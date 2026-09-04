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
        padding: '14px 0',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
        background: 'rgba(255, 250, 245, 0.94)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 2px 12px -2px rgba(234, 88, 12, 0.05)',
      }}>
        <div className="container-study" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
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
                  borderColor: 'var(--border)',
                  color: 'var(--accent-hover)',
                }}
                title="Quay lại"
              >
                ←
              </button>
            </Link>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2, color: 'var(--text-primary)' }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, fontWeight: 600 }}>
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

      {/* Content Body - Responsive Container */}
      <div className="container-study" style={{
        flex: 1,
        padding: '20px 16px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)',
        width: '100%',
      }}>
        {children}
      </div>
    </main>
  );
}
