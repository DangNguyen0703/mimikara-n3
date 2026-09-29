'use client';
import { useState } from 'react';
import { useVocabulary } from '@/hooks/useVocabulary';
import { VocabWord } from '@/types/vocabulary';
import { sounds } from '@/utils/sound';
import { speakJapanese } from '@/utils/speech';

interface ImportedListModalProps {
  onClose: () => void;
  onOpenImportNew: () => void;
}

export default function ImportedListModal({ onClose, onOpenImportNew }: ImportedListModalProps) {
  const { activeWords, deleteWord, clearImported, deleteDataset, setVocabSource, vocabSource, isUnlocked } = useVocabulary();
  const [search, setSearch] = useState('');
  const [selectedWord, setSelectedWord] = useState<VocabWord | null>(null);

  const filtered = activeWords.filter(w => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      w.kanji.toLowerCase().includes(q) ||
      w.hiragana.toLowerCase().includes(q) ||
      w.meaning.toLowerCase().includes(q) ||
      (w.unit && w.unit.toLowerCase().includes(q))
    );
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet animate-scale-in" onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Kho Từ Vựng Đang Học
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {activeWords.length} từ vựng trong bộ nhớ
            </p>
          </div>
          <button
            className="btn-secondary btn"
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            style={{ width: 32, height: 32, padding: 0, borderRadius: '50%', fontSize: '0.85rem' }}
          >
            ✕
          </button>
        </div>

        {/* Action Bar (Search + Import More) */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo Kanji, Hiragana, Nghĩa..."
            style={{
              flex: 1,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          <button
            className="btn btn-primary"
            style={{ padding: '0 16px', fontSize: '0.82rem', borderRadius: '12px' }}
            onClick={() => {
              sounds.playTap();
              onOpenImportNew();
            }}
          >
            + Nạp thêm .TXT
          </button>
        </div>

        {/* Word List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 2, minHeight: 200, maxHeight: '55vh' }}>
          {activeWords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Chưa có từ vựng nào được import
              </p>
              <p style={{ fontSize: '0.82rem', marginTop: 4, marginBottom: 16, color: 'var(--text-secondary)' }}>
                Tải lên file .txt để bổ sung thêm từ vựng mới vào kho học của bạn.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  sounds.playTap();
                  onOpenImportNew();
                }}
              >
                Tải file .TXT ngay
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.88rem' }}>Không tìm thấy từ nào khớp với &quot;{search}&quot;</p>
            </div>
          ) : (
            filtered.map(w => {
              const isSelected = selectedWord?.id === w.id;
              return (
                <div
                  key={w.id}
                  className="glass-card"
                  style={{
                    padding: '12px 14px',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                    background: isSelected ? 'rgba(254, 215, 170, 0.2)' : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{ flex: 1, cursor: 'pointer' }}
                      onClick={() => setSelectedWord(isSelected ? null : w)}
                    >
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span className="jp-text" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {w.kanji}
                        </span>
                        <span className="jp-text" style={{ fontSize: '0.88rem', color: 'var(--accent-hover)', fontWeight: 600 }}>
                          {w.hiragana}
                        </span>
                        {w.unit && (
                          <span className="badge badge-accent" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                            {w.unit.replace(/UNIT \d+: /, '')}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 2, fontWeight: 500 }}>
                        {w.meaning}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        className="speaker-btn"
                        style={{ width: 34, height: 34 }}
                        onClick={() => {
                          sounds.playTap();
                          speakJapanese(w.kanji || w.hiragana);
                        }}
                        title="Nghe phát âm"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                        </svg>
                      </button>

                      {isUnlocked && (
                        <button
                          onClick={() => {
                            if (confirm(`Xóa từ "${w.kanji}" khỏi danh sách?`)) {
                              sounds.playTap();
                              deleteWord(w.id);
                            }
                          }}
                          style={{
                            background: 'var(--rose-dim)',
                            border: '1px solid rgba(225, 29, 72, 0.25)',
                            color: 'var(--rose)',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                          }}
                          title="Xóa từ này"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Word Detail */}
                  {isSelected && (
                    <div style={{
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: '1px solid var(--border)',
                      fontSize: '0.82rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}>
                      {w.hanViet && (
                        <p style={{ color: 'var(--accent-hover)' }}><strong>Hán Việt:</strong> {w.hanViet}</p>
                      )}
                      {w.usage && (
                        <p style={{ color: 'var(--text-secondary)' }}><strong>Cách dùng:</strong> {w.usage}</p>
                      )}
                      {w.antonym && (
                        <p style={{ color: 'var(--text-secondary)' }}><strong>Trái nghĩa:</strong> {w.antonym}</p>
                      )}
                      {w.related && w.related.length > 0 && (
                        <p style={{ color: 'var(--text-secondary)' }}><strong>Liên quan:</strong> {w.related.join('、')}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {activeWords.length > 0 && (
          <div style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <button
              className="btn btn-primary"
              style={{ fontSize: '0.82rem', padding: '8px 16px', borderRadius: '9999px' }}
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
            >
              Học bộ này ({activeWords.length} từ)
            </button>
            {isUnlocked && vocabSource !== 'default' && vocabSource !== 'all' && (
              <button
                onClick={() => {
                  if (confirm(`Bạn có chắc muốn xóa TẤT CẢ từ trong bộ "${vocabSource}"?`)) {
                    deleteDataset(vocabSource);
                    sounds.playTap();
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--rose)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                Xóa bộ này
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
