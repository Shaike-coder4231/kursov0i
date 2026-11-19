import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/ProductCard';

export default function Favorites() {
  const { ids } = useFavorites();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.getProducts().then((all) => setProducts(all.filter((p) => ids.includes(p.id))));
  }, [ids]);

  return (
    <div className="container page">
      <h1>❤️ Избранное</h1>
      {products.length === 0 ? (
        <div className="center">
          <p className="muted">В избранном пока пусто.</p>
          <Link to="/catalog" className="btn btn-primary">В каталог</Link>
        </div>
      ) : (
        <div className="grid">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}
    </div>
  );
}