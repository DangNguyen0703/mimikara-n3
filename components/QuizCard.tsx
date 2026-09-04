'use client';
import { useState, useEffect, useCallback } from 'react';
import { VocabWord } from '@/types/vocabulary';
import { useBookmarks } from '@/hooks/useBookmarks';
import { sounds } from '@/utils/sound';
import { speakJapanese } from '@/utils/speech';
import { triggerConfetti } from '@/utils/confetti';

interface QuizCardProps {
  words: VocabWord[];
  mode: 'kanji' | 'meaning'; // kanji: show kanji, guess meaning | meaning: show meaning, guess kanji
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizCard({ words, mode }: QuizCardProps) {
  const [questions, setQuestions] = useState<VocabWord[]>([]);
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<VocabWord[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const { toggle } = useBookmarks();

  const buildChoices = useCallback((current: VocabWord, allWords: VocabWord[]) => {
    const wrong = shuffle(allWords.filter(w => w.id !== current.id)).slice(0, 3);
    return shuffle([current, ...wrong]);
  }, []);

  useEffect(() => {
    const q = shuffle(words);
    setQuestions(q);
    setIndex(0);
    setScore({ correct: 0, wrong: 0 });
    setStreak(0);
    setMaxStreak(0);
    setFinished(false);
    setSelected(null);
    if (q.length > 0) setChoices(buildChoices(q[0], words));
  }, [words, buildChoices]);

  const current = questions[index];

  const handleSelect = (choice: VocabWord) => {
    if (selected !== null) return;
    setSelected(choice.id);
    const isCorrect = choice.id === current.id;

    if (isCorrect) {
      sounds.playCorrect();
      setScore(s => ({ ...s, correct: s.correct + 1 }));
      setStreak(st => {
        const next = st + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      sounds.playWrong();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      setScore(s => ({ ...s, wrong: s.wrong + 1 }));
      setStreak(0);
      toggle(current.id, 'wrong');
    }

    setTimeout(() => {
      if (index + 1 >= questions.length) {
        setFinished(true);
        sounds.playFanfare();
        triggerConfetti();
      } else {
        const next = questions[index + 1];
        setChoices(buildChoices(next, words));
        setIndex(i => i + 1);
        setSelected(null);
      }
    }, 750);
  };

  const restart = () => {
    sounds.playTap();
    const q = shuffle(words);
    setQuestions(q);
    setIndex(0);
    setScore({ correct: 0, wrong: 0 });
    setStreak(0);
    setFinished(false);
    setSelected(null);
    if (q.length > 0) setChoices(buildChoices(q[0], words));
  };

  if (!current || questions.length === 0) return null;

  if (finished) {
    const total = score.correct + score.wrong;
    const pct = Math.round((score.correct / total) * 100);
    return (
      <div className="glass-card animate-scale-in" style={{ padding: '36px 24px', textAlign: 'center' }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'rgba(254, 215, 170, 0.35)',
          border: '2px solid var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '1.4rem',
          fontWeight: 900,
          color: 'var(--accent-hover)',
        }}>
          {pct}%
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)' }}>
          {pct >= 90 ? 'Xuất sắc!' : pct >= 70 ? 'Làm tốt lắm!' : 'Cố gắng lên!'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
          Bạn đã hoàn thành bài luyện tập
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '16px 12px',
          marginBottom: 24,
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Chính xác</span>
            <p style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--emerald)', marginTop: 2 }}>{pct}%</p>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Điểm</span>
            <p style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: 2 }}>{score.correct}/{total}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Max Chuỗi</span>
            <p style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--amber)', marginTop: 2 }}>{maxStreak}</p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={restart} style={{ width: '100%', padding: '14px', fontSize: '0.98rem' }}>
          Luyện tập lại
        </button>
      </div>
    );
  }

  const question = mode === 'kanji' ? current.kanji : current.meaning;
  const getChoiceLabel = (w: VocabWord) => mode === 'kanji' ? w.meaning : w.kanji;
  const getChoiceSub = (w: VocabWord) => mode === 'kanji' ? (w.hanViet ? `[${w.hanViet}]` : '') : w.hiragana;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Info Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {index + 1} / {questions.length}
            </span>
            {streak >= 2 && (
              <span className="badge badge-amber animate-scale-in">
                Chuỗi {streak}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--emerald)' }}>✓ {score.correct}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--rose)' }}>✗ {score.wrong}</span>
          </div>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Question Card */}
      <div
        className={`glass-card ${isShaking ? 'animate-shake' : ''}`}
        style={{
          padding: '28px 20px',
          textAlign: 'center',
          position: 'relative',
          background: 'linear-gradient(145deg, #ffffff 0%, #fff7ed 100%)',
          border: '1.5px solid rgba(249, 115, 22, 0.25)',
          boxShadow: '0 10px 25px -6px rgba(234, 88, 12, 0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {mode === 'kanji' ? 'CHỌN NGHĨA ĐÚNG' : 'CHỌN KANJI ĐÚNG'}
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

        <p className={mode === 'kanji' ? 'jp-text' : ''} style={{
          fontSize: mode === 'kanji' ? 'clamp(2.8rem, 11vw, 4rem)' : '1.35rem',
          fontWeight: mode === 'kanji' ? 900 : 800,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          margin: '10px 0',
        }}>
          {question}
        </p>

        {mode === 'kanji' && (
          <p className="jp-text" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-hover)' }}>
            {current.hiragana}
          </p>
        )}
      </div>

      {/* 4 Choices in Responsive Grid (2 cols on laptop, 1 col on mobile) */}
      <div className="quiz-choices-grid">
        {choices.map((choice, i) => {
          const isCorrect = choice.id === current.id;
          const isSelected = selected === choice.id;

          let bg = '#ffffff';
          let border = 'var(--border)';
          let color = 'var(--text-primary)';
          let shadow = '0 2px 8px rgba(0, 0, 0, 0.03)';

          if (selected !== null) {
            if (isCorrect) {
              bg = 'rgba(5, 150, 105, 0.12)';
              border = 'var(--emerald)';
              color = 'var(--emerald)';
              shadow = '0 0 18px rgba(5, 150, 105, 0.25)';
            } else if (isSelected) {
              bg = 'rgba(225, 29, 72, 0.12)';
              border = 'var(--rose)';
              color = 'var(--rose)';
              shadow = '0 0 18px rgba(225, 29, 72, 0.25)';
            }
          }

          return (
            <button
              key={choice.id}
              onClick={() => handleSelect(choice)}
              disabled={selected !== null}
              className="glass-card-interactive"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '14px',
                border: `1.5px solid ${border}`,
                background: bg,
                color: color,
                cursor: selected !== null ? 'default' : 'pointer',
                textAlign: 'left',
                boxShadow: shadow,
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'rgba(254, 215, 170, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: 'var(--accent-hover)',
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <div>
                  <p className={mode === 'meaning' ? 'jp-text' : ''} style={{
                    fontSize: mode === 'meaning' ? '1.3rem' : '0.96rem',
                    fontWeight: mode === 'meaning' ? 800 : 700,
                    lineHeight: 1.3,
                  }}>
                    {getChoiceLabel(choice)}
                  </p>
                  {getChoiceSub(choice) && (
                    <span className="jp-text" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {getChoiceSub(choice)}
                    </span>
                  )}
                </div>
              </div>

              {selected !== null && isCorrect && (
                <span style={{ fontSize: '1.3rem', color: 'var(--emerald)', fontWeight: 800 }}>✓</span>
              )}
              {selected !== null && isSelected && !isCorrect && (
                <span style={{ fontSize: '1.3rem', color: 'var(--rose)', fontWeight: 800 }}>✗</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
