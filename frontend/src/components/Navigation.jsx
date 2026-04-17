import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, BarChart3, Activity, User, Zap, QrCode, ShoppingBag } from 'lucide-react';
import './Navigation.css';

const NAV = [
  { to: '/',       icon: Home,       label: 'Overview'  },
  { to: '/map',    icon: Map,        label: 'Live Map'  },
  { to: '/entry',  icon: QrCode,     label: 'My Ticket' },
  { to: '/orders', icon: ShoppingBag,label: 'Order Food', badge: '🟢' },
  { to: '/admin',  icon: BarChart3,  label: 'Admin'     },
  { to: '/stats',  icon: Activity,   label: 'My Stats'  },
  { to: '/profile',icon: User,       label: 'Profile'   },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="sidebar" aria-label="Primary navigation">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon" aria-hidden="true">
          <Zap size={20} />
        </div>
        <div>
          <div className="brand-name">FlowSync AI</div>
          <div className="brand-tagline">Smart Venue Intelligence</div>
        </div>
      </div>

      {/* Live status */}
      <div className="status-banner" role="status" aria-live="polite">
        <span className="live-dot" aria-hidden="true" />
        <span>Live · 4,250 attendees</span>
        <span className="alert-chip" aria-label="2 alerts">2 alerts</span>
      </div>

      {/* Nav links */}
      <ul className="nav-links" role="list">
        {NAV.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              aria-current={location.pathname === to ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true"><Icon size={19} /></span>
              <span className="nav-label">{label}</span>
              {to === '/admin' && <span className="nav-badge" aria-label="2 notifications">2</span>}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <span>Powered by Gemini AI</span>
      </div>
    </nav>
  );
}
