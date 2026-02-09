import React, { useState } from 'react';
import axios from 'axios';

const AITestComponent: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setTestResult('Testando conexão...\n\n');

    try {
      const url = 'http://acs-assist-inova-agente1.nia.desenv.bb.com.br/acs/llms/agent';
      
      const requestData = {
        data: {
          input: 'Olá, você está funcionando?',
          context: {
            conversation_id: '6cb0a8e2-1151-47d8-93de-5f7e4f5862de',
            system: {
              dialog_turn_counter: 0
            },
            metadata: {
              user_id: '29c3df96-9937-429d-a4bf-5a996f8ae1a2'
            },
            messages: []
          },
          config: {
            temperature: 0.7
          }
        }
      };

      setTestResult(prev => prev + '📤 Enviando request para: ' + url + '\n\n');
      setTestResult(prev => prev + '📦 Payload:\n' + JSON.stringify(requestData, null, 2) + '\n\n');

      const response = await axios.post(url, requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setTestResult(prev => prev + '✅ SUCESSO!\n\n');
      setTestResult(prev => prev + '📥 Status: ' + response.status + '\n\n');
      setTestResult(prev => prev + '📥 Resposta completa:\n' + JSON.stringify(response.data, null, 2) + '\n\n');

      if (response.data.output?.generic?.[0]?.text) {
        setTestResult(prev => prev + '💬 Texto da resposta:\n' + response.data.output.generic[0].text);
      }

    } catch (error: any) {
      setTestResult(prev => prev + '❌ ERRO!\n\n');
      
      if (axios.isAxiosError(error)) {
        setTestResult(prev => prev + '🔴 Status: ' + (error.response?.status || 'Network Error') + '\n');
        setTestResult(prev => prev + '🔴 Message: ' + error.message + '\n\n');
        
        if (error.response) {
          const response = error.response;
          if (response.data) {
            setTestResult(prev => prev + '📥 Response Data:\n' + JSON.stringify(response.data, null, 2) + '\n\n');
          }
          if (response.headers) {
            setTestResult(prev => prev + '📥 Response Headers:\n' + JSON.stringify(response.headers, null, 2) + '\n\n');
          }
        }
        
        if (error.code) {
          setTestResult(prev => prev + '🔴 Error Code: ' + error.code + '\n');
        }
      } else {
        setTestResult(prev => prev + '🔴 ' + error.toString());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>🧪 Teste de Conexão com API LLM</h2>
      <button 
        onClick={testAPI} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? '⏳ Testando...' : '▶️ Testar API'}
      </button>

      {testResult && (
        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          overflow: 'auto',
          maxHeight: '600px',
          fontSize: '12px',
          lineHeight: '1.5'
        }}>
          {testResult}
        </pre>
      )}
    </div>
  );
};

export default AITestComponent;
