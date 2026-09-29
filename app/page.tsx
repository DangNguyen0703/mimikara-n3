'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useVocabulary, VocabSource } from '@/hooks/useVocabulary';
import { useBookmarks } from '@/hooks/useBookmarks';
import ImportTxt from '@/components/ImportTxt';
import ImportedListModal from '@/components/ImportedListModal';
import { sounds } from '@/utils/sound';

const MODES = [
  {
    id: 'flashcard',
    num: '01',
    jp: '単語カード',
    label: 'Flashcard 3D',
    desc: 'Lật thẻ 3D trực quan, phát âm bản xứ',
    href: '/flashcard',
    accent: '#ea580c',
  },
  {
    id: 'quiz-kanji',
    num: '02',
    jp: '漢字クイズ',
    label: 'Quiz Kanji',
    desc: 'Đọc chữ Hán → chọn nghĩa chính xác',
    href: '/quiz?mode=kanji',
    accent: '#059669',
  },
  {
    id: 'quiz-meaning',
    num: '03',
    jp: '意味クイズ',
    label: 'Quiz Nghĩa',
    desc: 'Đọc nghĩa tiếng Việt → tìm Kanji đúng',
    href: '/quiz?mode=meaning',
    accent: '#0284c7',
  },
  {
    id: 'typing',
    num: '04',
    jp: '入力練習',
    label: 'Luyện Gõ Hiragana',
    desc: 'Gõ chuẩn xác từng âm tiết phiên âm',
    href: '/typing',
    accent: '#d97706',
  },
  {
    id: 'sequential',
    num: '05',
    jp: '順次学習',
    label: 'Học Tuần Tự',
    desc: 'Xem chi tiết theo từng danh mục bài học',
    href: '/sequential',
    accent: '#f97316',
  },
  {
    id: 'random',
    num: '06',
    jp: 'ランダム',
    label: 'Luyện Ngẫu Nhiên',
    desc: 'Ôn tập phản xạ nhanh không theo thứ tự',
    href: '/random',
    accent: '#c2410c',
  },
];

