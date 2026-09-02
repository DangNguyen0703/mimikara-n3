'use client';
import { useVocabulary } from '@/hooks/useVocabulary';
import PageWrapper from '@/components/PageWrapper';
import FlashCard from '@/components/FlashCard';

export default function FlashcardPage() {
  const { studyWords } = useVocabulary();

  if (!studyWords.length) {
    return (
      <PageWrapper title="🃏 Flashcard" subtitle="Học từ vựng qua thẻ">
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 40 }}>
          Không có từ nào để học.
        </p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="🃏 Flashcard" subtitle={`${studyWords.length} từ vựng`}>
      <FlashCard words={studyWords} />
    </PageWrapper>
  );
}
