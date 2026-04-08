import React from 'react';
import { User, Bell, Map, Zap, Shield } from 'lucide-react';

export default function Profile() {
  return (
    <main aria-label="User Profile" style={{ animation: 'fadeIn 0.35s ease-out', maxWidth: 600 }}>
      <div className="anim-fade-up" style={{ marginBottom: '2rem' }}>
        <h1>My Profile</h1>
        <p>Manage preferences, notifications, and personalization settings.</p>
      </div>

      {/* Avatar + name */}
      <div className="card anim-fade-up stagger-1" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', flexShrink:0 }}>
          J
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem' }}>Jayani Trivedi</h2>
          <p style={{ fontSize: '0.85rem', margin:0 }}>FlowSync AI Member · Stadium Pass Holder</p>
        </div>
      </div>

      {/* Settings rows */}
      {[
        { icon: Map,    label: 'Routing Preference',   value: 'Fastest Path',  action: 'Change' },
        { icon: Bell,   label: 'Push Notifications',   value: 'Alerts + Tips', action: 'Manage' },
        { icon: Shield, label: 'Accessibility Mode',   value: 'Off',           action: 'Enable' },
        { icon: Zap,    label: 'AI Personalization',   value: 'Full Profile',  action: 'Review' },
      ].map((row, i) => {
        const Icon = row.icon;
        return (
          <div key={row.label} className={`card anim-fade-up stagger-${i + 1}`} style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'0.8rem', padding:'1rem 1.2rem' }}>
            <div style={{ background:'var(--primary-faint)', padding:'0.6rem', borderRadius:'var(--radius-sm)' }}>
              <Icon size={18} color="var(--primary-light)" aria-hidden="true" />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>{row.label}</div>
              <div style={{ fontWeight:600 }}>{row.value}</div>
            </div>
            <button className="btn-ghost" style={{ fontSize:'0.8rem', padding:'0.4rem 0.8rem' }} aria-label={`${row.action} ${row.label}`}>
              {row.action}
            </button>
          </div>
        );
      })}
    </main>
  );
}
