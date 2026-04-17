import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, MapPin, Clock, Users, AlertTriangle,
  Zap, ChevronDown, Navigation, CheckCircle, MessageSquare
} from 'lucide-react';

/* ─── Live zone data ─── */
const ZONES = [
  { id: 1, name: 'Gate A', fullName: 'Entrance Gate A', type: 'Entry / Exit',    density: 'High',   occupancy: 920, capacity: 1000, wait: 12, trend: '↑' },
  { id: 2, name: 'Gate B', fullName: 'Entrance Gate B', type: 'Entry / Exit',    density: 'Low',    occupancy: 180, capacity: 1000, wait: 2,  trend: '→' },
  { id: 3, name: 'Gate C', fullName: 'Entrance Gate C', type: 'Entry / Exit',    density: 'Medium', occupancy: 540, capacity: 800,  wait: 5,  trend: '↓' },
  { id: 4, name: 'Food Court Main', fullName: 'Food Court Main', type: 'Services', density: 'Medium', occupancy: 460, capacity: 600, wait: 15, trend: '↑' },
  { id: 5, name: 'Food Court West', fullName: 'Food Court West', type: 'Services', density: 'Low',   occupancy: 120, capacity: 400, wait: 4,  trend: '→' },
  { id: 6, name: 'Restrooms North', fullName: 'Restrooms North', type: 'Services', density: 'High',  occupancy: 145, capacity: 150, wait: 8,  trend: '↑' },
];

const densityColor = { High: 'var(--danger)', Medium: 'var(--warning)', Low: 'var(--success)' };
const densityBadge = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };

/* ─── Compact zone row ─── */
function ZoneRow({ zone, onNavigate }) {
  const pct = Math.round((zone.occupancy / zone.capacity) * 100);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        transition: 'background 0.2s',
        cursor: 'pointer',
      }}
      onClick={() => onNavigate('/map')}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      role="button"
      tabIndex={0}
      aria-label={`${zone.name}: ${zone.density} crowd, ${zone.wait} min wait`}
    >
      {/* Density dot */}
      <span style={{
        width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
        background: densityColor[zone.density],
        boxShadow: zone.density === 'High' ? `0 0 6px ${densityColor[zone.density]}` : 'none',
      }} aria-hidden="true" />

      {/* Name */}
      <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 500, color: 'var(--text)' }}>
        {zone.name}
      </span>

      {/* Mini bar */}
      <div style={{ width: 80, height: 4, background: 'var(--bg-solid)', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: densityColor[zone.density], borderRadius: '99px' }} />
      </div>

      {/* Wait */}
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', minWidth: 42, textAlign: 'right' }}>
        {zone.wait}<span style={{ fontSize: '0.65rem' }}> min</span>
      </span>

      {/* Trend */}
      <span style={{
        fontSize: '0.75rem', minWidth: 14,
        color: zone.trend === '↑' ? 'var(--danger)' : zone.trend === '↓' ? 'var(--success)' : 'var(--text-muted)',
      }}>{zone.trend}</span>
    </div>
  );
}

