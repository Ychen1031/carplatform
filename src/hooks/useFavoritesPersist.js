import { useEffect } from 'react';
import { useCar } from '../contexts/CarContext';

/**
 * 自動同步收藏夾到 localStorage
 * - 組件掛載時從 localStorage 恢復
 * - 收藏夾變化時自動保存
 */
export function useFavoritesPersist(storageKey = 'carFavorites') {
  const { state, setFavorites } = useCar();
  
  // 恢復收藏夾
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const favorites = JSON.parse(saved);
        setFavorites(favorites);
      } catch (error) {
        console.error('收藏夾恢復失敗:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在組件掛載時運行一次
  
  // 保存收藏夾
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state.favorites));
  }, [state.favorites, storageKey]);
  
  return state.favorites;
}
