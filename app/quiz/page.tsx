'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useVocabulary } from '@/hooks/useVocabulary';
import PageWrapper from '@/components/PageWrapper';
import QuizCard from '@/components/QuizCard';

function QuizContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') || 'kanji') as 'kanji' | 'meaning';
  const { studyWords } = useVocabulary();

  const title = mode === 'kanji' ? '🔤 Quiz Kanji' : '🧠 Quiz Nghĩa';
  const subtitle = mode === 'kanji' ? 'Đọc Kanji → chọn nghĩa' : 'Đọc nghĩa → chọn Kanji';

  if (studyWords.length < 4) {
    return (
      <PageWrapper title={title} subtitle={subtitle}>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 40 }}>
          Cần ít nhất 4 từ để làm quiz.
        </p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={title} subtitle={`${studyWords.length} từ vựng`}>
      <QuizCard words={studyWords} mode={mode} />
    </PageWrapper>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <PageWrapper title="Quiz" subtitle="Đang tải...">
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 60 }}>⏳</div>
      </PageWrapper>
    }>
      <QuizContent />
    </Suspense>
  );
}
