import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart, Plus, Minus, Trash2, Clock, CheckCircle,
  ChefHat, Zap, Star, Filter, Search, X, Package, AlertCircle
} from 'lucide-react';

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const STALLS = [
  {
    id: 's1', name: 'The Burger Pit', emoji: '🍔', category: 'Mains',
    wait: 8, rating: 4.7, location: 'Food Court Main',
    items: [
      { id: 'b1', name: 'Classic Smash Burger',    price: 249, desc: 'Double patty, cheddar, special sauce', popular: true  },
      { id: 'b2', name: 'Crispy Chicken Burger',   price: 229, desc: 'Fried chicken, sriracha mayo, slaw',   popular: false },
      { id: 'b3', name: 'BBQ Bacon Stack',          price: 279, desc: 'Bacon, BBQ sauce, caramelised onions', popular: true  },
      { id: 'b4', name: 'Veggie Burger',            price: 199, desc: 'Black bean patty, avocado, tomato',    popular: false },
    ],
  },
  {
    id: 's2', name: 'Spice Route', emoji: '🌮', category: 'Street Food',
    wait: 5, rating: 4.5, location: 'Food Court West',
    items: [
      { id: 'sr1', name: 'Chicken Tacos (3)',       price: 199, desc: 'Grilled chicken, salsa, jalapeños',    popular: true  },
      { id: 'sr2', name: 'Vada Pav Special',        price: 79,  desc: 'Mumbai-style with green chutney',      popular: true  },
      { id: 'sr3', name: 'Pav Bhaji',               price: 129, desc: 'Rich bhaji with 3 pav',               popular: false },
      { id: 'sr4', name: 'Loaded Nachos',           price: 179, desc: 'Cheese, jalapeños, sour cream, salsa', popular: false },
    ],
  },
  {
    id: 's3', name: 'Pizzeria Azzurra', emoji: '🍕', category: 'Mains',
    wait: 12, rating: 4.8, location: 'Food Court Main',
    items: [
      { id: 'p1', name: 'Margherita (8")',          price: 219, desc: 'San Marzano tomato, fresh mozzarella',  popular: false },
      { id: 'p2', name: 'Pepperoni Beast (10")',    price: 289, desc: 'Double pepperoni, provolone',           popular: true  },
      { id: 'p3', name: 'BBQ Chicken (10")',        price: 299, desc: 'Grilled chicken, BBQ base, red onion',  popular: true  },
      { id: 'p4', name: 'Veg Supreme (8")',         price: 249, desc: 'Bell peppers, olives, mushrooms',       popular: false },
    ],
  },
  {
    id: 's4', name: 'Chill Zone', emoji: '🥤', category: 'Drinks & Snacks',
    wait: 3, rating: 4.3, location: 'Food Court West',
    items: [
      { id: 'c1', name: 'Fresh Lime Soda',          price: 69,  desc: 'Sweet/salt, chilled',                  popular: false },
      { id: 'c2', name: 'Mango Lassi',              price: 99,  desc: 'Thick, chilled, topped with cream',    popular: true  },
      { id: 'c3', name: 'Stadium Nachos',           price: 129, desc: 'Crispy, cheese dip',                   popular: true  },
      { id: 'c4', name: 'Popcorn Combo',            price: 149, desc: 'Large caramel + salted tub',           popular: false },
    ],
  },
  {
    id: 's5', name: 'Gelato Garden', emoji: '🍦', category: 'Desserts',
    wait: 2, rating: 4.9, location: 'Food Court Main',
    items: [
      { id: 'g1', name: 'Double Scoop Gelato',      price: 159, desc: 'Choose 2 of 12 flavours',              popular: true  },
      { id: 'g2', name: 'Waffle Cone Special',      price: 199, desc: 'Triple scoop + crushed nuts',           popular: true  },
      { id: 'g3', name: 'Brownie Sundae',           price: 219, desc: 'Warm brownie, 2 scoops, chocolate sauce', popular: false },
    ],
  },
];

