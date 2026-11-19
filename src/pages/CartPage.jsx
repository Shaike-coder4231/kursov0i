import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../api/api';
import { fmt, productImages } from '../constants';
import ProductCard from '../components/ProductCard';

export default function CartPage() {
  const { items, changeQty, remove, clear, total } = useCart();
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    if (!items.length) { setSimilar([]); return; }
    const cat = items[0].product.category;
    const ids = items.map((i) => i.product.id);
    api.getProducts().then((all) =>
      setSimilar(all.filter((p) => p.category === cat && !ids.includes(p.id)).slice(0, 4)));
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="container page center">
        <h1>🛒 Корзина пуста</h1>
        <p className="muted">Выберите программу или игру в каталоге.</p>
        <Link to="/catalog" className="btn btn-primary">Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="row-between">
        <h1>Корзина</h1>
        <Link to="/catalog" className="btn btn-outline">← Продолжить покупки</Link>
      </div>
      <div className="cart-layout">
        <div className="cart-list">
          {items.map(({ product, quantity }) => {
            const imgs = productImages(product);
            return (
              <div className="cart-item" key={product.id}>
                <div className="cart-item-img">
                  {imgs.length ? <img src={imgs[0]} alt={product.title} /> : <div className="no-image-small">📦</div>}
                </div>
                <div className="cart-item-info">
                  <Link to={`/product/${product.id}`}><b>{product.title}</b></Link>
                  <span className="muted small">{product.category} · {fmt(product.price)} ₽/шт.</span>
                </div>
                <div className="qty">
                  <button onClick={() => changeQty(product.id, quantity - 1)}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => changeQty(product.id, Math.min(product.stock, quantity + 1))}>+</button>
                </div>
                <b className="cart-item-sum">{fmt(product.price * quantity)} ₽</b>
                <button className="icon-btn" onClick={() => remove(product.id)} title="Удалить">🗑️</button>
              </div>
            );
          })}
          <div><button className="btn btn-outline btn-sm" onClick={clear}>Очистить корзину</button></div>
        </div>

        <aside className="cart-summary">
          <h3>Ваш заказ</h3>
          <div className="row-between"><span>Товары ({items.length})</span><b>{fmt(total)} ₽</b></div>
          <div className="row-between"><span>Доставка (e-mail)</span><b className="ok">бесплатно</b></div>
          <hr />
          <div className="row-between"><span>Итого</span><b>{fmt(total)} ₽</b></div>
          <Link to="/checkout" className="btn btn-primary" style={{ width: '100%' }}>Оформить заказ</Link>
        </aside>
      </div>

      {similar.length > 0 && (
        <section>
          <h2>Похожие товары</h2>
          <div className="grid">{similar.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}