import axios from 'axios';
import https from 'https';

const AI_API_URL = 'https://generabb-acs.gbb.servicos.bb.com.br/gateway/agent';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 2000;
const REQUEST_TIMEOUT_MS = 90000; // 90 segundos

// Agent HTTPS que ignora certificados auto-assinados
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface AIRequest {
  action: string;
  body: {
    data: {
      input: string;
      context: {
        conversation_id: string;
        system: {
          dialog_turn_counter: number;
        };
        metadata: {
          user_id: string;
        };
        messages: Array<{
          role: string;
          content: string;
        }>;
      };
    };
  };
  agent_id: string;
}

export class AIAdapter {
  async sendMessage(request: AIRequest, userIdentification?: string): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'UOR': '459616',
      'X-Client-Id': 'eyJpZCI6IiIsImNvZGlnb1B1YmxpY2Fkb3IiOjAsImNvZGlnb1NvZnR3YXJlIjo1OTkxNywic2VxdWVuY2lhbEluc3RhbGFjYW8iOjJ9',
      'userIdentification': userIdentification || 'F4690059',
    };

    if (userIdentification) {
      headers['userIdentification'] = userIdentification;
    }

    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[AIAdapter] Tentativa ${attempt}/${MAX_RETRIES} - Enviando request para:`, AI_API_URL);

        const response = await axios.post(
          AI_API_URL,
          request,
          { 
            headers,
            timeout: REQUEST_TIMEOUT_MS,
            httpsAgent
          }
        );

        console.log('[AIAdapter] Resposta recebida:', JSON.stringify(response.data, null, 2));
        return response.data;
      } catch (error) {
        lastError = error;
        const isRetryable = this.isRetryableError(error);

        if (axios.isAxiosError(error)) {
          console.error(`[AIAdapter] Erro na tentativa ${attempt}/${MAX_RETRIES}:`, {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            retryable: isRetryable
          });
        } else {
          console.error(`[AIAdapter] Erro na tentativa ${attempt}/${MAX_RETRIES}:`, error);
        }

        if (!isRetryable || attempt === MAX_RETRIES) {
          break;
        }

        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`[AIAdapter] Aguardando ${delay}ms antes de tentar novamente...`);
        await sleep(delay);
      }
    }

    throw lastError;
  }

  private isRetryableError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      // Timeout or network errors are retryable
      if (!error.response) return true; // network error / timeout
      const status = error.response.status;
      // 429 NÃO é retryable no backend - devolvemos ao frontend para ele controlar o timing
      return status >= 500; // Apenas 5xx
    }
    return false; // Non-axios errors are not retryable
  }

  async getContextualRetrieval(
    input: string,
    context: any,
    userIdentification?: string
  ): Promise<any> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (userIdentification) {
        headers['userIdentification'] = userIdentification;
      }

      const response = await axios.post(
        `${AI_API_URL}/acs/llms/contextual_retrieval`,
        { data: { input, context } },
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('[AIAdapter] Erro no contextual retrieval:', error);
      throw error;
    }
  }
}
