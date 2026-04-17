import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, Navigation, Clock, TrendingDown, Star,
  Zap, MapPin, ShoppingBag, Shield, ChevronRight,
  Award, BarChart2, Target
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────── */
const PROFILE = { name: 'Jayani', preference: 'Fastest Path', accessibility: false };

const FINAL_STATS = {
  stepsSaved:     1240,
  minutesSaved:   28,
  queuesAvoided:  7,
  aiRoutesUsed:   14,
  ordersPlaced:   3,
  alertsReceived: 5,
};

const ACTIVITY = [
  { time: '19:42', icon: '🚪', label: 'Entered via Gate B',         sub: 'AI recommended — saved 10 min vs Gate A', color: '#10b981' },
  { time: '19:58', icon: '🍔', label: 'Ordered from Burger Pit',    sub: 'Classic Smash Burger · ₹249 · Ready in 8 min', color: '#f59e0b' },
  { time: '20:15', icon: '🗺️', label: 'Rerouted via West Concourse', sub: 'Avoided Restrooms North congestion surge', color: '#3b82f6' },
  { time: '20:31', icon: '🚨', label: 'Alert received',              sub: 'Halftime — AI pre-routed to Food Court West', color: '#ef4444' },
  { time: '20:44', icon: '🍦', label: 'Ordered from Gelato Garden', sub: 'Double Scoop · ₹159 · Skipped queue via app', color: '#8b5cf6' },
  { time: '21:02', icon: '✅', label: 'Exit via Gate B',             sub: 'Left 12 min before match end — zero queue', color: '#10b981' },
];

const BADGES = [
  { icon: '🏃', label: 'Speed Runner',   desc: 'Fastest path used 10× times',   earned: true  },
  { icon: '🧠', label: 'AI Whisperer',   desc: 'Asked 14 questions to FlowSync', earned: true  },
  { icon: '🚀', label: 'Early Adopter',  desc: 'Top 100 FlowSync users',         earned: true  },
  { icon: '🎯', label: 'Zero-Queue',     desc: 'Avoided all queues in 1 visit',  earned: false },
  { icon: '🌟', label: 'Super Fan',      desc: 'Attended 5 events',              earned: false },
];

const JOURNEY = [
  { id: 'gate-b', label: 'Gate B Entry',       x: '15%', y: '15%', done: true  },
  { id: 'food-m', label: 'Burger Pit Order',   x: '60%', y: '25%', done: true  },
  { id: 'west',   label: 'West Concourse',     x: '20%', y: '55%', done: true  },
  { id: 'gelato', label: 'Gelato Garden',      x: '50%', y: '70%', done: true  },
  { id: 'exit-b', label: 'Gate B Exit',        x: '14%', y: '85%', done: true  },
];

