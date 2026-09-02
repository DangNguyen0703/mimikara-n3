'use client';
import { useState } from 'react';
import { VocabWord } from '@/types/vocabulary';
import { useVocabulary } from '@/hooks/useVocabulary';
import { sounds } from '@/utils/sound';
import { triggerConfetti } from '@/utils/confetti';

interface ImportTxtProps {
  onClose: () => void;
}

function parseTxt(text: string): { words: VocabWord[]; errors: string[] } {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const words: VocabWord[] = [];
  const errors: string[] = [];
  let currentUnit = '';
  let currentWord: Partial<VocabWord> = {};
  let idCounter = 20000;

  const pushWord = () => {
    if (currentWord.kanji && currentWord.hiragana && currentWord.meaning) {
      words.push({
        id: idCounter++,
        kanji: currentWord.kanji,
        hiragana: currentWord.hiragana,
        meaning: currentWord.meaning,
        hanViet: currentWord.hanViet,
        antonym: currentWord.antonym,
        usage: currentWord.usage,
        related: currentWord.related,
        similar: currentWord.similar,
        unit: currentUnit || 'Imported',
      });
    } else if (currentWord.kanji) {
      errors.push(`Thiếu thông tin bắt buộc cho từ: ${currentWord.kanji}`);
    }
    currentWord = {};
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const unitMatch = trimmed.match(/^===\s*(.+?)\s*===$/);
    if (unitMatch) {
      pushWord();
      currentUnit = unitMatch[1];
      continue;
    }

    if (trimmed === '---') {
      pushWord();
      continue;
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();

    switch (key) {
      case 'Kanji': currentWord.kanji = value; break;
      case 'Hiragana': currentWord.hiragana = value; break;
      case 'Nghĩa': currentWord.meaning = value; break;
      case 'HánViệt': currentWord.hanViet = value; break;
      case 'TráiNghĩa': currentWord.antonym = value; break;
      case 'TrợTừ': currentWord.usage = value; break;
      case 'LiênQuan': currentWord.related = value.split(/[、,]/).map(s => s.trim()).filter(Boolean); break;
      case 'DễNhầm': currentWord.similar = value.split(/[、,]/).map(s => s.trim()).filter(Boolean); break;
    }
  }
  pushWord();

  return { words, errors };
}

export default function ImportTxt({ onClose }: ImportTxtProps) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<VocabWord[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const { addImportedWords, clearImported } = useVocabulary();

  const handleParse = () => {
    sounds.playTap();
    const result = parseTxt(text);
    setPreview(result.words);
    setErrors(result.errors);
  };

  const handleImport = () => {
    if (!preview || preview.length === 0) return;
    sounds.playTap();
    setImporting(true);
    setTimeout(() => {
      addImportedWords(preview);
      setImporting(false);
      setDone(true);
      sounds.playFanfare();
      triggerConfetti();
    }, 400);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sounds.playTap();
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      setText(content);
      const result = parseTxt(content);
      setPreview(result.words);
      setErrors(result.errors);
    };
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'flex-end',
    }}>
      <div className="animate-fade-in" style={{
        background: '#12141f',
        borderRadius: '24px 24px 0 0',
        width: '100%',
        maxHeight: '90dvh',
        overflowY: 'auto',
        padding: '24px 20px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.3rem' }}>📥</span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              Import từ vựng .TXT
            </h2>
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

        {done ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🎉</div>
            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald)', marginBottom: 6 }}>
              Import thành công {preview?.length} từ!
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Dữ liệu được lưu vĩnh viễn trong bộ nhớ LocalStorage của trình duyệt này.
            </p>
            <button className="btn btn-primary" onClick={onClose} style={{ padding: '12px 28px' }}>
              Bắt đầu học ngay
            </button>
          </div>
        ) : (
          <>
            {/* File Upload Box */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '16px',
              background: 'rgba(139, 92, 246, 0.08)',
              border: '2px dashed rgba(139, 92, 246, 0.35)',
              borderRadius: '16px',
              cursor: 'pointer',
              marginBottom: 14,
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--accent-light)',
              transition: 'all 0.2s',
            }}>
              <span>📁 Chọn file từ vựng .txt</span>
              <input type="file" accept=".txt" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>

            {/* Textarea */}
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
              HOẶC DÁN NỘI DUNG VÀO ĐÂY:
            </p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`=== UNIT 1: Danh từ A ===\nKanji: 男性\nHiragana: だんせい\nNghĩa: Nam giới, đàn ông\nHánViệt: NAM TÍNH\n---`}
              rows={7}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '14px',
                color: '#ffffff',
                fontFamily: 'Noto Sans JP, monospace',
                fontSize: '0.82rem',
                resize: 'vertical',
                outline: 'none',
                marginBottom: 12,
              }}
            />

            <button
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: 14, padding: '12px' }}
              onClick={handleParse}
            >
              🔍 Kiểm tra định dạng
            </button>

            {errors.length > 0 && (
              <div style={{
                marginBottom: 14,
                padding: '10px 14px',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                borderRadius: '10px',
              }}>
                {errors.map((e, i) => (
                  <p key={i} style={{ fontSize: '0.75rem', color: 'var(--rose)' }}>⚠ {e}</p>
                ))}
              </div>
            )}

            {preview !== null && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Nhận diện được: <strong style={{ color: 'var(--emerald)' }}>{preview.length} từ vựng</strong>
                  </span>
                </div>

                <div style={{
                  maxHeight: 180,
                  overflowY: 'auto',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginBottom: 14,
                }}>
                  {preview.slice(0, 8).map(w => (
                    <div key={w.id} style={{
                      display: 'flex',
                      gap: 12,
                      padding: '6px 0',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      fontSize: '0.82rem',
                      alignItems: 'center',
                    }}>
                      <span className="jp-text" style={{ color: '#ffffff', fontWeight: 700, minWidth: 60 }}>{w.kanji}</span>
                      <span className="jp-text" style={{ color: 'var(--accent-light)', minWidth: 80 }}>{w.hiragana}</span>
                      <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{w.meaning}</span>
                    </div>
                  ))}
                  {preview.length > 8 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', padding: '6px 0', textAlign: 'center' }}>
                      ...và {preview.length - 8} từ khác
                    </p>
                  )}
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
                  onClick={handleImport}
                  disabled={importing || preview.length === 0}
                >
                  {importing ? '⏳ Đang import vào kho...' : `✅ Xác nhận thêm ${preview.length} từ`}
                </button>
              </div>
            )}

            {/* Note about LocalStorage persistence */}
            <div style={{
              marginTop: 14,
              padding: '12px 14px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}>
              <span>💾 Lưu vĩnh viễn trên trình duyệt của bạn</span>
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa tất cả từ vựng bạn đã tự import thêm? (Danh sách 687 từ gốc vẫn được giữ nguyên)')) {
                    clearImported();
                    sounds.playTap();
                    alert('Đã xóa các từ tự import!');
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--rose)',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                }}
              >
                🗑️ Xóa từ đã import
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
