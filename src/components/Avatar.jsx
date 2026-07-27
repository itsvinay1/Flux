import React, { useState } from 'react';

export default function RenderAvatar({ avatar, name = 'User', size = 48, fontSize = '22px', style = {} }) {
  const [imageError, setImageError] = useState(false);

  const isUrl = typeof avatar === 'string' && 
    (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:image'));

  if (isUrl && !imageError) {
    return (
      <img
        src={avatar}
        alt={name}
        onError={() => setImageError(true)}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'block',
          ...style,
        }}
      />
    );
  }

  return (
    <span style={{ fontSize, lineHeight: 1, userSelect: 'none', ...style }}>
      {avatar && avatar !== '⚡' && !isUrl ? avatar : '⚡'}
    </span>
  );
}
