import React, { useState, useEffect } from 'react';
import { Info, AlertTriangle, Zap } from 'lucide-react';

/* ── Zone data (mirrors the backend snapshot) ── */
const ZONES = [
  { id:'gate-a', name:'Entrance Gate A', top:'12%',  left:'18%',  size:130, density:'High',   wait:'12 min', occ:92 },
  { id:'gate-b', name:'Entrance Gate B', top:'12%',  left:'68%',  size:110, density:'Low',    wait:'2 min',  occ:18 },
  { id:'gate-c', name:'Entrance Gate C', top:'48%',  left:'5%',   size:105, density:'Medium', wait:'5 min',  occ:68 },
  { id:'food-m', name:'Food Court Main', top:'42%',  left:'52%',  size:165, density:'Medium', wait:'15 min', occ:77 },
  { id:'food-w', name:'Food Court West', top:'60%',  left:'22%',  size:115, density:'Low',    wait:'4 min',  occ:30 },
  { id:'rest-n', name:'Restrooms North', top:'22%',  left:'78%',  size:90,  density:'High',   wait:'8 min',  occ:97 },
  { id:'rest-s', name:'Restrooms South', top:'78%',  left:'65%',  size:85,  density:'Low',    wait:'1 min',  occ:20 },
  { id:'merch',  name:'Merchandise',     top:'30%',  left:'38%',  size:100, density:'Medium', wait:'5 min',  occ:78 },
];

const densityGrad = {
  High:   c => `radial-gradient(circle, rgba(239,68,68,${c}) 0%, rgba(239,68,68,0) 72%)`,
  Medium: c => `radial-gradient(circle, rgba(245,158,11,${c}) 0%, rgba(245,158,11,0) 72%)`,
  Low:    c => `radial-gradient(circle, rgba(16,185,129,${c})  0%, rgba(16,185,129,0) 72%)`,
};
const densityColor = { High: 'var(--danger)', Medium: 'var(--warning)', Low: 'var(--success)' };
const tagClass     = { High: 'badge-high',   Medium: 'badge-medium',   Low: 'badge-low'   };

export default function Heatmap() {
  const [hovered, setHovered]   = useState(null);
  const [animated, setAnimated] = useState(false);
  const [tick, setTick]         = useState(0);

  // Pulse animation + data "refresh" every 5s
  useEffect(() => {
    setAnimated(true);
    const iv = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(iv);
  }, []);

  const triggerAI = (zone) => {
    const fab = document.querySelector('.fab');
    if (fab) { fab.click(); }
    setTimeout(() => {
      const input = document.querySelector('.floating-chat-container input');
      if (!input) return;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, `What's the fastest route avoiding ${zone}?`);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, 160);
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Info size={14} /> Hover zones for details · Click to ask AI
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Last refresh: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Map canvas */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(380px, 55vw, 520px)',
          background: 'radial-gradient(ellipse at center, #0f1d3a 0%, var(--bg) 80%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.6)',
        }}
        role="img"
        aria-label="Stadium heatmap"
      >
        {/* Stadium rings */}
        {[88, 62, 38].map((pct, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${(100 - pct) / 2}%`, left: `${(100 - pct) / 2}%`,
            width: `${pct}%`, height: `${pct}%`,
            border: `1px solid rgba(255,255,255,0.05)`,
            borderRadius: '50%',
            pointerEvents: 'none',
          }} aria-hidden="true" />
        ))}

        {/* Center label */}
        <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Main Stage</div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>◉ Live View</div>
        </div>

        {/* Heat zones */}
        {ZONES.map((z) => {
          const isHov = hovered?.id === z.id;
          const intensity = isHov ? '0.85' : '0.6';
          return (
            <div key={z.id} style={{ position: 'absolute', top: z.top, left: z.left, zIndex: isHov ? 20 : 1 }}>
              {/* Heat blob */}
              <div
                role="button"
                tabIndex={0}
                aria-label={`${z.name}: ${z.density} density, ${z.wait} wait`}
                aria-haspopup="true"
                onMouseEnter={() => setHovered(z)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(z)}
                onBlur={() => setHovered(null)}
                onClick={() => triggerAI(z.name)}
                onKeyDown={e => e.key === 'Enter' && triggerAI(z.name)}
                style={{
                  width: z.size, height: z.size,
                  borderRadius: '50%',
                  background: densityGrad[z.density](intensity),
                  cursor: 'pointer',
                  animation: z.density === 'High'
                    ? `heatPulse ${2 + Math.random()}s ease-in-out infinite`
                    : animated ? `fadeIn 1s ease-out` : 'none',
                  transition: 'transform 0.3s var(--ease)',
                  transform: isHov ? 'scale(1.25)' : 'scale(1)',
                }}
              />

              {/* Tooltip */}
              {isHov && (
                <div
                  role="tooltip"
                  aria-live="polite"
                  style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: `translate(-50%, -${z.size / 2 + 80}px)`,
                    background: 'rgba(7,13,27,0.95)',
                    border: `1px solid ${densityColor[z.density]}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem 1.1rem',
                    minWidth: '190px',
                    boxShadow: `0 8px 30px rgba(0,0,0,0.6)`,
                    animation: 'fadeUp 0.2s ease-out forwards',
                    pointerEvents: 'none',
                    zIndex: 30,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'white', fontSize: '0.9rem' }}>{z.name}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Density: <strong className={`badge ${tagClass[z.density]}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>{z.density}</strong></span>
                    <span>Occupancy: <strong style={{ color: densityColor[z.density] }}>{z.occ}%</strong></span>
                    <span>Est. Wait: <strong style={{ color: 'white' }}>{z.wait}</strong></span>
                  </div>
                  <div style={{ marginTop: '0.6rem', fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600 }}>
                    <Zap size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> Click to ask AI for routing
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Legend */}
        <div aria-label="Density key" style={{ position: 'absolute', bottom: '1rem', right: '1.2rem', display: 'flex', gap: '1rem', fontSize: '0.75rem', background: 'rgba(7,13,27,0.8)', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          {['Low', 'Medium', 'High'].map(d => (
            <span key={d} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: densityColor[d] }}>
              <span style={{ width: 8, height: 8, background: densityColor[d], borderRadius: '50%', display: 'inline-block' }} />
              {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
