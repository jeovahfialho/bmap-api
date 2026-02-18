import axios from 'axios';
import { ProcessedCard, AIEvaluationResult } from '../types/Card';
import { stripHtml } from '../utils/textUtils';

const AI_API_URL = 'https://generabb-acs.gbb.servicos.bb.com.br/gateway/agent';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIConversationContext {
  conversation_id: string;
  system: {
    dialog_turn_counter: number;
  };
  metadata: {
    user_id: string;
  };
  messages: AIMessage[];
}

export interface AIRequest {
  data: {
    input: string;
    context: AIConversationContext;
    config?: {
      temperature?: number;
    };
  };
}

export interface AIResponse {
  output: {
    generic: Array<{
      response_type: string;
      text: string;
    }>;
  };
  context: AIConversationContext;
}

class AIService {
  private conversationId: string;
  private userId: string;
  private messages: AIMessage[] = [];
  private turnCounter: number = 0;

  constructor() {
    // Gera IDs únicos para a sessão
    this.conversationId = this.generateUUID();
    this.userId = this.generateUUID();
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  async sendMessage(
    input: string,
    userIdentification?: string,
    temperature: number = 0.7
  ): Promise<string> {
    try {
      const request = {
        action: 'conversar',
        body: {
          data: {
            input,
            context: {
              conversation_id: this.conversationId,
              system: {
                dialog_turn_counter: this.turnCounter,
              },
              metadata: {
                user_id: this.userId,
              },
              messages: this.messages,
            },
          },
        },
        agent_id: 'inic-agente-1',
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'UOR': '459616',
        'X-Client-Id': 'eyJpZCI6IiIsImNvZGlnb1B1YmxpY2Fkb3IiOjAsImNvZGlnb1NvZnR3YXJlIjo1OTkxNywic2VxdWVuY2lhbEluc3RhbGFjYW8iOjJ9',
        'userIdentification': userIdentification || 'F4690059', // Valor padrão
      };

      if (userIdentification) {
        headers['userIdentification'] = userIdentification;
      }

      console.log('[AIService] Enviando request via backend:', {
        url: '/api/ai/agent',
        headers,
        request: JSON.stringify(request, null, 2)
      });

      // Usa o backend como proxy para evitar CORS
      const response = await axios.post<any>(
        '/api/ai/agent',
        request,
        { headers, timeout: 120000 } // 120s timeout para IA
      );

      console.log('[AIService] Resposta recebida:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro desconhecido');
      }

      const apiData = response.data.data;

      console.log('[AIService] apiData completo:', JSON.stringify(apiData, null, 2));

      // Incrementa o contador de turnos
      this.turnCounter++;

      // Adiciona a mensagem do usuário ao histórico
      this.messages.push({
        role: 'user',
        content: input,
      });

      // Extrai a resposta do assistente do novo formato da API
      // A resposta vem em: data.output.text[0]
      const assistantResponse =
        apiData.data?.output?.text?.[0] || 
        apiData.output?.text?.[0] || 
        apiData.output?.text ||
        'Sem resposta';

      console.log('[AIService] Resposta extraída:', assistantResponse);

      // Adiciona a resposta do assistente ao histórico
      this.messages.push({
        role: 'assistant',
        content: assistantResponse,
      });

      // Atualiza o contexto se vier na resposta
      // O contexto pode vir em data.context ou apiData.context
      const contextData = apiData.data?.context || apiData.context;
      if (contextData) {
        this.messages = contextData.messages || this.messages;
        this.turnCounter = contextData.system?.dialog_turn_counter || this.turnCounter;
      }

      return assistantResponse;
    } catch (error) {
      console.error('[AIService] Erro completo:', error);
      if (axios.isAxiosError(error)) {
        console.error('[AIService] Erro Axios:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          message: error.message
        });
        throw new Error(
          `Erro na API de IA: ${error.response?.status || 'Network Error'} - ${error.message}`
        );
      }
      throw error;
    }
  }

  async getContextualRetrieval(
    input: string,
    totalContext: number = 3,
    userIdentification?: string
  ): Promise<any> {
    try {
      const request = {
        data: {
          input,
          context: {
            conversation_id: this.conversationId,
            system: {
              dialog_turn_counter: this.turnCounter,
            },
            metadata: {
              user_id: this.userId,
            },
            total_context: totalContext,
            messages: this.messages,
          },
        },
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (userIdentification) {
        headers['userIdentification'] = userIdentification;
      }

      const response = await axios.post(
        `${AI_API_URL}/acs/llms/contextual_retrieval`,
        request,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar contexto:', error);
      throw error;
    }
  }

  resetConversation(): void {
    this.conversationId = this.generateUUID();
    this.messages = [];
    this.turnCounter = 0;
  }

  getConversationHistory(): AIMessage[] {
    return [...this.messages];
  }
}

// Classe para gerenciar conversa de relatório (agente diferente)
class ReportService {
  private conversationId: string;
  private userId: string;
  private messages: AIMessage[] = [];
  private turnCounter: number = 0;
  private systemPromptSent: boolean = false;

  constructor() {
    this.conversationId = this.generateUUID();
    this.userId = this.generateUUID();
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  async sendMessage(
    input: string,
    conversationHistory: Array<{ role: string; content: string }>,
    userIdentification?: string,
    temperature: number = 0.7
  ): Promise<string> {
    try {
      // Se é a primeira mensagem, adiciona o prompt do sistema
      let enhancedInput = input;
      if (!this.systemPromptSent) {
        this.systemPromptSent = true;
        const systemPrompt = `Você é o "Analista Estratégico", um consultor especialista e assistente interativo. Sua missão é ajudar Gerentes de Projeto (PMs) a traduzirem seus projetos de TI para a linguagem técnica exigida pelo Ministério da Ciência, Tecnologia e Inovação (MCTI) para o enquadramento na Lei do Bem.

IMPORTANTE: Conduza a entrevista fazendo UMA PERGUNTA DE CADA VEZ. Não faça todas as 4 perguntas de uma vez. Aguarde a resposta do PM antes de prosseguir para a próxima.

PROCESSO:
1. Após receber a descrição inicial, faça a Pergunta 1 sobre a ENTREGA
2. Quando receber a resposta, faça a Pergunta 2 sobre o DESAFIO
3. Quando receber a resposta, faça a Pergunta 3 sobre o PROCESSO
4. Quando receber a resposta, faça a Pergunta 4 sobre o RESULTADO
5. Ao final das 4 respostas, compile tudo em um texto único otimizado para PD&I

Pergunta 1 (Entrega):
"Obrigado. Vamos começar pela Entrega.
Pergunta-Chave: Qual foi a entrega central do seu projeto? Pense no problema que ela está resolvendo, quais as funcionalidades que foram desenvolvidas, quais as inovações que puderam ser observadas.
O 'Porquê': Você precisa diferenciar o que foi criado do que foi meramente aplicado. Uma 'nova plataforma' não é suficiente; queremos saber qual peça tecnológica nova foi desenvolvida.
Evite: 'Desenvolvemos um novo dashboard de vendas.'
Busque: 'Desenvolvemos um algoritmo proprietário de renderização que reduz a latência em 80% comparado às bibliotecas open-source existentes.'"

Pergunta 2 (Desafio):
"Entendido. Agora, vamos focar no desafio central.
Pergunta-Chave: Qual foi o principal desafio ou problema técnico que sua equipe buscou resolver no início? Qual era a barreira enfrentada?
O 'Porquê': Este é um critério muito importante.
Evite: 'Nosso desafio era melhorar a experiência do usuário.'
Busque: 'A incerteza residia em como manter a integridade de dados criptografados em redes de baixa largura de banda sem comprometer o desempenho.'"

Pergunta 3 (Processo):
"Perfeito. Agora, como vocês superaram essa incerteza?
Pergunta-Chave: Descreva as etapas, testes e validação que vocês realizaram para encontrar a solução. Como vocês provaram que a ideia funcionava?
O 'Porquê': Precisamos de evidências do processo de desenvolvimento.
Evite: 'Fizemos várias reuniões e desenvolvemos o código.'
Busque: 'Nosso processo foi: 1. Estudo bibliográfico. 2. Simulação matemática. 3. Desenvolvimento de protótipos. 4. Realização de ensaios de estresse.'"

Pergunta 4 (Resultado):
"Estamos quase lá. Por fim, o Resultado alcançado.
Pergunta-Chave: Qual foi o resultado que seu projeto proporcionou? Qual ganho mensurável vocês alcançaram?
O 'Porquê': O avanço precisa ser técnico e/ou negócio.
Evite: 'O sistema ficou mais rápido.'
Busque: 'O projeto resultou em uma nova técnica 15% mais eficiente que o padrão de mercado.'"

Aqui está a descrição inicial do projeto:
${input}

Faça APENAS a primeira pergunta sobre a ENTREGA. Não faça todas as perguntas de uma vez.`;
        enhancedInput = systemPrompt;
      }

      const request = {
        action: 'conversar',
        body: {
          data: {
            input: enhancedInput,
            context: {
              conversation_id: this.conversationId,
              system: {
                dialog_turn_counter: this.turnCounter,
              },
              metadata: {
                user_id: this.userId,
              },
              messages: this.messages,
            },
          },
        },
        agent_id: 'inic-agente-1',
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'UOR': '459616',
        'X-Client-Id': 'eyJpZCI6IiIsImNvZGlnb1B1YmxpY2Fkb3IiOjAsImNvZGlnb1NvZnR3YXJlIjo1OTkxNywic2VxdWVuY2lhbEluc3RhbGFjYW8iOjJ9',
        'userIdentification': userIdentification || 'F4690059',
      };

      console.log('[ReportService] Enviando mensagem:', {
        turnCounter: this.turnCounter,
        messagesCount: this.messages.length,
        conversationId: this.conversationId
      });

      const response = await axios.post<any>(
        '/api/ai/agent',
        request,
        { headers, timeout: 120000 } // 120s timeout para IA
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro desconhecido');
      }

      const apiData = response.data.data;

      this.turnCounter++;

      this.messages.push({
        role: 'user',
        content: input,
      });

      const assistantResponse =
        apiData.data?.output?.text?.[0] || 
        apiData.output?.text?.[0] || 
        apiData.output?.text ||
        'Sem resposta';

      this.messages.push({
        role: 'assistant',
        content: assistantResponse,
      });

      const contextData = apiData.data?.context || apiData.context;
      if (contextData) {
        this.messages = contextData.messages || this.messages;
        this.turnCounter = contextData.system?.dialog_turn_counter || this.turnCounter;
      }

      console.log('[ReportService] Resposta recebida. Novo turnCounter:', this.turnCounter);

      return assistantResponse;
    } catch (error) {
      console.error('[ReportService] Erro:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Erro na API de IA: ${error.response?.status || 'Network Error'} - ${error.message}`
        );
      }
      throw error;
    }
  }

  resetConversation(): void {
    this.conversationId = this.generateUUID();
    this.messages = [];
    this.turnCounter = 0;
    this.systemPromptSent = false;
  }
}

// Mapa para manter uma instância de ReportService por conversa
const reportServiceInstances = new Map<string, ReportService>();

export const sendReportMessage = async (
  input: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userIdentification?: string,
  conversationKey?: string
): Promise<string> => {
  // Usa uma chave única para cada modal/conversa
  const key = conversationKey || 'default';
  
  if (!reportServiceInstances.has(key)) {
    reportServiceInstances.set(key, new ReportService());
  }
  
  const service = reportServiceInstances.get(key)!;
  return service.sendMessage(input, conversationHistory, userIdentification);
};

export const resetReportConversation = (conversationKey?: string) => {
  const key = conversationKey || 'default';
  const service = reportServiceInstances.get(key);
  if (service) {
    service.resetConversation();
    reportServiceInstances.delete(key);
  }
};

// --- Batch AI Evaluation ---

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Parses the AI response text to extract structured fields.
 * Handles multiple format variations from the AI, including markdown bold (**).
 */
const parseAIResponse = (response: string): Omit<AIEvaluationResult, 'status'> => {
  // Strip markdown bold markers before parsing for cleaner extraction
  const cleanResponse = response.replace(/\*\*/g, '');
  
  // Try multiple regex patterns for classification
  const classificacaoMatch = cleanResponse.match(/Classifica[çc][aã]o:\s*(.+?)(?=\n|$)/i);
  
  // Try multiple patterns for PD&I indication
  const indicacaoMatch = cleanResponse.match(/Indica[çc][aã]o\s*(?:de\s*)?PD&?I:\s*(.+?)(?=\n|$)/i)
    || cleanResponse.match(/PD&?I:\s*(sim|n[aã]o)\b/i)
    || cleanResponse.match(/\b(eleg[ií]vel|n[aã]o\s*eleg[ií]vel)\b/i);

  let justificativa = '';
  let sugestao = '';

  const lowerClean = cleanResponse.toLowerCase();
  const justIndex = lowerClean.indexOf('justificativa:');
  const sugestaoIndex = lowerClean.indexOf('sugestão de melhoria:');
  const sugestaoAlt = lowerClean.indexOf('sugestao de melhoria:');
  const sugIdx = sugestaoIndex !== -1 ? sugestaoIndex : sugestaoAlt;

  if (justIndex !== -1 && sugIdx !== -1) {
    justificativa = cleanResponse.substring(justIndex + 14, sugIdx).trim();
    sugestao = cleanResponse.substring(sugIdx + 22).trim();
  } else if (justIndex !== -1) {
    justificativa = cleanResponse.substring(justIndex + 14).trim();
  } else if (sugIdx !== -1) {
    sugestao = cleanResponse.substring(sugIdx + 22).trim();
  }

  return {
    classification: classificacaoMatch?.[1]?.trim(),
    pdiIndication: indicacaoMatch?.[1]?.trim(),
    justification: justificativa || undefined,
    suggestion: sugestao || undefined,
    rawResponse: response,
  };
};

/**
 * Determines status from the parsed AI evaluation.
 * Uses broader matching to handle varied AI response formats.
 */
const determineStatus = (parsed: Omit<AIEvaluationResult, 'status'>): AIEvaluationResult['status'] => {
  // First check parsed pdiIndication field
  if (parsed.pdiIndication) {
    const indication = parsed.pdiIndication.toLowerCase().trim();
    if (indication === 'sim' || indication.startsWith('sim')) return 'eligible';
    if (indication === 'não' || indication.startsWith('não') || indication === 'nao' || indication.startsWith('nao')) return 'not-eligible';
    if (indication.includes('elegível') || indication.includes('elegivel')) return 'eligible';
    if (indication.includes('não elegível') || indication.includes('nao elegivel')) return 'not-eligible';
  }
  
  // Fallback: scan the raw response for eligibility signals (strip markdown)
  if (parsed.rawResponse) {
    const raw = parsed.rawResponse.replace(/\*\*/g, '').toLowerCase();
    // Strong positive signals
    if (raw.includes('indicação de pd&i: sim') || raw.includes('indicação de pdi: sim')) return 'eligible';
    if (raw.includes('indicação de pd&i: não') || raw.includes('indicação de pdi: não') ||
        raw.includes('indicação de pd&i: nao') || raw.includes('indicação de pdi: nao')) return 'not-eligible';
    // Weaker signals from the response body
    if (raw.includes('é elegível') || raw.includes('projeto é elegível') || raw.includes('elegível para pd&i')) return 'eligible';
    if (raw.includes('não é elegível') || raw.includes('não elegível') || raw.includes('nao elegivel')) return 'not-eligible';
  }

  return 'pending';
};

/**
 * Evaluates a single card using the AI service.
 * Creates its own AIService instance to avoid conversation conflicts.
 * Does NOT retry on 429 — the batch loop handles rate limit timing.
 * Only retries on non-429 errors (network issues, 5xx, etc.).
 */
const evaluateSingleCard = async (card: ProcessedCard): Promise<AIEvaluationResult> => {
  const cleanDescription = stripHtml(card.description || '').trim();

  if (!cleanDescription) {
    return {
      status: 'pending',
      rawResponse: 'Sem descrição disponível para avaliação.',
    };
  }

  try {
    const service = new AIService();
    const response = await service.sendMessage(cleanDescription);
    const parsed = parseAIResponse(response);
    const status = determineStatus(parsed);
    return { ...parsed, status };
  } catch (error: any) {
    console.error(`[BatchAI] Erro ao avaliar card #${card.id}:`, error.message);
    return {
      status: 'error',
      rawResponse: `Erro: ${error?.message || 'Falha ao comunicar com a IA'}`,
    };
  }
};

/**
 * Batch evaluates multiple cards respecting the API rate limit of 5 req/min.
 * Sends 1 request at a time with a 12s delay to stay within limits.
 * Backend retries handle transient errors; frontend retries handle 429s.
 * Calls onProgress for each card as it completes.
 */
export const batchEvaluateCards = async (
  cards: ProcessedCard[],
  onProgress?: (cardId: number, result: AIEvaluationResult) => void,
  _concurrency: number = 1
): Promise<Map<number, AIEvaluationResult>> => {
  const results = new Map<number, AIEvaluationResult>();
  const DELAY_BETWEEN_CALLS_MS = 13000; // 13s entre chamadas → máx ~4.6 req/min (limite: 5/min)

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    const result = await evaluateSingleCard(card);
    results.set(card.id, result);
    if (onProgress) {
      onProgress(card.id, result);
    }

    // Respect rate limit — skip delay after last card
    if (i < cards.length - 1) {
      await sleep(DELAY_BETWEEN_CALLS_MS);
    }
  }

  return results;
};

export default new AIService();
