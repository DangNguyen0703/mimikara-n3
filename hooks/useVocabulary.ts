'use client';
import { useMemo } from 'react';
import { vocabulary } from '@/data/vocabulary';
import { VocabWord } from '@/types/vocabulary';
import { useLocalStorage } from './useLocalStorage';

export function useVocabulary() {
  const [limit, setLimit] = useLocalStorage<number>('study_limit', 50);
  const [importedWords, setImportedWords] = useLocalStorage<VocabWord[]>('imported_words', []);

  const allWords = useMemo(() => {
    const combined = [...vocabulary, ...importedWords];
    return combined;
  }, [importedWords]);

  const studyWords = useMemo(() => allWords.slice(0, limit), [allWords, limit]);

  const units = useMemo(() => {
    const unitMap = new Map<string, VocabWord[]>();
    allWords.forEach(w => {
      const u = w.unit || 'Khác';
      if (!unitMap.has(u)) unitMap.set(u, []);
      unitMap.get(u)!.push(w);
    });
    return unitMap;
  }, [allWords]);

  const lookupWord = (kanji: string): VocabWord | undefined => {
    return allWords.find(w => w.kanji === kanji || w.kanji.startsWith(kanji));
  };

  const addImportedWords = (words: VocabWord[]) => {
    const maxId = Math.max(...allWords.map(w => w.id), 0);
    const newWords = words.map((w, i) => ({ ...w, id: maxId + i + 1 }));
    setImportedWords(prev => [...prev, ...newWords]);
  };

  const deleteImportedWord = (id: number) => {
    setImportedWords(prev => prev.filter(w => w.id !== id));
  };

  const clearImported = () => setImportedWords([]);

  return {
    allWords,
    studyWords,
    importedWords,
    units,
    limit,
    setLimit,
    lookupWord,
    addImportedWords,
    deleteImportedWord,
    clearImported,
  };
}
