import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fmt, productImages } from '../constants';

export default function MiniCart({ onNavigate }) {
  const { items, total, changeQty, remove } = useCart();

  return (
    <div className="minicart">
      {items.length === 0 ? (
        <p className="muted">Корзина пуста</p>
      ) : (
        <>
          {items.map((i) => {
            const imgs = productImages(i.product);
            return (
              <div className="minicart-item" key={i.product.id}>
                <div className="minicart-item-left">
                  <div className="minicart-thumb-wrap">
                    {imgs.length ? (
                      <img src={imgs[0]} alt={i.product.title} className="minicart-thumb" />
                    ) : (
                      <div className="minicart-thumb-placeholder">📦</div>
                    )}
                  </div>
                  <div>
                    <b className="small">{i.product.title}</b>
                    <div className="row" style={{ gap: 6, marginTop: 4 }}>
                      <span className="muted small">{i.quantity} × {fmt(i.product.price)} ₽</span>
                      <button className="link small" onClick={() => changeQty(i.product.id, i.quantity - 1)}>−</button>
                      <button className="link small" onClick={() => changeQty(i.product.id, i.quantity + 1)}>+</button>
                      <button className="link small" onClick={() => remove(i.product.id)}>✕</button>
                    </div>
                  </div>
                </div>
                <b className="small">{fmt(i.product.price * i.quantity)} ₽</b>
              </div>
            );
          })}
          <div className="minicart-total">Итого: <b>{fmt(total)} ₽</b></div>
          <Link to="/cart" className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={onNavigate}>
            Перейти в корзину
          </Link>
        </>
      )}
    </div>
  );
}