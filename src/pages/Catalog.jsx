import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/api';
import ProductCard from '../components/ProductCard';

const PER_PAGE = 8;

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();

  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const type = params.get('type') || '';
  const inStock = params.get('stock') === '1';
  const min = params.get('min') || '';
  const max = params.get('max') || '';
  const sort = params.get('sort') || 'default';
  const page = Math.max(1, +(params.get('page') || 1));

  useEffect(() => { api.getProducts().then(setProducts).finally(() => setLoading(false)); }, []);

  const setParam = (key, value) => {
    const p = new URLSearchParams(params);
    if (value === '' || value === null || value === false) p.delete(key);
    else p.set(key, String(value));
    if (key !== 'page') p.delete('page');
    setParams(p);
  };

  let list = products.filter((p) =>
    (!q || p.title.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase())) &&
    (!category || p.category === category) &&
    (!type || p.type === type) &&
    (!inStock || p.stock > 0) &&
    (!min || p.price >= +min) &&
    (!max || p.price <= +max)
  );

  switch (sort) {
    case 'price-asc': list = [...list].sort((a, b) => a.price - b.price); break;
    case 'price-desc': list = [...list].sort((a, b) => b.price - a.price); break;
    case 'rating': list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    case 'new': list = [...list].reverse(); break;
    default: break;
  }

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const pageItems = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const categories = [...new Set(products.map((p) => p.category))];
  const resetFilters = () => setParams(q ? { q } : {});

  return (
    <div className="container page">
      <h1>Каталог{q && <>: «{q}»</>}</h1>

      <div className="catalog-layout">
        <aside className="filters">
          <h3>Фильтры</h3>
          <label>Категория
            <select value={category} onChange={(e) => setParam('category', e.target.value)}>
              <option value="">Все</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>Тип
            <select value={type} onChange={(e) => setParam('type', e.target.value)}>
              <option value="">Любой</option>
              <option value="license">Лицензия</option>
              <option value="subscription">Подписка</option>
            </select>
          </label>
          <label>Цена, ₽
            <div className="row">
              <input type="number" placeholder="от" value={min} onChange={(e) => setParam('min', e.target.value)} />
              <input type="number" placeholder="до" value={max} onChange={(e) => setParam('max', e.target.value)} />
            </div>
          </label>
          <label className="check">
            <input type="checkbox" checked={inStock} onChange={(e) => setParam('stock', e.target.checked ? '1' : '')} />
            Только в наличии
          </label>
          <button className="btn btn-outline btn-sm" onClick={resetFilters}>Сбросить</button>
        </aside>

        <div>
          <div className="sort-row">
            <span className="muted">Найдено: {list.length}</span>
            <select value={sort} onChange={(e) => setParam('sort', e.target.value)}>
              <option value="default">По умолчанию</option>
              <option value="price-asc">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
              <option value="rating">По рейтингу</option>
              <option value="new">Новинки</option>
            </select>
          </div>

          {loading ? <p>Загрузка...</p> : list.length === 0 ? <p className="muted">Ничего не найдено. Попробуйте изменить фильтры.</p> : (
            <>
              <div className="grid">{pageItems.map((p) => <ProductCard key={p.id} product={p} />)}</div>
              {pages > 1 && (
                <div className="pagination">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                    <button key={n} className={n === page ? 'active' : ''} onClick={() => setParam('page', n)}>{n}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}