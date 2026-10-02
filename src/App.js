import React, { useState, useEffect, useCallback } from 'react';
import { Wrench, RotateCcw, Home, Users, ClipboardList, LogOut, ChevronRight, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'https://servfixy-production.up.railway.app';

// ── Auth ──────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      if (data.user.role !== 'maintenance' && data.user.role !== 'admin') {
        throw new Error('Access denied. Maintenance staff only.');
      }
      localStorage.setItem('mx_token', data.token);
      localStorage.setItem('mx_user', JSON.stringify(data.user));
      onLogin(data.user, data.token);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', fontFamily: "'Inter', system-ui, sans-serif", padding: '8px 16px' }}>
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <img src="https://i.imgur.com/OPDKgyD.png" alt="Servfixy" style={{ width: '420px', maxWidth: '100%', marginBottom: '0px', objectFit: 'contain' }} />

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}>
            {error}
          </div>
        )}

        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="you@servfixy.com"
          style={{ width: '100%', padding: '14px 18px', border: 'none', borderRadius: '12px', fontSize: '14px', backgroundColor: '#EEF2F7', boxSizing: 'border-box', marginBottom: '14px', outline: 'none' }} />

        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="••••••••"
          style={{ width: '100%', padding: '14px 18px', border: 'none', borderRadius: '12px', fontSize: '14px', backgroundColor: '#EEF2F7', boxSizing: 'border-box', marginBottom: '24px', outline: 'none' }} />

        <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={handleLogin} disabled={loading}
            style={{ padding: '13px 28px', backgroundColor: '#14B8A6', color: 'white', border: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
          <span style={{ fontSize: '22px', fontWeight: '700', color: '#0482FD' }}>Maintenance</span>
        </div>

      </div>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'workorders', label: 'Work Orders', icon: Wrench },
  { id: 'turns', label: 'Turns', icon: RotateCcw },
  { id: 'units', label: 'Units', icon: Home },
  { id: 'technicians', label: 'Technicians', icon: Users },
  { id: 'reports', label: 'Reports', icon: ClipboardList },
];

