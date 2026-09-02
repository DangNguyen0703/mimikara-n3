'use client';
import { useLocalStorage } from './useLocalStorage';

export type BookmarkType = 'starred' | 'wrong' | 'forgettable';

export function useBookmarks() {
  const [starred, setStarred] = useLocalStorage<number[]>('bookmarks_starred', []);
  const [wrong, setWrong] = useLocalStorage<number[]>('bookmarks_wrong', []);
  const [forgettable, setForgettable] = useLocalStorage<number[]>('bookmarks_forgettable', []);

  const toggle = (id: number, type: BookmarkType) => {
    const setter = type === 'starred' ? setStarred : type === 'wrong' ? setWrong : setForgettable;
    const current = type === 'starred' ? starred : type === 'wrong' ? wrong : forgettable;
    setter(current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  };

  const has = (id: number, type: BookmarkType) => {
    const list = type === 'starred' ? starred : type === 'wrong' ? wrong : forgettable;
    return list.includes(id);
  };

  const clearAll = () => {
    setStarred([]);
    setWrong([]);
    setForgettable([]);
  };

  return { starred, wrong, forgettable, toggle, has, clearAll };
}
