'use client';
import { useVocabulary } from '@/hooks/useVocabulary';
import PageWrapper from '@/components/PageWrapper';
import TypingCard from '@/components/TypingCard';

export default function TypingPage() {
  const { studyWords, vocabSource } = useVocabulary();

  const sourceLabel = vocabSource === 'imported' ? 'Bộ Import' : vocabSource === 'default' ? 'Bộ gốc N3' : 'Tất cả';

  return (
    <PageWrapper title="Luyện Gõ Hiragana" subtitle={`${studyWords.length} từ • ${sourceLabel}`}>
      {studyWords.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 40, fontWeight: 600 }}>
          Không có từ nào để luyện gõ.
        </p>
      ) : (
        <TypingCard words={studyWords} />
      )}
    </PageWrapper>
  );
}

