'use client';
import { useMemo, useCallback } from 'react';
import { vocabulary } from '@/data/vocabulary';
import { VocabWord } from '@/types/vocabulary';
import { useLocalStorage } from './useLocalStorage';

export type VocabSource = 'imported' | 'default' | 'all';

export function useVocabulary() {
  const [limit, setLimit] = useLocalStorage<number>('study_limit', 50);
  const [importedWords, setImportedWords] = useLocalStorage<VocabWord[]>('imported_words', []);
  const [vocabSource, setVocabSourceState] = useLocalStorage<VocabSource>('active_vocab_source', 'default');
  const [defaultDeleted, setDefaultDeleted] = useLocalStorage<boolean>('default_vocab_deleted', false);
  const [deletedDefaultIds, setDeletedDefaultIds] = useLocalStorage<number[]>('deleted_default_ids', []);
  const [isUnlocked, setIsUnlocked] = useLocalStorage<boolean>('delete_unlocked', false);

  const defaultWords = useMemo(() => {
    if (defaultDeleted) return [];
    if (deletedDefaultIds.length > 0) {
      return vocabulary.filter(w => !deletedDefaultIds.includes(w.id));
    }
    return vocabulary;
  }, [defaultDeleted, deletedDefaultIds]);

  const allWords = useMemo(() => {
    return [...defaultWords, ...importedWords];
  }, [defaultWords, importedWords]);

  // Determine which dataset is actively selected
  const activeWords = useMemo(() => {
    if (vocabSource === 'imported') {
      return importedWords.length > 0 ? importedWords : defaultWords;
    }
    if (vocabSource === 'all') {
      return allWords.length > 0 ? allWords : (importedWords.length > 0 ? importedWords : defaultWords);
    }
    // 'default'
    if (defaultWords.length === 0 && importedWords.length > 0) {
      return importedWords;
    }
    return defaultWords;
  }, [vocabSource, importedWords, defaultWords, allWords]);

  const studyWords = useMemo(() => {
    return activeWords.slice(0, limit);
  }, [activeWords, limit]);

  const units = useMemo(() => {
    const unitMap = new Map<string, VocabWord[]>();
    activeWords.forEach(w => {
      const u = w.unit || 'Khác';
      if (!unitMap.has(u)) unitMap.set(u, []);
      unitMap.get(u)!.push(w);
    });
    return unitMap;
  }, [activeWords]);

  const lookupWord = (kanji: string): VocabWord | undefined => {
    return allWords.find(w => w.kanji === kanji || w.kanji.startsWith(kanji));
  };

  const setVocabSource = useCallback((source: VocabSource) => {
    setVocabSourceState(source);
  }, [setVocabSourceState]);

  const addImportedWords = useCallback((words: VocabWord[], overwrite: boolean = false) => {
    const baseId = 20000;
    const newWords = words.map((w, i) => ({ ...w, id: baseId + i + 1 }));

    if (overwrite) {
      setImportedWords(newWords);
    } else {
      setImportedWords(prev => {
        const maxId = Math.max(...prev.map(w => w.id), baseId);
        const mapped = words.map((w, i) => ({ ...w, id: maxId + i + 1 }));
        return [...prev, ...mapped];
      });
    }
    // Auto switch to imported tab so user immediately sees their imported words!
    setVocabSourceState('imported');
  }, [setImportedWords, setVocabSourceState]);

  const deleteImportedWord = useCallback((id: number) => {
    setImportedWords(prev => prev.filter(w => w.id !== id));
  }, [setImportedWords]);

  const deleteDefaultWord = useCallback((id: number) => {
    setDeletedDefaultIds(prev => [...prev, id]);
  }, [setDeletedDefaultIds]);

  const deleteWord = useCallback((id: number) => {
    // Delete from both just in case
    setImportedWords(prev => prev.filter(w => w.id !== id));
    setDeletedDefaultIds(prev => [...new Set([...prev, id])]);
  }, [setImportedWords, setDeletedDefaultIds]);

  const clearImported = useCallback(() => {
    setImportedWords([]);
    setVocabSourceState(defaultDeleted ? 'imported' : 'default');
  }, [setImportedWords, setVocabSourceState, defaultDeleted]);

  const deleteDefaultWords = useCallback(() => {
    setDefaultDeleted(true);
    setVocabSourceState('imported');
  }, [setDefaultDeleted, setVocabSourceState]);

  const restoreDefaultWords = useCallback(() => {
    setDefaultDeleted(false);
    setVocabSourceState('default');
  }, [setDefaultDeleted, setVocabSourceState]);

  return {
    allWords,
    defaultWords,
    defaultDeleted,
    importedWords,
    activeWords,
    studyWords,
    units,
    limit,
    setLimit,
    vocabSource,
    setVocabSource,
    lookupWord,
    addImportedWords,
    deleteImportedWord,
    deleteDefaultWord,
    deleteWord,
    clearImported,
    deleteDefaultWords,
    restoreDefaultWords,
    isUnlocked,
    setIsUnlocked,
  };
}

