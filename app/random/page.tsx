'use client';
import { useState, useCallback, useEffect } from 'react';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import PageWrapper from '@/components/PageWrapper';
import VocabCard from '@/components/VocabCard';
import { VocabWord } from '@/types/vocabulary';
import { sounds } from '@/utils/sound';

function pickRandom(words: VocabWord[], exclude?: number): VocabWord {
  const pool = words.length > 1 ? words.filter(w => w.id !== exclude) : words;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function RandomPage() {
  const { studyWords } = useVocabulary();
  const [current, setCurrent] = useState<VocabWord | null>(null);
  const [history, setHistory] = useState<VocabWord[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [animating, setAnimating] = useState(false);

  // Toggle hide/show states
  const [hideKanji, setHideKanji] = useLocalStorage<boolean>('hide_kanji_random', false);
  const [hideHiragana, setHideHiragana] = useLocalStorage<boolean>('hide_hiragana_random', false);
  const [hideMeaning, setHideMeaning] = useLocalStorage<boolean>('hide_meaning_random', false);

  const getNew = useCallback(() => {
    if (studyWords.length === 0) return;
    sounds.playTap();
    setAnimating(true);
    setTimeout(() => {
      const next = pickRandom(studyWords, current?.id);
      setCurrent(next);
      setHistory(h => [next, ...h.filter(item => item.id !== next.id)].slice(0, 15));
      setAnimating(false);
    }, 180);
  }, [studyWords, current]);

  useEffect(() => {
    if (!current && studyWords.length > 0) {
      const first = pickRandom(studyWords);
      setCurrent(first);
      setHistory([first]);
    }
  }, [studyWords, current]);

  if (!current) {
    return (
      <PageWrapper title="🎲 Ngẫu nhiên" subtitle="Luyện phản xạ">
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 40 }}>
          Không có từ vựng nào trong danh sách.
        </p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="🎲 Luyện ngẫu nhiên" subtitle={`${studyWords.length} từ vựng`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        
        {/* Toggle Hide/Show Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
          background: 'rgba(255, 255, 255, 0.03)',
          padding: 6,
          borderRadius: '16px',
          border: '1px solid var(--border)',
        }}>
          <button
            onClick={() => {
              sounds.playTap();
              setHideKanji(h => !h);
            }}
            style={{
              padding: '8px 4px',
              borderRadius: '10px',
              border: 'none',
              background: hideKanji ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              color: hideKanji ? 'var(--accent-light)' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              transition: 'all 0.2s',
            }}
          >
            <span>{hideKanji ? '🙈' : '👁️'}</span>
            <span>{hideKanji ? 'Ẩn Kanji' : 'Kanji'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setHideHiragana(h => !h);
            }}
            style={{
              padding: '8px 4px',
              borderRadius: '10px',
              border: 'none',
              background: hideHiragana ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              color: hideHiragana ? 'var(--sky)' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              transition: 'all 0.2s',
            }}
          >
            <span>{hideHiragana ? '🙈' : '👁️'}</span>
            <span>{hideHiragana ? 'Ẩn Hira' : 'Hiragana'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setHideMeaning(h => !h);
            }}
            style={{
              padding: '8px 4px',
              borderRadius: '10px',
              border: 'none',
              background: hideMeaning ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              color: hideMeaning ? 'var(--emerald)' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              transition: 'all 0.2s',
            }}
          >
            <span>{hideMeaning ? '🙈' : '👁️'}</span>
            <span>{hideMeaning ? 'Ẩn Nghĩa' : 'Nghĩa TV'}</span>
          </button>
        </div>

        {/* Word Card with optional hidden fields */}
        <div
          className="glass-card"
          style={{
            padding: '22px 20px',
            opacity: animating ? 0.2 : 1,
            transform: animating ? 'scale(0.96)' : 'scale(1)',
            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <VocabCard
            word={current}
            showFull={expanded}
            hideKanji={hideKanji}
            hideHiragana={hideHiragana}
            hideMeaning={hideMeaning}
          />
          <button
            className="btn btn-ghost"
            style={{ width: '100%', marginTop: 12, fontSize: '0.82rem', color: 'var(--text-muted)' }}
            onClick={() => {
              sounds.playTap();
              setExpanded(e => !e);
            }}
          >
            {expanded ? '▲ Thu gọn chi tiết' : '▼ Mở rộng chi tiết'}
          </button>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '1rem', fontWeight: 700 }}
          onClick={getNew}
        >
          🎲 Đổi từ ngẫu nhiên khác
        </button>

        {/* Recent History */}
        {history.length > 1 && (
          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ĐÃ XEM GẦN ĐÂY ({history.length - 1} từ)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
              {history.slice(1).map((w, i) => (
                <button
                  key={`${w.id}-${i}`}
                  className="glass-card-interactive"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--text-primary)',
                  }}
                  onClick={() => {
                    sounds.playTap();
                    setCurrent(w);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="jp-text" style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>
                      {w.kanji}
                    </span>
                    <span className="jp-text" style={{ color: 'var(--accent-light)', fontSize: '0.8rem' }}>
                      {w.hiragana}
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    {w.meaning}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