/* ─────────────────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────────────────── */
function AnimCounter({ target, duration = 1800, suffix = '' }) {
  const [val, setVal] = useState(0);
  const started   = useRef(false);
  const nodeRef   = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setVal(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    if (nodeRef.current) observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={nodeRef}>{val.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, target, color, suffix, index }) {
  return (
    <div
      className={`card anim-fade-up stagger-${Math.min(index + 1, 6)}`}
      style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.1rem 1.2rem' }}
    >
      <div style={{ background: `${color}18`, padding: '0.7rem', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>{label}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
          <AnimCounter target={target} suffix={suffix} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MINI JOURNEY MAP — path through the stadium
───────────────────────────────────────────────────────── */
function JourneyPath() {
  const [animStep, setAnimStep] = useState(-1);

  useEffect(() => {
    const timers = JOURNEY.map((_, i) =>
      setTimeout(() => setAnimStep(i), 300 + i * 400)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ position: 'relative', height: 200, background: 'radial-gradient(ellipse at center, #0c1a38 0%, #070d1b 80%)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      {/* Stadium rings */}
      {[78, 52, 28].map((pct, i) => (
        <div key={i} aria-hidden="true" style={{
          position: 'absolute',
          top: `${(100 - pct) / 2}%`, left: `${(100 - pct) / 2}%`,
          width: `${pct}%`, height: `${pct}%`,
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '50%',
        }} />
      ))}
      {/* Centre */}
      <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '0.55rem', color: 'var(--text-dim)', textAlign: 'center', letterSpacing: '0.1em' }}>
        PITCH
      </div>
      {/* Path lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
        {JOURNEY.slice(1).map((point, i) => {
          const prev = JOURNEY[i];
          if (animStep < i) return null;
          return (
            <line
              key={i}
              x1={prev.x} y1={prev.y}
              x2={point.x} y2={point.y}
              stroke="rgba(16,185,129,0.4)" strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          );
        })}
      </svg>
      {/* Journey stops */}
      {JOURNEY.map((stop, i) => (
        <div
          key={stop.id}
          style={{
            position: 'absolute', left: stop.x, top: stop.y,
            transition: 'opacity 0.4s, transform 0.4s',
            opacity: animStep >= i ? 1 : 0,
            transform: `translate(-50%,-50%) scale(${animStep >= i ? 1 : 0.5})`,
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: '#10b981', border: '2px solid var(--bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.55rem', color: '#000', fontWeight: 800,
            boxShadow: '0 0 8px rgba(16,185,129,0.6)',
          }}>
            {i + 1}
          </div>
          {animStep >= i && (
            <div style={{
              position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(7,13,27,0.92)', border: '1px solid var(--border)',
              borderRadius: 4, padding: '0.1rem 0.35rem',
              fontSize: '0.55rem', color: 'var(--text-muted)', whiteSpace: 'nowrap',
            }}>
              {stop.label}
            </div>
          )}
        </div>
      ))}
      {/* Label */}
      <div style={{ position: 'absolute', top: '0.6rem', right: '0.8rem', fontSize: '0.62rem', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>YOUR ROUTE TODAY</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   COMPARISON BAR — you vs. avg attendee
───────────────────────────────────────────────────────── */
function ComparisonBar({ label, you, avg, unit, color }) {
  const [animate, setAnimate] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setAnimate(true); }, { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const max = Math.max(you, avg) * 1.2;

  return (
    <div ref={ref} style={{ marginBottom: '1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
        <span>{label}</span>
        <span>
          <strong style={{ color }}>{you}{unit}</strong>
          <span style={{ opacity: 0.5 }}> vs {avg}{unit} avg</span>
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {/* You */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          <span style={{ width: 22, textAlign: 'right', flexShrink: 0 }}>You</span>
          <div style={{ flex: 1, height: 8, background: 'var(--bg-solid)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: animate ? `${(you / max) * 100}%` : '0%', background: color, borderRadius: '99px', transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
          </div>
        </div>
        {/* Avg */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          <span style={{ width: 22, textAlign: 'right', flexShrink: 0 }}>Avg</span>
          <div style={{ flex: 1, height: 8, background: 'var(--bg-solid)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: animate ? `${(avg / max) * 100}%` : '0%', background: 'var(--border)', borderRadius: '99px', transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1) 0.15s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
export default function UserStats() {
  const [activeTab, setActiveTab] = useState('today'); // today | badges | compare
  const randomTip = [
    '🎯 Food Court West suits your history — 4 min wait right now.',
    '🗺️ Your usual Gate A route is congested — Gate B is 3× faster today.',
    '⏱️ Leaving 10 min early saves ~18 min at Gate A exit queue.',
    '🚽 Restrooms South are consistently less crowded — bookmark them!',
  ][Math.floor(Date.now() / 1000) % 4];

  return (
    <main aria-label="User Statistics" style={{ animation: 'fadeIn 0.35s ease-out' }}>

      {/* Header */}
      <div className="anim-fade-up" style={{ marginBottom: '1.8rem' }}>
        <h1>Hi, {PROFILE.name} 👋</h1>
        <p style={{ marginTop: '0.35rem' }}>
          FlowSync AI has improved your venue experience today.
        </p>
      </div>

      {/* Personalized AI tip */}
      <div className="anim-fade-up stagger-1" style={{
        background: 'var(--primary-faint)', border: '1px solid rgba(30,58,138,0.35)',
        borderRadius: 'var(--radius-md)', padding: '1rem 1.3rem', marginBottom: '2rem',
        display: 'flex', gap: '0.8rem', alignItems: 'center',
      }}>
        <Zap size={17} color="var(--accent)" style={{ flexShrink: 0 }} />
        <p style={{ color: 'var(--text)', margin: 0, fontSize: '0.88rem' }}>{randomTip}</p>
      </div>

      {/* Animated KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon={Clock}       label="Minutes Saved"    target={FINAL_STATS.minutesSaved}   color="#3b82f6" suffix=" min" index={0} />
        <StatCard icon={TrendingDown} label="Queues Avoided"  target={FINAL_STATS.queuesAvoided}  color="#f59e0b" suffix=""      index={1} />
        <StatCard icon={Navigation}  label="AI Routes Used"   target={FINAL_STATS.aiRoutesUsed}   color="#8b5cf6" suffix=""      index={2} />
        <StatCard icon={ShoppingBag} label="Orders Placed"    target={FINAL_STATS.ordersPlaced}   color="#10b981" suffix=""      index={3} />
        <StatCard icon={Activity}    label="Steps Saved"      target={FINAL_STATS.stepsSaved}     color="#ec4899" suffix=""      index={4} />
        <StatCard icon={Shield}      label="Alerts Received"  target={FINAL_STATS.alertsReceived} color="#ef4444" suffix=""      index={5} />
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', background: 'var(--bg-solid)', borderRadius: 'var(--radius-sm)', padding: '0.3rem', width: 'fit-content' }}>
        {[
          { id: 'today',   label: '📅 Today\'s Journey' },
          { id: 'badges',  label: '🏆 Achievements'     },
          { id: 'compare', label: '📊 vs Average'        },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '0.5rem 1.1rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.84rem',
              background: activeTab === t.id ? 'var(--primary-light)' : 'transparent',
              color:      activeTab === t.id ? '#fff' : 'var(--text-muted)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s var(--ease)',
            }}
            aria-selected={activeTab === t.id}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TODAY'S JOURNEY TAB */}
      {activeTab === 'today' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* Activity timeline */}
          <div className="card anim-fade-up">
            <h3 style={{ fontSize: '0.95rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={16} color="var(--accent)" /> Activity Timeline
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {ACTIVITY.map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', position: 'relative', paddingBottom: i < ACTIVITY.length - 1 ? '1.1rem' : 0 }}>
                  {/* Vertical line */}
                  {i < ACTIVITY.length - 1 && (
                    <div style={{ position: 'absolute', left: '1.05rem', top: 28, bottom: 0, width: 1, background: 'var(--border)' }} />
                  )}
                  {/* Icon dot */}
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    background: `${ev.color}15`, border: `1.5px solid ${ev.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
                    zIndex: 1,
                  }}>
                    {ev.icon}
                  </div>
                  <div style={{ paddingTop: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text)' }}>{ev.label}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{ev.time}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{ev.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Route map + time savings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="card anim-fade-up stagger-1">
              <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="var(--accent)" /> Route Map
              </h3>
              <JourneyPath />
            </div>

            <div className="card anim-fade-up stagger-2">
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={16} color="var(--accent)" /> AI Impact Today
              </h3>
              {[
                { label: 'Time recovered by AI routing', value: '28 min', color: '#10b981' },
                { label: 'Peak congestion dodged',        value: '3 events', color: '#f59e0b' },
                { label: 'Optimal gate selection rate',   value: '100%',    color: '#3b82f6' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                  <strong style={{ color: row.color }}>{row.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BADGES TAB */}
      {activeTab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {BADGES.map((b, i) => (
            <div
              key={b.label}
              className={`card anim-fade-up stagger-${i + 1}`}
              style={{
                display: 'flex', gap: '1rem', alignItems: 'center',
                opacity: b.earned ? 1 : 0.4,
                filter: b.earned ? 'none' : 'grayscale(1)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {b.earned && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  background: 'var(--success)', color: '#000',
                  fontSize: '0.58rem', fontWeight: 800,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '0 0 0 6px',
                }}>EARNED</div>
              )}
              <div style={{ fontSize: '2.2rem', flexShrink: 0 }}>{b.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.2rem' }}>{b.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── COMPARE TAB */}
      {activeTab === 'compare' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="card anim-fade-up">
            <h3 style={{ fontSize: '0.95rem', marginBottom: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={16} color="var(--accent)" /> You vs Average Attendee
            </h3>
            <ComparisonBar label="Wait time in queues" you={4}  avg={22} unit=" min" color="#10b981" />
            <ComparisonBar label="Gates used optimally" you={100} avg={41} unit="%"   color="#3b82f6" />
            <ComparisonBar label="AI suggestions used"  you={14} avg={2}  unit="×"   color="#8b5cf6" />
            <ComparisonBar label="Time saved vs average" you={28} avg={0}  unit=" min" color="#f59e0b" />
          </div>

          <div className="card anim-fade-up stagger-1" style={{ background: 'linear-gradient(145deg, rgba(16,185,129,0.08), rgba(30,58,138,0.15))', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, background: 'linear-gradient(135deg, #10b981, var(--accent))', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                Top 8%
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                of all attendees today
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {[
                  { icon: '⚡', text: '28 min saved vs average' },
                  { icon: '🎯', text: 'Zero missed AI suggestions' },
                  { icon: '🏃', text: 'Shortest total queue time' },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.9rem' }}>
                    <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
