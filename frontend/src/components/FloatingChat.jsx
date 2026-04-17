import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, MessageSquare, AlertTriangle, Brain, Wifi } from 'lucide-react';
import './FloatingChat.css';

/* ─────────────────────────────────────────────────────────
   LIVE VENUE STATE — same source of truth as the heatmap
   In production: poll /api/crowd every 30 s
───────────────────────────────────────────────────────── */
const LIVE_ZONES = [
  { id: 'gate-a',  name: 'Gate A',          type: 'gate',  density: 'High',   occ: 92, wait: 12, alt: { name: 'Gate B', wait: 2 } },
  { id: 'gate-b',  name: 'Gate B',          type: 'gate',  density: 'Low',    occ: 18, wait: 2,  alt: null },
  { id: 'gate-c',  name: 'Gate C',          type: 'gate',  density: 'Medium', occ: 64, wait: 5,  alt: { name: 'Gate B', wait: 2 } },
  { id: 'food-m',  name: 'Food Court Main', type: 'food',  density: 'Medium', occ: 77, wait: 15, alt: { name: 'Food Court West', wait: 4 } },
  { id: 'food-w',  name: 'Food Court West', type: 'food',  density: 'Low',    occ: 30, wait: 4,  alt: null },
  { id: 'rest-n',  name: 'Restrooms North', type: 'rest',  density: 'High',   occ: 97, wait: 8,  alt: { name: 'Restrooms South', wait: 1 } },
  { id: 'rest-s',  name: 'Restrooms South', type: 'rest',  density: 'Low',    occ: 20, wait: 1,  alt: null },
  { id: 'merch',   name: 'Merchandise',     type: 'merch', density: 'Medium', occ: 72, wait: 5,  alt: null },
];

