import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mimikara N3 | Học từ vựng tiếng Nhật',
  description: 'Ứng dụng học từ vựng tiếng Nhật N3 từ bộ Mimikara Oboeru. 687 từ vựng với flashcard, quiz, luyện gõ, viết và nhiều chế độ học khác.',
  keywords: ['tiếng Nhật', 'N3', 'từ vựng', 'Mimikara', 'JLPT', 'flashcard'],
  authors: [{ name: 'Mimikara N3' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f0f13',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
