import React from 'react';
import Heatmap from '../components/Heatmap';
import { RefreshCw, Download } from 'lucide-react';

export default function MapView() {
  return (
    <main aria-label="Live Venue Map" style={{ animation: 'fadeIn 0.35s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="anim-fade-up">
          <h1>Live Venue Map</h1>
          <p style={{ marginTop: '0.3rem' }}>Interactive heatmap — zones update every 30 seconds.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="btn-ghost" aria-label="Refresh map data">
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn-ghost" aria-label="Export density report">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      <div className="card anim-fade-up stagger-1" style={{ padding: '1.5rem' }}>
        <Heatmap />
      </div>
    </main>
  );
}
