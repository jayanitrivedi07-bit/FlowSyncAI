import React, { useState } from 'react';
import ChatInput from '../components/ChatInput';

const ChatAssistant = () => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I'm FlowSync AI Guidance Agent. How can I help you navigate the venue today?", agentType: 'userGuidanceAgent' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (msg) => {
    setMessages(prev => [...prev, { sender: 'user', text: msg }]);
    setLoading(true);

    try {
      // Dummy check to simulate API
      // In reality: const res = await fetch('http://localhost:3000/api/predict', { method: 'POST', body: JSON.stringify({ agentType: 'userGuidanceAgent', query: msg }) });
      // const data = await res.json();
      
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'ai', text: "Taking the East Corridor is currently the fastest path to the Main Stage." }]);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I'm having trouble connecting to the network right now." }]);
      setLoading(false);
    }
  };

  return (
    <div className="chat-page" style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
      <h1>AI Guidance Assistant</h1>
      
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '1rem', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: m.sender === 'user' ? 'var(--primary-color)' : 'var(--bg-color)',
              padding: '1rem',
              borderRadius: '12px',
              maxWidth: '80%',
              border: m.sender === 'user' ? 'none' : '1px solid var(--border-color)'
            }}>
              {m.text}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)' }}>AI is typing...</div>
          )}
        </div>
        
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
};

export default ChatAssistant;
