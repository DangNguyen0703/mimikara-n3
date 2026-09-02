'use client';
import Link from 'next/link';
import { ReactNode } from 'react';
import { sounds } from '@/utils/sound';

interface PageWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  backHref?: string;
  rightAction?: ReactNode;
}

export default function PageWrapper({ title, subtitle, children, backHref = '/', rightAction }: PageWrapperProps) {
  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '14px 20px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
        background: 'rgba(9, 10, 16, 0.85)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href={backHref} style={{ textDecoration: 'none' }} onClick={() => sounds.playTap()}>
              <button
                className="btn-secondary btn"
                style={{
                  width: 36,
                  height: 36,
                  padding: 0,
                  borderRadius: '50%',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Quay lại"
              >
                ←
              </button>
            </Link>
            <div>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.2, color: '#ffffff' }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {rightAction && (
            <div>{rightAction}</div>
          )}
        </div>
      </header>

      {/* Content Body */}
      <div style={{
        flex: 1,
        padding: '16px 20px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
        maxWidth: 480,
        margin: '0 auto',
        width: '100%',
      }}>
        {children}
      </div>
    </main>
  );
}
