import { useState } from 'react';

export default function ProductGallery({ images, title }) {
  const [idx, setIdx] = useState(0);

  if (!images.length) {
    return (
      <div className="product-img">
        <div className="no-image-large">📷 Фото не загружено</div>
      </div>
    );
  }

  const safeIdx = Math.min(idx, images.length - 1);
  const prev = () => setIdx((safeIdx - 1 + images.length) % images.length);
  const next = () => setIdx((safeIdx + 1) % images.length);

  return (
    <div className="gallery">
      <div className="gallery-main">
        <img src={images[safeIdx]} alt={title} />
        {images.length > 1 && (
          <>
            <button type="button" className="gallery-arrow left" onClick={prev} aria-label="Предыдущее фото">‹</button>
            <button type="button" className="gallery-arrow right" onClick={next} aria-label="Следующее фото">›</button>
            <span className="gallery-counter">{safeIdx + 1} / {images.length}</span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((src, i) => (
            <button type="button" key={i} className={i === safeIdx ? 'thumb active' : 'thumb'} onClick={() => setIdx(i)}>
              <img src={src} alt={`${title} — фото ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}