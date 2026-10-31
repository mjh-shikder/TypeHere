'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTypingStore } from '@/store/useTypingStore';
import { updateUserSettingsAction } from '@/app/actions/user-actions';
import { Keyboard, Trophy, User, Settings, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import type {
  CursorStyle,
  FontSize,
  GlassTheme,
  MonospaceFont,
  WordBankSize,
} from '@/types/typing';

const THEMES: { id: GlassTheme; label: string; color: string }[] = [
  { id: 'obsidian', label: 'Obsidian', color: '#f59e0b' },
  { id: 'cyber-frost', label: 'Cyber Frost', color: '#06b6d4' },
  { id: 'aurora', label: 'Aurora', color: '#10b981' },
  { id: 'moonlight-opal', label: 'Moonlight', color: '#a78bfa' },
  { id: 'solarized-liquid', label: 'Solarized', color: '#f97316' },
  { id: 'crystal-clear', label: 'Crystal', color: '#ffffff' },
];

const FONTS: MonospaceFont[] = ['JetBrains Mono', 'Fira Code', 'Roboto Mono', 'Geist Mono'];
const FONT_SIZES: { id: FontSize; label: string }[] = [
  { id: 'small', label: 'S' },
  { id: 'medium', label: 'M' },
  { id: 'large', label: 'L' },
];
const CURSORS: { id: CursorStyle; label: string }[] = [
  { id: 'line', label: 'Line' },
  { id: 'block', label: 'Block' },
  { id: 'underline', label: 'Underline' },
];

export default function FloatingNavbar() {
  const { data: session, status } = useSession();
  const phase = useTypingStore((s) => s.phase);
  const theme = useTypingStore((s) => s.theme);
  const fontFamily = useTypingStore((s) => s.fontFamily);
  const fontSize = useTypingStore((s) => s.fontSize);
  const cursorStyle = useTypingStore((s) => s.cursorStyle);
  const wordBankSize = useTypingStore((s) => s.wordBankSize);
  const setTheme = useTypingStore((s) => s.setTheme);
  const setFontFamily = useTypingStore((s) => s.setFontFamily);
  const setFontSize = useTypingStore((s) => s.setFontSize);
  const setCursorStyle = useTypingStore((s) => s.setCursorStyle);
  const setWordBankSize = useTypingStore((s) => s.setWordBankSize);
  const [showSettings, setShowSettings] = useState(false);
  const isTyping = phase === 'typing';
  const isAuthed = status === 'authenticated' && Boolean(session?.user);

  const persistRemote = (settings: Parameters<typeof updateUserSettingsAction>[0]) => {
    if (isAuthed) {
      void updateUserSettingsAction(settings);
    }
  };

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-5xl fade-on-typing transition-opacity duration-400 ${
        isTyping ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="glass-panel rounded-2xl px-4 py-3 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <Keyboard
            className="w-5 h-5 transition-colors"
            style={{ color: 'var(--accent-primary)' }}
          />
          <span
            className="font-bold text-lg tracking-tight"
            style={{ color: 'var(--text-untyped)' }}
          >
            TypeHere
          </span>
        </Link>

        <div className="w-px h-6" style={{ background: 'var(--glass-border)' }} />

        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="glass-pill px-4 py-2 text-sm font-medium flex items-center gap-2"
            style={{ color: 'var(--text-untyped)' }}
          >
            <Keyboard className="w-4 h-4" />
            Type
          </Link>
          <Link
            href="/leaderboard"
            className="glass-pill px-4 py-2 text-sm font-medium flex items-center gap-2"
            style={{ color: 'var(--text-typed)' }}
          >
            <Trophy className="w-4 h-4" />
            Leaderboard
          </Link>
          <Link
            href="/profile"
            className="glass-pill px-4 py-2 text-sm font-medium flex items-center gap-2"
            style={{ color: 'var(--text-typed)' }}
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
        </div>

        <div className="w-px h-6" style={{ background: 'var(--glass-border)' }} />

        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="glass-pill p-2 flex items-center gap-2"
            aria-label="Change settings"
          >
            <Settings className="w-4 h-4" style={{ color: 'var(--text-typed)' }} />
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: THEMES.find((t) => t.id === theme)?.color || '#f59e0b',
                boxShadow: `0 0 8px ${THEMES.find((t) => t.id === theme)?.color || '#f59e0b'}40`,
              }}
            />
          </button>

          {showSettings && (
            <div className="absolute top-full right-0 mt-2 glass-panel rounded-xl p-3 min-w-[240px] space-y-3">
              <p className="text-xs font-medium px-1" style={{ color: 'var(--text-typed)' }}>
                Theme
              </p>
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    persistRemote({ theme: t.id });
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    theme === t.id ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                  style={{ color: 'var(--text-untyped)' }}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      background: t.color,
                      boxShadow: theme === t.id ? `0 0 12px ${t.color}60` : 'none',
                    }}
                  />
                  <span>{t.label}</span>
                  {theme === t.id && <span className="ml-auto text-xs opacity-50">✓</span>}
                </button>
              ))}

              <div className="h-px" style={{ background: 'var(--glass-border)' }} />

              <p className="text-xs font-medium px-1" style={{ color: 'var(--text-typed)' }}>
                Font
              </p>
              <div className="flex flex-wrap gap-1">
                {FONTS.map((font) => (
                  <button
                    key={font}
                    onClick={() => {
                      setFontFamily(font);
                      persistRemote({ fontFamily: font });
                    }}
                    className="glass-pill px-2 py-1 text-[11px]"
                    data-active={fontFamily === font}
                    style={{ color: fontFamily === font ? 'var(--accent-primary)' : 'var(--text-typed)' }}
                  >
                    {font.replace(' Mono', '')}
                  </button>
                ))}
              </div>

              <p className="text-xs font-medium px-1" style={{ color: 'var(--text-typed)' }}>
                Size
              </p>
              <div className="flex gap-1">
                {FONT_SIZES.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => {
                      setFontSize(size.id);
                      persistRemote({ fontSize: size.id });
                    }}
                    className="glass-pill px-3 py-1 text-xs"
                    data-active={fontSize === size.id}
                    style={{ color: fontSize === size.id ? 'var(--accent-primary)' : 'var(--text-typed)' }}
                  >
                    {size.label}
                  </button>
                ))}
              </div>

              <p className="text-xs font-medium px-1" style={{ color: 'var(--text-typed)' }}>
                Cursor
              </p>
              <div className="flex gap-1">
                {CURSORS.map((cursor) => (
                  <button
                    key={cursor.id}
                    onClick={() => {
                      setCursorStyle(cursor.id);
                      persistRemote({ cursorStyle: cursor.id });
                    }}
                    className="glass-pill px-3 py-1 text-xs"
                    data-active={cursorStyle === cursor.id}
                    style={{ color: cursorStyle === cursor.id ? 'var(--accent-primary)' : 'var(--text-typed)' }}
                  >
                    {cursor.label}
                  </button>
                ))}
              </div>

              <p className="text-xs font-medium px-1" style={{ color: 'var(--text-typed)' }}>
                Word bank
              </p>
              <div className="flex gap-1">
                {([1000, 5000] as WordBankSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setWordBankSize(size);
                      persistRemote({ wordBankSize: size });
                    }}
                    className="glass-pill px-3 py-1 text-xs"
                    data-active={wordBankSize === size}
                    style={{ color: wordBankSize === size ? 'var(--accent-primary)' : 'var(--text-typed)' }}
                  >
                    {size.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {isAuthed ? (
          <div className="flex items-center gap-2">
            <Link
              href={session.user.username ? `/u/${session.user.username}` : '/profile'}
              className="text-sm font-medium"
              style={{ color: 'var(--text-untyped)' }}
            >
              {session.user.username ? `@${session.user.username}` : session.user.name || 'Account'}
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="glass-pill p-2"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" style={{ color: 'var(--text-typed)' }} />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="glass-pill px-4 py-2 text-sm font-medium flex items-center gap-2"
            style={{ color: 'var(--accent-primary)' }}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
