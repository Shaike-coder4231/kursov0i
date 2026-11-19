import { useEffect, useState } from 'react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { STATUSES, PAYMENTS, fmt } from '../constants';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(null);
  const [tab, setTab] = useState('orders');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', address: user.address || '' });
  const [saved, setSaved] = useState(false);

  const load = () => api.getOrders(user.id).then((o) => setOrders(o.sort((a, b) => b.id - a.id)));
  useEffect(() => { load(); }, []);

  const pay = async (id) => { await api.payOrder(id); setOpen(id); load(); };

  const saveProfile = async (e) => {
    e.preventDefault();
    await updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const visibleOrders = orders.filter((o) => !statusFilter || o.status === statusFilter);

  return (
    <div className="container page">
      <h1>👤 Личный кабинет</h1>
      <div className="tabs">
        <button className={tab === 'orders' ? 'tab active' : 'tab'} onClick={() => setTab('orders')}>Мои заказы</button>
        <button className={tab === 'settings' ? 'tab active' : 'tab'} onClick={() => setTab('settings')}>Профиль</button>
      </div>

      {tab === 'orders' && (
        <>
          <div className="filters">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 220 }}>
              <option value="">Все статусы</option>
              {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          {visibleOrders.length === 0 ? <p className="muted">Заказов пока нет.</p> :
            visibleOrders.map((o) => (
              <div className="order-card" key={o.id}>
                <div className="order-head" onClick={() => setOpen(open === o.id ? null : o.id)}>
                  <div><b>Заказ №{o.id}</b> <span className="muted">от {o.date}</span></div>
                  <span className={`status ${o.status}`}>{STATUSES[o.status]}</span>
                  <b>{fmt(o.total)} ₽</b>
                </div>
                {open === o.id && (
                  <div className="order-body">
                    {o.items.map((it, i) => (
                      <div key={i} className="order-item">
                        <div className="row-between"><span>{it.title} × {it.quantity}</span><b>{fmt(it.price * it.quantity)} ₽</b></div>
                        {it.keys && it.keys.map((k, j) => <div key={j} className="license-key">🔑 {k}</div>)}
                        {!it.keys && o.status === 'pending' && <span className="muted small">Ключи появятся после оплаты</span>}
                      </div>
                    ))}
                    <p className="muted small">Способ оплаты: {PAYMENTS[o.paymentMethod] || o.paymentMethod}</p>
                    {o.status === 'pending' && (
                      <div><button className="btn btn-primary btn-sm" onClick={() => pay(o.id)}>💳 Оплатить</button></div>
                    )}
                  </div>
                )}
              </div>
            ))}
        </>
      )}

      {tab === 'settings' && (
        <form className="form" style={{ maxWidth: 480 }} onSubmit={saveProfile}>
          <label>Имя<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Email<input value={user.email} disabled /></label>
          <label>Телефон<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label>Адрес<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
          <button className="btn btn-primary" type="submit">Сохранить</button>
          {saved && <span className="ok">Сохранено ✔</span>}
        </form>
      )}
    </div>
  );
}