'use client';
import { useVocabulary } from '@/hooks/useVocabulary';
import PageWrapper from '@/components/PageWrapper';
import FlashCard from '@/components/FlashCard';

export default function FlashcardPage() {
  const { studyWords, vocabSource } = useVocabulary();

  const sourceLabel = vocabSource === 'imported' ? 'Bộ Import' : vocabSource === 'default' ? 'Bộ gốc N3' : 'Tất cả';

  if (!studyWords.length) {
    return (
      <PageWrapper title="Flashcard 3D" subtitle="Học từ vựng qua thẻ">
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 40, fontWeight: 600 }}>
          Không có từ nào trong danh sách hiện tại.
        </p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Flashcard 3D" subtitle={`${studyWords.length} từ • ${sourceLabel}`}>
      <FlashCard words={studyWords} />
    </PageWrapper>
  );
}

