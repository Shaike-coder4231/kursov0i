import { useEffect, useState } from 'react';
import { api } from '../api/api';
import { STATUSES, PAYMENTS, fmt } from '../constants';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [open, setOpen] = useState(null);

  const load = () => api.getAllOrders().then((o) => setOrders(o.sort((a, b) => b.id - a.id)));
  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => { await api.updateOrder(id, { status }); load(); };
  const changeComment = async (id, comment) => { await api.updateOrder(id, { comment }); };

  const clientNames = [...new Set(orders.map((o) => o.clientName))];
  const list = orders.filter((o) =>
    (!filter || o.status === filter) &&
    (!clientFilter || o.clientName === clientFilter) &&
    (!dateFilter || o.date === dateFilter)
  );

  return (
    <div className="container page">
      <h1>Админ: заказы</h1>
      <div className="filters row">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">Все статусы</option>
          {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">Все клиенты</option>
          {clientNames.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ maxWidth: 180 }} />
      </div>

      {list.length === 0 ? <p className="muted">Заказов нет.</p> : list.map((o) => (
        <div className="order-card" key={o.id}>
          <div className="order-head" onClick={() => setOpen(open === o.id ? null : o.id)}>
            <div><b>№{o.id}</b> <span className="muted">от {o.date}</span></div>
            <span>{o.clientName}</span>
            <b>{fmt(o.total)} ₽</b>
            <select value={o.status} onClick={(e) => e.stopPropagation()} onChange={(e) => changeStatus(o.id, e.target.value)}>
              {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          {open === o.id && (
            <div className="order-body">
              <p className="muted small">
                Клиент: {o.clientName} · {o.clientEmail} · {o.clientPhone}<br />
                Оплата: {PAYMENTS[o.paymentMethod] || o.paymentMethod}
              </p>
              {o.items.map((it, i) => (
                <div key={i} className="order-item">
                  <div className="row-between"><span>{it.title} × {it.quantity}</span><b>{fmt(it.price * it.quantity)} ₽</b></div>
                  {it.keys && it.keys.map((k, j) => <div key={j} className="license-key">🔑 {k}</div>)}
                </div>
              ))}
              <label>Комментарий к заказу
                <textarea rows="2" defaultValue={o.comment || ''} placeholder="Комментарий оператора..."
                  onBlur={(e) => changeComment(o.id, e.target.value)} />
              </label>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}