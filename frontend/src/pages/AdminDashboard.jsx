import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import {
  Users, AlertTriangle, Clock, BellRing, Zap, Shield,
  PlayCircle, Activity, TrendingUp
} from 'lucide-react';

/* ── initial chart datasets ── */
const INIT_TREND = [
  { time: '18:00', Gate_A: 40, Food_Court: 28, Restrooms: 60  },
  { time: '18:30', Gate_A: 55, Food_Court: 48, Restrooms: 80  },
  { time: '19:00', Gate_A: 70, Food_Court: 72, Restrooms: 97  },
  { time: '19:30', Gate_A: 92, Food_Court: 77, Restrooms: 95  },
  { time: '20:00', Gate_A: 88, Food_Court: 65, Restrooms: 90  },
];

const WAIT_DATA = [
  { service: 'Food Main',    wait: 15, color: '#f59e0b' },
  { service: 'Food West',    wait: 4,  color: '#10b981' },
  { service: 'Restroom N',   wait: 8,  color: '#ef4444' },
  { service: 'Restroom S',   wait: 1,  color: '#10b981' },
  { service: 'Merchandise',  wait: 5,  color: '#3b82f6' },
  { service: 'Gate Ticket',  wait: 20, color: '#ef4444' },
];

const KPI = [
  { label: 'Total Crowd',      icon: Users,         color: '#3b82f6', value: st => st.total },
  { label: 'High-Risk Zones',  icon: AlertTriangle, color: '#ef4444', value: st => st.highZones },
  { label: 'Avg Wait Time',    icon: Clock,         color: '#f59e0b', value: st => st.avgWait },
  { label: 'Active Alerts',    icon: BellRing,      color: '#10b981', value: st => st.alerts },
];

