'use client';
import { useState } from 'react';
import { VocabWord } from '@/types/vocabulary';
import { useVocabulary } from '@/hooks/useVocabulary';
import { sounds } from '@/utils/sound';
import { triggerConfetti } from '@/utils/confetti';

interface ImportTxtProps {
  onClose: () => void;
}

function parseTxt(text: string, datasetName: string): { words: VocabWord[]; errors: string[] } {
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
        unit: currentUnit || 'Khác',
        dataset: datasetName,
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
  const [datasetName, setDatasetName] = useState('Bộ Import');
  const [preview, setPreview] = useState<VocabWord[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [overwriteMode, setOverwriteMode] = useState<boolean>(false);
  const { addImportedWords, clearImported, importedWords } = useVocabulary();

  const handleParse = () => {
    sounds.playTap();
    const result = parseTxt(text, datasetName || 'Bộ Import');
    setPreview(result.words);
    setErrors(result.errors);
  };

  const handleImport = () => {
    if (!preview || preview.length === 0) return;
    sounds.playTap();
    setImporting(true);
    setTimeout(() => {
      addImportedWords(preview, overwriteMode);
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
    const name = file.name.replace('.txt', '');
    setDatasetName(name);
    
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      setText(content);
      const result = parseTxt(content, name);
      setPreview(result.words);
      setErrors(result.errors);
    };
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Import Từ Vựng .TXT
            </h2>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Nạp danh sách từ tùy chỉnh vào ứng dụng
            </p>
          </div>
          <button
            className="btn-secondary btn"
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            style={{ width: 32, height: 32, padding: 0, borderRadius: '50%', fontSize: '0.9rem', color: 'var(--text-secondary)' }}
          >
            ✕
          </button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-hover)', marginBottom: 6 }}>
              Đã nạp thành công {preview?.length} từ vựng
            </p>
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '14px 18px',
              margin: '16px auto 20px',
              maxWidth: 420,
            }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--emerald)', fontWeight: 700, marginBottom: 4 }}>
                Đã tự động chuyển sang Tab: Bộ Import ({preview?.length} từ)
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Dữ liệu được lưu trong trình duyệt. Bạn có thể bắt đầu học ngay trên toàn bộ các chế độ.
              </p>
            </div>
            <button className="btn btn-primary" onClick={onClose} style={{ padding: '12px 36px', fontSize: '0.95rem' }}>
              Bắt đầu học bài ngay
            </button>
          </div>
        ) : (
          <>
            {/* File Upload Box */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '16px',
              background: 'rgba(254, 215, 170, 0.25)',
              border: '1.5px dashed var(--accent)',
              borderRadius: '14px',
              cursor: 'pointer',
              marginBottom: 14,
              fontSize: '0.92rem',
              fontWeight: 700,
              color: 'var(--accent-hover)',
              transition: 'all 0.2s',
            }}>
              <span>Chọn file từ vựng .txt từ máy tính</span>
              <input type="file" accept=".txt" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>

            {/* Dataset Name Input */}
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              TÊN BỘ TỪ VỰNG:
            </p>
            <input
              type="text"
              value={datasetName}
              onChange={e => setDatasetName(e.target.value)}
              placeholder="VD: Mimikara N3, Soumatome..."
              style={{
                width: '100%',
                background: '#fffdfa',
                border: '1.5px solid var(--border)',
                borderRadius: '12px',
                padding: '12px 14px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
                marginBottom: 14,
              }}
            />

            {/* Textarea */}
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              HOẶC DÁN NỘI DUNG VĂN BẢN VÀO ĐÂY:
            </p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`=== UNIT 1: Danh từ A ===\nKanji: 男性\nHiragana: だんせい\nNghĩa: Nam giới, đàn ông\nHánViệt: NAM TÍNH\n---`}
              rows={6}
              style={{
                width: '100%',
                background: '#fffdfa',
                border: '1.5px solid var(--border)',
                borderRadius: '14px',
                padding: '14px',
                color: 'var(--text-primary)',
                fontFamily: 'Noto Sans JP, monospace',
                fontSize: '0.85rem',
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
              Kiểm tra định dạng & Đếm số từ
            </button>

            {errors.length > 0 && (
              <div style={{
                marginBottom: 14,
                padding: '10px 14px',
                background: 'var(--rose-dim)',
                border: '1px solid rgba(225, 29, 72, 0.25)',
                borderRadius: '10px',
              }}>
                {errors.map((e, i) => (
                  <p key={i} style={{ fontSize: '0.75rem', color: 'var(--rose)', fontWeight: 600 }}>• {e}</p>
                ))}
              </div>
            )}

            {preview !== null && (
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                  padding: '8px 12px',
                  background: 'var(--emerald-dim)',
                  borderRadius: '10px',
                }}>
                  <span style={{ fontSize: '0.88rem', color: 'var(--emerald)', fontWeight: 700 }}>
                    Nhận diện hợp lệ: {preview.length} từ vựng
                  </span>
                </div>

                {/* Overwrite vs Append Options */}
                <div style={{
                  marginBottom: 12,
                  padding: '10px 14px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
                    CHỌN CÁCH NẠP DỮ LIỆU:
                  </p>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="radio"
                        name="importMode"
                        checked={overwriteMode}
                        onChange={() => setOverwriteMode(true)}
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      <span>Ghi đè mới toàn bộ {preview.length} từ</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="radio"
                        name="importMode"
                        checked={!overwriteMode}
                        onChange={() => setOverwriteMode(false)}
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      <span>Thêm nối tiếp (+{preview.length} từ)</span>
                    </label>
                  </div>
                </div>

                <div style={{
                  maxHeight: 180,
                  overflowY: 'auto',
                  background: '#ffffff',
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
                      borderBottom: '1px solid var(--border)',
                      fontSize: '0.82rem',
                      alignItems: 'center',
                    }}>
                      <span className="jp-text" style={{ color: 'var(--text-primary)', fontWeight: 800, minWidth: 65 }}>{w.kanji}</span>
                      <span className="jp-text" style={{ color: 'var(--accent-hover)', minWidth: 80, fontWeight: 600 }}>{w.hiragana}</span>
                      <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{w.meaning}</span>
                    </div>
                  ))}
                  {preview.length > 8 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', padding: '6px 0', textAlign: 'center', fontWeight: 500 }}>
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
                  {importing ? 'Đang lưu vào hệ thống...' : `Xác nhận nạp ${preview.length} từ vào ứng dụng`}
                </button>
              </div>
            )}

            {/* Note about LocalStorage persistence */}
            <div style={{
              marginTop: 14,
              padding: '12px 14px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}>
              <span>Dữ liệu được lưu an toàn trên trình duyệt của bạn</span>
              {importedWords.length > 0 && (
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
                    fontSize: '0.74rem',
                    fontWeight: 700,
                  }}
                >
                  Xóa từ đã import ({importedWords.length})
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
