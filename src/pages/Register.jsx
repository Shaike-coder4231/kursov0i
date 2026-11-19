import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError('Пароль должен быть не короче 6 символов');
    if (form.password !== form.confirm) return setError('Пароли не совпадают');
    try {
      setError('');
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/');
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="container page center">
      <form className="auth-form" onSubmit={submit}>
        <h1>📝 Регистрация</h1>
        {error && <div className="alert">{error}</div>}
        <label>Имя<input value={form.name} onChange={set('name')} required /></label>
        <label>Email<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>Пароль<input type="password" value={form.password} onChange={set('password')} required /></label>
        <label>Повторите пароль<input type="password" value={form.confirm} onChange={set('confirm')} required /></label>
        <button className="btn btn-primary" type="submit">Зарегистрироваться</button>
        <p className="muted">Уже есть аккаунт? <Link to="/login" className="link">Войти</Link></p>
      </form>
    </div>
  );
}