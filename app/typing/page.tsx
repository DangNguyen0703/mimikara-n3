'use client';
import { useVocabulary } from '@/hooks/useVocabulary';
import PageWrapper from '@/components/PageWrapper';
import TypingCard from '@/components/TypingCard';

export default function TypingPage() {
  const { studyWords } = useVocabulary();

  return (
    <PageWrapper title="⌨️ Luyện gõ" subtitle={`${studyWords.length} từ vựng`}>
      {studyWords.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 40 }}>
          Không có từ nào để học.
        </p>
      ) : (
        <TypingCard words={studyWords} />
      )}
    </PageWrapper>
  );
}
