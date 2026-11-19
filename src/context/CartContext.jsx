import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  // Корзина хранится в localStorage отдельно для каждого пользователя
  useEffect(() => {
    if (!user) { setItems([]); return; }
    try { setItems(JSON.parse(localStorage.getItem(`cart_${user.id}`)) || []); }
    catch { setItems([]); }
  }, [user]);

  const persist = (next) => {
    if (user) localStorage.setItem(`cart_${user.id}`, JSON.stringify(next));
  };

  const add = (product, qty = 1) => setItems((prev) => {
    const ex = prev.find((i) => i.product.id === product.id);
    let next;
    if (ex) {
      next = prev.map((i) => i.product.id === product.id
        ? { ...i, quantity: Math.min(i.quantity + qty, product.stock), product: { ...product } }
        : i);
    } else {
      next = [...prev, { product, quantity: Math.min(qty, product.stock) }];
    }
    persist(next);
    return next;
  });

  const changeQty = (id, qty) => setItems((prev) => {
    const next = qty <= 0
      ? prev.filter((i) => i.product.id !== id)
      : prev.map((i) => i.product.id === id ? { ...i, quantity: Math.min(qty, i.product.stock) } : i);
    persist(next);
    return next;
  });

  const remove = (id) => setItems((prev) => {
    const next = prev.filter((i) => i.product.id !== id);
    persist(next);
    return next;
  });

  const clear = () => { persist([]); setItems([]); };

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * i.product.price, 0);

  return (
    <CartContext.Provider value={{ items, add, changeQty, remove, clear, count, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);