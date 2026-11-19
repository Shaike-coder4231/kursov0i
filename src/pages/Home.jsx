import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  useEffect(() => { api.getProducts().then(setProducts).catch(console.error); }, []);

  const popular = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
  const fresh = [...products].slice(-4).reverse();
  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="container page">
      <section className="banner">
        <div>
          <h1>Лицензии и ПО с мгновенной доставкой</h1>
          <p>Windows, Office, антивирусы и игры — ключи приходят на e-mail сразу после оплаты.</p>
          <Link to="/catalog" className="btn btn-light">Перейти в каталог →</Link>
        </div>
      </section>

      <section className="cats">
        {categories.map((c) => (
          <Link key={c} to={`/catalog?category=${encodeURIComponent(c)}`} className="cat-chip">{c}</Link>
        ))}
      </section>

      <section>
        <div className="section-head"><h2>Популярные товары</h2><Link to="/catalog" className="muted">Все →</Link></div>
        <div className="grid">{popular.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>

      <section>
        <div className="section-head"><h2>Новинки</h2></div>
        <div className="grid">{fresh.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>

      <section className="benefits">
        <div><span>⚡</span><h3>Мгновенная доставка</h3><p className="muted">Ключи выдаются автоматически сразу после оплаты</p></div>
        <div><span>🛡️</span><h3>Гарантия</h3><p className="muted">Все лицензии официальные, гарантия активации</p></div>
        <div><span>💳</span><h3>Удобная оплата</h3><p className="muted">Карта, СБП, электронные кошельки</p></div>
      </section>
    </div>
  );
}