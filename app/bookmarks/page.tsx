'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useBookmarks } from '@/hooks/useBookmarks';
import PageWrapper from '@/components/PageWrapper';
import VocabCard from '@/components/VocabCard';
import { sounds } from '@/utils/sound';

type FilterType = 'starred' | 'wrong' | 'forgettable';

function BookmarksContent() {
  const searchParams = useSearchParams();
  const defaultType = (searchParams.get('type') || 'starred') as FilterType;
  const [activeType, setActiveType] = useState<FilterType>(defaultType);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { allWords } = useVocabulary();
  const { starred, wrong, forgettable } = useBookmarks();

  const ids = activeType === 'starred' ? starred : activeType === 'wrong' ? wrong : forgettable;
  const words = ids.map(id => allWords.find(w => w.id === id)).filter(Boolean) as typeof allWords;

  const tabs: { type: FilterType; icon: string; label: string; count: number; color: string }[] = [
    { type: 'starred', icon: '⭐', label: 'Đánh dấu', count: starred.length, color: 'var(--amber)' },
    { type: 'wrong', icon: '❌', label: 'Cần ôn', count: wrong.length, color: 'var(--rose)' },
    { type: 'forgettable', icon: '➕', label: 'Hay quên', count: forgettable.length, color: 'var(--sky)' },
  ];

  return (
    <PageWrapper title="📚 Danh sách lưu trữ" subtitle="Sổ tay cá nhân của bạn">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 3 Modern Tab Switchers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
          background: 'rgba(255, 255, 255, 0.03)',
          padding: 4,
          borderRadius: '16px',
          border: '1px solid var(--border)',
        }}>
          {tabs.map(tab => {
            const isActive = activeType === tab.type;
            return (
              <button
                key={tab.type}
                onClick={() => {
                  sounds.playTap();
                  setActiveType(tab.type);
                  setExpandedId(null);
                }}
                style={{
                  padding: '10px 6px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span>
                <span style={{ color: isActive ? tab.color : 'inherit' }}>
                  {tab.label} ({tab.count})
                </span>
              </button>
            );
          })}
        </div>

        {words.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>
              {activeType === 'starred' ? '⭐' : activeType === 'wrong' ? '🎯' : '💡'}
            </div>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Chưa có từ nào trong mục này
            </p>
            <p style={{ fontSize: '0.8rem', marginTop: 4 }}>
              Khi học, hãy nhấn nút ⭐ ❌ ➕ để lưu lại từ vựng cần ôn tập.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {words.map(word => {
              const isExpanded = expandedId === word.id;
              return (
                <div key={word.id} className="glass-card" style={{ overflow: 'hidden' }}>
                  <button
                    style={{
                      width: '100%',
                      padding: '16px 18px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                    }}
                    onClick={() => {
                      sounds.playTap();
                      setExpandedId(isExpanded ? null : word.id);
                    }}
                  >
                    <div>
                      <p className="jp-text" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                        {word.kanji}
                      </p>
                      <p className="jp-text" style={{ fontSize: '0.85rem', color: 'var(--accent-light)', fontWeight: 600 }}>
                        {word.hiragana}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {word.meaning}
                        </p>
                        {word.unit && (
                          <span className="badge badge-accent" style={{ fontSize: '0.65rem', marginTop: 2 }}>
                            {word.unit.replace(/UNIT \d+: /, '')}
                          </span>
                        )}
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{
                      padding: '16px 18px 20px',
                      borderTop: '1px solid var(--border)',
                      background: 'rgba(0, 0, 0, 0.2)',
                    }}>
                      <VocabCard word={word} showFull={true} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default function BookmarksPage() {
  return (
    <Suspense fallback={
      <PageWrapper title="📚 Danh sách lưu trữ">
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 60 }}>⏳ Đang tải...</div>
      </PageWrapper>
    }>
      <BookmarksContent />
    </Suspense>
  );
}
