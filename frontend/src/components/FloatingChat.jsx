import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, MessageSquare, AlertTriangle, Navigation, Utensils, Clock } from 'lucide-react';
import './FloatingChat.css';

/* ── Contextual suggestion chips keyed by crowd state ── */
const CHIPS = [
  { label: '🗺️ Shortest path to Gate B', query: 'What is the shortest path to Gate B right now?' },
  { label: '🍔 Fastest food queue',        query: 'Which food stall has the shortest queue?' },
  { label: '🚽 Nearest free washroom',     query: 'Which restroom has the shortest wait?' },
  { label: '🚨 Any safety alerts?',        query: 'Are there any safety or overcrowding alerts right now?' },
  { label: '🚗 Fastest exit route',        query: 'What is the fastest route to exit the venue?' },
];

const INITIAL = [
  { sender: 'ai', text: "👋 I'm your FlowSync AI guide! Gate A is at 92% capacity — I suggest using Gate B for a smoother entry." }
];

export default function FloatingChat() {
  const [open, setOpen]       = useState(false);
  const [msgs, setMsgs]       = useState(INITIAL);
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread]   = useState(1);
  const endRef                = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, loading]);

  const handleOpen = () => { setOpen(true); setUnread(0); };

  const send = (msg) => {
    const q = (msg || text).trim();
    if (!q || loading) return;
    setText('');
    setMsgs(p => [...p, { sender: 'user', text: q }]);
    setLoading(true);

    setTimeout(() => {
      const response = generateAIResponse(q);
      setMsgs(p => [...p, { sender: 'ai', text: response }]);
      setLoading(false);
    }, 1300);
  };

  return (
    <div className="floating-chat-container" role="complementary" aria-label="AI Assistant">
      {/* Chat modal */}
      {open && (
        <div className="chat-modal card" role="dialog" aria-modal="true" aria-label="FlowSync AI Chat Assistant">
          {/* Header */}
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} color="#000" aria-hidden="true" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>FlowSync AI</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: 6, height: 6, background: 'var(--success)', borderRadius: '50%', display: 'inline-block', animation: 'pulseDot 2s infinite' }} />
                  Live · Gemini-powered
                </div>
              </div>
            </div>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close AI assistant">
              <X size={18} />
            </button>
          </div>

          {/* Safety alert strip */}
          <div style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.15)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
            <AlertTriangle size={13} color="var(--danger)" aria-hidden="true" />
            <span style={{ color: 'var(--danger)' }}>Gate A alert active — overcrowding risk. Gate C predicted in 8 min.</span>
          </div>

          {/* Messages */}
          <div className="chat-messages" aria-live="polite" aria-label="Chat messages">
            {msgs.map((m, i) => (
              <div key={i} className={`msg-bubble ${m.sender}`}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="msg-bubble ai">
                <span className="typing-dots"><span /><span /><span /></span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick chips */}
          <div className="chips-row" aria-label="Quick questions">
            {CHIPS.map((c, i) => (
              <button key={i} className="suggestion-chip" onClick={() => send(c.query)} disabled={loading} aria-label={c.label}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form className="chat-input-row" onSubmit={e => { e.preventDefault(); send(); }} aria-label="Message input">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Ask for routing, queues, safety…"
              disabled={loading}
              aria-label="Chat message"
              autoComplete="off"
            />
            <button type="submit" className="send-btn" disabled={!text.trim() || loading} aria-label="Send message">
              <Send size={17} aria-hidden="true" />
            </button>
          </form>
        </div>
      )}

      {/* FAB */}
      <button className="fab" onClick={handleOpen} aria-label={`Open AI assistant${unread ? `, ${unread} new message` : ''}`}>
        <MessageSquare size={24} aria-hidden="true" />
        {unread > 0 && !open && (
          <span className="fab-badge" aria-hidden="true">{unread}</span>
        )}
      </button>
    </div>
  );
}

/* ── Contextual response generator (mock Gemini fallback) ── */
function generateAIResponse(q) {
  const lq = q.toLowerCase();
  if (lq.includes('gate b'))    return '✅ Gate B is at 18% capacity — take the East Corridor from your current position. ETA ~2 min.';
  if (lq.includes('food'))      return '🍔 Food Court West has only a 4-min wait vs 15 min at the Main Court. Head along the West Walkway.';
  if (lq.includes('washroom') || lq.includes('restroom')) return '🚽 Restrooms South have a 1-min wait. Head through Block D, turn left at the merchandise tent.';
  if (lq.includes('safety') || lq.includes('alert'))      return '🚨 Gate A: 92% capacity — HIGH risk. Restrooms North: 97% — CRITICAL. Stay clear and use alternatives.';
  if (lq.includes('exit'))      return '🚗 Fastest exit: Gate B → East parking. Gate A is congested. Use Gate C for south exits.';
  if (lq.includes('avoid'))     return '🗺️ To avoid congestion: stay on the East Corridor; avoid Gate A and North Restrooms. Gate B is flowing smoothly.';
  return '🤖 Based on current crowd data, I recommend Gate B for smoother navigation. Can you share your specific destination?';
}
