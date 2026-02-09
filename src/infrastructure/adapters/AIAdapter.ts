import axios from 'axios';
import https from 'https';

const AI_API_URL = 'https://generabb-acs.gbb.servicos.bb.com.br/gateway/agent';

// Agent HTTPS que ignora certificados auto-assinados
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

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
    try {
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

      console.log('[AIAdapter] Enviando request para:', AI_API_URL);
      console.log('[AIAdapter] Headers:', headers);
      console.log('[AIAdapter] Payload:', JSON.stringify(request, null, 2));

      const response = await axios.post(
        AI_API_URL,
        request,
        { 
          headers,
          timeout: 30000, // 30 segundos
          httpsAgent // Ignora certificados auto-assinados
        }
      );

      console.log('[AIAdapter] Resposta recebida:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('[AIAdapter] Erro:', error);
      if (axios.isAxiosError(error)) {
        console.error('[AIAdapter] Detalhes do erro:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
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
