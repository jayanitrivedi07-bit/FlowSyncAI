import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Clock, Users, CheckCircle, ArrowRight, Zap, RefreshCw, AlertTriangle, Star } from 'lucide-react';

/* ─── Gate data (backed by /api/wait-times in production) ─── */
const INITIAL_GATES = [
  { id: 'A', name: 'Gate A — North Entrance', wait: 12, occupancy: 92, capacity: 1000, status: 'High',   distance: '3 min walk', sector: 'Block A1-A10' },
  { id: 'B', name: 'Gate B — East Entrance',  wait: 2,  occupancy: 18, capacity: 1000, status: 'Low',    distance: '5 min walk', sector: 'Block B1-B10' },
  { id: 'C', name: 'Gate C — South Entrance', wait: 5,  occupancy: 54, capacity: 800,  status: 'Medium', distance: '7 min walk', sector: 'Block C1-C8'  },
  { id: 'D', name: 'Gate D — West Entrance',  wait: 1,  occupancy: 9,  capacity: 600,  status: 'Low',    distance: '4 min walk', sector: 'Block D1-D6'  },
];

/* ─── Ticket data (would come from authenticated user session) ─── */
const TICKET = {
  eventName: 'Champions League Final',
  venue:     'Wembley Stadium',
  date:      'April 14, 2026',
  time:      '20:45 IST',
  seat:      'Block B4 · Row 12 · Seat 7',
  ticketId:  'FSA-2026-04-14-B4-12-7',
  holder:    'Jayani Trivedi',
  qrValue:   'FSA:2026:WEMBLEY:B4:12:7:VALID',
  category:  'Premium Stand',
};

const statusColor = { High: 'var(--danger)', Medium: 'var(--warning)', Low: 'var(--success)' };
const statusBadge = { High: 'badge-high',   Medium: 'badge-medium',   Low: 'badge-low'    };

/* ─── Minimal SVG QR code (unique pattern per ticket) ─── */
function QRCodeSVG({ value }) {
  // Deterministic pixel pattern based on value string
  const seed = [...value].reduce((a, c) => a + c.charCodeAt(0), 0);
  const SIZE = 21;
  const rng = (i) => {
    const x = Math.sin(seed + i) * 10000;
    return x - Math.floor(x) > 0.45;
  };

  const cells = [];
  // finder patterns (corners)
  const finderOffsets = [[0,0],[0,14],[14,0]];
  const finderMask = new Set();
  finderOffsets.forEach(([fr,fc]) => {
    for (let r = fr; r < fr + 7; r++) for (let c = fc; c < fc + 7; c++) finderMask.add(`${r},${c}`);
  });

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      let fill = '#1a1a2e';
      if (finderMask.has(`${r},${c}`)) {
        const fr = r % 7, fc = c % 7;
        const inner = (fr >= 2 && fr <= 4 && fc >= 2 && fc <= 4) ||
                      (fr === 0 || fr === 6 || fc === 0 || fc === 6);
        fill = inner ? '#fff' : '#1a1a2e';
      } else if (rng(r * SIZE + c)) {
        fill = '#fff';
      }
      cells.push(
        <rect key={`${r}-${c}`} x={c * 5} y={r * 5} width={5} height={5} fill={fill} rx={0.5} />
      );
    }
  }

  return (
    <svg viewBox={`0 0 ${SIZE * 5} ${SIZE * 5}`} style={{ width: '100%', maxWidth: 180, height: 'auto', display: 'block', margin: '0 auto' }}>
      <rect width="100%" height="100%" fill="#1a1a2e" rx={4} />
      {cells}
    </svg>
  );
}