function Sidebar({ active, setActive, user, onLogout }) {
  return (
    <div style={{ width: '220px', minHeight: '100vh', backgroundColor: '#0C2A4A', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <img src="https://i.imgur.com/OPDKgyD.png" alt="Servfixy" style={{ width: '140px', objectFit: 'contain' }} />
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Maintenance</div>
      </div>
      <nav style={{ flex: 1, padding: '16px 0' }}>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActive(id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', border: 'none', background: active === id ? 'rgba(20,184,166,0.15)' : 'transparent', color: active === id ? '#14B8A6' : 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: active === id ? '700' : '400', cursor: 'pointer', borderLeft: active === id ? '3px solid #14B8A6' : '3px solid transparent', textAlign: 'left' }}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '4px' }}>{user?.name || user?.email}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '12px', textTransform: 'capitalize' }}>{user?.role}</div>
        <button onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer', padding: 0 }}>
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    open:        { bg: '#fef3c7', color: '#92400e', label: 'Open' },
    in_progress: { bg: '#dbeafe', color: '#1e40af', label: 'In Progress' },
    completed:   { bg: '#d1fae5', color: '#065f46', label: 'Completed' },
    pending:     { bg: '#f3e8ff', color: '#6b21a8', label: 'Pending' },
    cancelled:   { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
  };
  const s = map[status] || { bg: '#f1f5f9', color: '#475569', label: status };
  return <span style={{ backgroundColor: s.bg, color: s.color, padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: '700' }}>{s.label}</span>;
}

// ── Priority Badge ────────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const map = {
    tier0: { color: '#dc2626', label: 'T0 Emergency' },
    tier1: { color: '#ea580c', label: 'T1 Urgent' },
    tier2: { color: '#d97706', label: 'T2 Standard' },
    tier3: { color: '#65a30d', label: 'T3 Routine' },
  };
  const p = map[priority] || { color: '#94a3b8', label: priority || '—' };
  return <span style={{ color: p.color, fontWeight: '700', fontSize: '12px' }}>{p.label}</span>;
}

// ── Work Orders Tab ───────────────────────────────────────────────────────────
function WorkOrdersTab({ token, properties, selectedProp, setSelectedProp }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    if (!selectedProp) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/service-requests?org_id=${selectedProp}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data.requests || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, selectedProp]);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0C2A4A' }}>Work Orders</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all','open','in_progress','completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 14px', borderRadius: '50px', border: '1.5px solid', borderColor: filter === f ? '#14B8A6' : '#e5e7eb', backgroundColor: filter === f ? '#14B8A6' : 'transparent', color: filter === f ? '#fff' : '#6b7280', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Property selector */}
      <select value={selectedProp || ''} onChange={e => setSelectedProp(e.target.value)}
        style={{ marginBottom: '20px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#111827', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}>
        <option value="">— Select Property —</option>
        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      {loading ? (
        <div style={{ color: '#94a3b8', padding: '40px', textAlign: 'center' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: '#94a3b8', padding: '40px', textAlign: 'center' }}>No work orders found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(o => (
            <div key={o.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#0C2A4A', marginBottom: '4px' }}>{o.category || o.issue_type || 'Work Order'} — Unit {o.unit_number || o.unit || '—'}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{o.description?.slice(0,80) || '—'}</div>
              </div>
              <PriorityBadge priority={o.priority} />
              <Badge status={o.status} />
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Turns Tab ─────────────────────────────────────────────────────────────────
function TurnsTab({ token, properties, selectedProp, setSelectedProp }) {
  const [turns, setTurns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gateFilter, setGateFilter] = useState('all');

  const load = useCallback(async () => {
    if (!selectedProp) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/turns?org_id=${selectedProp}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTurns(Array.isArray(data) ? data : data.turns || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, selectedProp]);

  useEffect(() => { load(); }, [load]);

  const GATES = ['all', 'gate_0', 'gate_1', 'gate_2', 'complete'];
  const filtered = gateFilter === 'all' ? turns : turns.filter(t => t.gate === gateFilter || t.current_gate === gateFilter);

  const gateColor = (g) => ({ gate_0: '#f59e0b', gate_1: '#3b82f6', gate_2: '#8b5cf6', complete: '#10b981' }[g] || '#94a3b8');

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0C2A4A' }}>Unit Turns — 3-Gate Protocol</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {GATES.map(g => (
            <button key={g} onClick={() => setGateFilter(g)}
              style={{ padding: '6px 14px', borderRadius: '50px', border: '1.5px solid', borderColor: gateFilter === g ? '#14B8A6' : '#e5e7eb', backgroundColor: gateFilter === g ? '#14B8A6' : 'transparent', color: gateFilter === g ? '#fff' : '#6b7280', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              {g === 'all' ? 'All' : g === 'complete' ? 'Complete' : g.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <select value={selectedProp || ''} onChange={e => setSelectedProp(e.target.value)}
        style={{ marginBottom: '20px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#111827', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}>
        <option value="">— Select Property —</option>
        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      {loading ? (
        <div style={{ color: '#94a3b8', padding: '40px', textAlign: 'center' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: '#94a3b8', padding: '40px', textAlign: 'center' }}>No turns found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(t => (
            <div key={t.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#0C2A4A', marginBottom: '4px' }}>Unit {t.unit_number || t.unit || '—'}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Move-out: {t.move_out_date ? new Date(t.move_out_date).toLocaleDateString() : '—'} · Move-in: {t.move_in_date ? new Date(t.move_in_date).toLocaleDateString() : '—'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {['gate_0','gate_1','gate_2'].map((g, i) => (
                  <div key={g} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: (t.gate || t.current_gate) >= g || t.status === 'complete' ? gateColor(g) : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: '10px', fontWeight: '700' }}>{i}</span>
                    </div>
                    {i < 2 && <div style={{ width: '16px', height: '2px', backgroundColor: '#e5e7eb' }} />}
                  </div>
                ))}
              </div>
              <Badge status={t.status || 'open'} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Technicians Tab ───────────────────────────────────────────────────────────
function TechniciansTab({ token }) {
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/technicians`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setTechs(Array.isArray(d) ? d : d.technicians || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const tierColor = t => ({ s1:'#65a30d', s2:'#0ea5e9', s3:'#8b5cf6', s4:'#f59e0b' }[t?.toLowerCase()] || '#94a3b8');

  return (
    <div style={{ padding: '28px 32px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0C2A4A', marginBottom: '24px' }}>Technician Roster</h2>
      {loading ? (
        <div style={{ color: '#94a3b8', padding: '40px', textAlign: 'center' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {techs.map(t => (
            <div key={t.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#EEF2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#0C2A4A', fontSize: '14px' }}>
                  {(t.name || t.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#0C2A4A' }}>{t.name || '—'}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {t.tier && <span style={{ backgroundColor: tierColor(t.tier), color: '#fff', padding: '2px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: '700' }}>{t.tier?.toUpperCase()}</span>}
                {t.specialties?.map(s => <span key={s} style={{ backgroundColor: '#EEF2F7', color: '#475569', padding: '2px 10px', borderRadius: '50px', fontSize: '11px' }}>{s}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Units Tab ─────────────────────────────────────────────────────────────────
function UnitsTab({ token, properties, selectedProp, setSelectedProp }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!selectedProp) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/properties/${selectedProp}/units`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUnits(Array.isArray(data) ? data : data.units || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, selectedProp]);

  useEffect(() => { load(); }, [load]);

  const statusColor = s => ({ occupied: '#d1fae5', vacant: '#fee2e2', on_notice: '#fef3c7', turn: '#dbeafe' }[s] || '#f1f5f9');
  const statusText = s => ({ occupied: '#065f46', vacant: '#991b1b', on_notice: '#92400e', turn: '#1e40af' }[s] || '#475569');

  return (
    <div style={{ padding: '28px 32px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0C2A4A', marginBottom: '16px' }}>Unit Directory</h2>
      <select value={selectedProp || ''} onChange={e => setSelectedProp(e.target.value)}
        style={{ marginBottom: '20px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#111827', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}>
        <option value="">— Select Property —</option>
        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      {loading ? <div style={{ color: '#94a3b8', padding: '40px', textAlign: 'center' }}>Loading...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
          {units.map(u => (
            <div key={u.id} style={{ backgroundColor: statusColor(u.status), borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ fontWeight: '700', fontSize: '16px', color: statusText(u.status), marginBottom: '4px' }}>#{u.unit_number || u.number}</div>
              <div style={{ fontSize: '11px', color: statusText(u.status), opacity: 0.8, textTransform: 'capitalize' }}>{u.status?.replace('_',' ') || '—'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reports Tab ───────────────────────────────────────────────────────────────
function ReportsTab({ token, properties }) {
  return (
    <div style={{ padding: '28px 32px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0C2A4A', marginBottom: '24px' }}>Reports</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
        {[
          { label: 'Open Work Orders by Priority', icon: AlertCircle, color: '#dc2626' },
          { label: 'Completed Work Orders', icon: CheckCircle, color: '#10b981' },
          { label: 'Turn Status Summary', icon: RotateCcw, color: '#3b82f6' },
          { label: 'Tech Performance by Property', icon: Users, color: '#8b5cf6' },
          { label: 'Average Days to Close', icon: Clock, color: '#f59e0b' },
          { label: 'Gate 1 QA Closeout Rate', icon: ClipboardList, color: '#0ea5e9' },
        ].map(({ label, icon: Icon, color }) => (
          <div key={label} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
            onClick={() => alert('Report export coming soon.')}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0C2A4A' }}>{label}</div>
            <ChevronRight size={14} color="#94a3b8" style={{ marginLeft: 'auto', flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mx_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('mx_token') || '');
  const [active, setActive] = useState('workorders');
  const [properties, setProperties] = useState([]);
  const [selectedProp, setSelectedProp] = useState('');

  const onLogin = (u, t) => { setUser(u); setToken(t); };
  const onLogout = () => {
    localStorage.removeItem('mx_token');
    localStorage.removeItem('mx_user');
    setUser(null); setToken('');
  };

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/properties`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : d.properties || [];
        setProperties(list);
        if (list.length > 0) setSelectedProp(String(list[0].id));
      })
      .catch(console.error);
  }, [token]);

  if (!user || !token) return <Login onLogin={onLogin} />;

  const tabProps = { token, properties, selectedProp, setSelectedProp };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F0F4F8' }}>
      <Sidebar active={active} setActive={setActive} user={user} onLogout={onLogout} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {active === 'workorders'  && <WorkOrdersTab  {...tabProps} />}
        {active === 'turns'       && <TurnsTab       {...tabProps} />}
        {active === 'units'       && <UnitsTab       {...tabProps} />}
        {active === 'technicians' && <TechniciansTab token={token} />}
        {active === 'reports'     && <ReportsTab     token={token} properties={properties} />}
      </main>
    </div>
  );
}
