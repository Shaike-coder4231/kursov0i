import { Link } from 'react-router-dom';
import { api } from '../api/api';

export default function Footer() {
  const reset = async () => {
    if (!confirm('Сбросить все данные к исходному состоянию из JSON-файлов? Все изменения будут удалены.')) return;
    await api.resetData();
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="logo">💾 <span>DigitalStore</span></div>
          <p className="muted">Магазин цифровых товаров: лицензии, подписки и ПО. Мгновенная доставка ключей на e-mail.</p>
        </div>
        <div>
          <h4>Разделы</h4>
          <Link to="/catalog">Каталог</Link>
          <Link to="/profile">Мои заказы</Link>
          <Link to="/favorites">Избранное</Link>
        </div>
        <div>
          <h4>Контакты</h4>
          <p className="muted">8-800-555-35-35<br />support@digitalstore.ru<br />г. Юрга, ул. Ленинградская, 26</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span className="muted">© 2026 DigitalStore · Курсовой проект 09.02.09</span>
        <button className="btn btn-outline btn-sm" onClick={reset}>↺ Сброс данных</button>
      </div>
    </footer>
  );
}