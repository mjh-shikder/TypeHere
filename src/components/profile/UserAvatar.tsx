'use client';

import { useState } from 'react';
import { UserRound } from 'lucide-react';

interface UserAvatarProps {
  src: string | null;
  name: string;
  className: string;
}

export default function UserAvatar({ src, name, className }: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (src && !imageFailed) {
    return (
      <img
        src={src}
        alt={`${name}'s profile picture`}
        className={`${className} rounded-full object-cover`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center rounded-full bg-white/10`}
      role="img"
      aria-label={`${name}'s profile picture`}
    >
      {name.trim() ? (
        <span className="font-semibold" style={{ color: 'var(--text-untyped)' }}>
          {name.trim().charAt(0).toUpperCase()}
        </span>
      ) : (
        <UserRound className="w-1/2 h-1/2" style={{ color: 'var(--text-typed)' }} />
      )}
    </div>
  );
}
