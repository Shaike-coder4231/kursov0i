import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/catalog?q=${encodeURIComponent(q.trim())}` : '/catalog');
  };

  const cats = ['Операционные системы', 'Антивирусы', 'Офисные программы', 'Игры'];

  return (
    <div className="container page center">
      <h1 style={{ fontSize: 72 }}>404</h1>
      <p className="muted">Страница не найдена. Возможно, в адресе опечатка.</p>
      <form className="search" style={{ maxWidth: 420, margin: '0 auto' }} onSubmit={submit}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск товаров..." />
        <button type="submit">🔍</button>
      </form>
      <div className="cats" style={{ justifyContent: 'center' }}>
        {cats.map((c) => (
          <Link key={c} to={`/catalog?category=${encodeURIComponent(c)}`} className="cat-chip">{c}</Link>
        ))}
      </div>
      <div className="row" style={{ justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">На главную</Link>
        <Link to="/catalog" className="btn btn-outline">В каталог</Link>
      </div>
    </div>
  );
}