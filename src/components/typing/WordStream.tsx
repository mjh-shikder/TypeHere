'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useTypingStore } from '@/store/useTypingStore';
import type { WordState, TypedCharacter } from '@/types/typing';

const CharSpan = React.memo(function CharSpan({
  char,
  charIndex,
  globalIndex,
}: {
  char: TypedCharacter;
  charIndex: number;
  globalIndex?: number;
}) {
  const statusClass =
    char.status === 'correct' ? 'char-typed' :
    char.status === 'incorrect' ? 'char-error' :
    char.status === 'extra' ? 'char-extra' :
    'char-untyped';

  return (
    <span
      className={statusClass}
      data-char-index={charIndex}
      data-char-global-index={globalIndex}
    >
      {char.status === 'extra' ? char.typed : char.expected}
    </span>
  );
});

const ExtraCharSpan = React.memo(function ExtraCharSpan({
  char,
  extraIndex,
}: {
  char: TypedCharacter;
  extraIndex: number;
}) {
  return (
    <span className="char-extra" data-extra-index={extraIndex}>
      {char.typed}
    </span>
  );
});

const WordItem = React.memo(
  function WordItem({
    word,
    wordIndex,
    isActive,
    globalCharOffset,
  }: {
    word: WordState;
    wordIndex: number;
    isActive: boolean;
    globalCharOffset: number;
  }) {
    return (
      <div
        className={`inline-block mr-[0.5em] ${isActive ? 'relative' : ''}`}
        data-word-index={wordIndex}
      >
        {word.characters.map((char, i) => (
          <CharSpan
            key={i}
            char={char}
            charIndex={i}
            globalIndex={globalCharOffset + i}
          />
        ))}
        {word.extraCharacters.map((char, i) => (
          <ExtraCharSpan key={`extra-${i}`} char={char} extraIndex={i} />
        ))}
      </div>
    );
  },
  (prev, next) => {
    if (prev.isActive !== next.isActive) return false;
    if (prev.word === next.word) return true;
    if (
      prev.word.original !== next.word.original ||
      prev.word.isCompleted !== next.word.isCompleted ||
      prev.word.isCorrect !== next.word.isCorrect ||
      prev.word.characters.length !== next.word.characters.length ||
      prev.word.extraCharacters.length !== next.word.extraCharacters.length
    ) {
      return false;
    }

    for (let i = 0; i < prev.word.characters.length; i++) {
      if (
        prev.word.characters[i].expected !== next.word.characters[i].expected ||
        prev.word.characters[i].status !== next.word.characters[i].status
      ) {
        return false;
      }
      if (prev.word.characters[i].typed !== next.word.characters[i].typed) return false;
    }
    for (let i = 0; i < prev.word.extraCharacters.length; i++) {
      if (
        prev.word.extraCharacters[i].expected !== next.word.extraCharacters[i].expected ||
        prev.word.extraCharacters[i].status !== next.word.extraCharacters[i].status
      ) {
        return false;
      }
      if (prev.word.extraCharacters[i].typed !== next.word.extraCharacters[i].typed) return false;
    }

    return true;
  }
);

export default function WordStream() {
  const words = useTypingStore((s) => s.words);
  const activeWordIndex = useTypingStore((s) => s.activeWordIndex);
  const fontSize = useTypingStore((s) => s.fontSize);
  const fontFamily = useTypingStore((s) => s.fontFamily);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [shiftPx, setShiftPx] = useState(0);

  const fontClass =
    fontFamily === 'JetBrains Mono' ? 'font-jetbrains' :
    fontFamily === 'Fira Code' ? 'font-fira' :
    fontFamily === 'Roboto Mono' ? 'font-roboto-mono' :
    'font-geist-mono';

  const sizeClass =
    fontSize === 'small' ? 'text-typing-small' :
    fontSize === 'large' ? 'text-typing-large' :
    'text-typing-medium';

  useEffect(() => {
    if (activeWordIndex === 0) {
      setShiftPx(0);
      return;
    }
    if (!wrapRef.current) return;

    const activeWordEl = wrapRef.current.querySelector(
      `[data-word-index="${activeWordIndex}"]`
    ) as HTMLElement | null;
    if (!activeWordEl) return;

    const lineHeight = activeWordEl.offsetHeight;
    const y = activeWordEl.offsetTop;
    const desiredY = lineHeight;
    const nextShift = Math.max(0, y - desiredY);
    setShiftPx((prev) => (nextShift > prev ? nextShift : prev));
  }, [activeWordIndex]);

  const getGlobalCharOffset = useCallback((wordIndex: number): number => {
    let offset = 0;
    for (let i = 0; i < wordIndex; i++) {
      offset += words[i].original.length + 1;
    }
    return offset;
  }, [words]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${fontClass} ${sizeClass}`}
      style={{ height: 'calc(2em * 3)' }}
    >
      <div
        ref={wrapRef}
        className="flex flex-wrap leading-[2] will-change-transform"
        style={{
          transform: `translate3d(0, ${-shiftPx}px, 0)`,
          transition: 'transform 180ms ease',
        }}
      >
        {words.map((word, i) => (
          <WordItem
            key={i}
            word={word}
            wordIndex={i}
            isActive={i === activeWordIndex}
            globalCharOffset={getGlobalCharOffset(i)}
          />
        ))}
      </div>
    </div>
  );
}
