'use client';

import { useEffect, useRef } from 'react';
import { useTypingStore } from '@/store/useTypingStore';
import type { CursorStyle } from '@/types/typing';

interface SmoothCaretProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isGhost?: boolean;
  ghostCharIndex?: number;
}

/**
 * SmoothCaret — Hardware-accelerated floating caret
 * Positioned via transform: translate3d() measured from the active character's
 * offsetLeft/offsetTop relative to the words container.
 * Supports line, block, and underline cursor styles.
 */
export default function SmoothCaret({ containerRef, isGhost = false, ghostCharIndex }: SmoothCaretProps) {
  const caretRef = useRef<HTMLDivElement>(null);
  const cursorStyle = useTypingStore((s) => s.cursorStyle);
  const activeWordIndex = useTypingStore((s) => s.activeWordIndex);
  const activeCharIndex = useTypingStore((s) => s.activeCharIndex);
  const words = useTypingStore((s) => s.words);
  const phase = useTypingStore((s) => s.phase);

  useEffect(() => {
    if (!caretRef.current || !containerRef.current) return;
    if (phase === 'finished') {
      caretRef.current.style.opacity = '0';
      return;
    }

    const container = containerRef.current;

    const updatePosition = () => {
      if (!caretRef.current) return;

      // For ghost caret, find the character by charIndex
      let targetSpan: HTMLElement | null = null;

      if (isGhost && ghostCharIndex !== undefined) {
        const allChars = container.querySelectorAll('[data-char-global-index]');
        for (const el of allChars) {
          const idx = parseInt((el as HTMLElement).dataset.charGlobalIndex || '-1', 10);
          if (idx >= ghostCharIndex) {
            targetSpan = el as HTMLElement;
            break;
          }
        }
      } else {
        const wordEl = container.querySelector(`[data-word-index="${activeWordIndex}"]`);
        if (wordEl) {
          const chars = wordEl.querySelectorAll('[data-char-index]');
          const currentWord = words[activeWordIndex];

          if (currentWord && activeCharIndex >= currentWord.original.length) {
            const extraChars = wordEl.querySelectorAll('[data-extra-index]');
            const extraIdx = activeCharIndex - currentWord.original.length;
            if (extraChars[extraIdx]) {
              targetSpan = extraChars[extraIdx] as HTMLElement;
            } else if (extraChars.length > 0) {
              targetSpan = extraChars[extraChars.length - 1] as HTMLElement;
            } else if (chars.length > 0) {
              targetSpan = chars[chars.length - 1] as HTMLElement;
            }
          } else if (chars[activeCharIndex]) {
            targetSpan = chars[activeCharIndex] as HTMLElement;
          } else if (chars.length > 0) {
            targetSpan = chars[chars.length - 1] as HTMLElement;
          }
        }
      }

      if (!targetSpan) {
        caretRef.current.style.opacity = '0';
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const spanRect = targetSpan.getBoundingClientRect();

      let x = spanRect.left - containerRect.left;
      const y = spanRect.top - containerRect.top;
      const charHeight = spanRect.height;
      const charWidth = spanRect.width;

      // If we're past the last char, position at right edge
      const currentWord = words[activeWordIndex];
      if (!isGhost && currentWord) {
        const totalChars = currentWord.original.length + currentWord.extraCharacters.length;
        if (activeCharIndex >= totalChars && activeCharIndex > 0) {
          x += charWidth;
        }
      }

      caretRef.current.style.opacity = isGhost ? '0.55' : '1';

      // Position based on cursor style
      if (cursorStyle === 'line') {
        caretRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        caretRef.current.style.height = `${charHeight}px`;
      } else if (cursorStyle === 'block') {
        caretRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        caretRef.current.style.width = `${charWidth || 12}px`;
        caretRef.current.style.height = `${charHeight}px`;
      } else if (cursorStyle === 'underline') {
        caretRef.current.style.transform = `translate3d(${x}px, ${y + charHeight - 2}px, 0)`;
        caretRef.current.style.width = `${charWidth || 12}px`;
      }
    };

    updatePosition();

    // WordStream scrolls wrapped lines with a transform after the typing
    // state update. Keep the caret attached while that transform animates.
    const wordStream = container.querySelector('[data-word-stream]');
    if (!wordStream || isGhost) return;

    let animationFrame = 0;
    let isTransforming = false;
    const trackTransform = () => {
      if (!isTransforming) return;
      updatePosition();
      animationFrame = window.requestAnimationFrame(trackTransform);
    };
    const onTransitionRun = (event: Event) => {
      if ((event as TransitionEvent).propertyName !== 'transform') return;
      isTransforming = true;
      animationFrame = window.requestAnimationFrame(trackTransform);
    };
    const onTransitionEnd = (event: Event) => {
      if ((event as TransitionEvent).propertyName !== 'transform') return;
      isTransforming = false;
      window.cancelAnimationFrame(animationFrame);
      updatePosition();
    };

    wordStream.addEventListener('transitionrun', onTransitionRun);
    wordStream.addEventListener('transitionend', onTransitionEnd);
    wordStream.addEventListener('transitioncancel', onTransitionEnd);

    return () => {
      isTransforming = false;
      window.cancelAnimationFrame(animationFrame);
      wordStream.removeEventListener('transitionrun', onTransitionRun);
      wordStream.removeEventListener('transitionend', onTransitionEnd);
      wordStream.removeEventListener('transitioncancel', onTransitionEnd);
    };
  }, [activeWordIndex, activeCharIndex, words, phase, cursorStyle, isGhost, ghostCharIndex, containerRef]);

  const caretClassName = `caret ${
    cursorStyle === 'line' ? 'caret-line' :
    cursorStyle === 'block' ? 'caret-block' :
    'caret-underline'
  } ${isGhost ? 'caret-ghost' : ''}`;

  return (
    <div
      ref={caretRef}
      className={caretClassName}
      style={{ opacity: 0 }}
    />
  );
}
