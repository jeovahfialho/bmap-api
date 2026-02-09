import DOMPurify from 'dompurify';

/**
 * Remove tags HTML e retorna texto limpo
 */
export const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

/**
 * Gera um resumo inteligente do texto
 * Extrai as primeiras sentenças ou pontos principais
 */
export const generateSummary = (text: string, maxLength: number = 200): string => {
  const cleanText = stripHtml(text).trim();
  
  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  // Tenta quebrar em sentenças
  const sentences = cleanText.split(/[.!?]\s+/);
  let summary = '';
  
  for (const sentence of sentences) {
    if ((summary + sentence).length > maxLength) {
      break;
    }
    summary += sentence + '. ';
  }

  // Se não conseguiu nenhuma sentença completa, corta no espaço mais próximo
  if (summary.length === 0) {
    const cutIndex = cleanText.lastIndexOf(' ', maxLength);
    summary = cleanText.substring(0, cutIndex > 0 ? cutIndex : maxLength) + '...';
  }

  return summary.trim();
};

/**
 * Sanitiza HTML removendo scripts e elementos perigosos
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['class', 'style'],
    KEEP_CONTENT: true
  });
};

/**
 * Extrai pontos principais de listas (ul/ol) ou parágrafos
 */
export const extractKeyPoints = (html: string, maxPoints: number = 3): string[] => {
  const tmp = document.createElement('div');
  tmp.innerHTML = sanitizeHtml(html);
  
  const points: string[] = [];
  
  // Primeiro, tenta extrair itens de listas
  const listItems = tmp.querySelectorAll('li');
  if (listItems.length > 0) {
    listItems.forEach((li, idx) => {
      if (idx < maxPoints && li.textContent) {
        points.push(li.textContent.trim());
      }
    });
  }
  
  // Se não há listas, pega os primeiros parágrafos
  if (points.length === 0) {
    const paragraphs = tmp.querySelectorAll('p');
    paragraphs.forEach((p, idx) => {
      if (idx < maxPoints && p.textContent) {
        const text = p.textContent.trim();
        if (text.length > 0) {
          points.push(text.length > 150 ? text.substring(0, 147) + '...' : text);
        }
      }
    });
  }
  
  // Se ainda não há pontos, quebra o texto em sentenças
  if (points.length === 0) {
    const fullText = tmp.textContent || '';
    const sentences = fullText.split(/[.!?]\s+/).filter(s => s.trim().length > 0);
    sentences.forEach((sentence, idx) => {
      if (idx < maxPoints) {
        points.push(sentence.trim() + '.');
      }
    });
  }
  
  return points.slice(0, maxPoints);
};

/**
 * Formata HTML para melhor visualização removendo estilos inline problemáticos
 */
export const formatHtml = (html: string): string => {
  let formatted = sanitizeHtml(html);
  
  // Remove estilos inline que podem causar problemas
  formatted = formatted.replace(/style="[^"]*"/g, '');
  
  // Adiciona classes customizadas para elementos específicos
  formatted = formatted.replace(/<p>/g, '<p class="formatted-paragraph">');
  formatted = formatted.replace(/<ul>/g, '<ul class="formatted-list">');
  formatted = formatted.replace(/<ol>/g, '<ol class="formatted-list">');
  
  return formatted;
};
