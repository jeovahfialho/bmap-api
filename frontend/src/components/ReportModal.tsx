import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { sendReportMessage, resetReportConversation } from '../services/aiService';
import { stripHtml } from '../utils/textUtils';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardTitle: string;
  cardDescription: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Função para limpar HTML, markdown e aplicar negrito real em perguntas/títulos
const formatMessage = (text: string): JSX.Element => {
  // Remove tags HTML e converte para texto puro
  let clean = stripHtml(text);
  // Remove ** do markdown
  clean = clean.replace(/\*\*(.*?)\*\*/g, '$1');
  // Remove __ do markdown
  clean = clean.replace(/__(.*?)__/g, '$1');
  // Remove qualquer tag HTML remanescente
  clean = clean.replace(/<[^>]+>/g, '');
  // Divide em linhas
  const paragraphs = clean.split(/\r?\n/).filter(p => p.trim());
  return (
    <>
      {paragraphs.map((paragraph, index) => {
        // Aplica negrito se for pergunta ou título
        const isQuestion = /pergunta|resultado|entrega|desafio|processo|final|^\s*\d+\./i.test(paragraph) || paragraph.trim().endsWith('?');
        return (
          <p
            key={index}
            style={isQuestion ? { fontWeight: '600', marginTop: index > 0 ? '12px' : '0' } : {}}
          >
            {paragraph}
          </p>
        );
      })}
    </>
  );
};

const ReportModal: React.FC<ReportModalProps> = ({ 
  isOpen, 
  onClose, 
  cardTitle, 
  cardDescription 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationKeyRef = useRef<string>(`report-${Date.now()}-${Math.random()}`);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !conversationStarted) {
      startConversation();
    }
  }, [isOpen]);

  const startConversation = async () => {
    setConversationStarted(true);
    setIsLoading(true);

    // Remove HTML da descrição antes de enviar
    const cleanDescription = stripHtml(cardDescription);
    const initialPrompt = `Projeto: ${cardTitle}\n\nDescrição inicial: ${cleanDescription}`;
    
    try {
      const response = await sendReportMessage(
        initialPrompt, 
        [], 
        undefined, 
        conversationKeyRef.current
      );
      
      setMessages([
        { role: 'user', content: initialPrompt },
        { role: 'assistant', content: response }
      ]);
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      setMessages([
        { role: 'assistant', content: 'Desculpe, ocorreu um erro ao iniciar a conversa. Por favor, tente novamente.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: Message = { role: 'user', content: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, newUserMessage];
      const response = await sendReportMessage(
        userInput, 
        conversationHistory, 
        undefined, 
        conversationKeyRef.current
      );
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    // Reseta a conversa quando fechar o modal
    resetReportConversation(conversationKeyRef.current);
    setMessages([]);
    setUserInput('');
    setConversationStarted(false);
    // Gera nova chave para próxima conversa
    conversationKeyRef.current = `report-${Date.now()}-${Math.random()}`;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Gerar Relatório PD&I</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body report-modal-body">
          <div className="messages-container">
            {messages.map((message, index) => (
              <div key={index} className={`message message-${message.role}`}>
                <div className="message-content">
                  {formatMessage(message.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message message-assistant">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <textarea
              className="message-input"
              placeholder="Digite sua resposta..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              rows={3}
            />
            <button 
              className="send-button" 
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
