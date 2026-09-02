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
              color: '#ffffff',
              lineHeight: 1.15,
              letterSpacing: '0.02em',
              textShadow: '0 2px 16px rgba(139, 92, 246, 0.25)',
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
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1.5px dashed rgba(139, 92, 246, 0.4)',
              borderRadius: '16px',
              padding: '16px 24px',
              color: 'var(--accent-light)',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
              margin: '8px auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
          >
            <span>🙈</span> Chạm để hiện Kanji
          </button>
        )}

        {isHiraganaVisible ? (
          <p
            className="jp-text animate-fade-in"
            style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: 'var(--accent-light)',
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
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px dashed var(--border)',
                borderRadius: '9999px',
                padding: '4px 14px',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              👁️ Hiện Hiragana
            </button>
          </div>
        )}
      </div>

      {/* Meaning Banner */}
      {isMeaningVisible ? (
        <div
          className="animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(56, 189, 248, 0.08))',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: 14,
            textAlign: 'center',
            boxShadow: '0 4px 20px -4px rgba(139, 92, 246, 0.15)',
            cursor: hideMeaning ? 'pointer' : 'default',
          }}
          onClick={() => hideMeaning && setRevealedMeaning(false)}
        >
          <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            {word.meaning}
          </p>
          {word.hanViet && (
            <p style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--accent-light)',
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
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1.5px dashed rgba(56, 189, 248, 0.35)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: 'var(--sky)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            👁️ Chạm để hiện Nghĩa tiếng Việt
          </button>
        </div>
      )}

      {/* Detailed Fields */}
      {showFull && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {word.usage && (
            <InfoRow icon="💬" label="Ví dụ / Cách dùng" value={word.usage} isJp onSpeak={() => speakJapanese(word.usage!)} />
          )}
          {word.antonym && (
            <InfoRow icon="↔️" label="Từ trái nghĩa" value={`${word.antonym} (${lookupInfo(word.antonym)})`} isJp onSpeak={() => speakJapanese(word.antonym!)} />
          )}
          {word.related && word.related.length > 0 && (
            <InfoRow icon="🔗" label="Từ liên quan" value={word.related.join('、')} isJp />
          )}
          {word.similar && word.similar.length > 0 && (
            <InfoRow icon="⚠️" label="Dễ nhầm lẫn" value={word.similar.join('、')} isJp />
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
          icon="⭐"
          label="Đánh dấu"
          activeColor="#f59e0b"
        />
        <BookmarkBtn
          active={has(word.id, 'wrong')}
          onClick={(e) => {
            e.stopPropagation();
            sounds.playTap();
            toggle(word.id, 'wrong');
          }}
          icon="❌"
          label="Sai"
          activeColor="#f43f5e"
        />
        <BookmarkBtn
          active={has(word.id, 'forgettable')}
          onClick={(e) => {
            e.stopPropagation();
            sounds.playTap();
            toggle(word.id, 'forgettable');
          }}
          icon="➕"
          label="Hay quên"
          activeColor="#38bdf8"
        />
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, isJp, onSpeak }: {
  icon: string;
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
      padding: '8px 12px',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '10px',
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: 1 }}>{icon}</span>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {label}
          </span>
          <span className={isJp ? 'jp-text' : ''} style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', wordBreak: 'break-word', fontWeight: 500 }}>
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
            color: 'var(--text-muted)',
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

function BookmarkBtn({ active, onClick, icon, label, activeColor }: {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  icon: string;
  label: string;
  activeColor: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: '9999px',
        border: `1px solid ${active ? activeColor + '80' : 'rgba(255, 255, 255, 0.08)'}`,
        background: active ? activeColor + '18' : 'rgba(255, 255, 255, 0.03)',
        color: active ? activeColor : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        fontSize: '0.78rem',
        fontWeight: 600,
      }}
    >
      <span style={{ fontSize: '0.95rem' }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