/* ─── Home page ─── */
export default function Home() {
  const navigate = useNavigate();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showZones, setShowZones] = useState(false);
  const [actionDone, setActionDone] = useState(false);
  const pulseRef = useRef(null);

  const recommended = zones.find(z => z.density === 'Low' && z.type === 'Entry / Exit') || zones[1];
  const busiest     = zones.reduce((worst, z) => (z.wait > (worst?.wait ?? 0) ? z : worst), null);
  const timeSaved   = recommended && busiest ? busiest.wait - recommended.wait : 10;

  useEffect(() => {
    const t = setTimeout(() => {
      setZones(ZONES);
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {[200, 80, 320].map((h, i) => (
          <div key={i} className="skeleton" style={{ height: h, borderRadius: 'var(--radius-md)' }} />
        ))}
      </main>
    );
  }

  return (
    <main aria-label="Venue Overview" style={{ animation: 'fadeIn 0.35s ease-out', maxWidth: 1100, margin: '0 auto' }}>

      {/* ══════════════════════════════════════════
          DECISION CARD  —  hero, full attention
      ══════════════════════════════════════════ */}
      <div
        className="anim-fade-up"
        style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(30,58,138,0.25) 60%, rgba(7,13,27,0.9) 100%)',
          border: '1px solid rgba(16,185,129,0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(1.5rem, 4vw, 2.4rem)',
          marginBottom: '2rem',
          boxShadow: '0 0 40px rgba(16,185,129,0.08)',
        }}
      >
        {/* Ambient glow */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: -60, left: -60,
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* AI badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)',
            borderRadius: '99px', padding: '0.2rem 0.75rem',
            fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)',
            letterSpacing: '0.08em',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: 'var(--success)',
              animation: 'pulseDot 1.5s ease-in-out infinite',
            }} />
            AI RECOMMENDATION · LIVE
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800,
          background: 'linear-gradient(135deg, #fff 30%, var(--success) 100%)',
          backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem', lineHeight: 1.15,
        }}>
          Head to Gate B now
        </h1>

        {/* Why */}
        <p style={{
          fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.6rem', maxWidth: 480,
        }}>
          Gate A is at <strong style={{ color: 'var(--danger)' }}>92% capacity</strong> with a{' '}
          <strong style={{ color: 'var(--danger)' }}>12 min wait</strong>. Gate B is clear —{' '}
          <strong style={{ color: 'var(--success)' }}>only 2 min</strong>. You save{' '}
          <strong style={{ color: 'var(--accent)' }}>{timeSaved} min</strong>.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          {actionDone ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)',
              borderRadius: 'var(--radius-sm)', padding: '0.65rem 1.4rem',
              color: 'var(--success)', fontWeight: 700, fontSize: '0.95rem',
            }}>
              <CheckCircle size={18} /> On your way — Gate B
            </div>
          ) : (
            <button
              id="go-to-gate-b-btn"
              className="btn-primary"
              onClick={() => { setActionDone(true); navigate('/entry'); }}
              style={{
                background: 'var(--success)', boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
                fontSize: '1rem', padding: '0.75rem 1.8rem', fontWeight: 700,
                border: 'none',
              }}
              aria-label="Navigate to Gate B with 2 minute wait"
            >
              Go to Gate B &nbsp;·&nbsp; 2 min wait <ArrowRight size={17} />
            </button>
          )}

          <button
            id="view-route-btn"
            className="btn-ghost"
            onClick={() => navigate('/map')}
            style={{ fontSize: '0.9rem', padding: '0.7rem 1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            aria-label="View route on live map"
          >
            <Navigation size={15} /> View Route
          </button>
        </div>

        {/* Compact secondary context — muted, right side */}
        <div style={{
          position: 'absolute', top: '1.6rem', right: '1.8rem',
          display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end',
          opacity: 0.55,
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <Users size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
            4,250 attendees
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
            Avg wait: 9 min
          </span>
          <span style={{
            fontSize: '0.68rem', color: 'var(--danger)', fontWeight: 600,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '4px', padding: '0.1rem 0.5rem',
          }}>
            2 high-risk zones
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECONDARY ACTIONS  — compact, supporting
      ══════════════════════════════════════════ */}
      <div className="anim-fade-up stagger-1" style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem',
      }}>
        {[
          {
            label: 'Order food now',
            sub:   'Food Court West — 4 min',
            icon:  '🍔', cta: 'Order →', color: '#f59e0b',
            action: () => navigate('/orders'),
            id: 'quick-order-btn',
          },
          {
            label: 'Check live map',
            sub:   '8 zones monitored',
            icon:  '🗺️', cta: 'Open Map →', color: 'var(--primary-light)',
            action: () => navigate('/map'),
            id: 'quick-map-btn',
          },
          {
            label: 'Nearest restroom',
            sub:   'Restrooms South — Low crowd',
            icon:  '🚻', cta: 'Get Directions →', color: 'var(--success)',
            action: () => navigate('/map'),
            id: 'quick-restroom-btn',
          },
        ].map(card => (
          <button
            key={card.id}
            id={card.id}
            onClick={card.action}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '1.1rem 1.2rem',
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s var(--ease)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = card.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
            aria-label={card.label}
          >
            <span style={{ fontSize: '1.4rem' }}>{card.icon}</span>
            <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.88rem' }}>{card.label}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.sub}</span>
            <span style={{ fontSize: '0.78rem', color: card.color, fontWeight: 600, marginTop: '0.2rem' }}>{card.cta}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          ALL ZONES — collapsed by default, context only
      ══════════════════════════════════════════ */}
      <div className="anim-fade-up stagger-2">
        <button
          onClick={() => setShowZones(v => !v)}
          id="toggle-zones-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            width: '100%', padding: '0.85rem 1.1rem',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: showZones ? 'var(--radius-md) var(--radius-md) 0 0' : 'var(--radius-md)',
            cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500,
            transition: 'border-radius 0.2s',
          }}
          aria-expanded={showZones}
        >
          <MapPin size={15} color="var(--text-muted)" />
          All Zones — context view
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', background: 'rgba(239,68,68,0.12)', color: 'var(--danger)', padding: '0.15rem 0.6rem', borderRadius: '99px', fontWeight: 600 }}>
            2 High
          </span>
          <ChevronDown
            size={16}
            style={{ transition: 'transform 0.25s', transform: showZones ? 'rotate(180deg)' : 'none' }}
          />
        </button>

        {showZones && (
          <div style={{
            border: '1px solid var(--border)', borderTop: 'none',
            borderRadius: '0 0 var(--radius-md) var(--radius-md)',
            padding: '0.75rem',
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
            background: 'var(--bg-card)',
            animation: 'fadeIn 0.2s ease',
          }}>
            {/* Column headers */}
            <div style={{
              display: 'flex', gap: '1rem',
              padding: '0.2rem 1rem', fontSize: '0.68rem', fontWeight: 600,
              color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 9 }} />
              <span style={{ flex: 1 }}>Zone</span>
              <span style={{ width: 80, textAlign: 'center' }}>Occupancy</span>
              <span style={{ minWidth: 42, textAlign: 'right' }}>Wait</span>
              <span style={{ minWidth: 14 }}>▲▼</span>
            </div>
            {zones.map(z => (
              <ZoneRow key={z.id} zone={z} onNavigate={navigate} />
            ))}
          </div>
        )}
      </div>

    </main>
  );
}
