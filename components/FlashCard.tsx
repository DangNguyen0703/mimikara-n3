'use client';
import { useState, useRef, TouchEvent, useEffect, useCallback } from 'react';
import { VocabWord } from '@/types/vocabulary';
import VocabCard from './VocabCard';
import { speakJapanese } from '@/utils/speech';
import { sounds } from '@/utils/sound';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface FlashCardProps {
  words: VocabWord[];
}

export default function FlashCard({ words }: FlashCardProps) {
  const [savedIndex, setSavedIndex] = useLocalStorage<number>('last_flashcard_index', 0);
  const [hideKanji, setHideKanji] = useLocalStorage<boolean>('flashcard_hide_kanji', false);
  const [hideHiragana, setHideHiragana] = useLocalStorage<boolean>('flashcard_hide_hiragana', false);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [jumpInput, setJumpInput] = useState('');

  // Local temporary reveal states for current card
  const [revealedKanji, setRevealedKanji] = useState(false);
  const [revealedHiragana, setRevealedHiragana] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const isSwiping = useRef(false);

  const total = words.length;

  // Restore saved index if valid
  useEffect(() => {
    if (savedIndex > 0 && savedIndex < total) {
      setIndex(savedIndex);
    }
  }, [savedIndex, total]);

  const current = words[index] || words[0];

  // Reset temporary reveals when word changes
  useEffect(() => {
    setRevealedKanji(false);
    setRevealedHiragana(false);
  }, [index]);

  const handleFlip = useCallback(() => {
    sounds.playFlip();
    setFlipped(f => !f);
  }, []);

  const changeIndex = useCallback((newIdx: number) => {
    const validIdx = Math.max(0, Math.min(total - 1, newIdx));
    setIndex(validIdx);
    setSavedIndex(validIdx);
    setFlipped(false);
  }, [total, setSavedIndex]);

  const go = useCallback((direction: 1 | -1) => {
    if (isAnimating) return;
    sounds.playTap();
    setIsAnimating(true);
    setTimeout(() => {
      const nextIdx = (index + direction + total) % total;
      changeIndex(nextIdx);
      setIsAnimating(false);
    }, 200);
  }, [isAnimating, index, total, changeIndex]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showJumpModal) return;
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        go(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        go(-1);
      } else if (e.key === 'j' || e.key === 'J') {
        setShowJumpModal(true);
      } else if (e.key === 's' || e.key === 'S') {
        if (current) speakJapanese(current.kanji || current.hiragana);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, go, current, showJumpModal]);

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

    // Horizontal swipe gesture on mobile
    if (Math.abs(dx) > 70 && dy < 60 && dt < 600) {
      go(dx < 0 ? 1 : -1);
    } else if (Math.abs(dx) < 15 && dy < 15) {
      handleFlip();
    }
  };

  const handleDirectJump = (targetNumber: number) => {
    sounds.playTap();
    changeIndex(targetNumber - 1);
    setShowJumpModal(false);
    setJumpInput('');
  };

  // Get list of unique Units with their first word index
  const unitList = Array.from(
    words.reduce((map, w, i) => {
      const u = w.unit || 'Khác';
      if (!map.has(u)) map.set(u, i);
      return map;
    }, new Map<string, number>()).entries()
  );

  const isKanjiShown = !hideKanji || revealedKanji;
  const isHiraganaShown = !hideHiragana || revealedHiragana;

  if (!current) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Top Header: Quick Jump & Unit */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>          <button
            onClick={() => {
              sounds.playTap();
              setJumpInput(String(index + 1));
              setShowJumpModal(true);
            }}
            className="glass-card-interactive"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(254, 215, 170, 0.35)',
              border: '1px solid var(--accent)',
              borderRadius: '9999px',
              padding: '5px 14px',
              cursor: 'pointer',
              color: 'var(--accent-hover)',
            }}
            title="Bấm để nhảy nhanh đến số từ bất kỳ"
          >
            <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>
              Từ {index + 1}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              / {total}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent)', marginLeft: 4, fontWeight: 700 }}>
              [Đổi số]
            </span>
          </button>

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

      {/* Hide/Show Controls Toolbar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
      }}>
        <button
          onClick={() => {
            sounds.playTap();
            setHideKanji(h => !h);
          }}
          style={{
            padding: '8px 10px',
            borderRadius: '12px',
            border: `1px solid ${hideKanji ? 'var(--accent)' : 'var(--border)'}`,
            background: hideKanji ? 'rgba(254, 215, 170, 0.4)' : '#ffffff',
            color: hideKanji ? 'var(--accent-hover)' : 'var(--text-secondary)',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          <span>{hideKanji ? 'Đang ẩn Kanji' : 'Ẩn chữ Kanji'}</span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setHideHiragana(h => !h);
          }}
          style={{
            padding: '8px 10px',
            borderRadius: '12px',
            border: `1px solid ${hideHiragana ? 'var(--sky)' : 'var(--border)'}`,
            background: hideHiragana ? 'var(--sky-dim)' : '#ffffff',
            color: hideHiragana ? 'var(--sky)' : 'var(--text-secondary)',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          <span>{hideHiragana ? 'Đang ẩn Hiragana' : 'Ẩn chữ Hiragana'}</span>
        </button>
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
          transition: 'opacity 0.2s, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (touchStartTime.current === 0) handleFlip();
        }}
      >
        <div className={`flip-card-inner ${flipped ? 'is-flipped' : ''}`}>
          {/* Card Front (Kanji + Hiragana + Speaker) */}
          <div
            className="flip-card-face glass-card"
            style={{
              padding: '24px 20px',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(145deg, #ffffff 0%, #fff7ed 100%)',
              border: '1.5px solid rgba(249, 115, 22, 0.25)',
              boxShadow: '0 12px 35px -10px rgba(234, 88, 12, 0.12)',
            }}
          >
            {/* Top Row on Front */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
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

            {/* Kanji & Hiragana in the Middle */}
            <div style={{ textAlign: 'center', margin: 'auto 0', width: '100%' }}>
              {/* Kanji */}
              {isKanjiShown ? (
                <p
                  className="jp-text animate-fade-in"
                  style={{
                    fontSize: 'clamp(2.8rem, 12vw, 4.2rem)',
                    fontWeight: 900,
                    color: 'var(--text-primary)',
                    lineHeight: 1.15,
                    letterSpacing: '0.02em',
                    cursor: hideKanji ? 'pointer' : 'default',
                  }}
                  onClick={(e) => {
                    if (hideKanji) {
                      e.stopPropagation();
                      setRevealedKanji(false);
                    }
                  }}
                >
                  {current.kanji}
                </p>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playTap();
                    setRevealedKanji(true);
                  }}
                  style={{
                    background: 'rgba(254, 215, 170, 0.3)',
                    border: '1.5px dashed var(--accent)',
                    borderRadius: '16px',
                    padding: '16px 24px',
                    color: 'var(--accent-hover)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    margin: '8px auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  Chạm để hiện Kanji
                </button>
              )}

              {/* Hiragana Reading on Front */}
              {isHiraganaShown ? (
                <p
                  className="jp-text animate-fade-in"
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: 'var(--accent-hover)',
                    marginTop: 8,
                    cursor: hideHiragana ? 'pointer' : 'default',
                  }}
                  onClick={(e) => {
                    if (hideHiragana) {
                      e.stopPropagation();
                      setRevealedHiragana(false);
                    }
                  }}
                >
                  {current.hiragana}
                </p>
              ) : (
                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playTap();
                      setRevealedHiragana(true);
                    }}
                    style={{
                      background: 'var(--sky-dim)',
                      border: '1px dashed var(--sky)',
                      borderRadius: '9999px',
                      padding: '5px 14px',
                      color: 'var(--sky)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Chạm để hiện Hiragana
                  </button>
                </div>
              )}

              <p style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginTop: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontWeight: 500,
              }}>
                Chạm vào thẻ hoặc bấm phím Cách để lật thẻ
              </p>
            </div>

            {/* Bottom Hint */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <span>← Vuốt để chuyển từ</span>
              <span>Phím cách: Lật thẻ</span>
            </div>
          </div>

          {/* Card Back (Detailed Info) */}
          <div
            className="flip-card-face flip-card-back glass-card"
            style={{
              padding: '20px',
              overflowY: 'auto',
              background: 'linear-gradient(145deg, #ffffff 0%, #fffbf5 100%)',
              border: '1.5px solid rgba(249, 115, 22, 0.3)',
              boxShadow: '0 12px 35px -10px rgba(234, 88, 12, 0.12)',
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
          {flipped ? 'Xem mặt trước' : 'Xem nghĩa & ví dụ'}
        </button>
        <button className="btn btn-secondary" onClick={() => go(1)} style={{ padding: '14px 10px' }}>
          Tiếp →
        </button>
      </div>

      {/* Quick Jump Modal */}
      {showJumpModal && (
        <div className="modal-overlay" onClick={() => setShowJumpModal(false)}>
          <div
            className="modal-sheet animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Nhảy Nhanh Đến Từ
                </h3>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Chọn số thứ tự hoặc bài học
                </p>
              </div>
              <button
                className="btn-secondary btn"
                onClick={() => setShowJumpModal(false)}
                style={{ width: 32, height: 32, padding: 0, borderRadius: '50%', fontSize: '0.85rem' }}
              >
                ✕
              </button>
            </div>

            {/* Direct Number Input */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <input
                type="number"
                min={1}
                max={total}
                value={jumpInput}
                onChange={e => setJumpInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && jumpInput) {
                    handleDirectJump(Number(jumpInput));
                  }
                }}
                placeholder={`Nhập từ 1 đến ${total}...`}
                style={{
                  flex: 1,
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                autoFocus
              />
              <button
                className="btn btn-primary"
                style={{ padding: '0 22px', fontSize: '0.95rem' }}
                onClick={() => {
                  if (jumpInput) handleDirectJump(Number(jumpInput));
                }}
              >
                Đi đến
              </button>
            </div>

            {/* Quick Step Buttons (+10, +50, -10, -50) */}
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                BƯỚC NHẢY NHANH
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[-50, -10, 10, 50].map(step => {
                  const target = index + 1 + step;
                  const isDisabled = target < 1 || target > total;
                  return (
                    <button
                      key={step}
                      disabled={isDisabled}
                      onClick={() => handleDirectJump(target)}
                      className="glass-card-interactive"
                      style={{
                        padding: '10px 4px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        background: '#ffffff',
                        color: isDisabled ? 'var(--text-muted)' : 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.35 : 1,
                      }}
                    >
                      {step > 0 ? `+${step}` : step}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Unit Shortcuts */}
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                HOẶC CHỌN THEO BÀI HỌC (UNIT)
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                {unitList.map(([unitName, startIdx]) => (
                  <button
                    key={unitName}
                    onClick={() => handleDirectJump(startIdx + 1)}
                    className="glass-card-interactive"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: `1px solid ${current.unit === unitName ? 'var(--accent)' : 'var(--border)'}`,
                      background: current.unit === unitName ? 'rgba(254, 215, 170, 0.35)' : '#ffffff',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{unitName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-hover)', fontWeight: 800 }}>
                      Từ #{startIdx + 1} →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
