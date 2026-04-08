import React, { useState, useEffect } from 'react';
import { Activity, Navigation, Clock, TrendingDown, Star } from 'lucide-react';

/* ── Simulated personalised user profile ── */
const PROFILE = {
  name: 'Jayani',
  preference: 'Fastest Path',
  accessibility: false,
};

const LIFETIME = {
  stepsSaved:   1240,
  minutesSaved: 28,
  queuesAvoided: 7,
  routesUsed:    14,
};

/* ── Dummy AI personalised tips ── */
const AI_TIPS = [
  '🎯 Based on your habits, Food Court West suits you — 4 min wait now.',
  '🗺️ Your usual Gate A route is congested — Gate B is 3× faster today.',
  '⏱️ Leaving 10 min before match end will save ~18 min in Gate A queue.',
  '🚽 Restrooms South are always less crowded — bookmark them!',
];

const BADGE = [
  { icon: '🏃', label: 'Speed Runner',  desc: 'Used fastest path 10× times'  },
  { icon: '🧠', label: 'AI Whisperer',  desc: 'Asked AI 25+ queries'          },
  { icon: '🚀', label: 'Early Adopter', desc: 'First 100 FlowSync users'       },
];

export default function UserStats() {
  const [tip, setTip] = useState('');

  useEffect(() => {
    setTip(AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)]);
  }, []);

  return (
    <main aria-label="User Statistics" style={{ animation: 'fadeIn 0.35s ease-out' }}>

      {/* Header */}
      <div className="anim-fade-up" style={{ marginBottom: '2rem' }}>
        <h1>Hi, {PROFILE.name} 👋</h1>
        <p style={{ marginTop: '0.4rem' }}>Here's how FlowSync AI has improved your venue experience.</p>
      </div>

      {/* AI personal tip */}
      <div className="anim-fade-up stagger-1" style={{ background: 'var(--primary-faint)', border: '1px solid rgba(30,58,138,0.35)', borderRadius: 'var(--radius-md)', padding: '1rem 1.4rem', marginBottom: '2rem', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
        <Star size={18} color="var(--accent)" aria-hidden="true" />
        <p style={{ color: 'var(--text)', margin: 0, fontSize: '0.9rem' }}>{tip}</p>
      </div>

      {/* Impact stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Steps Saved',      value: LIFETIME.stepsSaved.toLocaleString(),  icon: Activity,    color: '#10b981', unit: 'steps' },
          { label: 'Minutes Saved',    value: LIFETIME.minutesSaved,                  icon: Clock,       color: '#3b82f6', unit: 'min' },
          { label: 'Queues Avoided',   value: LIFETIME.queuesAvoided,                 icon: TrendingDown,color: '#f59e0b', unit: '' },
          { label: 'AI Routes Used',   value: LIFETIME.routesUsed,                    icon: Navigation,  color: '#8b5cf6', unit: '' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`card anim-fade-up stagger-${i + 1}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.1rem 1.2rem' }}>
              <div style={{ background: `${s.color}20`, padding: '0.7rem', borderRadius: 'var(--radius-sm)' }}>
                <Icon size={20} color={s.color} aria-hidden="true" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>
                  {s.value}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.2rem' }}>{s.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preference and Badges row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Preferences card */}
        <div className="card anim-fade-up stagger-3">
          <h3 style={{ marginBottom: '1.2rem' }}>Your Preferences</h3>
          {[
            { label: 'Routing Mode',       value: PROFILE.preference },
            { label: 'Accessibility Mode', value: PROFILE.accessibility ? 'On' : 'Off' },
            { label: 'Notifications',      value: 'Enabled' },
            { label: 'AI Profile',         value: 'Personalized' },
          ].map(p => (
            <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{p.label}</span>
              <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.88rem' }}>{p.value}</span>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="card anim-fade-up stagger-4">
          <h3 style={{ marginBottom: '1.2rem' }}>Achievements</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {BADGE.map(b => (
              <div key={b.label} style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
                <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>{b.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
