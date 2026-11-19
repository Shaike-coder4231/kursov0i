import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { api } from '../api/api';
import { fmt } from '../constants';
import MiniCart from './MiniCart';

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { count: favCount } = useFavorites();
  const [q, setQ] = useState('');
  const [suggest, setSuggest] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (q.trim().length < 2) { setSuggest([]); return; }
    api.getProducts().then((all) =>
      setSuggest(all.filter((p) => p.title.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 5))
    );
  }, [q]);

  const submitSearch = (e) => {
    e.preventDefault();
    setSuggest([]);
    navigate(q.trim() ? `/catalog?q=${encodeURIComponent(q.trim())}` : '/catalog');
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>💾 <span>Digital</span>Store</Link>

        <Link to="/catalog" className="btn btn-catalog" onClick={() => setMenuOpen(false)}>
          ☰ Каталог
        </Link>

        <form className="search" onSubmit={submitSearch}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск программ, игр, лицензий..." />
          <button type="submit">🔍</button>
          {suggest.length > 0 && (
            <div className="search-suggest">
              {suggest.map((p) => (
                <button key={p.id} type="button" onClick={() => { setQ(''); setSuggest([]); navigate(`/product/${p.id}`); }}>
                  {p.title} — {fmt(p.price)} ₽
                </button>
              ))}
            </div>
          )}
        </form>

        <nav className={menuOpen ? 'nav open' : 'nav'}>
          {user?.role === 'admin' && (
            <>
              <NavLink to="/admin/products" onClick={() => setMenuOpen(false)}>Товары</NavLink>
              <NavLink to="/admin/orders" onClick={() => setMenuOpen(false)}>Заказы</NavLink>
            </>
          )}
          {user && (
            <>
              <NavLink to="/favorites" onClick={() => setMenuOpen(false)}>
                Избранное{favCount > 0 && <span className="badge">{favCount}</span>}
              </NavLink>
              <NavLink to="/profile" onClick={() => setMenuOpen(false)}>👤 {user.name.split(' ')[0]}</NavLink>
            </>
          )}
          {!user && <NavLink to="/catalog" onClick={() => setMenuOpen(false)}>Каталог</NavLink>}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <div className="cart-wrap">
                <button className="icon-btn" onClick={() => setCartOpen(!cartOpen)} title="Корзина">
                  🛒{count > 0 && <span className="badge">{count}</span>}
                </button>
                {cartOpen && <MiniCart onNavigate={() => setCartOpen(false)} />}
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}>
                Выйти
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Войти</Link>
          )}
          <button className="burger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
      </div>
    </header>
  );
}