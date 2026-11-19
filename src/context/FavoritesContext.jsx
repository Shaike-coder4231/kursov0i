import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState([]);

  useEffect(() => {
    if (!user) { setIds([]); return; }
    try { setIds(JSON.parse(localStorage.getItem(`fav_${user.id}`)) || []); }
    catch { setIds([]); }
  }, [user]);

  const persist = (next) => { if (user) localStorage.setItem(`fav_${user.id}`, JSON.stringify(next)); };

  const toggle = (id) => setIds((prev) => {
    const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
    persist(next);
    return next;
  });

  const has = (id) => ids.includes(id);

  return (
    <FavoritesContext.Provider value={{ ids, toggle, has, count: ids.length }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);