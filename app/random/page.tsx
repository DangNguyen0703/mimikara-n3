'use client';
import { useState, useCallback, useEffect } from 'react';
import { useVocabulary } from '@/hooks/useVocabulary';
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

  const getNew = useCallback(() => {
    if (studyWords.length === 0) return;
    sounds.playTap();
    setAnimating(true);
    setTimeout(() => {
      const next = pickRandom(studyWords, current?.id);
      setCurrent(next);
      setHistory(h => [next, ...h.filter(item => item.id !== next.id)].slice(0, 15));
      setAnimating(false);
    }, 140);
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
        <div
          className="glass-card"
          style={{
            padding: '22px 20px',
            opacity: animating ? 0.2 : 1,
            transform: animating ? 'scale(0.96)' : 'scale(1)',
            transition: 'all 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <VocabCard word={current} showFull={expanded} />
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
