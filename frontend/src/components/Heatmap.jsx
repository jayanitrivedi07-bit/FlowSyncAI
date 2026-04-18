import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, CheckCircle, ArrowRight, ArrowLeft,
  ArrowDown, Navigation, X, Zap, Clock, Users, RefreshCw
} from 'lucide-react';
import { useCrowdZones } from '../useFirestore.js';


/* ─────────────────────────────────────────────────────────
   ZONE CONFIG — each zone knows its own routing advice
───────────────────────────────────────────────────────── */
const INIT_ZONES = [
  {
    id: 'gate-a', name: 'Gate A', subtitle: 'North Entrance',
    top: '10%',  left: '16%',  size: 120,
    density: 'High',   occ: 92, wait: 12,
    avoid: true,
    route: { arrow: '→', label: 'Move to Gate B', targetId: 'gate-b', saving: 10 },
  },
  {
    id: 'gate-b', name: 'Gate B', subtitle: 'East Entrance',
    top: '10%',  left: '66%', size: 100,
    density: 'Low',    occ: 18, wait: 2,
    avoid: false,
    route: null,
  },
  {
    id: 'gate-c', name: 'Gate C', subtitle: 'South Entrance',
    top: '46%',  left: '4%',  size: 98,
    density: 'Medium', occ: 64, wait: 5,
    avoid: false,
    route: { arrow: '↑', label: 'Gate B is faster', targetId: 'gate-b', saving: 3 },
  },
  {
    id: 'food-m', name: 'Food Court Main', subtitle: 'Central Area',
    top: '40%',  left: '50%', size: 150,
    density: 'Medium', occ: 77, wait: 15,
    avoid: false,
    route: { arrow: '←', label: 'Food West saves 11 min', targetId: 'food-w', saving: 11 },
  },
  {
    id: 'food-w', name: 'Food West', subtitle: 'West Wing',
    top: '58%',  left: '20%', size: 108,
    density: 'Low',    occ: 30, wait: 4,
    avoid: false,
    route: null,
  },
  {
    id: 'rest-n', name: 'Restrooms N', subtitle: 'North Block',
    top: '20%',  left: '76%', size: 84,
    density: 'High',   occ: 97, wait: 8,
    avoid: true,
    route: { arrow: '↓', label: 'Restrooms South is clear', targetId: 'rest-s', saving: 7 },
  },
  {
    id: 'rest-s', name: 'Restrooms S', subtitle: 'South Block',
    top: '76%',  left: '63%', size: 78,
    density: 'Low',    occ: 20, wait: 1,
    avoid: false,
    route: null,
  },
  {
    id: 'merch', name: 'Merchandise', subtitle: 'East Stand',
    top: '28%',  left: '37%', size: 92,
    density: 'Medium', occ: 72, wait: 5,
    avoid: false,
    route: null,
  },
];

const DENSITY_GRAD = {
  High:   (a) => `radial-gradient(circle, rgba(239,68,68,${a}) 0%, rgba(239,68,68,0) 70%)`,
  Medium: (a) => `radial-gradient(circle, rgba(245,158,11,${a}) 0%, rgba(245,158,11,0) 70%)`,
  Low:    (a) => `radial-gradient(circle, rgba(16,185,129,${a})  0%, rgba(16,185,129,0) 70%)`,
};
const DENSITY_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
const ARROW_ICONS   = { '→': ArrowRight, '←': ArrowLeft, '↓': ArrowDown, '↑': ArrowRight };

