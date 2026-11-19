import { useEffect, useState } from 'react';
import { api } from '../api/api';
import { TYPES, fmt, productImages } from '../constants';
import { compressImage } from '../utils/image';

const EMPTY = {
  title: '', category: 'Операционные системы', type: 'license', price: 0,
  oldPrice: '', stock: 10, duration: 'бессрочно', activation: 'E-mail', description: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');
  const [editing, setEditing] = useState(null);

  const load = () => api.getProducts().then(setProducts);
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm('Удалить товар вместе с его фотографиями?')) return;
    await api.deleteProduct(id);
    load();
  };

  const categories = [...new Set(products.map((p) => p.category))];
  const list = products.filter((p) =>
    (!cat || p.category === cat) && p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container page">
      <div className="row-between">
        <h1>Админ: товары</h1>
        <button className="btn btn-primary" onClick={() => setEditing('new')}>+ Добавить товар</button>
      </div>

      <div className="filters row">
        <input placeholder="Поиск по названию..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
        <select value={cat} onChange={(e) => setCat(e.target.value)} style={{ maxWidth: 220 }}>
          <option value="">Все категории</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Название</th><th>Категория</th><th>Тип</th><th>Цена</th><th>Остаток</th><th>Фото</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.title}</td>
                <td>{p.category}</td>
                <td>{TYPES[p.type] || p.type}</td>
                <td>{fmt(p.price)} ₽</td>
                <td>{p.stock}</td>
                <td>{productImages(p).length}</td>
                <td>
                  <div className="row">
                    <button className="btn btn-outline btn-sm" onClick={() => setEditing(p)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}

function ProductForm({ product, onClose, onSaved }) {
  const [form, setForm] = useState(product ? { ...EMPTY, ...product, oldPrice: product.oldPrice ?? '' } : EMPTY);
  const [images, setImages] = useState(() => productImages(product || {}));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Выбор нескольких файлов + сжатие на клиенте
  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    setError('');
    try {
      const prepared = await Promise.all(files.map((f) => compressImage(f)));
      setImages((prev) => [...prev, ...prepared]);
    } catch {
      setError('Не удалось прочитать файл изображения');
    }
    setBusy(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Укажите название');
    if (+form.price <= 0) return setError('Цена должна быть больше 0');
    const body = {
      title: form.title,
      category: form.category,
      type: form.type,
      price: +form.price,
      oldPrice: form.oldPrice === '' ? null : +form.oldPrice,
      stock: +form.stock,
      duration: form.duration,
      activation: form.activation,
      description: form.description,
      images,
    };
    try {
      if (product) await api.updateProduct(product.id, body);
      else await api.createProduct(body);
      onSaved();
      onClose();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{product ? 'Редактирование товара' : 'Новый товар'}</h2>
        {error && <div className="alert">{error}</div>}

        <div className="form-block">
          <span className="form-title">Фотографии товара (можно несколько)</span>
          <div className="upload-grid">
            {images.map((src, i) => (
              <div className="upload-item" key={i}>
                <img src={src} alt={`Фото ${i + 1}`} />
                <button type="button" className="remove-image" onClick={() => setImages(images.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            <label className="upload-add">
              <input type="file" accept="image/*" multiple onChange={onFiles} disabled={busy} />
              <span>{busy ? '⏳ Обработка…' : '＋ Добавить фото'}</span>
            </label>
          </div>
        </div>

        <label>Название<input value={form.title} onChange={set('title')} /></label>
        <div className="row">
          <label style={{ flex: 2 }}>Категория<input value={form.category} onChange={set('category')} /></label>
          <label style={{ flex: 1 }}>Тип
            <select value={form.type} onChange={set('type')}>
              <option value="license">Лицензия</option>
              <option value="subscription">Подписка</option>
            </select>
          </label>
        </div>
        <div className="row">
          <label>Цена, ₽<input type="number" value={form.price} onChange={set('price')} /></label>
          <label>Старая цена, ₽<input type="number" value={form.oldPrice} onChange={set('oldPrice')} placeholder="нет" /></label>
          <label>Остаток<input type="number" value={form.stock} onChange={set('stock')} /></label>
        </div>
        <div className="row">
          <label>Срок действия<input value={form.duration} onChange={set('duration')} /></label>
          <label>Активация<input value={form.activation} onChange={set('activation')} /></label>
        </div>
        <label>Описание<textarea rows="3" value={form.description} onChange={set('description')} /></label>
        <div className="row">
          <button type="button" className="btn btn-outline" onClick={onClose}>Отмена</button>
          <button type="submit" className="btn btn-primary">Сохранить</button>
        </div>
      </form>
    </div>
  );
}