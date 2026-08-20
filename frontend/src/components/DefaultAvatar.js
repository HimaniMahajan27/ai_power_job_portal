import React, { useState } from 'react';

const DefaultAvatar = ({ src, alt, size = 40, className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const showFallback = !src || imgError;

  if (showFallback) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 50%, #4C1D95 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
        title={alt}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          width={size * 0.55}
          height={size * 0.55}
        >
          <circle cx="12" cy="8" r="4" fill="rgba(255,255,255,0.9)" />
          <path
            d="M4 20c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6"
            fill="rgba(255,255,255,0.9)"
          />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      onError={() => setImgError(true)}
    />
  );
};

export default DefaultAvatar;
