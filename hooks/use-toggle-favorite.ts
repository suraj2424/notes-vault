'use client';

import { useCallback, useState } from 'react';

export function useToggleFavorite(
  noteId: string,
  initialFavorite: boolean,
  onOptimisticUpdate?: (noteId: string, newState: boolean) => void,
  onRevert?: (noteId: string, oldState: boolean) => void
) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isToggling, setIsToggling] = useState(false);

  const toggleFavorite = useCallback(async () => {
    if (isToggling) return;
    const previousFavorite = isFavorite;
    const newFavorite = !previousFavorite;

    setIsFavorite(newFavorite);
    onOptimisticUpdate?.(noteId, newFavorite);
    setIsToggling(true);

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: newFavorite }),
      });
      if (!res.ok) throw new Error('Failed to update');
    } catch (error) {
      setIsFavorite(previousFavorite);
      onRevert?.(noteId, previousFavorite);
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsToggling(false);
    }
  }, [isFavorite, isToggling, noteId, onOptimisticUpdate, onRevert]);

  return { isFavorite, isToggling, toggleFavorite };
}
