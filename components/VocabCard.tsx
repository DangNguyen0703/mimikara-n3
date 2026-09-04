'use client';
import { useState, useEffect } from 'react';
import { VocabWord } from '@/types/vocabulary';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useVocabulary } from '@/hooks/useVocabulary';
import { speakJapanese } from '@/utils/speech';
import { sounds } from '@/utils/sound';

interface VocabCardProps {
  word: VocabWord;
  showFull?: boolean;
  hideKanji?: boolean;
  hideHiragana?: boolean;
  hideMeaning?: boolean;
}

export default function VocabCard({
  word,
  showFull = true,
  hideKanji = false,
  hideHiragana = false,
  hideMeaning = false,
}: VocabCardProps) {
  const { toggle, has } = useBookmarks();
  const { lookupWord } = useVocabulary();

  // Local reveal states when user taps on a hidden item
  const [revealedKanji, setRevealedKanji] = useState(false);
  const [revealedHiragana, setRevealedHiragana] = useState(false);
  const [revealedMeaning, setRevealedMeaning] = useState(false);

  // Reset revealed states when word changes
  useEffect(() => {
    setRevealedKanji(false);
    setRevealedHiragana(false);
    setRevealedMeaning(false);
  }, [word.id]);

  const handleSpeech = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playTap();
    speakJapanese(word.kanji || word.hiragana);
  };

  const lookupInfo = (kanji: string) => {
    const found = lookupWord(kanji);
    if (found) return `${found.hiragana} - ${found.meaning}`;
    return kanji;
  };

  const isKanjiVisible = !hideKanji || revealedKanji;
  const isHiraganaVisible = !hideHiragana || revealedHiragana;
  const isMeaningVisible = !hideMeaning || revealedMeaning;

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* Header with Unit & Speaker */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        {word.unit ? (
          <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>
            {word.unit}
          </span>
        ) : <div />}

        <button
          className="speaker-btn"
          onClick={handleSpeech}
          title="Phát âm tiếng Nhật"
          aria-label="Phát âm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
        </button>
      </div>

      {/* Main Kanji & Reading */}
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        {isKanjiVisible ? (
          <p
            className="jp-text animate-fade-in"
            style={{
              fontSize: 'clamp(2.6rem, 11vw, 3.8rem)',
              fontWeight: 900,
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              letterSpacing: '0.02em',
              cursor: hideKanji ? 'pointer' : 'default',
            }}
            onClick={() => hideKanji && setRevealedKanji(false)}
          >
            {word.kanji}
          </p>
        ) : (
          <button
            onClick={() => {
              sounds.playTap();
              setRevealedKanji(true);
            }}
            style={{
              background: 'rgba(254, 215, 170, 0.35)',
              border: '1.5px dashed var(--accent)',
              borderRadius: '16px',
              padding: '16px 24px',
              color: 'var(--accent-hover)',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: 'pointer',
              margin: '8px auto',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            Chạm để hiện Kanji
          </button>
        )}

        {isHiraganaVisible ? (
          <p
            className="jp-text animate-fade-in"
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--accent-hover)',
              marginTop: 6,
              cursor: hideHiragana ? 'pointer' : 'default',
            }}
            onClick={() => hideHiragana && setRevealedHiragana(false)}
          >
            {word.hiragana}
          </p>
        ) : (
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => {
                sounds.playTap();
                setRevealedHiragana(true);
              }}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px dashed var(--border)',
                borderRadius: '9999px',
                padding: '5px 16px',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Hiện Hiragana
            </button>
          </div>
        )}
      </div>

      {/* Meaning Banner */}
      {isMeaningVisible ? (
        <div
          className="animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, rgba(254, 215, 170, 0.45) 0%, rgba(255, 237, 213, 0.6) 100%)',
            border: '1px solid rgba(249, 115, 22, 0.25)',
            borderRadius: '14px',
            padding: '12px 16px',
            marginBottom: 14,
            textAlign: 'center',
            boxShadow: '0 4px 14px -4px rgba(234, 88, 12, 0.12)',
            cursor: hideMeaning ? 'pointer' : 'default',
          }}
          onClick={() => hideMeaning && setRevealedMeaning(false)}
        >
          <p style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {word.meaning}
          </p>
          {word.hanViet && (
            <p style={{
              fontSize: '0.76rem',
              fontWeight: 700,
              color: 'var(--accent-hover)',
              marginTop: 3,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              Hán Việt: {word.hanViet}
            </p>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <button
            onClick={() => {
              sounds.playTap();
              setRevealedMeaning(true);
            }}
            style={{
              width: '100%',
              background: 'rgba(254, 215, 170, 0.3)',
              border: '1.5px dashed var(--accent)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: 'var(--accent-hover)',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Chạm để hiện Nghĩa tiếng Việt
          </button>
        </div>
      )}

      {/* Detailed Fields */}
      {showFull && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {word.usage && (
            <InfoRow tag="Ví dụ" label="Cách dùng" value={word.usage} isJp onSpeak={() => speakJapanese(word.usage!)} />
          )}
          {word.antonym && (
            <InfoRow tag="Trái nghĩa" label="Từ trái nghĩa" value={`${word.antonym} (${lookupInfo(word.antonym)})`} isJp onSpeak={() => speakJapanese(word.antonym!)} />
          )}
          {word.related && word.related.length > 0 && (
            <InfoRow tag="Liên quan" label="Từ liên quan" value={word.related.join('、')} isJp />
          )}
          {word.similar && word.similar.length > 0 && (
            <InfoRow tag="Dễ nhầm" label="Dễ nhầm lẫn" value={word.similar.join('、')} isJp />
          )}
        </div>
      )}

      {/* Bookmark Action Pill Buttons */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', paddingTop: 4 }}>
        <BookmarkBtn
          active={has(word.id, 'starred')}
          onClick={(e) => {
            e.stopPropagation();
            sounds.playTap();
            toggle(word.id, 'starred');
          }}
          label="Đã lưu"
          activeColor="#d97706"
        />
        <BookmarkBtn
          active={has(word.id, 'wrong')}
          onClick={(e) => {
            e.stopPropagation();
            sounds.playTap();
            toggle(word.id, 'wrong');
          }}
          label="Cần ôn"
          activeColor="#e11d48"
        />
        <BookmarkBtn
          active={has(word.id, 'forgettable')}
          onClick={(e) => {
            e.stopPropagation();
            sounds.playTap();
            toggle(word.id, 'forgettable');
          }}
          label="Hay quên"
          activeColor="#0284c7"
        />
      </div>
    </div>
  );
}

function InfoRow({ tag, label, value, isJp, onSpeak }: {
  tag: string;
  label: string;
  value: string;
  isJp?: boolean;
  onSpeak?: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      padding: '9px 12px',
      background: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', minWidth: 0, flex: 1 }}>
        <span style={{
          fontSize: '0.66rem',
          fontWeight: 800,
          color: 'var(--accent-hover)',
          background: 'rgba(254, 215, 170, 0.35)',
          padding: '2px 6px',
          borderRadius: '6px',
          flexShrink: 0,
          marginTop: 2,
          letterSpacing: '0.02em',
        }}>
          {tag}
        </span>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {label}
          </span>
          <span className={isJp ? 'jp-text' : ''} style={{ fontSize: '0.88rem', color: 'var(--text-primary)', wordBreak: 'break-word', fontWeight: 600 }}>
            {value}
          </span>
        </div>
      </div>
      {onSpeak && (
        <button
          onClick={(e) => { e.stopPropagation(); onSpeak(); }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--accent-hover)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            borderRadius: '6px',
          }}
          title="Nghe"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        </button>
      )}
    </div>
  );
}

function BookmarkBtn({ active, onClick, label, activeColor }: {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  label: string;
  activeColor: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 18px',
        borderRadius: '9999px',
        border: `1.5px solid ${active ? activeColor : 'var(--border)'}`,
        background: active ? activeColor : '#ffffff',
        color: active ? '#ffffff' : 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        fontSize: '0.8rem',
        fontWeight: 700,
        boxShadow: active ? `0 4px 12px ${activeColor}40` : '0 2px 6px rgba(0, 0, 0, 0.03)',
      }}
    >
      <span>{label}</span>
    </button>
  );
}
