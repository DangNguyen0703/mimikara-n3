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
  const { importedWords, deleteImportedWord, clearImported } = useVocabulary();
  const [search, setSearch] = useState('');
  const [selectedWord, setSelectedWord] = useState<VocabWord | null>(null);

  const filtered = importedWords.filter(w => {
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          background: '#12141f',
          borderRadius: '24px 24px 0 0',
          width: '100%',
          maxWidth: 480,
          margin: '0 auto',
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          padding: '22px 20px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.25rem' }}>📂</span>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                Từ vựng đã Import
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {importedWords.length} từ trong bộ nhớ LocalStorage
              </p>
            </div>
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
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '0.85rem',
              color: '#ffffff',
              outline: 'none',
            }}
          />
          <button
            className="btn btn-primary"
            style={{ padding: '0 14px', fontSize: '0.8rem', borderRadius: '12px' }}
            onClick={() => {
              sounds.playTap();
              onOpenImportNew();
            }}
          >
            + Thêm .TXT
          </button>
        </div>

        {/* Word List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 2 }}>
          {importedWords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 8 }}>📥</div>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Bạn chưa import từ vựng nào
              </p>
              <p style={{ fontSize: '0.8rem', marginTop: 4, marginBottom: 16 }}>
                Tải lên file .txt để bổ sung thêm từ vựng mới vào kho học.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  sounds.playTap();
                  onOpenImportNew();
                }}
              >
                📥 Tải file .TXT ngay
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.85rem' }}>Không tìm thấy từ nào khớp với &quot;{search}&quot;</p>
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
                    borderColor: isSelected ? 'rgba(139, 92, 246, 0.5)' : 'var(--border)',
                    background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{ flex: 1, cursor: 'pointer' }}
                      onClick={() => setSelectedWord(isSelected ? null : w)}
                    >
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span className="jp-text" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                          {w.kanji}
                        </span>
                        <span className="jp-text" style={{ fontSize: '0.85rem', color: 'var(--accent-light)', fontWeight: 600 }}>
                          {w.hiragana}
                        </span>
                        {w.unit && (
                          <span className="badge badge-accent" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                            {w.unit.replace(/UNIT \d+: /, '')}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {w.meaning}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        className="speaker-btn"
                        style={{ width: 32, height: 32 }}
                        onClick={() => {
                          sounds.playTap();
                          speakJapanese(w.kanji || w.hiragana);
                        }}
                        title="Nghe phát âm"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Xóa từ "${w.kanji}" khỏi danh sách import?`)) {
                            sounds.playTap();
                            deleteImportedWord(w.id);
                          }
                        }}
                        style={{
                          background: 'rgba(244, 63, 94, 0.1)',
                          border: '1px solid rgba(244, 63, 94, 0.25)',
                          color: 'var(--rose)',
                          borderRadius: '8px',
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                        title="Xóa từ này"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Expanded Word Detail */}
                  {isSelected && (
                    <div style={{
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: '0.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}>
                      {w.hanViet && (
                        <p style={{ color: 'var(--accent-light)' }}><strong>Hán Việt:</strong> {w.hanViet}</p>
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

        {/* Footer with Clear All button */}
        {importedWords.length > 0 && (
          <div style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Tổng: {importedWords.length} từ tự thêm
            </span>
            <button
              onClick={() => {
                if (confirm('Bạn có chắc muốn xóa TẤT CẢ từ đã import? (Dữ liệu gốc 687 từ vẫn còn)')) {
                  clearImported();
                  sounds.playTap();
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--rose)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              🗑️ Xóa tất cả từ import
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
