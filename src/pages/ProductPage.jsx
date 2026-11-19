import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { TYPES, fmt, productImages } from '../constants';
import ProductCard from '../components/ProductCard';
import ProductGallery from '../components/ProductGallery';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { add } = useCart();
  const { has, toggle } = useFavorites();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [review, setReview] = useState({ rating: 5, text: '' });
  const [added, setAdded] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    setProduct(null); setNotFound(false); setQty(1); setAdded(false); setReviewError('');
    api.getProduct(id)
      .then((p) => {
        setProduct(p);
        api.getProducts().then((all) =>
          setRelated(all.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4)));
      })
      .catch(() => {
        setNotFound(true);
        api.getProducts().then((all) =>
          setRelated([...all].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4)));
      });
  }, [id]);

  if (notFound) {
    return (
      <div className="container page center">
        <h2>😕 Товар не найден</h2>
        <p className="muted">Возможно, он был снят с продажи.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link to="/catalog" className="btn btn-primary">Перейти в каталог</Link>
        </div>
        {related.length > 0 && (
          <section style={{ width: '100%' }}>
            <h2>Возможно, вы искали это</h2>
            <div className="grid">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          </section>
        )}
      </div>
    );
  }
  if (!product) return <div className="container page"><p>Загрузка...</p></div>;

  // Отзыв текущего пользователя (если уже оставлял)
  const userReview = user && product.reviews ? product.reviews.find((r) => r.author === user.name) : null;

  const inCart = () => { if (!user) return navigate('/login'); add(product, qty); setAdded(true); };
  const buyNow = () => { if (!user) return navigate('/login'); add(product, qty); navigate('/checkout'); };
  const fav = () => { if (!user) return navigate('/login'); toggle(product.id); };

  const sendReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (product.reviews && product.reviews.some((r) => r.author === user.name)) {
      setReviewError('Вы уже оставляли отзыв на этот товар');
      return;
    }
    if (!review.text.trim()) return;
    const newReview = { author: user.name, rating: +review.rating, text: review.text.trim(), date: new Date().toISOString().slice(0, 10) };
    const reviews = [newReview, ...(product.reviews || [])];
    const rating = Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
    setProduct(await api.updateProduct(product.id, { reviews, rating }));
    setReview({ rating: 5, text: '' });
    setReviewError('');
  };

  return (
    <div className="container page">
      <nav className="crumbs">
        <Link to="/">Главная</Link> / <Link to="/catalog">Каталог</Link> /{' '}
        <Link to={`/catalog?category=${encodeURIComponent(product.category)}`}>{product.category}</Link> / <span>{product.title}</span>
      </nav>

      <div className="product-layout">
        <ProductGallery key={product.id} images={productImages(product)} title={product.title} />

        <div className="product-info">
          <span className="card-cat">{product.category} · {TYPES[product.type] || product.type}</span>
          <h1>{product.title}</h1>
          <div className="card-rating">
            {'★'.repeat(Math.round(product.rating || 0))}
            <span className="muted">{'★'.repeat(5 - Math.round(product.rating || 0))} ({(product.reviews || []).length} отзывов)</span>
          </div>

          <div className="product-price">
            {product.oldPrice ? <s className="muted">{fmt(product.oldPrice)} ₽</s> : null}
            <b>{fmt(product.price)} ₽</b>
          </div>

          <p className={product.stock > 0 ? 'ok' : 'danger-text'}>
            {product.stock > 0 ? `✔ В наличии: ${product.stock} шт.` : '✖ Нет в наличии'}
          </p>

          <div className="buy-row">
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
            </div>
            <button className="btn btn-primary" onClick={inCart} disabled={product.stock === 0}>
              {added ? '✔ Добавлено' : 'В корзину'}
            </button>
            <button className="btn btn-outline" onClick={buyNow} disabled={product.stock === 0}>Купить сейчас</button>
            <button className="fav-btn big" onClick={fav}>{has(product.id) ? '❤️' : '🤍'}</button>
          </div>

          <table className="spec">
            <tbody>
              <tr><td>Артикул</td><td>DG-{product.id}</td></tr>
              <tr><td>Тип</td><td>{TYPES[product.type] || product.type}</td></tr>
              <tr><td>Срок действия</td><td>{product.duration}</td></tr>
              <tr><td>Активация</td><td>{product.activation}</td></tr>
            </tbody>
          </table>

          <div>
            <h3>Описание</h3>
            <p>{product.description}</p>
          </div>

          <div className="delivery-info">
            <h3>Доставка, оплата и возврат</h3>
            <p className="muted">
              📧 Доставка — мгновенно на e-mail после оплаты. 💳 Оплата: карта, СБП, электронный кошелёк.
              ↩️ Возврат в течение 14 дней, если ключ не был активирован.
            </p>
          </div>
        </div>
      </div>

      <section>
        <h2>Отзывы</h2>
        {userReview ? (
          <div className="review" style={{ borderLeftColor: 'var(--ok)' }}>
            <div>
              <b>Ваш отзыв:</b>{' '}
              <span className="card-rating">{'★'.repeat(userReview.rating)}</span>{' '}
              <span className="muted">{userReview.date}</span>
            </div>
            <p>{userReview.text}</p>
          </div>
        ) : user ? (
          <form className="review-form" onSubmit={sendReview}>
            {reviewError && <div className="alert">{reviewError}</div>}
            <select value={review.rating} onChange={(e) => setReview({ ...review, rating: e.target.value })} style={{ maxWidth: 130 }}>
              {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{'★'.repeat(r)}</option>)}
            </select>
            <textarea rows="2" placeholder="Ваш отзыв о товаре..." value={review.text} onChange={(e) => setReview({ ...review, text: e.target.value })} />
            <button className="btn btn-primary btn-sm" type="submit">Отправить отзыв</button>
          </form>
        ) : (
          <p className="muted"><Link to="/login" className="link">Войдите</Link>, чтобы оставить отзыв</p>
        )}

        {(product.reviews || []).filter((r) => r.author !== user?.name).length === 0 ? (
          <p className="muted">Отзывов пока нет.</p>
        ) : (
          product.reviews.filter((r) => r.author !== user?.name).map((r, i) => (
            <div className="review" key={i}>
              <div>
                <b>{r.author}</b>{' '}
                <span className="card-rating">{'★'.repeat(r.rating)}</span>{' '}
                <span className="muted">{r.date}</span>
              </div>
              <p>{r.text}</p>
            </div>
          ))
        )}
      </section>

      {related.length > 0 && (
        <section>
          <h2>Похожие товары</h2>
          <div className="grid">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}