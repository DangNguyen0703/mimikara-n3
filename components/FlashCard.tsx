'use client';
import { useState, useRef, TouchEvent, useEffect, useCallback } from 'react';
import { VocabWord } from '@/types/vocabulary';
import VocabCard from './VocabCard';
import { speakJapanese } from '@/utils/speech';
import { sounds } from '@/utils/sound';

interface FlashCardProps {
  words: VocabWord[];
}

export default function FlashCard({ words }: FlashCardProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const isSwiping = useRef(false);

  const current = words[index];
  const total = words.length;

  const handleFlip = useCallback(() => {
    sounds.playFlip();
    setFlipped(f => !f);
  }, []);

  const go = useCallback((direction: 1 | -1) => {
    if (isAnimating) return;
    sounds.playTap();
    setIsAnimating(true);
    setTimeout(() => {
      setIndex(prev => (prev + direction + total) % total);
      setFlipped(false);
      setIsAnimating(false);
    }, 240);
  }, [isAnimating, total]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        go(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        go(-1);
      } else if (e.key === 's' || e.key === 'S') {
        if (current) speakJapanese(current.kanji || current.hiragana);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, go, current]);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isSwiping.current = false;
  };

  const handleTouchMove = (e: TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > 25 && dx > dy) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    const dt = Date.now() - touchStartTime.current;

    // If it's a deliberate horizontal swipe on mobile (moved > 70px in reasonable time and horizontal > vertical)
    if (Math.abs(dx) > 70 && dy < 60 && dt < 600) {
      go(dx < 0 ? 1 : -1);
    } else if (Math.abs(dx) < 15 && dy < 15) {
      // Clean tap to flip (avoid double triggers)
      handleFlip();
    }
  };

  if (!current) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Header: Progress & Unit */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
              {index + 1}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              / {total} từ
            </span>
          </div>
          {current.unit && (
            <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>
              {current.unit}
            </span>
          )}
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        className="perspective-container"
        style={{
          height: 'clamp(390px, 56vh, 490px)',
          cursor: 'pointer',
          touchAction: 'pan-y',
          opacity: isAnimating ? 0.35 : 1,
          transform: isAnimating ? 'scale(0.97)' : 'scale(1)',
          transition: 'opacity 0.24s, transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          // If not from a mobile touch gesture, allow click
          if (touchStartTime.current === 0) {
            handleFlip();
          }
        }}
      >
        <div className={`flip-card-inner ${flipped ? 'is-flipped' : ''}`}>
          {/* Card Front (Kanji Only + Speaker) */}
          <div
            className="flip-card-face glass-card"
            style={{
              padding: '24px 20px',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(145deg, rgba(26, 29, 46, 0.9) 0%, rgba(17, 19, 31, 0.9) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            {/* Top Row on Front */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                CHẠM ĐỂ LẬT THẺ
              </span>
              <button
                className="speaker-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playTap();
                  speakJapanese(current.kanji || current.hiragana);
                }}
                title="Phát âm tiếng Nhật"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
              </button>
            </div>

            {/* Kanji in the Middle */}
            <div style={{ textAlign: 'center', margin: 'auto 0' }}>
              <p className="jp-text" style={{
                fontSize: 'clamp(3.2rem, 13vw, 4.8rem)',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.15,
                letterSpacing: '0.02em',
                textShadow: '0 4px 24px rgba(139, 92, 246, 0.35)',
              }}>
                {current.kanji}
              </p>
              <p style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                marginTop: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}>
                <span>💡</span> Nhấn để xem cách đọc & nghĩa
              </p>
            </div>

            {/* Bottom Hint */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>← Vuốt để chuyển từ</span>
              <span>Phím cách: Lật ␣</span>
            </div>
          </div>

          {/* Card Back (Detailed Info) */}
          <div
            className="flip-card-face flip-card-back glass-card"
            style={{
              padding: '20px',
              overflowY: 'auto',
              background: 'linear-gradient(145deg, rgba(22, 25, 42, 0.95) 0%, rgba(15, 17, 28, 0.95) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              boxShadow: '0 12px 40px -10px rgba(139, 92, 246, 0.35)',
            }}
          >
            <VocabCard word={current} showFull={true} />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 10 }}>
        <button className="btn btn-secondary" onClick={() => go(-1)} style={{ padding: '14px 10px' }}>
          ← Trước
        </button>
        <button
          className="btn btn-primary"
          onClick={handleFlip}
          style={{ padding: '14px 12px' }}
        >
          {flipped ? '🔄 Xem Kanji' : '✨ Xem nghĩa'}
        </button>
        <button className="btn btn-secondary" onClick={() => go(1)} style={{ padding: '14px 10px' }}>
          Tiếp →
        </button>
      </div>
    </div>
  );
}
