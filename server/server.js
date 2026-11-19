import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, 'data');
const SEED = path.join(__dirname, 'seed');
const UPLOADS = path.join(__dirname, 'uploads');
const PORT = 3001;

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(UPLOADS));

const file = (n) => path.join(DATA, n);
const read = (n) => JSON.parse(fs.readFileSync(file(n), 'utf-8'));
const write = (n, d) => fs.writeFileSync(file(n), JSON.stringify(d, null, 2), 'utf-8');
const nextId = (a) => (a.length ? Math.max(...a.map((x) => x.id)) + 1 : 1);

if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });
if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true });
for (const f of ['products.json', 'clients.json', 'orders.json']) {
  if (!fs.existsSync(file(f))) fs.copyFileSync(path.join(SEED, f), file(f));
}

/* ================= ИЗОБРАЖЕНИЯ ================= */
const isDataUrl = (s) => typeof s === 'string' && s.startsWith('data:image');
const isImagePath = (s) => typeof s === 'string' && (s.startsWith('/uploads') || s.startsWith('http'));

// Сохраняет base64 как файл в server/uploads, возвращает путь
function saveBase64(dataUrl) {
  const m = dataUrl.match(/^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/i);
  if (!m) return null;
  const ext = m[1].toLowerCase().replace('jpeg', 'jpg');
  const name = `product_${Date.now()}_${Math.floor(Math.random() * 1e6)}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS, name), Buffer.from(m[2], 'base64'));
  return `/uploads/${name}`;
}

// Массив картинок: base64 -> файл + путь, готовые пути оставляем
function processImages(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((i) => (isDataUrl(i) ? saveBase64(i) : i)).filter((i) => typeof i === 'string' && i.length);
}

// Приводит товар к единому виду: images[] + image = первая картинка
function normalizeProduct(p) {
  if (!Array.isArray(p.images)) {
    p.images = isDataUrl(p.image) || isImagePath(p.image) ? [p.image] : [];
  }
  p.image = p.images[0] || '';
  return p;
}

const publicClient = (c) => { const { password, ...rest } = c; return rest; };

/* ================= ТОВАРЫ ================= */
app.get('/api/products', (req, res) => res.json(read('products.json').map(normalizeProduct)));

app.get('/api/products/:id', (req, res) => {
  const p = read('products.json').find((x) => x.id === +req.params.id);
  if (!p) return res.status(404).json({ error: 'Товар не найден' });
  res.json(normalizeProduct(p));
});

app.post('/api/products', (req, res) => {
  const products = read('products.json');
  const body = { ...req.body };
  body.images = processImages(body.images);
  const product = normalizeProduct({
    id: nextId(products), title: '', category: 'ПО', type: 'license',
    price: 0, oldPrice: null, stock: 0, duration: 'бессрочно',
    activation: 'E-mail', description: '', rating: 0, reviews: [],
    ...body,
  });
  products.push(product);
  write('products.json', products);
  res.status(201).json(product);
});

app.put('/api/products/:id', (req, res) => {
  const products = read('products.json');
  const i = products.findIndex((x) => x.id === +req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Товар не найден' });
  const body = { ...req.body };
  // Если images не передавали (например, обновление отзыва) — не трогаем старые
  if (Array.isArray(body.images)) body.images = processImages(body.images);
  else delete body.images;
  products[i] = normalizeProduct({ ...products[i], ...body, id: products[i].id });
  write('products.json', products);
  res.json(products[i]);
});

app.delete('/api/products/:id', (req, res) => {
  const products = read('products.json');
  const p = products.find((x) => x.id === +req.params.id);
  if (p && Array.isArray(p.images)) {
    p.images.forEach((src) => {
      if (src.startsWith('/uploads/')) {
        const fp = path.join(__dirname, src);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      }
    });
  }
  write('products.json', products.filter((x) => x.id !== +req.params.id));
  res.json({ ok: true });
});

/* ================= КЛИЕНТЫ / АВТОРИЗАЦИЯ ================= */
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Заполните все поля' });
  const clients = read('clients.json');
  if (clients.some((c) => c.email === email))
    return res.status(400).json({ error: 'Пользователь с таким email уже зарегистрирован' });
  const client = { id: nextId(clients), name, email, password, role: 'user', phone: '', address: '' };
  clients.push(client);
  write('clients.json', clients);
  res.status(201).json(publicClient(client));
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const client = read('clients.json').find((c) => c.email === email && c.password === password);
  if (!client) return res.status(401).json({ error: 'Неверный email или пароль' });
  res.json(publicClient(client));
});

app.get('/api/clients', (req, res) => res.json(read('clients.json').map(publicClient)));

app.put('/api/clients/:id', (req, res) => {
  const clients = read('clients.json');
  const i = clients.findIndex((c) => c.id === +req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Пользователь не найден' });
  clients[i] = { ...clients[i], ...req.body, id: clients[i].id, role: clients[i].role };
  write('clients.json', clients);
  res.json(publicClient(clients[i]));
});

/* ================= ЗАКАЗЫ ================= */
const KEY_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const genKey = () =>
  Array.from({ length: 4 }, () =>
    Array.from({ length: 5 }, () => KEY_CHARS[Math.floor(Math.random() * KEY_CHARS.length)]).join('')
  ).join('-');

function attachKeys(order) {
  order.items = order.items.map((it) => ({
    ...it,
    keys: it.keys && it.keys.length === it.quantity ? it.keys : Array.from({ length: it.quantity }, genKey),
  }));
}

app.get('/api/orders', (req, res) => {
  let orders = read('orders.json');
  const clients = read('clients.json');
  if (req.query.clientId) orders = orders.filter((o) => o.clientId === +req.query.clientId);
  orders = orders.map((o) => {
    const c = clients.find((x) => x.id === o.clientId);
    return { ...o, clientName: c?.name || 'Неизвестный', clientEmail: c?.email || '', clientPhone: c?.phone || '' };
  });
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const { clientId, items, paymentMethod } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Корзина пуста' });
  const products = read('products.json');
  const orders = read('orders.json');

  for (const it of items) {
    const p = products.find((x) => x.id === it.productId);
    if (!p) return res.status(400).json({ error: 'Товар не найден' });
    if (p.stock < it.quantity) return res.status(400).json({ error: `Недостаточно лицензий: ${p.title}` });
  }

  const orderItems = items.map((it) => {
    const p = products.find((x) => x.id === it.productId);
    p.stock -= it.quantity;
    return { productId: it.productId, title: p.title, quantity: it.quantity, price: p.price };
  });
  write('products.json', products);

  const order = {
    id: nextId(orders), clientId,
    date: new Date().toISOString().slice(0, 10),
    status: 'pending',
    paymentMethod: paymentMethod || 'card',
    items: orderItems,
    total: orderItems.reduce((s, it) => s + it.price * it.quantity, 0),
  };
  orders.push(order);
  write('orders.json', orders);
  res.status(201).json(order);
});

app.post('/api/orders/:id/pay', (req, res) => {
  const orders = read('orders.json');
  const order = orders.find((o) => o.id === +req.params.id);
  if (!order) return res.status(404).json({ error: 'Заказ не найден' });
  if (order.status === 'cancelled') return res.status(400).json({ error: 'Заказ отменён' });
  order.status = 'completed';
  order.paid = true;
  attachKeys(order);
  write('orders.json', orders);
  res.json(order);
});

app.put('/api/orders/:id', (req, res) => {
  const orders = read('orders.json');
  const products = read('products.json');
  const i = orders.findIndex((o) => o.id === +req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Заказ не найден' });
  const old = orders[i];

  if (req.body.status === 'cancelled' && old.status !== 'cancelled') {
    for (const it of old.items) {
      const p = products.find((x) => x.id === it.productId);
      if (p) p.stock += it.quantity;
    }
    write('products.json', products);
  }

  orders[i] = { ...old, ...req.body, id: old.id };
  if (orders[i].status === 'completed') { orders[i].paid = true; attachKeys(orders[i]); }
  write('orders.json', orders);
  res.json(orders[i]);
});

/* ================= СБРОС ================= */
app.post('/api/reset', (req, res) => {
  for (const f of ['products.json', 'clients.json', 'orders.json']) {
    fs.copyFileSync(path.join(SEED, f), file(f));
  }
  fs.rmSync(UPLOADS, { recursive: true, force: true });
  fs.mkdirSync(UPLOADS, { recursive: true });
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`✅ API-сервер запущен: http://localhost:${PORT}`));