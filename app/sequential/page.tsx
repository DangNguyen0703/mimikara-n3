'use client';
import { useState } from 'react';
import { useVocabulary } from '@/hooks/useVocabulary';
import PageWrapper from '@/components/PageWrapper';
import VocabCard from '@/components/VocabCard';
import { sounds } from '@/utils/sound';

export default function SequentialPage() {
  const { studyWords, vocabSource } = useVocabulary();
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(true);

  const sourceLabel = vocabSource === 'imported' ? 'Bộ Import' : vocabSource === 'default' ? 'Bộ gốc N3' : 'Tất cả';
  const current = studyWords[index];
  const total = studyWords.length;

  if (!current) {
    return (
      <PageWrapper title="Học Tuần Tự" subtitle={`Theo danh mục • ${sourceLabel}`}>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 40, fontWeight: 600 }}>
          Không có từ vựng nào trong danh sách.
        </p>
      </PageWrapper>
    );
  }

  const handlePrev = () => {
    sounds.playTap();
    setIndex(i => Math.max(0, i - 1));
  };

  const handleNext = () => {
    sounds.playTap();
    setIndex(i => Math.min(total - 1, i + 1));
  };

  return (
    <PageWrapper title="Học Tuần Tự" subtitle={`Từ ${index + 1} / ${total} • ${sourceLabel}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{index + 1} / {total}</span>
            <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>{current.unit}</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${((index + 1) / total) * 100}%` }} />
          </div>
        </div>

        {/* Word Card */}
        <div className="glass-card" style={{ padding: '22px 20px' }}>
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

        {/* Navigation Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            className="btn btn-secondary"
            onClick={handlePrev}
            disabled={index === 0}
            style={{ padding: '14px', opacity: index === 0 ? 0.4 : 1 }}
          >
            ← Từ trước
          </button>
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={index === total - 1}
            style={{ padding: '14px', opacity: index === total - 1 ? 0.4 : 1 }}
          >
            Từ tiếp theo →
          </button>
        </div>

        {/* Unit Filter Tags */}
        <div style={{ marginTop: 6 }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
            NHẢY NHANH THEO UNIT
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Array.from(new Set(studyWords.map(w => w.unit))).filter(Boolean).map(unit => {
              const isActive = current.unit === unit;
              return (
                <button
                  key={unit}
                  className="badge"
                  style={{
                    cursor: 'pointer',
                    background: isActive ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#ffffff',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    border: `1px solid ${isActive ? 'transparent' : 'var(--border)'}`,
                    padding: '7px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    boxShadow: isActive ? '0 4px 12px rgba(234, 88, 12, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => {
                    sounds.playTap();
                    const i = studyWords.findIndex(w => w.unit === unit);
                    if (i !== -1) setIndex(i);
                  }}
                >
                  {unit?.replace(/UNIT \d+: /, '')}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