/* ─── Gate card ─── */
function GateCard({ gate, isRecommended, index }) {
  const pct = Math.round((gate.occupancy / gate.capacity) * 100);
  return (
    <article
      className={`card anim-fade-up stagger-${Math.min(index + 1, 6)}`}
      style={{
        border: isRecommended ? '2px solid var(--success)' : undefined,
        boxShadow: isRecommended ? '0 0 24px rgba(16,185,129,0.2)' : undefined,
        position: 'relative',
        transition: 'all 0.3s var(--ease)',
      }}
      aria-label={`Gate ${gate.id}: ${gate.status} crowd, ${gate.wait} min wait`}
    >
      {isRecommended && (
        <div style={{
          position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--success)', color: '#000', fontSize: '0.7rem', fontWeight: 700,
          padding: '0.2rem 0.9rem', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '0.3rem',
          whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(16,185,129,0.4)',
        }}>
          <Star size={11} /> AI RECOMMENDED
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{gate.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{gate.sector} · {gate.distance}</div>
        </div>
        <span className={`badge ${statusBadge[gate.status]}`}>{gate.status}</span>
      </div>

      {/* Occupancy bar */}
      <div style={{ marginBottom: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
          <span>Queue</span>
          <span style={{ color: statusColor[gate.status], fontWeight: 600 }}>{pct}%</span>
        </div>
        <div style={{ height: '6px', background: 'var(--bg-solid)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, background: statusColor[gate.status],
            borderRadius: '99px', transition: 'width 1s var(--ease)',
          }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={14} /> <strong style={{ color: 'var(--text)' }}>{gate.wait} min</strong> wait
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Users size={14} /> {gate.occupancy}/{gate.capacity}
        </span>
      </div>
    </article>
  );
}

/* ─── Entry Page ─── */
export default function Entry() {
  const [gates, setGates] = useState(INITIAL_GATES);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [tab, setTab] = useState('ticket'); // 'ticket' | 'gates'
  const [admitted, setAdmitted] = useState(false);
  const intervalRef = useRef(null);

  // Recommend the gate with lowest wait time
  const recommended = gates.reduce((best, g) => (g.wait < best.wait ? g : best), gates[0]);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      setGates(prev => prev.map(g => ({
        ...g,
        wait:      Math.max(1, g.wait + Math.floor(Math.random() * 5) - 2),
        occupancy: Math.min(g.capacity, Math.max(10, g.occupancy + Math.floor(Math.random() * 60) - 30)),
      })).map(g => ({
        ...g,
        status: (g.occupancy / g.capacity) > 0.8 ? 'High' : (g.occupancy / g.capacity) > 0.5 ? 'Medium' : 'Low',
      })));
      setLastRefresh(new Date());
      setLoading(false);
    }, 600);
  };

  // Auto-refresh every 30 s
  useEffect(() => {
    intervalRef.current = setInterval(refresh, 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleScan = () => {
    setAdmitted(true);
    setTimeout(() => setAdmitted(false), 4000);
  };

  return (
    <main aria-label="Smart Entry System" style={{ animation: 'fadeIn 0.35s ease-out', maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div className="anim-fade-up" style={{ marginBottom: '2rem' }}>
        <h1>Smart Entry</h1>
        <p style={{ marginTop: '0.4rem' }}>Your digital ticket · Live gate intelligence · AI gate selection</p>
      </div>

      {/* AI Recommendation Banner */}
      <div className="anim-fade-up stagger-1" style={{
        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: 'var(--radius-md)', padding: '1rem 1.4rem', marginBottom: '2rem',
        display: 'flex', alignItems: 'center', gap: '0.8rem',
      }}>
        <Zap size={18} color="var(--success)" />
        <p style={{ color: 'var(--success)', fontSize: '0.9rem', margin: 0 }}>
          ⚡ AI Recommends <strong>Gate {recommended.id}</strong> — only <strong>{recommended.wait} min</strong> wait right now. Save ~{Math.max(...gates.map(g => g.wait)) - recommended.wait} min vs. busiest gate.
        </p>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'var(--bg-solid)', borderRadius: 'var(--radius-sm)', padding: '0.3rem', width: 'fit-content' }}>
        {[{ id: 'ticket', label: '🎫 My Ticket' }, { id: 'gates', label: '🚪 Gate Status' }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '0.5rem 1.2rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.88rem',
              background: tab === t.id ? 'var(--primary-light)' : 'transparent',
              color:      tab === t.id ? '#fff' : 'var(--text-muted)',
              border:     'none', transition: 'all 0.2s var(--ease)',
            }}
            aria-selected={tab === t.id}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Ticket Tab ── */}
      {tab === 'ticket' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

          {/* QR Ticket Card */}
          <div className="card anim-fade-up stagger-1" style={{
            background: 'linear-gradient(145deg, rgba(30,58,138,0.4), rgba(20,33,63,0.8))',
            border: '1px solid rgba(37,99,235,0.4)', textAlign: 'center', padding: '2rem 1.5rem',
          }}>
            {/* Event badge */}
            <div style={{ background: 'var(--primary-faint)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.8rem', display: 'inline-block', marginBottom: '1.2rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--primary-light)', fontWeight: 700, letterSpacing: '0.1em' }}>OFFICIAL DIGITAL TICKET</span>
            </div>

            <h2 style={{ fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.3rem' }}>{TICKET.eventName}</h2>
            <p style={{ fontSize: '0.82rem', marginBottom: '1.2rem' }}>{TICKET.venue} · {TICKET.date} · {TICKET.time}</p>

            {/* QR */}
            <div style={{ background: '#1a1a2e', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
              <QRCodeSVG value={TICKET.qrValue} />
            </div>

            <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem', letterSpacing: '0.05em' }}>
              {TICKET.ticketId}
            </div>

            {/* Admit button */}
            {admitted ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 700, animation: 'fadeIn 0.3s ease' }}>
                <CheckCircle size={20} /> Ticket Valid — Welcome!
              </div>
            ) : (
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleScan} id="scan-ticket-btn">
                <QrCode size={16} /> Scan at Gate
              </button>
            )}
          </div>

          {/* Ticket Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card anim-fade-up stagger-2">
              <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Ticket Details</h3>
              {[
                { label: 'Holder',    value: TICKET.holder },
                { label: 'Seat',      value: TICKET.seat },
                { label: 'Category',  value: TICKET.category },
                { label: 'Gate',      value: `Gate ${recommended.id} (Recommended)`, color: 'var(--success)' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                  <strong style={{ color: row.color || 'var(--text)' }}>{row.value}</strong>
                </div>
              ))}
            </div>

            <div className="card anim-fade-up stagger-3" style={{ background: 'var(--accent-faint)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                <AlertTriangle size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Entry Tips</div>
                  <ul style={{ color: 'var(--text-muted)', fontSize: '0.82rem', paddingLeft: '1rem', lineHeight: 1.8 }}>
                    <li>Arrive 30 min before kickoff</li>
                    <li>Gate {recommended.id} is least crowded now</li>
                    <li>Keep this screen bright at the scanner</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Gates Tab ── */}
      {tab === 'gates' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <button className="btn-ghost" onClick={refresh} disabled={loading} aria-label="Refresh gate data" id="refresh-gates-btn">
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', paddingTop: '0.75rem' }}>
            {gates
              .sort((a, b) => a.wait - b.wait)
              .map((gate, idx) => (
                <GateCard
                  key={gate.id}
                  gate={gate}
                  index={idx}
                  isRecommended={gate.id === recommended.id}
                />
              ))
            }
          </div>

          <div className="card anim-fade-up" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.8rem', alignItems: 'center', background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.2)' }}>
            <Zap size={18} color="var(--primary-light)" />
            <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-muted)' }}>
              Gate recommendations update every 30 seconds based on real-time crowd density. Your seat is in <strong style={{ color: 'var(--text)' }}>{recommended.name.split('—')[0].trim()}</strong> sector.
            </p>
          </div>
        </div>
      )}

    </main>
  );
}
