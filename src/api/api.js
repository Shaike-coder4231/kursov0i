const API = '/api';

async function request(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}

export const api = {
  // товары
  getProducts: () => request('/products'),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (p) => request('/products', { method: 'POST', body: p }),
  updateProduct: (id, p) => request(`/products/${id}`, { method: 'PUT', body: p }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  // авторизация и клиенты
  login: (d) => request('/login', { method: 'POST', body: d }),
  register: (d) => request('/register', { method: 'POST', body: d }),
  updateClient: (id, d) => request(`/clients/${id}`, { method: 'PUT', body: d }),
  // заказы
  getOrders: (clientId) => request(`/orders?clientId=${clientId}`),
  getAllOrders: () => request('/orders'),
  createOrder: (o) => request('/orders', { method: 'POST', body: o }),
  payOrder: (id) => request(`/orders/${id}/pay`, { method: 'POST' }),
  updateOrder: (id, o) => request(`/orders/${id}`, { method: 'PUT', body: o }),
  // сброс данных к исходным
  resetData: () => request('/reset', { method: 'POST' }),
};