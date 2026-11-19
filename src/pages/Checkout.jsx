import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { PAYMENTS, fmt } from '../constants';

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '',
    phone: user?.phone || '', address: user?.address || '',
  });
  const [payment, setPayment] = useState('card');
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);

  if (orderId) {
    return (
      <div className="container page center">
        <h1>🎉 Заказ №{orderId} создан</h1>
        <p className="muted">Статус — «Ожидает оплаты». Оплатите его в личном кабинете: после оплаты лицензионные ключи будут выданы автоматически.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link to="/profile" className="btn btn-primary">Перейти в личный кабинет</Link>
          <Link to="/catalog" className="btn btn-outline">Продолжить покупки</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container page center">
        <h1>Корзина пуста</h1>
        <Link to="/catalog" className="btn btn-primary">В каталог</Link>
      </div>
    );
  }

  const next = () => {
    if (!form.name.trim()) return setError('Укажите имя');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Укажите корректный email');
    setError('');
    setStep(2);
  };

  const submit = async () => {
    try {
      setError('');
      const order = await api.createOrder({
        clientId: user.id,
        paymentMethod: payment,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      });
      clear();
      setOrderId(order.id);
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="container page">
      <h1>Оформление заказа</h1>
      <div className="steps">
        <div className={step >= 1 ? 'step active' : 'step'}>1. Контакты</div>
        <div className={step >= 2 ? 'step active' : 'step'}>2. Оплата</div>
        <div className={step >= 3 ? 'step active' : 'step'}>3. Подтверждение</div>
      </div>

      {error && <div className="alert">{error}</div>}

      {step === 1 && (
        <div className="form" style={{ maxWidth: 480 }}>
          <label>Имя<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Телефон<input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label>Адрес<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
          <button className="btn btn-primary" onClick={next}>Далее →</button>
        </div>
      )}

      {step === 2 && (
        <div className="form" style={{ maxWidth: 480 }}>
          {Object.entries(PAYMENTS).map(([key, label]) => (
            <label key={key} className="check">
              <input type="radio" name="pay" checked={payment === key} onChange={() => setPayment(key)} /> {label}
            </label>
          ))}
          <div className="row">
            <button className="btn btn-outline" onClick={() => setStep(1)}>← Назад</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>Далее →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ maxWidth: 560 }}>
          <div className="cart-summary">
            <h3>Состав заказа</h3>
            {items.map(({ product, quantity }) => (
              <div className="row-between" key={product.id}>
                <span>{product.image} {product.title} × {quantity}</span>
                <b>{fmt(product.price * quantity)} ₽</b>
              </div>
            ))}
            <hr />
            <div className="row-between"><span>Итого</span><b>{fmt(total)} ₽</b></div>
            <div className="row-between"><span>Оплата</span><span>{PAYMENTS[payment]}</span></div>
            <div className="row-between"><span>Покупатель</span><span>{form.name}, {form.email}</span></div>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn btn-outline" onClick={() => setStep(2)}>← Назад</button>
            <button className="btn btn-primary" onClick={submit}>Подтвердить заказ</button>
          </div>
        </div>
      )}
    </div>
  );
}