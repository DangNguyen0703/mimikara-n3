'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useBookmarks } from '@/hooks/useBookmarks';
import ImportTxt from '@/components/ImportTxt';
import ImportedListModal from '@/components/ImportedListModal';
import { sounds } from '@/utils/sound';

const MODES = [
  {
    id: 'flashcard',
    label: 'Flashcard 3D',
    icon: '🃏',
    desc: 'Lật thẻ 3D + phát âm bản xứ',
    href: '/flashcard',
    accent: '#8b5cf6',
    bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.16) 0%, rgba(139, 92, 246, 0.04) 100%)',
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  {
    id: 'quiz-kanji',
    label: 'Quiz Kanji',
    icon: '🔤',
    desc: 'Đọc chữ Hán → chọn nghĩa',
    href: '/quiz?mode=kanji',
    accent: '#10b981',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(16, 185, 129, 0.04) 100%)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  {
    id: 'quiz-meaning',
    label: 'Quiz Nghĩa',
    icon: '🧠',
    desc: 'Đọc nghĩa → tìm đúng Kanji',
    href: '/quiz?mode=meaning',
    accent: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.16) 0%, rgba(56, 189, 248, 0.04) 100%)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  {
    id: 'typing',
    label: 'Luyện Gõ Hiragana',
    icon: '⌨️',
    desc: 'Gõ chuẩn xác từng âm tiết',
    href: '/typing',
    accent: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(245, 158, 11, 0.04) 100%)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  {
    id: 'sequential',
    label: 'Học Tuần Tự',
    icon: '📖',
    desc: 'Xem theo danh mục 11 Unit',
    href: '/sequential',
    accent: '#ec4899',
    bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.16) 0%, rgba(236, 72, 153, 0.04) 100%)',
    borderColor: 'rgba(236, 72, 153, 0.25)',
  },
  {
    id: 'random',
    label: 'Luyện Ngẫu Nhiên',
    icon: '🎲',
    desc: 'Ôn tập phản xạ nhanh',
    href: '/random',
    accent: '#a855f7',
    bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.16) 0%, rgba(168, 85, 247, 0.04) 100%)',
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
];

export default function HomePage() {
  const { allWords, importedWords, limit, setLimit } = useVocabulary();
  const { starred, wrong, forgettable } = useBookmarks();
  const [showImport, setShowImport] = useState(false);
  const [showImportedList, setShowImportedList] = useState(false);
  const [soundActive, setSoundActive] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSoundActive(sounds.isEnabled());
  }, []);

  const totalWords = allWords.length;

  const toggleSound = () => {
    const next = sounds.toggleSound();
    setSoundActive(next);
    if (next) sounds.playTap();
  };

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 24px)' }}>
      {/* Sticky Top Header with Ambient Blur */}
      <header style={{
        padding: '16px 20px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'rgba(9, 10, 16, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
                <span className="gradient-text">Mimikara</span>
                <span style={{ color: 'var(--accent-light)', marginLeft: 6, fontSize: '0.95rem', fontWeight: 700 }}>N3</span>
              </h1>
              <span className="badge badge-accent" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                JLPT N3
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 3 }}>
              {mounted ? `${totalWords} từ vựng` : '...'} • 耳から覚える
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={toggleSound}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: soundActive ? 'var(--accent-light)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title={soundActive ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundActive ? '🔊' : '🔇'}
            </button>

            {/* View Imported List Button */}
            {mounted && importedWords.length > 0 ? (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  sounds.playTap();
                  setShowImportedList(true);
                }}
                style={{ fontSize: '0.78rem', padding: '8px 12px', borderRadius: '9999px', borderColor: 'rgba(139, 92, 246, 0.4)' }}
                title="Xem danh sách từ đã import"
              >
                📂 {importedWords.length} từ
              </button>
            ) : null}

            <button
              className="btn btn-primary"
              onClick={() => {
                sounds.playTap();
                setShowImport(true);
              }}
              style={{ fontSize: '0.78rem', padding: '8px 12px', borderRadius: '9999px' }}
            >
              📥 + Import
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ padding: '20px 20px 0', maxWidth: 480, margin: '0 auto' }}>
        
        {/* Study Limit Control Box */}
        <div className="glass-card" style={{ padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1rem' }}>🎯</span>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Giới hạn học mỗi lần
              </span>
            </div>
            <span className="badge badge-accent" style={{ fontSize: '0.82rem', padding: '4px 12px', fontWeight: 700 }}>
              {mounted ? limit : '...'} / {mounted ? totalWords : '...'} từ
            </span>
          </div>

          <input
            type="range"
            min={10}
            max={totalWords || 100}
            step={10}
            value={mounted ? limit : 50}
            onChange={e => {
              setLimit(Number(e.target.value));
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>10 từ (Nhanh)</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Toàn bộ ({mounted ? totalWords : '...'})</span>
          </div>
        </div>

        {/* 3 Quick Bookmark Statistic Pills */}
        {mounted && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
            <Link href="/bookmarks?type=starred" style={{ textDecoration: 'none' }} onClick={() => sounds.playTap()}>
              <div className="glass-card glass-card-interactive" style={{
                padding: '14px 10px',
                textAlign: 'center',
                borderColor: starred.length > 0 ? 'rgba(245, 158, 11, 0.3)' : 'var(--border)',
              }}>
                <div style={{ fontSize: '1.25rem', marginBottom: 2 }}>⭐</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--amber)' }}>{starred.length}</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)' }}>Đã lưu</div>
              </div>
            </Link>

            <Link href="/bookmarks?type=wrong" style={{ textDecoration: 'none' }} onClick={() => sounds.playTap()}>
              <div className="glass-card glass-card-interactive" style={{
                padding: '14px 10px',
                textAlign: 'center',
                borderColor: wrong.length > 0 ? 'rgba(244, 63, 94, 0.3)' : 'var(--border)',
              }}>
                <div style={{ fontSize: '1.25rem', marginBottom: 2 }}>❌</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--rose)' }}>{wrong.length}</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)' }}>Cần ôn</div>
              </div>
            </Link>

            <Link href="/bookmarks?type=forgettable" style={{ textDecoration: 'none' }} onClick={() => sounds.playTap()}>
              <div className="glass-card glass-card-interactive" style={{
                padding: '14px 10px',
                textAlign: 'center',
                borderColor: forgettable.length > 0 ? 'rgba(56, 189, 248, 0.3)' : 'var(--border)',
              }}>
                <div style={{ fontSize: '1.25rem', marginBottom: 2 }}>➕</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--sky)' }}>{forgettable.length}</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)' }}>Hay quên</div>
              </div>
            </Link>
          </div>
        )}

        {/* Learning Mode Selection */}
        <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            CHẾ ĐỘ HỌC TẬP
          </h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--accent-light)', fontWeight: 600 }}>
            6 Chế độ
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {MODES.map(mode => (
            <Link key={mode.id} href={mode.href} style={{ textDecoration: 'none' }} onClick={() => sounds.playTap()}>
              <div
                className="glass-card glass-card-interactive"
                style={{
                  padding: '18px 16px',
                  background: mode.bgGradient,
                  borderColor: mode.borderColor,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 126,
                  borderRadius: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.75rem', marginBottom: 8 }}>{mode.icon}</div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '0.94rem',
                    color: '#ffffff',
                    lineHeight: 1.25,
                    marginBottom: 4,
                  }}>
                    {mode.label}
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                  {mode.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

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
