export const STATUSES = {
  pending: 'Ожидает оплаты',
  processing: 'В обработке',
  completed: 'Выполнен',
  cancelled: 'Отменён',
};

export const PAYMENTS = {
  card: 'Банковская карта',
  sbp: 'СБП',
  wallet: 'Электронный кошелёк',
};

export const TYPES = { license: 'Лицензия', subscription: 'Подписка' };

const GRADIENTS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #30cfd0, #330867)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #ff9a9e, #fecfef)',
];

export const gradient = (id) => GRADIENTS[Math.abs(id) % GRADIENTS.length];
export const fmt = (n) => n.toLocaleString('ru-RU');
export const isImageUrl = (s) =>
  typeof s === 'string' && (s.startsWith('/uploads') || s.startsWith('data:image') || s.startsWith('http'));

// Все картинки товара: новый массив images или старое поле image
export const productImages = (p) =>
  Array.isArray(p?.images) && p.images.length ? p.images : isImageUrl(p?.image) ? [p.image] : [];