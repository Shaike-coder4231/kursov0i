import { createContext, useContext, useState } from 'react';
import { api } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const save = (u) => { localStorage.setItem('user', JSON.stringify(u)); setUser(u); };

  const login = async (email, password) => { const u = await api.login({ email, password }); save(u); return u; };
  const register = async (data) => { const u = await api.register(data); save(u); return u; };
  const logout = () => { localStorage.removeItem('user'); setUser(null); };
  const updateUser = async (data) => { const u = await api.updateClient(user.id, data); save(u); return u; };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);