const EVENTS = [
  { id: 'goal',      label: '⚽ Simulate Goal',        color: 'var(--danger)' },
  { id: 'halftime',  label: '⏸ Simulate Halftime',    color: 'var(--warning)' },
  { id: 'match_end', label: '🏆 Simulate Match End',   color: 'var(--success)' },
  { id: 'emergency', label: '🚨 Emergency Drill',       color: 'var(--info)' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-solid)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.8rem 1rem', fontSize: '0.82rem' }}>
      <div style={{ fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}{p.name.includes('wait') || p.name.includes('wait') ? ' min' : '%'}</strong></div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [trend, setTrend]       = useState(INIT_TREND);
  const [alerts, setAlerts]     = useState([
    { id: 1, sev: 'HIGH',     text: 'Gate A at 92% capacity – deploy crowd control staff.', time: '19:30' },
    { id: 2, sev: 'CAUTION',  text: 'Food Court Main: wait time rising – 15 min now.',      time: '19:45' },
  ]);
  const [stats, setStats]       = useState({ total: '4,250', highZones: 2, avgWait: '9 min', alerts: 2 });
  const [simulating, setSim]    = useState(null);
  const [aiResp, setAiResp]     = useState('');
  const [agentRunning, setAR]   = useState(false);
  const [broadcastText, setBt]  = useState('');
  const [broadcasting, setBcg]  = useState(false);

  const simulate = (event) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSim(event.id);
    setAR(true);
    setAiResp('');

    setTimeout(() => {
      let newSlice, newAlert, resp;

      if (event.id === 'goal') {
        newSlice = { time: now, Gate_A: 25, Food_Court: 98, Restrooms: 100 };
        newAlert = { id: Date.now(), sev: 'CRITICAL', text: '⚽ Goal! Washroom + Food Court overflow imminent.', time: now };
        resp = 'Goal scored! Predicting mass movement to Food Court and Restrooms within 2 min. Pre-routing users to West alternatives.';
      } else if (event.id === 'halftime') {
        newSlice = { time: now, Gate_A: 60, Food_Court: 95, Restrooms: 99 };
        newAlert = { id: Date.now(), sev: 'HIGH', text: '⏸ Halftime rush — all services spiking.', time: now };
        resp = 'Halftime detected. Expecting 40% surge in Food + Restroom demand. Routing suggestions dispatched to users.';
      } else if (event.id === 'match_end') {
        newSlice = { time: now, Gate_A: 100, Food_Court: 35, Restrooms: 40 };
        newAlert = { id: Date.now(), sev: 'CRITICAL', text: '🏆 Match end — Gate A at max! All exits needed.', time: now };
        resp = 'Match ended. Gate A at 100% capacity – activating overflow protocol to Gates B & C. Estimated clearance: 22 min.';
      } else {
        newSlice = { time: now, Gate_A: 80, Food_Court: 40, Restrooms: 55 };
        newAlert = { id: Date.now(), sev: 'HIGH', text: '🚨 Emergency drill initiated — evacuating Block D.', time: now };
        resp = 'Emergency drill running. All exits CLEAR except Exit D (blocked). Routing verified. Capacity: 1,200 pax/min via A+C.';
      }

      setTrend(p => [...p.slice(-4), newSlice]);
      setAlerts(p => [newAlert, ...p.slice(0, 3)]);
      setStats(s => ({ ...s, alerts: s.alerts + 1, highZones: Math.min(s.highZones + 1, 6) }));
      setAiResp(resp);
      setAR(false);
      setSim(null);
    }, 1800);
  };

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    setBcg(true);
    setTimeout(() => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAlerts(p => [{
        id: Date.now(),
        sev: 'CRITICAL',
        text: `📢 SYSTEM BROADCAST: ${broadcastText}`,
        time: now
      }, ...p.slice(0, 3)]);
      setStats(s => ({ ...s, alerts: s.alerts + 1 }));
      setBt('');
      setBcg(false);
    }, 600);
  };

  return (
    <main aria-label="Admin Dashboard" style={{ animation: 'fadeIn 0.35s ease-out' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="anim-fade-up">
          <h1>Admin Control Centre</h1>
          <p style={{ marginTop: '0.3rem' }}>Live analytics · Multi-agent AI monitoring · Event simulation</p>
        </div>
        <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
          {EVENTS.map(ev => (
            <button
              key={ev.id}
              className="btn-ghost"
              style={{ borderColor: ev.color, color: ev.color, opacity: agentRunning ? 0.5 : 1 }}
              onClick={() => simulate(ev)}
              disabled={agentRunning}
              aria-label={`Simulate ${ev.label}`}
            >
              {simulating === ev.id ? 'Running…' : ev.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI response panel */}
      {aiResp && (
        <div className="anim-fade-up" style={{ background: 'var(--accent-faint)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 'var(--radius-md)', padding: '1rem 1.4rem', marginBottom: '1.8rem', display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
          <Zap size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '0.2rem' }}>Admin Alert Agent Response</div>
            <p style={{ color: 'var(--text)', margin: 0, fontSize: '0.9rem' }}>{aiResp}</p>
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {KPI.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className={`card anim-fade-up stagger-${i + 1}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem 1.2rem' }}>
              <div style={{ background: `${k.color}20`, padding: '0.75rem', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}>
                <Icon size={22} color={k.color} aria-hidden="true" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{k.label}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>{k.value(stats)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts + alerts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Area chart: occupancy % trend */}
          <div className="card anim-fade-up stagger-2">
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.2rem' }}>
              <TrendingUp size={17} color="var(--accent)" aria-hidden="true" /> Zone Occupancy % Trend
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trend}>
                <defs>
                  {[['gA','#ef4444'],['gF','#f59e0b'],['gR','#3b82f6']].map(([id,c])=>(
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={c} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={c} stopOpacity={0}  />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--text-muted)" tick={{fontSize:12}} />
                <YAxis stroke="var(--text-muted)" tick={{fontSize:12}} unit="%" domain={[0,100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="Gate_A"    stroke="#ef4444" fill="url(#gA)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="Food_Court" stroke="#f59e0b" fill="url(#gF)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="Restrooms"  stroke="#3b82f6" fill="url(#gR)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart: wait times */}
          <div className="card anim-fade-up stagger-3">
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.2rem' }}>
              <Activity size={17} color="var(--accent)" aria-hidden="true" /> Service Wait Times (min)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={WAIT_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="service" stroke="var(--text-muted)" tick={{fontSize:11}} />
                <YAxis stroke="var(--text-muted)" tick={{fontSize:11}} unit="m" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="wait" name="Wait Time" radius={[5,5,0,0]} fill="var(--primary-light)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts column */}
        <div className="card anim-fade-up stagger-2" style={{ height: 'fit-content', maxHeight: '90vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <h3 style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem', flexShrink:0 }}>
            <Shield size={17} color="var(--danger)" aria-hidden="true" /> Live Alerts
          </h3>
          <div style={{ overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:'0.9rem' }} aria-live="assertive" aria-label="Live system alerts">
            {alerts.map(a => (
              <div key={a.id} className="anim-fade-up" style={{ padding:'0.9rem 1rem', borderRadius:'var(--radius-sm)', borderLeft:`4px solid ${a.sev === 'CRITICAL' ? 'var(--danger)' : a.sev === 'HIGH' ? 'var(--warning)' : 'var(--info)'}`, background: a.sev === 'CRITICAL' ? 'rgba(239,68,68,0.1)' : a.sev === 'HIGH' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.35rem', fontSize:'0.75rem' }}>
                  <span style={{ fontWeight:700, color: a.sev === 'CRITICAL' ? 'var(--danger)' : a.sev === 'HIGH' ? 'var(--warning)' : 'var(--info)' }}>{a.sev}</span>
                  <span style={{ color:'var(--text-muted)' }}>{a.time}</span>
                </div>
                <p style={{ margin:0, fontSize:'0.83rem', color:'var(--text)' }}>{a.text}</p>
              </div>
            ))}
          </div>

          {/* Broadcast input form */}
          <form style={{ marginTop:'1rem', borderTop:'1px solid var(--border)', paddingTop:'1rem', display:'flex', flexDirection:'column', gap:'0.6rem' }} onSubmit={handleBroadcast}>
            <label style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--text-muted)' }}>Broadcast Platform-Wide Alert</label>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <input 
                type="text" 
                placeholder="Type emergency message..." 
                value={broadcastText}
                onChange={e => setBt(e.target.value)}
                disabled={broadcasting}
                style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'0.6rem 0.8rem', color:'var(--text)', fontSize:'0.85rem' }}
              />
              <button 
                type="submit" 
                disabled={!broadcastText.trim() || broadcasting}
                style={{ background:'var(--danger)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', padding:'0 1rem', fontWeight:600, fontSize:'0.85rem', cursor: broadcastText.trim() && !broadcasting ? 'pointer' : 'not-allowed', opacity: broadcastText.trim() && !broadcasting ? 1 : 0.5 }}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
