import React, { useState } from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
      <input 
        type="text" 
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask for the shortest path or food options..."
        style={{
          flex: 1,
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-color)',
          color: 'var(--text-main)',
          outline: 'none'
        }}
        disabled={disabled}
      />
      <button type="submit" className="btn-primary" disabled={disabled || !text.trim()}>
        <Send size={18} />
      </button>
    </form>
  );
};

export default ChatInput;
