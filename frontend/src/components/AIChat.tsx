import React, { useState, useRef, useEffect } from 'react';
import aiService, { AIMessage } from '../services/aiService';

interface AIChatProps {
  onClose?: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Adiciona mensagem do usuário
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await aiService.sendMessage(userMessage);
      
      // Adiciona resposta da IA
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro ao processar sua mensagem.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    aiService.resetConversation();
    setMessages([]);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Botão flutuante */}
      <button className="ai-chat-toggle" onClick={toggleChat} title="Assistente IA">
        🤖
      </button>

      {/* Janela do chat */}
      {isOpen && (
        <div className="ai-chat-container">
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <span className="ai-icon">🤖</span>
              <h3>Assistente IA - ACS GeneraBB</h3>
            </div>
            <div className="ai-chat-actions">
              <button
                className="ai-chat-reset"
                onClick={handleReset}
                title="Nova conversa"
              >
                🔄
              </button>
              <button className="ai-chat-close" onClick={toggleChat}>
                ×
              </button>
            </div>
          </div>

          <div className="ai-chat-messages">
            {messages.length === 0 && (
              <div className="ai-chat-welcome">
                <p>👋 Olá! Sou o assistente do ACS GeneraBB.</p>
                <p>Como posso ajudar você hoje?</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`ai-message ${msg.role}`}>
                <div className="ai-message-content">
                  {msg.role === 'assistant' && <span className="ai-avatar">🤖</span>}
                  <div className="ai-message-text">{msg.content}</div>
                  {msg.role === 'user' && <span className="user-avatar">👤</span>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="ai-message assistant">
                <div className="ai-message-content">
                  <span className="ai-avatar">🤖</span>
                  <div className="ai-message-text ai-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chat-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={loading}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="ai-send-button"
            >
              ➤
            </button>
          </div>

          <div className="ai-chat-footer">
            <small>Mensagens: {messages.length}</small>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