const CATEGORIES = ['All', 'Mains', 'Street Food', 'Drinks & Snacks', 'Desserts'];

const ORDER_STATUSES = [
  { key: 'placed',    label: 'Order Placed',      icon: Package,      color: '#3b82f6', done: true  },
  { key: 'confirmed', label: 'Confirmed',          icon: CheckCircle,  color: '#8b5cf6', done: false },
  { key: 'preparing', label: 'Being Prepared',     icon: ChefHat,      color: '#f59e0b', done: false },
  { key: 'ready',     label: 'Ready for Pickup',   icon: Star,         color: '#10b981', done: false },
];

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */
function ItemCard({ item, stall, qty, onAdd, onRemove }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '1rem 0',
    }}>
      <div style={{ flex: 1, paddingRight: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{item.name}</span>
          {item.popular && (
            <span style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--accent)', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '99px', border: '1px solid rgba(251,191,36,0.3)' }}>
              POPULAR
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.78rem', margin: '0 0 0.4rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--primary-light)' }}>₹{item.price}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {qty > 0 ? (
          <>
            <button
              onClick={() => onRemove(item, stall)}
              style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-solid)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', cursor: 'pointer' }}
              aria-label={`Remove one ${item.name}`}
            >
              <Minus size={12} />
            </button>
            <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{qty}</span>
          </>
        ) : null}
        <button
          onClick={() => onAdd(item, stall)}
          style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-light)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: 'transform 0.15s', boxShadow: '0 2px 8px rgba(37,99,235,0.35)' }}
          aria-label={`Add ${item.name} to cart`}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function StallCard({ stall, cart, onAdd, onRemove, expanded, onToggle }) {
  const stallCount = Object.entries(cart)
    .filter(([id]) => stall.items.some(it => it.id === id))
    .reduce((s, [, {qty}]) => s + qty, 0);

  return (
    <div className="card anim-fade-up" style={{ marginBottom: '1rem', padding: 0, overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        style={{ width: '100%', padding: '1.1rem 1.4rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        aria-expanded={expanded}
        id={`stall-${stall.id}`}
      >
        <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{stall.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{stall.name}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', color: 'var(--accent)' }}>
              <Star size={11} fill="var(--accent)" /> {stall.rating}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} /> ~{stall.wait} min
            </span>
            <span>{stall.location}</span>
          </div>
        </div>
        {stallCount > 0 && (
          <span style={{ background: 'var(--primary-light)', color: '#fff', borderRadius: '99px', minWidth: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
            {stallCount}
          </span>
        )}
        <span style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none', fontSize: '0.7rem' }}>▼</span>
      </button>

      {expanded && (
        <div style={{ padding: '0 1.4rem 1rem' }}>
          {stall.items.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              stall={stall}
              qty={cart[item.id]?.qty || 0}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderTracker({ order, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= ORDER_STATUSES.length - 1) return;
    const times = [0, 3000, 8000, 15000];
    const timers = times.map((t, i) => setTimeout(() => setCurrentStep(i), t));
    return () => timers.forEach(clearTimeout);
  }, []);

  const status = ORDER_STATUSES[currentStep];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(7,13,27,0.85)', zIndex: 1000,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      backdropFilter: 'blur(6px)', animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: 'var(--bg-solid)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        width: '100%', maxWidth: 520, padding: '2rem', animation: 'fadeUp 0.3s var(--ease)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem' }}>Order #{order.id}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} aria-label="Close order tracker">
            <X size={20} />
          </button>
        </div>

        {/* Status indicator */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: `${status.color}20`,
            border: `2px solid ${status.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.8rem', animation: 'pulseDot 1.5s ease-in-out infinite',
          }}>
            <status.icon size={26} color={status.color} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{status.label}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {currentStep < 3 ? `Est. pickup: ${order.wait} min · Stall: ${order.stall}` : `Ready at ${order.stall}! 🎉`}
          </div>
        </div>

        {/* Step progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 14, left: 14, right: 14, height: 2, background: 'var(--border)', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: 14, left: 14, height: 2, background: 'var(--primary-light)', zIndex: 1, transition: 'width 0.6s var(--ease)', width: `${(currentStep / (ORDER_STATUSES.length - 1)) * (100 - (28 / 520 * 100))}%` }} />
          {ORDER_STATUSES.map((s, i) => (
            <div key={s.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', zIndex: 2 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i <= currentStep ? s.color : 'var(--bg-solid)',
                border: `2px solid ${i <= currentStep ? s.color : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.4s var(--ease)',
              }}>
                {i <= currentStep ? <CheckCircle size={13} color="#fff" /> : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />}
              </div>
              <span style={{ fontSize: '0.65rem', color: i <= currentStep ? 'var(--text)' : 'var(--text-muted)', fontWeight: i === currentStep ? 700 : 400, textAlign: 'center', maxWidth: 60 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem' }}>
          {order.items.map(it => (
            <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', padding: '0.3rem 0', color: 'var(--text-muted)' }}>
              <span>{it.name} × {it.qty}</span>
              <span>₹{it.price * it.qty}</span>
            </div>
          ))}
          <div style={{ marginTop: '0.7rem', paddingTop: '0.7rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--text)' }}>
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        {currentStep === ORDER_STATUSES.length - 1 && (
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose} id="collect-order-btn">
            <CheckCircle size={16} /> Mark as Collected
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function Orders() {
  const [category, setCategory]     = useState('All');
  const [search, setSearch]         = useState('');
  const [cart, setCart]             = useState({});       // { itemId: { item, stall, qty } }
  const [expandedStall, setExpanded]= useState('s1');
  const [showCart, setShowCart]     = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [pastOrders, setPastOrders] = useState([]);

  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.item.price * i.qty, 0);

  const filteredStalls = STALLS.filter(s =>
    (category === 'All' || s.category === category) &&
    (search === '' || s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.items.some(it => it.name.toLowerCase().includes(search.toLowerCase())))
  );

  const addItem = useCallback((item, stall) => {
    setCart(prev => ({
      ...prev,
      [item.id]: {
        item, stall,
        qty: (prev[item.id]?.qty || 0) + 1,
      },
    }));
  }, []);

  const removeItem = useCallback((item) => {
    setCart(prev => {
      const qty = (prev[item.id]?.qty || 1) - 1;
      if (qty <= 0) { const next = { ...prev }; delete next[item.id]; return next; }
      return { ...prev, [item.id]: { ...prev[item.id], qty } };
    });
  }, []);

  const placeOrder = () => {
    if (cartItems.length === 0) return;
    const stallName = cartItems[0].stall.name;
    const wait      = cartItems[0].stall.wait;
    const order = {
      id:    Math.random().toString(36).slice(2, 8).toUpperCase(),
      items: cartItems.map(({ item, qty }) => ({ ...item, qty })),
      total: cartTotal,
      stall: stallName,
      wait,
      placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setPastOrders(p => [order, ...p]);
    setCart({});
    setShowCart(false);
    setActiveOrder(order);
  };

  return (
    <main aria-label="Food Ordering" style={{ animation: 'fadeIn 0.35s ease-out' }}>

      {/* Active order tracker modal */}
      {activeOrder && <OrderTracker order={activeOrder} onClose={() => setActiveOrder(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="anim-fade-up">
          <h1>Food & Drinks</h1>
          <p style={{ marginTop: '0.4rem' }}>Order from stadium stalls · Live wait times · Pickup tracking</p>
        </div>

        {/* Cart button */}
        <button
          className="btn-primary"
          onClick={() => setShowCart(true)}
          style={{ position: 'relative' }}
          id="open-cart-btn"
          aria-label={`View cart: ${cartCount} items`}
        >
          <ShoppingCart size={16} />
          Cart
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: -8, right: -8,
              background: 'var(--accent)', color: '#000', borderRadius: '99px',
              minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 800, animation: 'pulseDot 1s ease-in-out',
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Past orders */}
      {pastOrders.length > 0 && (
        <div className="anim-fade-up" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.7rem' }}>RECENT ORDERS</h3>
          <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {pastOrders.map(o => (
              <button
                key={o.id}
                onClick={() => setActiveOrder(o)}
                style={{ background: 'var(--bg-high)', borderRadius: 'var(--radius-sm)', padding: '0.7rem 1rem', whiteSpace: 'nowrap', cursor: 'pointer', color: 'var(--text)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Package size={14} color="var(--primary-light)" />
                #{o.id} · ₹{o.total} · {o.placedAt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="anim-fade-up stagger-1" style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search items or stalls…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              padding: '0.6rem 0.8rem 0.6rem 2.2rem', color: 'var(--text)', fontSize: '0.88rem',
            }}
            aria-label="Search food items"
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '0.5rem 0.9rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600,
                background: category === cat ? 'var(--primary-light)' : 'var(--bg-card)',
                color:      category === cat ? '#fff' : 'var(--text-muted)',
                border:     `1px solid ${category === cat ? 'var(--primary-light)' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 0.2s var(--ease)',
              }}
              aria-pressed={category === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stall list */}
      <div className="anim-fade-up stagger-2">
        {filteredStalls.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={32} style={{ display: 'block', margin: '0 auto 0.8rem' }} />
            No stalls match your search.
          </div>
        ) : (
          filteredStalls.map(stall => (
            <StallCard
              key={stall.id}
              stall={stall}
              cart={cart}
              onAdd={addItem}
              onRemove={removeItem}
              expanded={expandedStall === stall.id}
              onToggle={() => setExpanded(prev => prev === stall.id ? null : stall.id)}
            />
          ))
        )}
      </div>

      {/* ── Cart Drawer ── */}
      {showCart && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(7,13,27,0.8)', zIndex: 900, backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease' }}
          onClick={() => setShowCart(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 400,
              background: 'var(--bg-solid)', borderLeft: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', animation: 'slideRight 0.3s var(--ease)',
            }}
            role="dialog"
            aria-label="Your cart"
          >
            {/* Drawer header */}
            <div style={{ padding: '1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-high)' }}>
              <h2 style={{ fontSize: '1.1rem' }}>
                <ShoppingCart size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
                Your Order
              </h2>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} aria-label="Close cart">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.4rem' }}>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  <ShoppingCart size={36} style={{ display: 'block', margin: '0 auto 0.8rem', opacity: 0.3 }} />
                  Your cart is empty
                </div>
              ) : (
                cartItems.map(({ item, stall, qty }) => (
                  <div key={item.id} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', padding: '0.9rem 0' }}>
                    <span style={{ fontSize: '1.4rem' }}>{stall.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stall.name}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button onClick={() => removeItem(item)} style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}>
                        {qty === 1 ? <Trash2 size={11} /> : <Minus size={11} />}
                      </button>
                      <span style={{ fontWeight: 700, minWidth: 18, textAlign: 'center', fontSize: '0.88rem' }}>{qty}</span>
                      <button onClick={() => addItem(item, stall)} style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-light)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                        <Plus size={11} />
                      </button>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', minWidth: 50, textAlign: 'right' }}>₹{item.price * qty}</span>
                  </div>
                ))
              )}
            </div>

            {/* Checkout footer */}
            {cartItems.length > 0 && (
              <div style={{ padding: '1.2rem 1.4rem', background: 'var(--bg-high)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>Subtotal ({cartCount} items)</span>
                  <span style={{ color: 'var(--text)', fontWeight: 700 }}>₹{cartTotal}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--success)', marginBottom: '1rem' }}>
                  <Zap size={12} /> Est. pickup in ~{Math.min(...cartItems.map(i => i.stall.wait))} min
                </div>
                <button
                  className="btn-accent"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem', padding: '0.8rem' }}
                  onClick={placeOrder}
                  id="place-order-btn"
                >
                  Place Order · ₹{cartTotal}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