/* ─────────────────────────────────────────────────────────
   DIRECTION ARROW — floats near zone, points to alternative
───────────────────────────────────────────────────────── */
function DirectionArrow({ zone, zones, onSelect }) {
  if (!zone.route || !zone.avoid) return null;
  const target = zones.find(z => z.id === zone.route.targetId);
  if (!target) return null;

  const ArrowIcon = ARROW_ICONS[zone.route.arrow] || ArrowRight;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(target); }}
      role="button"
      tabIndex={0}
      aria-label={`Navigate to ${target.name}`}
      onKeyDown={e => e.key === 'Enter' && onSelect(target)}
      style={{
        position: 'absolute',
        top: `calc(${zone.top} + ${zone.size * 0.3}px)`,
        left: `calc(${zone.left} + ${zone.size * 0.6}px)`,
        zIndex: 25,
        display: 'flex', alignItems: 'center', gap: '0.3rem',
        background: 'rgba(7,13,27,0.92)',
        border: '1px solid rgba(16,185,129,0.5)',
        borderRadius: '99px',
        padding: '0.25rem 0.6rem',
        cursor: 'pointer',
        animation: 'fadeIn 0.4s var(--ease)',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <ArrowIcon size={11} color="#10b981" />
      <span style={{ fontSize: '0.63rem', color: '#10b981', fontWeight: 700 }}>
        {zone.route.label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ACTION PANEL — slides up on zone tap (no chat needed)
───────────────────────────────────────────────────────── */
function ActionPanel({ zone, zones, onClose, onSelectTarget }) {
  if (!zone) return null;

  const target = zone.route?.targetId ? zones.find(z => z.id === zone.route.targetId) : null;
  const isCritical = zone.occ >= 90;

  return (
    <div
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(7,13,27,0.97)',
        backdropFilter: 'blur(16px)',
        borderTop: `2px solid ${DENSITY_COLOR[zone.density]}`,
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        padding: '1.1rem 1.3rem 1.2rem',
        zIndex: 40,
        animation: 'fadeUp 0.25s var(--ease)',
      }}
      role="region"
      aria-label={`Zone details: ${zone.name}`}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            {/* Pulsing status dot */}
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: DENSITY_COLOR[zone.density],
              display: 'inline-block',
              animation: zone.density === 'High' ? 'pulseDot 1s infinite' : 'none',
            }} />
            <span style={{ fontWeight: 700, fontSize: '0.97rem', color: '#fff' }}>{zone.name}</span>
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '99px',
              background: `${DENSITY_COLOR[zone.density]}20`,
              color: DENSITY_COLOR[zone.density],
              border: `1px solid ${DENSITY_COLOR[zone.density]}40`,
            }}>
              {zone.density.toUpperCase()}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{zone.subtitle}</span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
          aria-label="Close zone details"
        >
          <X size={17} />
        </button>
      </div>

      {/* Occupancy bar */}
      <div style={{ marginBottom: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
          <span>Occupancy</span>
          <span style={{ color: DENSITY_COLOR[zone.density], fontWeight: 700 }}>{zone.occ}%</span>
        </div>
        <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '99px',
            width: `${zone.occ}%`,
            background: `linear-gradient(90deg, ${DENSITY_COLOR[zone.density]}, ${DENSITY_COLOR[zone.density]}aa)`,
            transition: 'width 0.8s var(--ease)',
          }} />
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Clock size={13} /> <strong style={{ color: '#fff' }}>{zone.wait} min</strong> wait
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Users size={13} /> {zone.occ}% capacity
        </span>
      </div>

      {/* ── ROUTING RECOMMENDATION — no chat needed */}
      {zone.route && target ? (
        <div style={{
          background: isCritical ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
          border: `1px solid ${isCritical ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '0.8rem 1rem',
          marginBottom: '0.8rem',
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
            {isCritical
              ? <AlertTriangle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
              : <Zap size={15} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
            }
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: isCritical ? '#ef4444' : '#10b981', marginBottom: '0.15rem' }}>
                {isCritical ? 'Avoid this zone' : 'Faster alternative available'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {zone.route.arrow} {zone.route.label} — saves{' '}
                <strong style={{ color: '#fff' }}>{zone.route.saving} min</strong>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={() => onSelectTarget(target)}
              style={{
                flex: 1, padding: '0.55rem 0.8rem',
                background: '#10b981', border: 'none', borderRadius: 'var(--radius-sm)',
                color: '#000', fontWeight: 700, fontSize: '0.82rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                boxShadow: '0 2px 12px rgba(16,185,129,0.35)',
                transition: 'transform 0.15s',
              }}
              id={`go-to-${target.id}-btn`}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Navigation size={13} /> Go to {target.name}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '0.55rem 0.8rem',
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)',
                fontSize: '0.8rem', cursor: 'pointer',
              }}
            >
              Stay
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 'var(--radius-sm)', padding: '0.7rem 1rem',
          marginBottom: '0.8rem',
        }}>
          <CheckCircle size={15} color="#10b981" />
          <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 600 }}>
            This zone is clear — good to go!
          </span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN HEATMAP COMPONENT
───────────────────────────────────────────────────────── */
export default function Heatmap() {
  // Layout config (positions, sizes, routing advice) stays local
  const [zones, setZones]       = useState(INIT_ZONES);
  const [selected, setSelected] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing]   = useState(false);

  // 🔥 Real-time Firestore crowd data
  const { zones: firestoreZones, loading: fsLoading } = useCrowdZones();

  // Merge Firestore live data into layout config whenever it updates
  useEffect(() => {
    if (!firestoreZones || firestoreZones.length === 0) return;

    setZones(prev => prev.map(localZone => {
      // Match by zone name (Firestore doc has a `zone` field)
      const live = firestoreZones.find(fz =>
        fz.zone && localZone.name && (
          fz.zone.toLowerCase().includes(localZone.name.toLowerCase()) ||
          localZone.name.toLowerCase().includes(fz.zone.toLowerCase().split(' ')[0].toLowerCase())
        )
      );
      if (!live) return localZone;

      const newOcc     = live.occupancy !== undefined ? Math.round((live.occupancy / (live.capacity || 1)) * 100) : localZone.occ;
      const newDensity = live.density || (newOcc >= 80 ? 'High' : newOcc >= 45 ? 'Medium' : 'Low');
      const avoid      = newDensity === 'High';

      return {
        ...localZone,
        occ:     newOcc,
        wait:    live.wait ?? localZone.wait,
        density: newDensity,
        avoid,
      };
    }));

    setLastRefresh(new Date());
    setRefreshing(false);
  }, [firestoreZones]);

  // Keep selected zone in sync when live data updates
  useEffect(() => {
    if (selected) {
      const fresh = zones.find(z => z.id === selected.id);
      if (fresh) setSelected(fresh);
    }
  }, [zones]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    // Firestore onSnapshot already handles updates automatically;
    // this just gives the user visual feedback
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleSelect       = useCallback((zone) => setSelected(prev => prev?.id === zone.id ? null : zone), []);
  const handleSelectTarget = useCallback((target) => setSelected(target), []);
  const handleClose        = useCallback(() => setSelected(null), []);

  const highCount = zones.filter(z => z.density === 'High').length;

  return (
    <div>
      {/* ── Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {/* Status chips */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { color: '#ef4444', label: `${highCount} High` },
            { color: '#f59e0b', label: `${zones.filter(z => z.density === 'Medium').length} Medium` },
            { color: '#10b981', label: `${zones.filter(z => z.density === 'Low').length} Clear` },
          ].map(s => (
            <span key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              background: `${s.color}15`, border: `1px solid ${s.color}35`,
              borderRadius: '99px', padding: '0.2rem 0.7rem',
              fontSize: '0.72rem', fontWeight: 600, color: s.color,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
              {s.label}
            </span>
          ))}
        </div>

        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>

        <button
          onClick={refresh}
          disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            padding: '0.3rem 0.7rem', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer',
          }}
          aria-label="Refresh map data"
          id="refresh-map-btn"
        >
          <RefreshCw size={12} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* ── TAP HINT */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        marginBottom: '0.8rem', fontSize: '0.75rem', color: 'var(--text-muted)',
      }}>
        <span style={{ fontSize: '1rem' }}>👆</span>
        Tap any zone for instant routing · High zones pulse red
        {highCount > 0 && (
          <span style={{
            marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700,
            color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}>
            <AlertTriangle size={11} /> {highCount} zone{highCount > 1 ? 's' : ''} need attention
          </span>
        )}
      </div>

      {/* ── MAP CANVAS */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(360px, 54vw, 500px)',
          background: 'radial-gradient(ellipse at center, #0c1a38 0%, #070d1b 80%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.6)',
          userSelect: 'none',
        }}
        role="application"
        aria-label="Stadium crowd heatmap — tap zones for routing"
      >
        {/* Stadium rings */}
        {[88, 62, 38].map((pct, i) => (
          <div key={i} aria-hidden="true" style={{
            position: 'absolute',
            top: `${(100 - pct) / 2}%`, left: `${(100 - pct) / 2}%`,
            width: `${pct}%`, height: `${pct}%`,
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />
        ))}

        {/* Grid lines */}
        {[33, 66].map(p => (
          <React.Fragment key={p}>
            <div aria-hidden="true" style={{ position: 'absolute', top: `${p}%`, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.025)', pointerEvents: 'none' }} />
            <div aria-hidden="true" style={{ position: 'absolute', left: `${p}%`, top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.025)', pointerEvents: 'none' }} />
          </React.Fragment>
        ))}

        {/* Centre label */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>⬡ Main Stage</div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', opacity: 0.6 }}>Live View</div>
        </div>

        {/* Directional arrows — float over HIGH zones */}
        {zones.map(z => (
          <DirectionArrow key={`arrow-${z.id}`} zone={z} zones={zones} onSelect={handleSelect} />
        ))}

        {/* Heat zones */}
        {zones.map((z) => {
          const isSelected = selected?.id === z.id;
          const isHigh     = z.density === 'High';

          return (
            <div key={z.id} style={{ position: 'absolute', top: z.top, left: z.left, zIndex: isSelected ? 30 : 5 }}>

              {/* Outer pulse ring for HIGH zones */}
              {isHigh && (
                <div aria-hidden="true" style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%,-50%)',
                  width: z.size + 30, height: z.size + 30,
                  borderRadius: '50%',
                  border: '2px solid rgba(239,68,68,0.4)',
                  animation: 'heatPulseRing 2s ease-in-out infinite',
                  pointerEvents: 'none',
                }} />
              )}

              {/* Selected ring */}
              {isSelected && (
                <div aria-hidden="true" style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%,-50%)',
                  width: z.size + 16, height: z.size + 16,
                  borderRadius: '50%',
                  border: `2px solid ${DENSITY_COLOR[z.density]}`,
                  boxShadow: `0 0 20px ${DENSITY_COLOR[z.density]}60`,
                  pointerEvents: 'none',
                }} />
              )}

              {/* Main heat blob */}
              <div
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`${z.name}: ${z.density} density, ${z.wait} min wait. Tap for routing.`}
                onClick={() => handleSelect(z)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelect(z)}
                style={{
                  width: z.size, height: z.size, borderRadius: '50%',
                  background: DENSITY_GRAD[z.density](isSelected ? 0.9 : isHigh ? 0.75 : 0.55),
                  cursor: 'pointer',
                  animation: isHigh
                    ? `heatPulse ${1.5 + Math.random() * 0.5}s ease-in-out infinite`
                    : 'fadeIn 0.8s ease-out',
                  transition: 'transform 0.25s var(--ease), filter 0.25s',
                  transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                  filter: isSelected ? `drop-shadow(0 0 16px ${DENSITY_COLOR[z.density]})` : 'none',
                }}
              />

              {/* Zone label — always visible */}
              <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center', pointerEvents: 'none',
                width: z.size + 20,
              }}>
                <div style={{
                  fontSize: z.size > 100 ? '0.7rem' : '0.6rem',
                  fontWeight: 700, color: '#fff',
                  textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                  lineHeight: 1.2,
                }}>{z.name}</div>
                <div style={{
                  fontSize: '0.58rem', color: 'rgba(255,255,255,0.6)',
                  marginTop: '0.15rem',
                  textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                }}>{z.wait}m wait</div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div aria-label="Density key" style={{
          position: 'absolute', bottom: selected ? 'calc(105px + 0.5rem)' : '1rem',
          left: '1rem',
          display: 'flex', gap: '0.8rem',
          background: 'rgba(7,13,27,0.85)', backdropFilter: 'blur(8px)',
          padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)', fontSize: '0.65rem',
          transition: 'bottom 0.25s var(--ease)',
          zIndex: 35,
        }}>
          {['Low', 'Medium', 'High'].map(d => (
            <span key={d} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: DENSITY_COLOR[d] }}>
              <span style={{ width: 7, height: 7, background: DENSITY_COLOR[d], borderRadius: '50%', display: 'inline-block' }} />
              {d}
            </span>
          ))}
        </div>

        {/* Action Panel */}
        <ActionPanel
          zone={selected}
          zones={zones}
          onClose={handleClose}
          onSelectTarget={handleSelectTarget}
        />
      </div>
    </div>
  );
}
