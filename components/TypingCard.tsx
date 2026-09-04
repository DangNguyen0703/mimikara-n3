'use client';
import { useState, useEffect, useRef } from 'react';
import { VocabWord } from '@/types/vocabulary';
import { useBookmarks } from '@/hooks/useBookmarks';
import { sounds } from '@/utils/sound';
import { speakJapanese } from '@/utils/speech';

interface TypingCardProps {
  words: VocabWord[];
}

export default function TypingCard({ words }: TypingCardProps) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [streak, setStreak] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toggle } = useBookmarks();

  const current = words[index];

  useEffect(() => {
    inputRef.current?.focus();
  }, [index]);

  const handleSubmit = () => {
    if (!input.trim() || !current) return;
    const answer = current.hiragana.trim();
    const userInput = input.trim();

    const correct = userInput === answer;

    if (correct) {
      sounds.playCorrect();
      setResult('correct');
      setScore(s => ({ ...s, correct: s.correct + 1 }));
      setStreak(st => st + 1);
      setTimeout(() => {
        goNext();
      }, 700);
    } else {
      sounds.playWrong();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      setResult('wrong');
      setScore(s => ({ ...s, wrong: s.wrong + 1 }));
      setStreak(0);
      toggle(current.id, 'wrong');
      setShowAnswer(true);
    }
  };

  const goNext = () => {
    setIndex(i => (i + 1) % words.length);
    setInput('');
    setResult('idle');
    setShowAnswer(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (result === 'idle') {
        handleSubmit();
      } else {
        goNext();
      }
    }
  };

  if (!current) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {index + 1} / {words.length}
          </span>
          {streak >= 2 && (
            <span className="badge badge-amber animate-scale-in">
              Chuỗi {streak}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--emerald)' }}>✓ {score.correct}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--rose)' }}>✗ {score.wrong}</span>
        </div>
      </div>

      {/* Word Question Card */}
      <div
        className={`glass-card ${isShaking ? 'animate-shake' : ''}`}
        style={{
          padding: '28px 20px',
          textAlign: 'center',
          background: 'linear-gradient(145deg, #ffffff 0%, #fff7ed 100%)',
          border: '1.5px solid rgba(249, 115, 22, 0.25)',
          boxShadow: '0 10px 25px -6px rgba(234, 88, 12, 0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            GÕ HIRAGANA CHÍNH XÁC
          </span>
          <button
            className="speaker-btn"
            onClick={() => {
              sounds.playTap();
              speakJapanese(current.kanji || current.hiragana);
            }}
            title="Nghe phát âm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
          </button>
        </div>

        <p className="jp-text" style={{
          fontSize: 'clamp(2.8rem, 11vw, 4rem)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          lineHeight: 1.15,
          margin: '8px 0',
        }}>
          {current.kanji}
        </p>

        <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          {current.meaning}
        </p>

        {current.hanViet && (
          <span className="badge badge-accent" style={{ marginTop: 8, fontSize: '0.74rem' }}>
            Hán Việt: {current.hanViet}
          </span>
        )}
      </div>

      {/* Input Box */}
      <div style={{
        position: 'relative',
        background: '#ffffff',
        border: `2px solid ${result === 'correct' ? 'var(--emerald)' : result === 'wrong' ? 'var(--rose)' : 'var(--border)'}`,
        boxShadow: result === 'correct' ? '0 0 20px rgba(5, 150, 105, 0.25)' : result === 'wrong' ? '0 0 20px rgba(225, 29, 72, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
        borderRadius: '16px',
        padding: '6px 16px',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            setResult('idle');
            setShowAnswer(false);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Nhập Hiragana... (ví dụ: だんせい)"
          disabled={result !== 'idle' && !showAnswer}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '14px 0',
            fontSize: '1.35rem',
            fontWeight: 700,
            color: result === 'correct' ? 'var(--emerald)' : result === 'wrong' ? 'var(--rose)' : 'var(--text-primary)',
            fontFamily: 'Noto Sans JP, sans-serif',
            textAlign: 'center',
          }}
        />
      </div>

      {/* Correct answer revealed on error */}
      {result === 'wrong' && showAnswer && (
        <div className="glass-card animate-scale-in" style={{
          padding: '14px 18px',
          background: 'var(--rose-dim)',
          border: '1px solid rgba(225, 29, 72, 0.3)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rose)', textTransform: 'uppercase', marginBottom: 2 }}>
            Đáp án chính xác:
          </p>
          <p className="jp-text" style={{ fontSize: '1.45rem', color: 'var(--text-primary)', fontWeight: 800 }}>
            {current.hiragana}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        {result === 'idle' ? (
          <>
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => {
                sounds.playTap();
                setShowAnswer(true);
              }}
            >
              Xem gợi ý
            </button>
            <button className="btn btn-primary" style={{ flex: 1.4 }} onClick={handleSubmit}>
              Kiểm tra ↵
            </button>
          </>
        ) : (
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={goNext}>
            {result === 'correct' ? 'Tiếp tục →' : 'Tiếp theo →'}
          </button>
        )}
      </div>

      {/* Hint display */}
      {showAnswer && result === 'idle' && (
        <div className="glass-card animate-fade-in" style={{ padding: '12px', textAlign: 'center', background: 'var(--bg-secondary)' }}>
          <p className="jp-text" style={{ fontSize: '1.3rem', color: 'var(--accent-hover)', fontWeight: 800 }}>
            {current.hiragana}
          </p>
        </div>
      )}
    </div>
  );
}
