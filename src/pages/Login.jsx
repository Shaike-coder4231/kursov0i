import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="container page center">
      <form className="auth-form" onSubmit={submit}>
        <h1>🔑 Вход</h1>
        {error && <div className="alert">{error}</div>}
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Пароль<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button className="btn btn-primary" type="submit">Войти</button>
        <p className="muted">Нет аккаунта? <Link to="/register" className="link">Зарегистрироваться</Link></p>
        <div className="muted small">Демо-доступы:<br />админ: admin@store.ru / admin123<br />клиент: ivan@example.com / user123</div>
      </form>
    </div>
  );
}