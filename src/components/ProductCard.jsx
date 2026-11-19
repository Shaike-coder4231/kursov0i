import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { fmt, productImages } from '../constants';

export default function ProductCard({ product }) {
  const { add, items } = useCart();
  const { user } = useAuth();
  const { has, toggle } = useFavorites();
  const navigate = useNavigate();
  const images = productImages(product);
  const inCart = items.some((i) => i.product.id === product.id);

  const toCart = (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    add(product);
  };

  const toFav = (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    toggle(product.id);
  };

  return (
    <Link to={`/product/${product.id}`} className="card">
      <div className="card-img">
        {images.length ? <img src={images[0]} alt={product.title} loading="lazy" /> : <div className="no-image">📷 Нет фото</div>}
      </div>
      <div className="card-body">
        <span className="card-cat">{product.category}</span>
        <h3 className="card-title">{product.title}</h3>
        <div className="card-rating">
          {'★'.repeat(Math.round(product.rating || 0))}
          <span className="muted">{'★'.repeat(5 - Math.round(product.rating || 0))}</span>
        </div>
        <div className="card-bottom">
          <div className="price">
            {product.oldPrice ? <s className="muted">{fmt(product.oldPrice)} ₽</s> : null}
            <b>{fmt(product.price)} ₽</b>
          </div>
          <div className="card-actions">
            <button className="fav-btn" onClick={toFav} title="В избранное">{has(product.id) ? '❤️' : '🤍'}</button>
            <button className="btn btn-primary btn-sm" onClick={toCart} disabled={product.stock === 0}>
              {product.stock === 0 ? 'Нет' : inCart ? '✓ В корзине' : 'Купить'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}