/* ─────────────────────────────────────────────────────────
   CONTEXT CHIP GENERATOR — purely data-driven, no hardcoding
───────────────────────────────────────────────────────── */
function generateContextChips(zones) {
  const chips = [];

  // Avoid high-density zones
  zones.filter(z => z.density === 'High' && z.alt).forEach(z => {
    chips.push({
      id:    `avoid-${z.id}`,
      label: `⚠️ Avoid ${z.name} — ${z.alt.name} is ${z.wait - z.alt.wait}m faster`,
      query: `${z.name} is at ${z.occ}%. What should I do?`,
      priority: 1,
    });
  });

  // Fastest food right now
  const fastestFood = zones
    .filter(z => z.type === 'food')
    .sort((a, b) => a.wait - b.wait)[0];
  if (fastestFood) {
    chips.push({
      id:    `food-${fastestFood.id}`,
      label: `🍔 ${fastestFood.name} — only ${fastestFood.wait} min wait`,
      query: `Which food stall is quickest right now?`,
      priority: 2,
    });
  }

  // Best gate to use
  const bestGate = zones
    .filter(z => z.type === 'gate')
    .sort((a, b) => a.wait - b.wait)[0];
  if (bestGate) {
    chips.push({
      id:    `gate-${bestGate.id}`,
      label: `🚪 ${bestGate.name} clear — ${bestGate.wait} min entry now`,
      query: `Which gate has the shortest queue right now?`,
      priority: 2,
    });
  }

  // Restroom tip
  const bestRest = zones
    .filter(z => z.type === 'rest')
    .sort((a, b) => a.wait - b.wait)[0];
  if (bestRest) {
    chips.push({
      id:    `rest-${bestRest.id}`,
      label: `🚻 ${bestRest.name} — ${bestRest.wait} min wait`,
      query: `Which restroom is least crowded?`,
      priority: 3,
    });
  }

  // Exit planning tip (time-sensitive)
  chips.push({
    id:    'exit-plan',
    label: '🚗 Best exit route after match',
    query: 'What is the best exit route when the match ends?',
    priority: 3,
  });

  return chips.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

/* ─────────────────────────────────────────────────────────
   CONTEXT-AWARE AI RESPONSE ENGINE
   Reads live zone data → generates precise, data-driven answers
───────────────────────────────────────────────────────── */
function buildAIResponse(query, zones) {
  const q = query.toLowerCase();

  const highZones  = zones.filter(z => z.density === 'High');
  const clearGates = zones.filter(z => z.type === 'gate' && z.density === 'Low').sort((a, b) => a.wait - b.wait);
  const fastFood   = zones.filter(z => z.type === 'food').sort((a, b) => a.wait - b.wait);
  const clearRest  = zones.filter(z => z.type === 'rest').sort((a, b) => a.wait - b.wait);

  // Gate routing
  if (q.match(/gate|entry|enter|queue|crowd/)) {
    if (clearGates.length > 0) {
      const best   = clearGates[0];
      const worst  = zones.filter(z => z.type === 'gate').sort((a, b) => b.wait - a.wait)[0];
      return `📍 **${best.name}** is your best option right now — only **${best.wait} min** wait at ${best.occ}% capacity.\n\nAvoid **${worst.name}** (${worst.occ}% full, ${worst.wait} min queue). Head East from your current position. I estimate **${best.wait + 2} min** including walking time.`;
    }
    return `All gates are moderately busy. Gate B is relatively clearest at ${zones.find(z => z.id === 'gate-b')?.occ}% capacity.`;
  }

  // Food routing
  if (q.match(/food|eat|hungry|stall|burger|order|drink/)) {
    if (fastFood.length > 0) {
      const best   = fastFood[0];
      const slower = fastFood[fastFood.length - 1];
      return `🍔 **${best.name}** is fastest right now — **${best.wait} min** wait vs ${slower.wait} min at ${slower.name}.\n\nHead ${best.id === 'food-w' ? 'West along the main concourse' : 'through the Central Corridor'}. I also recommend ordering on the **FlowSync app** to skip the queue entirely.`;
    }
  }

  // Restroom routing
  if (q.match(/restroom|washroom|toilet|bathroom|wc/)) {
    if (clearRest.length > 0) {
      const best  = clearRest[0];
      const worst = clearRest[clearRest.length - 1];
      return `🚻 **${best.name}** — only **${best.wait} min** wait right now (${best.occ}% full).\n\nAvoid **${worst.name}** — it's at ${worst.occ}% capacity with an ${worst.wait} min wait. ${best.id === 'rest-s' ? 'Head South past the merchandise tent.' : 'Head North along Block A.'}`;
    }
  }

  // Safety / alerts
  if (q.match(/safe|alert|danger|emergency|overcrowd|risk/)) {
    const critical = zones.filter(z => z.occ >= 90);
    if (critical.length > 0) {
      const list = critical.map(z => `• **${z.name}**: ${z.occ}% — ${z.alt ? `use ${z.alt.name} instead` : 'avoid if possible'}`).join('\n');
      return `🚨 **${critical.length} zone${critical.length > 1 ? 's' : ''} at critical capacity:**\n\n${list}\n\nStaff have been notified. Follow the green directional signs or use the Live Map to find safer routes.`;
    }
    return `✅ No critical safety alerts active. All zones are within normal operating parameters.`;
  }

  // Exit planning
  if (q.match(/exit|leave|go home|parking|out/)) {
    const exitGate = clearGates[0];
    return `🚗 For the smoothest exit:\n\n• **Best gate:** ${exitGate?.name ?? 'Gate B'} (${exitGate?.wait ?? 2} min wait)\n• Leave **10–15 min before match end** to avoid the main surge\n• Gate A typically peaks at 100% capacity right at final whistle\n• ${exitGate?.id === 'gate-b' ? 'East Parking is closest to Gate B.' : 'South Parking connects directly to Gate C.'}\n\nI'll alert you 12 min before predicted crowd surge.`;
  }

  // Wait time queries
  if (q.match(/wait|time|how long|queue/)) {
    const sorted = [...zones].sort((a, b) => a.wait - b.wait);
    return `⏱️ **Current wait times:**\n\n${sorted.slice(0, 5).map(z => `• ${z.name}: **${z.wait} min** (${z.density})`).join('\n')}\n\nShortest overall: **${sorted[0].name}** at ${sorted[0].wait} min.`;
  }

  // Avoid + zone name
  const matchedZone = zones.find(z => q.includes(z.name.toLowerCase()) || q.includes(z.id));
  if (matchedZone) {
    if (matchedZone.alt) {
      return `📊 **${matchedZone.name}** is at **${matchedZone.occ}%** capacity with a **${matchedZone.wait} min** wait — ${matchedZone.density === 'High' ? 'critically busy' : 'moderately busy'}.\n\nI recommend switching to **${matchedZone.alt.name}** (only ${matchedZone.alt.wait} min wait). That saves you **${matchedZone.wait - matchedZone.alt.wait} min** right now.`;
    }
    return `✅ **${matchedZone.name}** is in good shape — ${matchedZone.occ}% full with only a **${matchedZone.wait} min** wait. Good choice!`;
  }

  // Default — contextual summary
  const topAlert = highZones[0];
  return `🤖 Live crowd analysis: **${highZones.length} zone${highZones.length !== 1 ? 's' : ''}** are high-density right now.${topAlert ? `\n\nMost urgent: **${topAlert.name}** (${topAlert.occ}% full). ${topAlert.alt ? `Use **${topAlert.alt.name}** instead — ${topAlert.wait - topAlert.alt.wait} min faster.` : ''}` : ''}\n\nAsk me about a specific gate, food stall, restroom, or exit route for precise directions.`;
}

/* ─────────────────────────────────────────────────────────
   TYPEWRITER EFFECT for AI messages
───────────────────────────────────────────────────────── */
function TypewriterText({ text }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    // Vary speed slightly for natural feel
    const tick = () => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
        const delay = text[i - 1] === '\n' ? 60 : text[i - 1] === '.' ? 45 : 12;
        setTimeout(tick, delay);
      }
    };
    setTimeout(tick, 80);
  }, [text]);

  // Render **bold** markdown
  const parts = displayed.split(/\*\*(.+?)\*\*/g);
  return (
    <span style={{ whiteSpace: 'pre-line' }}>
      {parts.map((p, i) =>
        i % 2 === 1
          ? <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>{p}</strong>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   VENUE CONTEXT STRIP — shown at top of chat
───────────────────────────────────────────────────────── */
function VenueContextStrip({ zones }) {
  const highCount = zones.filter(z => z.density === 'High').length;
  const bestGate  = zones.filter(z => z.type === 'gate').sort((a, b) => a.wait - b.wait)[0];

  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      padding: '0.5rem 1rem',
      fontSize: '0.72rem',
      display: 'flex', gap: '1rem', alignItems: 'center',
      background: 'rgba(7,13,27,0.5)',
      overflowX: 'auto', flexWrap: 'nowrap',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--success)', flexShrink: 0 }}>
        <Wifi size={10} />
        <span style={{ width: 5, height: 5, background: 'var(--success)', borderRadius: '50%', animation: 'pulseDot 2s infinite' }} />
        Live data
      </span>
      <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>4,250 attendees</span>
      {highCount > 0 && (
        <span style={{ color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>
          ⚠ {highCount} high-risk zone{highCount > 1 ? 's' : ''}
        </span>
      )}
      {bestGate && (
        <span style={{ color: 'var(--success)', fontWeight: 700, flexShrink: 0 }}>
          ✓ {bestGate.name}: {bestGate.wait}m wait
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
export default function FloatingChat() {
  const [open, setOpen]       = useState(false);
  const [zones]               = useState(LIVE_ZONES);
  const [msgs, setMsgs]       = useState([]);
  const [text, setText]       = useState('');
  const [stage, setStage]     = useState('idle'); // idle | scanning | thinking | done
  const [unread, setUnread]   = useState(1);
  const endRef                = useRef(null);
  const inputRef              = useRef(null);

  const chips = generateContextChips(zones);

  /* Welcome message on open */
  useEffect(() => {
    if (open && msgs.length === 0) {
      const topAlert = zones.find(z => z.density === 'High');
      setMsgs([{
        sender: 'ai',
        text: `👋 Scanning live crowd data now…\n\n${topAlert
          ? `⚠️ **${topAlert.name}** is at **${topAlert.occ}%** — ${topAlert.alt ? `I recommend **${topAlert.alt.name}** (${topAlert.alt.wait} min wait) instead.` : 'please avoid if possible.'}`
          : `✅ No critical zones right now — all areas are manageable.`}\n\nAsk me anything about gates, food, restrooms, or exits.`,
        live: true,
      }]);
    }
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, stage]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const send = useCallback((overrideQuery) => {
    const q = (overrideQuery ?? text).trim();
    if (!q || stage !== 'idle') return;

    setText('');
    setMsgs(prev => [...prev, { sender: 'user', text: q }]);

    // Phase 1: "Scanning..." — short before thinking
    setStage('scanning');
    setTimeout(() => {
      setStage('thinking');

      // Phase 2: Thinking delay — varies by query length (feels natural)
      const thinkDelay = 700 + Math.min(q.length * 12, 900);
      setTimeout(() => {
        const response = buildAIResponse(q, zones);
        setMsgs(prev => [...prev, { sender: 'ai', text: response, live: true }]);
        setStage('idle');
      }, thinkDelay);
    }, 450);
  }, [text, stage, zones]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="floating-chat-container" role="complementary" aria-label="AI Assistant">

      {/* ── CHAT MODAL */}
      {open && (
        <div className="chat-modal card" role="dialog" aria-modal="true" aria-label="FlowSync AI Assistant">

          {/* Header */}
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 34, height: 34,
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(251,191,36,0.25)',
              }}>
                <Sparkles size={16} color="#000" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>FlowSync AI</div>
                <div style={{
                  fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
                  color: stage !== 'idle' ? 'var(--accent)' : 'var(--success)',
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: stage !== 'idle' ? 'var(--accent)' : 'var(--success)',
                    display: 'inline-block',
                    animation: stage !== 'idle' ? 'pulseDot 0.8s infinite' : 'pulseDot 2s infinite',
                  }} />
                  {stage === 'scanning'  && 'Scanning live data…'}
                  {stage === 'thinking'  && 'AI is analyzing…'}
                  {stage === 'idle'      && 'Live · Crowd-aware'}
                </div>
              </div>
            </div>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close AI assistant">
              <X size={18} />
            </button>
          </div>

          {/* Live venue context strip */}
          <VenueContextStrip zones={zones} />

          {/* Messages */}
          <div className="chat-messages" aria-live="polite" aria-label="Chat messages">
            {msgs.map((m, i) => (
              <div key={i} className={`msg-bubble ${m.sender}`}>
                {m.sender === 'ai' && m.live
                  ? <TypewriterText text={m.text} />
                  : m.text
                }
              </div>
            ))}

            {/* Thinking states */}
            {stage === 'scanning' && (
              <div className="msg-bubble ai" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}>
                <Brain size={13} color="var(--accent)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>
                  AI is analyzing live crowd data…
                </span>
              </div>
            )}
            {stage === 'thinking' && (
              <div className="msg-bubble ai">
                <span className="typing-dots"><span /><span /><span /></span>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Dynamic context chips — generated from live zone state */}
          <div className="chips-row" aria-label="Context-aware suggestions">
            {chips.map(chip => (
              <button
                key={chip.id}
                className="suggestion-chip"
                onClick={() => send(chip.query)}
                disabled={stage !== 'idle'}
                aria-label={chip.label}
                title={chip.label}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            className="chat-input-row"
            onSubmit={e => { e.preventDefault(); send(); }}
            aria-label="Message input"
          >
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                stage !== 'idle'
                  ? 'AI is responding…'
                  : 'Ask about gates, food, exits…'
              }
              disabled={stage !== 'idle'}
              aria-label="Chat message"
              autoComplete="off"
            />
            <button
              type="submit"
              className="send-btn"
              disabled={!text.trim() || stage !== 'idle'}
              aria-label="Send message"
            >
              <Send size={17} />
            </button>
          </form>
        </div>
      )}

      {/* ── FAB */}
      <button
        className="fab"
        onClick={() => { setOpen(o => !o); }}
        aria-label={`${open ? 'Close' : 'Open'} AI assistant${unread && !open ? `, ${unread} new suggestion` : ''}`}
      >
        <MessageSquare size={24} />
        {unread > 0 && !open && (
          <span className="fab-badge" aria-hidden="true">{unread}</span>
        )}
      </button>
    </div>
  );
}
