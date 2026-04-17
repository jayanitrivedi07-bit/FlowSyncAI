import React, { useState } from 'react';
import Heatmap from '../components/Heatmap';
import { RefreshCw, Download, AlertTriangle, Zap } from 'lucide-react';

export default function MapView() {
  const [exportDone, setExportDone] = useState(false);

  const handleExport = () => {
    setExportDone(true);
    // In production: generate PDF/CSV of zone density report
    setTimeout(() => setExportDone(false), 2500);
  };

  return (
    <main aria-label="Live Venue Map" style={{ animation: 'fadeIn 0.35s ease-out' }}>

      {/* Page header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div className="anim-fade-up">
          <h1>Live Venue Map</h1>
          <p style={{ marginTop: '0.3rem' }}>
            Tap any zone for instant routing · Refreshes every 30 s
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            className="btn-ghost"
            onClick={handleExport}
            aria-label="Export density report"
            id="export-map-btn"
            style={{ fontSize: '0.85rem' }}
          >
            <Download size={14} />
            {exportDone ? 'Exported ✓' : 'Export'}
          </button>
        </div>
      </div>

      {/* Critical alert ribbon — only shown when high-risk zones exist */}
      <div className="anim-fade-up stagger-1" style={{
        display: 'flex', alignItems: 'center', gap: '0.8rem',
        background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 'var(--radius-sm)', padding: '0.65rem 1rem',
        marginBottom: '1.2rem',
      }}>
        <AlertTriangle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, fontSize: '0.82rem' }}>
          <span style={{ fontWeight: 700, color: '#ef4444' }}>2 zones critical — </span>
          <span style={{ color: 'var(--text-muted)' }}>
            Gate A (92%) and Restrooms North (97%). Tap them on the map for alternatives.
          </span>
        </div>
        <span style={{
          fontSize: '0.68rem', color: 'var(--success)', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '4px', padding: '0.15rem 0.5rem', whiteSpace: 'nowrap',
        }}>
          <Zap size={10} /> Gate B clear
        </span>
      </div>

      {/* Heatmap card */}
      <div className="card anim-fade-up stagger-2" style={{ padding: '1.2rem' }}>
        <Heatmap />
      </div>

      {/* Usage guide */}
      <div className="anim-fade-up stagger-3" style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))',
        gap: '0.8rem', marginTop: '1.2rem',
      }}>
        {[
          { icon: '👆', title: 'Tap to select',  desc: 'Tap any heat zone to see crowd density and routing options' },
          { icon: '🔴', title: 'Pulsing = avoid', desc: 'Fast-pulsing red blobs indicate critically crowded zones' },
          { icon: '→',  title: 'Follow arrows',  desc: 'Green arrows show instant alternative routes — no chatbot needed' },
        ].map(tip => (
          <div key={tip.title} style={{
            display: 'flex', gap: '0.8rem', alignItems: 'flex-start',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '0.9rem 1rem',
          }}>
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{tip.icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text)', marginBottom: '0.15rem' }}>{tip.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{tip.desc}</div>
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}
