'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
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

function NavLinksInner({ currentPath }: { currentPath: string | null }) {
  const isHome = currentPath === '/';
  const isLeaderboard = currentPath?.startsWith('/leaderboard') ?? false;
  const isProfile = currentPath?.startsWith('/profile') ?? false;

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/"
        aria-current={isHome ? 'page' : undefined}
        className="glass-pill px-4 py-2 text-sm font-medium flex items-center gap-2"
        style={{ color: isHome || currentPath === null ? 'var(--text-untyped)' : 'var(--text-typed)' }}
      >
        <Keyboard className="w-4 h-4" aria-hidden="true" />
        Type
      </Link>
      <Link
        href="/leaderboard"
        aria-current={isLeaderboard ? 'page' : undefined}
        className="glass-pill px-4 py-2 text-sm font-medium flex items-center gap-2"
        style={{ color: isLeaderboard ? 'var(--text-untyped)' : 'var(--text-typed)' }}
      >
        <Trophy className="w-4 h-4" aria-hidden="true" />
        Leaderboard
      </Link>
      <Link
        href="/profile"
        aria-current={isProfile ? 'page' : undefined}
        className="glass-pill px-4 py-2 text-sm font-medium flex items-center gap-2"
        style={{ color: isProfile ? 'var(--text-untyped)' : 'var(--text-typed)' }}
      >
        <User className="w-4 h-4" aria-hidden="true" />
        Profile
      </Link>
    </div>
  );
}

function ActiveNavLinks() {
  const pathname = usePathname();
  return <NavLinksInner currentPath={pathname} />;
}

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
  const settingsRef = useRef<HTMLDivElement>(null);
  const isTyping = phase === 'typing';
  const isAuthed = status === 'authenticated' && Boolean(session?.user);

  useEffect(() => {
    if (!showSettings) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !settingsRef.current?.contains(event.target)) {
        setShowSettings(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSettings(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSettings]);

  const persistRemote = (settings: Parameters<typeof updateUserSettingsAction>[0]) => {
    if (isAuthed) {
      void updateUserSettingsAction(settings);
    }
  };

  return (
    <header
      className={`fixed top-4 left-0 right-0 z-50 px-3 flex justify-center fade-on-typing transition-opacity duration-400 ${
        isTyping ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <nav aria-label="Primary navigation" className="relative w-full max-w-5xl rounded-2xl">
        <div
          aria-hidden="true"
          className="floating-nav-glass backdrop-blur-2xl backdrop-saturate-150 pointer-events-none absolute inset-0 rounded-2xl"
        />
        <div className="relative z-10 px-4 py-3 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          <a
            href="/"
            aria-label="TypeHere home — reload typing test"
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
                return;
              }
              event.preventDefault();
              window.location.assign('/');
            }}
            className="flex items-center gap-2 group rounded-lg px-1 py-0.5"
          >
            <Keyboard
              className="w-5 h-5 transition-colors"
              style={{ color: 'var(--accent-primary)' }}
              aria-hidden="true"
            />
            <span
              className="font-bold text-lg tracking-tight"
              style={{ color: 'var(--text-untyped)' }}
            >
              TypeHere
            </span>
          </a>

          <div className="w-px h-6" style={{ background: 'var(--glass-border)' }} aria-hidden="true" />

          <Suspense fallback={<NavLinksInner currentPath={null} />}>
            <ActiveNavLinks />
          </Suspense>

          <div className="w-px h-6" style={{ background: 'var(--glass-border)' }} aria-hidden="true" />

          <div className="relative" ref={settingsRef}>
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="glass-pill p-2 flex items-center gap-2"
              aria-label="Change typing appearance settings"
              aria-expanded={showSettings}
              aria-haspopup="true"
            >
              <Settings className="w-4 h-4" style={{ color: 'var(--text-typed)' }} aria-hidden="true" />
              <div
                className="w-3 h-3 rounded-full"
                aria-hidden="true"
                style={{
                  background: THEMES.find((t) => t.id === theme)?.color || '#f59e0b',
                  boxShadow: `0 0 8px ${THEMES.find((t) => t.id === theme)?.color || '#f59e0b'}40`,
                }}
              />
            </button>

            {showSettings && (
              <div
                role="dialog"
                aria-label="Appearance settings"
                className="absolute top-full right-0 mt-2 glass-panel backdrop-blur-xl rounded-xl p-3 min-w-[240px] space-y-3"
              >
                <p className="text-xs font-medium px-1" style={{ color: 'var(--text-typed)' }}>
                  Theme
                </p>
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={theme === t.id}
                    onClick={() => {
                      setTheme(t.id);
                      persistRemote({ theme: t.id });
                      setShowSettings(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      theme === t.id ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                    style={{ color: 'var(--text-untyped)' }}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      aria-hidden="true"
                      style={{
                        background: t.color,
                        boxShadow: theme === t.id ? `0 0 12px ${t.color}60` : 'none',
                      }}
                    />
                    <span>{t.label}</span>
                    {theme === t.id && (
                      <span className="ml-auto text-xs opacity-50" aria-hidden="true">
                        ✓
                      </span>
                    )}
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
                      type="button"
                      aria-pressed={fontFamily === font}
                      onClick={() => {
                        setFontFamily(font);
                        persistRemote({ fontFamily: font });
                        setShowSettings(false);
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
                      type="button"
                      aria-pressed={fontSize === size.id}
                      onClick={() => {
                        setFontSize(size.id);
                        persistRemote({ fontSize: size.id });
                        setShowSettings(false);
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
                      type="button"
                      aria-pressed={cursorStyle === cursor.id}
                      onClick={() => {
                        setCursorStyle(cursor.id);
                        persistRemote({ cursorStyle: cursor.id });
                        setShowSettings(false);
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
                      type="button"
                      aria-pressed={wordBankSize === size}
                      onClick={() => {
                        setWordBankSize(size);
                        persistRemote({ wordBankSize: size });
                        setShowSettings(false);
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
                className="text-sm font-medium rounded-lg px-2 py-1"
                style={{ color: 'var(--text-untyped)' }}
              >
                {session.user.username ? `@${session.user.username}` : session.user.name || 'Account'}
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="glass-pill p-2"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" style={{ color: 'var(--text-typed)' }} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="glass-pill px-4 py-2 text-sm font-medium flex items-center gap-2"
              style={{ color: 'var(--accent-primary)' }}
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