export default function HomePage() {
  const {
    allWords,
    defaultWords,
    defaultDeleted,
    importedWords,
    activeWords,
    vocabSource,
    setVocabSource,
    clearImported,
    deleteDefaultWords,
    restoreDefaultWords,
    limit,
    setLimit,
    isUnlocked,
    setIsUnlocked,
  } = useVocabulary();

  const { starred, wrong, forgettable } = useBookmarks();
  const [showImport, setShowImport] = useState(false);
  const [showImportedList, setShowImportedList] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteDefaultConfirm, setShowDeleteDefaultConfirm] = useState(false);
  const [soundActive, setSoundActive] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSoundActive(sounds.isEnabled());
  }, []);

  const totalWords = activeWords.length;

  const toggleSound = () => {
    const next = sounds.toggleSound();
    setSoundActive(next);
    if (next) sounds.playTap();
  };

  const handleSourceSelect = (src: VocabSource) => {
    sounds.playTap();
    if (src === 'imported' && importedWords.length === 0) {
      setShowImport(true);
      return;
    }
    setVocabSource(src);
  };

  const confirmDeleteImported = () => {
    clearImported();
    setVocabSource(defaultDeleted ? 'imported' : 'default');
    setShowDeleteConfirm(false);
    sounds.playTap();
  };

  const handleUnlock = () => {
    sounds.playTap();
    if (isUnlocked) {
      setIsUnlocked(false);
      return;
    }
    const pwd = prompt('Nhập mật khẩu để mở khóa tính năng xóa:');
    if (pwd === '070304') {
      setIsUnlocked(true);
      alert('Đã mở khóa chức năng xóa!');
    } else if (pwd !== null) {
      alert('Mật khẩu không đúng!');
    }
  };

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 36px)' }}>
      {/* Sticky Top Header */}
      <header style={{
        padding: '14px 0',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'rgba(255, 250, 245, 0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 2px 14px -2px rgba(234, 88, 12, 0.05)',
      }}>
        <div className="container-responsive" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
                <span className="gradient-text">Mimikara</span>
                <span style={{ color: 'var(--accent-hover)', marginLeft: 6, fontSize: '1.05rem', fontWeight: 800 }}>N3</span>
              </h1>
              <span className="badge badge-accent" style={{ fontSize: '0.7rem', padding: '3px 10px' }}>
                JLPT N3
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4, fontWeight: 600 }}>
              {mounted ? (
                <>
                  {vocabSource === 'imported' ? (
                    <>
                      <strong style={{ color: 'var(--accent-hover)' }}>{importedWords.length} từ vựng</strong>
                      {' • Bộ Import'}
                    </>
                  ) : vocabSource === 'default' ? (
                    <>
                      <strong style={{ color: 'var(--accent-hover)' }}>880 từ vựng</strong>
                      {' • 耳から覚える'}
                    </>
                  ) : (
                    <>
                      <strong style={{ color: 'var(--accent-hover)' }}>{allWords.length} từ vựng</strong>
                      {' • 耳から覚える'}
                    </>
                  )}
                </>
              ) : 'Đang nạp...'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Audio Toggle button */}
            <button
              onClick={toggleSound}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: soundActive ? 'var(--accent-hover)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                flexShrink: 0,
              }}
              title={soundActive ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundActive ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
              )}
            </button>

            {/* View Active List Button */}
            {mounted && activeWords.length > 0 ? (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  sounds.playTap();
                  setShowImportedList(true);
                }}
                style={{ fontSize: '0.82rem', padding: '8px 14px', borderRadius: '9999px', borderColor: 'var(--accent)', flexShrink: 0 }}
                title="Xem danh sách từ đang học"
              >
                Kho từ ({activeWords.length})
              </button>
            ) : null}

            {/* Import Button */}
            <button
              className="btn btn-primary"
              onClick={() => {
                sounds.playTap();
                setShowImport(true);
              }}
              style={{ fontSize: '0.85rem', padding: '9px 18px', borderRadius: '9999px', fontWeight: 700, flexShrink: 0 }}
            >
              + Import .TXT
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Container */}
      <div className="container-responsive" style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Serene Japanese Zen Banner with Image */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(254, 215, 170, 0.35) 0%, rgba(255, 247, 237, 0.95) 100%)',
          border: '1px solid rgba(249, 115, 22, 0.22)',
          borderRadius: '16px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 4px 16px -4px rgba(234, 88, 12, 0.06)',
        }}>
          {/* Peaceful Zen Illustration Image */}
          <img
            src="/zen-banner.jpg"
            alt="Trí Tuệ & Tĩnh Tại"
            style={{
              width: 104,
              height: 68,
              objectFit: 'cover',
              borderRadius: '12px',
              border: '1px solid rgba(249, 115, 22, 0.25)',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.12)',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-amber" style={{ fontSize: '0.72rem', padding: '2px 9px', fontWeight: 800 }}>
                Trí Tuệ & Tĩnh Tại
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-hover)', fontWeight: 700 }}>
                耳から覚える • JLPT N3
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500, lineHeight: 1.4 }}>
              Không gian học tập bình yên, nuôi dưỡng tư duy sâu sắc và phản xạ vững vàng.
            </p>
          </div>
        </div>

        {/* TAB SELECTOR: Choose Vocabulary Source with Delete Buttons */}
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CHỌN BỘ TỪ VỰNG HỌC TẬP
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--accent-hover)', fontWeight: 700 }}>
                {vocabSource === 'imported' ? 'Đang chọn: Bộ Import' : vocabSource === 'default' ? 'Đang chọn: Gốc Mimikara' : 'Đang chọn: Tất cả'}
              </span>

              {/* Delete Lock Button */}
              <button
                onClick={handleUnlock}
                style={{
                  background: isUnlocked ? 'var(--emerald-dim)' : 'var(--bg-secondary)',
                  border: isUnlocked ? '1px solid var(--emerald)' : '1px solid var(--border)',
                  color: isUnlocked ? 'var(--emerald)' : 'var(--text-muted)',
                  padding: '3px 10px',
                  borderRadius: '8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                title={isUnlocked ? "Khóa lại" : "Mở khóa xóa"}
              >
                {isUnlocked ? '🔓 Đã mở khóa' : '🔒 Mở khóa xóa'}
              </button>

              {/* Delete Default Sample (687 words) Button */}
              {isUnlocked && !defaultDeleted && (
                <button
                  onClick={() => setShowDeleteDefaultConfirm(true)}
                  style={{
                    background: 'var(--rose-dim)',
                    border: '1px solid rgba(225, 29, 72, 0.25)',
                    color: 'var(--rose)',
                    padding: '3px 10px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  title="Xóa bộ mẫu gốc 687 từ"
                >
                  Xóa bộ gốc
                </button>
              )}

              {/* Delete Imported Button with Confirmation */}
              {isUnlocked && importedWords.length > 0 && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    background: 'var(--rose-dim)',
                    border: '1px solid rgba(225, 29, 72, 0.25)',
                    color: 'var(--rose)',
                    padding: '3px 10px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  title="Xóa bộ từ đã import"
                >
                  Xóa bộ import ({importedWords.length})
                </button>
              )}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: defaultDeleted ? '1fr' : 'repeat(3, 1fr)',
            gap: 8,
            background: 'var(--bg-secondary)',
            padding: 6,
            borderRadius: '14px',
            border: '1px solid var(--border)',
          }}>
            {/* Tab: Imported Words */}
            <button
              onClick={() => handleSourceSelect('imported')}
              style={{
                padding: '12px 10px',
                borderRadius: '10px',
                border: vocabSource === 'imported' ? '1px solid var(--accent)' : '1px solid transparent',
                background: vocabSource === 'imported' ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#ffffff',
                color: vocabSource === 'imported' ? '#ffffff' : 'var(--text-primary)',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                boxShadow: vocabSource === 'imported' ? '0 4px 14px rgba(234, 88, 12, 0.35)' : '0 1px 3px rgba(0, 0, 0, 0.03)',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              <span>Bộ Import</span>
              <span style={{
                fontSize: '0.72rem',
                opacity: vocabSource === 'imported' ? 0.95 : 0.65,
                fontWeight: 700,
              }}>
                {mounted ? (importedWords.length > 0 ? `${importedWords.length} từ` : 'Chưa nạp từ') : '...'}
              </span>
              {mounted && isUnlocked && importedWords.length > 0 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playTap();
                    setShowDeleteConfirm(true);
                  }}
                  style={{
                    marginTop: 3,
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: '5px',
                    background: vocabSource === 'imported' ? 'rgba(255, 255, 255, 0.28)' : 'var(--rose-dim)',
                    color: vocabSource === 'imported' ? '#ffffff' : 'var(--rose)',
                    border: vocabSource === 'imported' ? '1px solid rgba(255, 255, 255, 0.45)' : '1px solid rgba(225, 29, 72, 0.25)',
                    cursor: 'pointer',
                  }}
                  title="Xóa bộ import này"
                >
                  Xóa bộ này
                </span>
              )}
            </button>

            {/* Tab: Default Mimikara (sample 687 words) */}
            {!defaultDeleted && (
              <button
                onClick={() => handleSourceSelect('default')}
                style={{
                  padding: '12px 10px',
                  borderRadius: '10px',
                  border: vocabSource === 'default' ? '1px solid var(--accent)' : '1px solid transparent',
                  background: vocabSource === 'default' ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#ffffff',
                  color: vocabSource === 'default' ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: vocabSource === 'default' ? '0 4px 14px rgba(234, 88, 12, 0.35)' : '0 1px 3px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <span>Gốc Mimikara</span>
                <span style={{
                  fontSize: '0.72rem',
                  opacity: vocabSource === 'default' ? 0.95 : 0.65,
                  fontWeight: 700,
                }}>
                  {defaultDeleted ? 'Đã xóa (687 từ)' : '687 từ'}
                </span>
                {isUnlocked && !defaultDeleted && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playTap();
                      setShowDeleteDefaultConfirm(true);
                    }}
                    style={{
                      marginTop: 3,
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      padding: '1px 7px',
                      borderRadius: '5px',
                      background: vocabSource === 'default' ? 'rgba(255, 255, 255, 0.28)' : 'var(--rose-dim)',
                      color: vocabSource === 'default' ? '#ffffff' : 'var(--rose)',
                      border: vocabSource === 'default' ? '1px solid rgba(255, 255, 255, 0.45)' : '1px solid rgba(225, 29, 72, 0.25)',
                      cursor: 'pointer',
                    }}
                    title="Xóa bộ từ mẫu này"
                  >
                    Xóa bộ gốc
                  </span>
                )}
              </button>
            )}

            {/* Tab: All Words Combined */}
            {!defaultDeleted && (
              <button
              onClick={() => handleSourceSelect('all')}
              style={{
                padding: '12px 10px',
                borderRadius: '10px',
                border: vocabSource === 'all' ? '1px solid var(--accent)' : '1px solid transparent',
                background: vocabSource === 'all' ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#ffffff',
                color: vocabSource === 'all' ? '#ffffff' : 'var(--text-primary)',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                boxShadow: vocabSource === 'all' ? '0 4px 14px rgba(234, 88, 12, 0.35)' : '0 1px 3px rgba(0, 0, 0, 0.03)',
                transition: 'all 0.2s',
              }}
            >
              <span>Tất Cả Kết Hợp</span>
              <span style={{
                fontSize: '0.72rem',
                opacity: vocabSource === 'all' ? 0.95 : 0.65,
                fontWeight: 700,
              }}>
                {allWords.length} từ
              </span>
            </button>
          </div>
        </div>

        {/* Study Limit Control Box */}
        <div className="glass-card" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 800 }}>
              Giới hạn từ học mỗi lần
            </span>
            <span className="badge badge-accent" style={{ fontSize: '0.85rem', padding: '5px 14px', fontWeight: 800 }}>
              {mounted ? limit : '...'} / {mounted ? totalWords : '...'} từ
            </span>
          </div>

          <input
            type="range"
            min={10}
            max={totalWords || 100}
            step={10}
            value={mounted ? Math.min(limit, totalWords || 100) : 50}
            onChange={e => {
              setLimit(Number(e.target.value));
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>10 từ (Nhanh)</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Toàn bộ ({mounted ? totalWords : '...'} từ)</span>
          </div>
        </div>

        {/* 3 Quick Bookmark Statistic Pills */}
        {mounted && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <Link href="/bookmarks?type=starred" style={{ textDecoration: 'none' }} onClick={() => sounds.playTap()}>
              <div className="glass-card glass-card-interactive" style={{
                padding: '16px 14px',
                textAlign: 'center',
                borderColor: starred.length > 0 ? 'rgba(217, 119, 6, 0.4)' : 'var(--border)',
              }}>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--amber)' }}>{starred.length}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 2 }}>Đã lưu</div>
              </div>
            </Link>

            <Link href="/bookmarks?type=wrong" style={{ textDecoration: 'none' }} onClick={() => sounds.playTap()}>
              <div className="glass-card glass-card-interactive" style={{
                padding: '16px 14px',
                textAlign: 'center',
                borderColor: wrong.length > 0 ? 'rgba(225, 29, 72, 0.4)' : 'var(--border)',
              }}>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--rose)' }}>{wrong.length}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 2 }}>Cần ôn tập</div>
              </div>
            </Link>

            <Link href="/bookmarks?type=forgettable" style={{ textDecoration: 'none' }} onClick={() => sounds.playTap()}>
              <div className="glass-card glass-card-interactive" style={{
                padding: '16px 14px',
                textAlign: 'center',
                borderColor: forgettable.length > 0 ? 'rgba(2, 132, 199, 0.4)' : 'var(--border)',
              }}>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--sky)' }}>{forgettable.length}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 2 }}>Hay quên</div>
              </div>
            </Link>
          </div>
        )}

        {/* Learning Mode Selection - Responsive Grid */}
        <div>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              color: 'var(--text-secondary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              CHẾ ĐỘ HỌC TẬP
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-hover)', fontWeight: 700 }}>
              6 Chế độ sẵn sàng
            </span>
          </div>

          <div className="modes-grid">
            {MODES.map(mode => (
              <Link key={mode.id} href={mode.href} style={{ textDecoration: 'none' }} onClick={() => sounds.playTap()}>
                <div
                  className="glass-card glass-card-interactive"
                  style={{
                    padding: '20px 18px',
                    background: '#ffffff',
                    border: '1.5px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 136,
                    borderRadius: '16px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: mode.accent,
                        background: 'rgba(254, 215, 170, 0.35)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}>
                        {mode.num}
                      </span>
                      <span className="jp-text" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {mode.jp}
                      </span>
                    </div>
                    <div style={{
                      fontWeight: 800,
                      fontSize: '1.02rem',
                      color: 'var(--text-primary)',
                      lineHeight: 1.25,
                      marginBottom: 4,
                    }}>
                      {mode.label}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.35, fontWeight: 500 }}>
                    {mode.desc}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal to Delete Imported Words */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-sheet animate-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, textAlign: 'center', padding: '28px 24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              Xác Nhận Xóa Bộ Import?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
              Bạn có chắc chắn muốn xóa toàn bộ <strong>{importedWords.length} từ vựng</strong> đã import?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Hủy bỏ
              </button>
              <button
                className="btn"
                style={{ flex: 1.2, background: 'var(--rose)', color: '#ffffff', fontWeight: 700 }}
                onClick={confirmDeleteImported}
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Delete Default 687 Sample Words */}
      {showDeleteDefaultConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteDefaultConfirm(false)}>
          <div className="modal-sheet animate-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, textAlign: 'center', padding: '28px 24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              Xác Nhận Xóa Bộ Mẫu Gốc?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
              Bạn có chắc chắn muốn xóa bộ từ vựng mẫu <strong>(687 từ)</strong>? Sau khi xóa, bạn sẽ tập trung hoàn toàn vào bộ từ vựng tùy chỉnh (880 từ) bạn nạp vào. Bạn <strong>sẽ không thể khôi phục lại</strong> bộ từ này trừ khi xóa dữ liệu trang web.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowDeleteDefaultConfirm(false)}
              >
                Hủy bỏ
              </button>
              <button
                className="btn"
                style={{ flex: 1.2, background: 'var(--rose)', color: '#ffffff', fontWeight: 700 }}
                onClick={() => {
                  deleteDefaultWords();
                  setShowDeleteDefaultConfirm(false);
                  sounds.playTap();
                }}
              >
                Đồng ý xóa bộ mẫu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showImport && <ImportTxt onClose={() => setShowImport(false)} />}
      
      {showImportedList && (
        <ImportedListModal
          onClose={() => setShowImportedList(false)}
          onOpenImportNew={() => {
            setShowImportedList(false);
            setShowImport(true);
          }}
        />
      )}
    </main>
  );
}
