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
  const { studyWords, vocabSource } = useVocabulary();
  const [current, setCurrent] = useState<VocabWord | null>(null);
  const [history, setHistory] = useState<VocabWord[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [animating, setAnimating] = useState(false);

  const sourceLabel = vocabSource === 'imported' ? 'Bộ Import' : vocabSource === 'default' ? 'Bộ gốc N3' : 'Tất cả';

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
      <PageWrapper title="Luyện Ngẫu Nhiên" subtitle={`Luyện phản xạ • ${sourceLabel}`}>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 40, fontWeight: 600 }}>
          Không có từ vựng nào trong danh sách.
        </p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Luyện Ngẫu Nhiên" subtitle={`${studyWords.length} từ • ${sourceLabel}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        
        {/* Toggle Hide/Show Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
          background: 'var(--bg-secondary)',
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
              border: `1px solid ${hideKanji ? 'var(--accent)' : 'var(--border)'}`,
              background: hideKanji ? 'rgba(254, 215, 170, 0.4)' : '#ffffff',
              color: hideKanji ? 'var(--accent-hover)' : 'var(--text-secondary)',
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
            <span>{hideKanji ? 'Đang ẩn Kanji' : 'Ẩn Kanji'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setHideHiragana(h => !h);
            }}
            style={{
              padding: '8px 4px',
              borderRadius: '10px',
              border: `1px solid ${hideHiragana ? 'var(--sky)' : 'var(--border)'}`,
              background: hideHiragana ? 'var(--sky-dim)' : '#ffffff',
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
            <span>{hideHiragana ? 'Đang ẩn Hira' : 'Ẩn Hiragana'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setHideMeaning(h => !h);
            }}
            style={{
              padding: '8px 4px',
              borderRadius: '10px',
              border: `1px solid ${hideMeaning ? 'var(--emerald)' : 'var(--border)'}`,
              background: hideMeaning ? 'var(--emerald-dim)' : '#ffffff',
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
            <span>{hideMeaning ? 'Đang ẩn Nghĩa' : 'Ẩn Nghĩa'}</span>
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
          Đổi từ ngẫu nhiên khác
        </button>

        {/* Recent History */}
        {history.length > 1 && (
          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
                    background: '#ffffff',
                    border: '1px solid var(--border)',
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
                    <span className="jp-text" style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {w.kanji}
                    </span>
                    <span className="jp-text" style={{ color: 'var(--accent-hover)', fontSize: '0.82rem', fontWeight: 600 }}>
                      {w.hiragana}
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500 }}>
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
