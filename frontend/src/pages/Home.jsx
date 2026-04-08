import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowRight, MessageSquare, Users, AlertTriangle, Zap } from 'lucide-react';

/* ─── mock venue data (would come from /api/crowd in production) ─── */
const ZONES = [
  { id: 1, name: 'Entrance Gate A', type: 'Entry / Exit',    density: 'High',   occupancy: 920,  capacity: 1000, wait: '12 min', trend: '↑' },
  { id: 2, name: 'Entrance Gate B', type: 'Entry / Exit',    density: 'Low',    occupancy: 180,  capacity: 1000, wait: '2 min',  trend: '→' },
  { id: 3, name: 'Entrance Gate C', type: 'Entry / Exit',    density: 'Medium', occupancy: 540,  capacity: 800,  wait: '5 min',  trend: '↓' },
  { id: 4, name: 'Food Court Main', type: 'Services',        density: 'Medium', occupancy: 460,  capacity: 600,  wait: '15 min', trend: '↑' },
  { id: 5, name: 'Food Court West', type: 'Services',        density: 'Low',    occupancy: 120,  capacity: 400,  wait: '4 min',  trend: '→' },
  { id: 6, name: 'Restrooms North', type: 'Services',        density: 'High',   occupancy: 145,  capacity: 150,  wait: '8 min',  trend: '↑' },
];

const STATS = [
  { label: 'Total Attendees', value: '4,250',  icon: Users,         color: '#3b82f6' },
  { label: 'High-Risk Zones', value: '2',      icon: AlertTriangle, color: '#ef4444' },
  { label: 'Avg Wait Time',   value: '9 min',  icon: Clock,         color: '#f59e0b' },
  { label: 'AI Predictions',  value: 'Active', icon: Zap,           color: '#10b981' },
];

/* ─── ZoneCard component ─── */
function ZoneCard({ data, index, onAskAI }) {
  const navigate = useNavigate();
  const tagClass = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' }[data.density];
  const barPct   = Math.round((data.occupancy / data.capacity) * 100);
  const barColor = { High: 'var(--danger)', Medium: 'var(--warning)', Low: 'var(--success)' }[data.density];

  return (
    <article
      className={`card zone-card anim-fade-up stagger-${Math.min(index + 1, 6)}`}
      tabIndex={0}
      aria-label={`${data.name}: ${data.density} density, ${data.wait} wait`}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.9rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <MapPin size={15} color="var(--primary-light)" aria-hidden="true" />
            <h3 style={{ fontSize: '0.95rem' }}>{data.name}</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{data.type}</span>
        </div>
        <span className={`badge ${tagClass}`} aria-label={`${data.density} crowd`}>
          {data.density}
        </span>
      </div>

      {/* Occupancy bar */}
      <div style={{ marginBottom: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
          <span>Occupancy</span>
          <span style={{ color: barColor, fontWeight: 600 }}>{barPct}%</span>
        </div>
        <div style={{ height: '6px', background: 'var(--bg-solid)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${barPct}%`, background: barColor, borderRadius: '99px', transition: 'width 0.8s var(--ease)' }} role="progressbar" aria-valuenow={barPct} aria-valuemin={0} aria-valuemax={100} />
        </div>
      </div>

      {/* Wait row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <Clock size={14} aria-hidden="true" />
        Wait: <strong style={{ color: 'var(--text)' }}>{data.wait}</strong>
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: data.trend === '↑' ? 'var(--danger)' : data.trend === '↓' ? 'var(--success)' : 'var(--text-muted)' }}>
          {data.trend} Trend
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <button className="btn-primary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => navigate('/map')} aria-label={`Navigate to ${data.name} on map`}>
          View Map <ArrowRight size={14} aria-hidden="true" />
        </button>
        <button className="btn-ghost" style={{ padding: '0.5rem 0.9rem' }} aria-label={`Ask AI about ${data.name}`} onClick={() => onAskAI(data.name)}>
          <MessageSquare size={15} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

/* ─── Home page ─── */
export default function Home() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiTip, setAiTip] = useState('Analyzing crowd flow…');

  useEffect(() => {
    const timer = setTimeout(() => {
      setZones(ZONES);
      setAiTip('⚡ Gate A is at 92% capacity. Gate B is clear — redirect users now!');
      setLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const triggerAI = (zone) => {
    const fab = document.querySelector('.fab');
    if (fab) fab.click();
    setTimeout(() => {
      const input = document.querySelector('.floating-chat-container input');
      if (!input) return;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, `How do I avoid crowds at ${zone}?`);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, 150);
  };

  return (
    <main aria-label="Venue Overview" style={{ animation: 'fadeIn 0.35s ease-out' }}>

      {/* Page header */}
      <div className="anim-fade-up" style={{ marginBottom: '2rem' }}>
        <h1>Venue Overview</h1>
        <p style={{ marginTop: '0.4rem', fontSize: '1rem' }}>
          Real-time crowd intelligence powered by Gemini AI multi-agents.
        </p>
      </div>

      {/* AI prediction banner */}
      <div className="anim-fade-up stagger-1" style={{ background: 'var(--accent-faint)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 'var(--radius-md)', padding: '1rem 1.4rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <Zap size={18} color="var(--accent)" aria-hidden="true" />
        <p style={{ color: 'var(--accent)', fontSize: '0.9rem', margin: 0 }}>{aiTip}</p>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`card anim-fade-up stagger-${i + 1}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem 1.2rem' }}>
              <div style={{ background: `${s.color}20`, padding: '0.7rem', borderRadius: 'var(--radius-sm)' }}>
                <Icon size={20} color={s.color} aria-hidden="true" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>{s.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zone cards grid */}
      <h2 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', color: 'var(--text-muted)' }}>All Zones</h2>
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1.5rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '210px' }} aria-hidden="true" />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1.5rem' }}>
          {zones.map((z, idx) => <ZoneCard key={z.id} data={z} index={idx} onAskAI={triggerAI} />)}
        </div>
      )}
    </main>
  );
}
