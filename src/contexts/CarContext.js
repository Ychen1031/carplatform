import React, { createContext, useReducer, useMemo, useEffect, useRef, useCallback } from 'react';

export const CarContext = createContext();

/**
 * 確保陣列中的 ID 唯一，去除重複項
 * @param {Array} items - 包含 id 屬性的物件陣列
 * @param {string} source - 數據源標識（用於調試日誌）
 * @returns {Array} - 去重後的陣列
 */
function deduplicateById(items, source = 'unknown') {
  if (!Array.isArray(items)) return [];
  
  const seenIds = new Map();
  const result = [];
  
  items.forEach(item => {
    const id = item.id;
    if (seenIds.has(id)) {
      console.warn(
        `[CarContext] 去除重複 ID: ${id} 來自 ${source}`,
        '原始項目:', seenIds.get(id),
        '重複項目:', item
      );
    } else {
      seenIds.set(id, item);
      result.push(item);
    }
  });
  
  return result;
}

// 初始狀態
const initialState = {
  // 車源數據
  listings: [],
  newCars: [],
  usedCars: [],
  
  // 用戶互動狀態
  favorites: [],
  selectedCar: null,
  activeContactId: null,
  
  // 篩選和排序
  filters: {
    keyword: '',
    maxPrice: '',
    minYear: '',
    brand: '',
    city: '',
    type: '',
    fuel: '',
  },
  sortBy: 'price-asc',
};

// 設定 Action Types
export const ACTIONS = {
  // 數據操作
  SET_NEW_CARS: 'SET_NEW_CARS',
  SET_USED_CARS: 'SET_USED_CARS',
  SET_LISTINGS: 'SET_LISTINGS',
  ADD_NEW_CAR: 'ADD_NEW_CAR',
  ADD_USED_CAR: 'ADD_USED_CAR',
  UPDATE_CAR: 'UPDATE_CAR',
  DELETE_CAR: 'DELETE_CAR',
  
  // 收藏操作
  TOGGLE_FAVORITE: 'TOGGLE_FAVORITE',
  SET_FAVORITES: 'SET_FAVORITES',
  
  // 選擇和展示
  SELECT_CAR: 'SELECT_CAR',
  DESELECT_CAR: 'DESELECT_CAR',
  SET_ACTIVE_CONTACT: 'SET_ACTIVE_CONTACT',
  CLEAR_ACTIVE_CONTACT: 'CLEAR_ACTIVE_CONTACT',
  
  // 篩選和排序
  SET_FILTERS: 'SET_FILTERS',
  RESET_FILTERS: 'RESET_FILTERS',
  SET_SORT: 'SET_SORT',
  
  // 批量操作
  RESET_ALL: 'RESET_ALL',
};

const normalizeId = (id) => String(id);

const normalizeFavorites = (favorites) =>
  Array.isArray(favorites) ? favorites.map(normalizeId) : [];

// Reducer 函數
function carReducer(state, action) {
  switch (action.type) {
    // 數據操作
    case ACTIONS.SET_NEW_CARS: {
      const dedupedCars = deduplicateById(action.payload, 'SET_NEW_CARS');
      return {
        ...state,
        newCars: dedupedCars,
        listings: [...dedupedCars, ...(state.usedCars || [])],
      };
    }
    
    case ACTIONS.SET_USED_CARS: {
      const dedupedCars = deduplicateById(action.payload, 'SET_USED_CARS');
      return {
        ...state,
        usedCars: dedupedCars,
        listings: [...(state.newCars || []), ...dedupedCars],
      };
    }
    
    case ACTIONS.SET_LISTINGS:
      return {
        ...state,
        listings: deduplicateById(action.payload, 'SET_LISTINGS'),
      };
    
    case ACTIONS.ADD_NEW_CAR: {
      const newCar = { ...action.payload, id: action.payload.id || action.generatedId };
      // 移除任何具有相同 ID 的現有車，以防止重複
      const filteredNewCars = state.newCars.filter(car => car.id !== newCar.id);
      const filteredListings = state.listings.filter(car => car.id !== newCar.id);
      return {
        ...state,
        newCars: [newCar, ...filteredNewCars],
        listings: [newCar, ...filteredListings],
      };
    }
    
    case ACTIONS.ADD_USED_CAR: {
      const usedCar = { ...action.payload, id: action.payload.id || action.generatedId };
      // 移除任何具有相同 ID 的現有車，以防止重複
      const filteredUsedCars = state.usedCars.filter(car => car.id !== usedCar.id);
      const filteredListings = state.listings.filter(car => car.id !== usedCar.id);
      return {
        ...state,
        usedCars: [usedCar, ...filteredUsedCars],
        listings: [usedCar, ...filteredListings],
      };
    }
    
    // 編輯車輛
    case ACTIONS.UPDATE_CAR: {
      const { id, ...carData } = action.payload;
      const updatedCar = { ...carData, id };
      
      // 更新 listings
      const updatedListings = state.listings.map(car => car.id === id ? updatedCar : car);
      
      // 根據車型更新 newCars 或 usedCars
      let updatedNewCars = state.newCars;
      let updatedUsedCars = state.usedCars;
      
      const carType = updatedCar.carType || 'used';
      
      if (carType === 'new') {
        updatedNewCars = state.newCars.map(car => car.id === id ? updatedCar : car);
      } else {
        updatedUsedCars = state.usedCars.map(car => car.id === id ? updatedCar : car);
      }
      
      return {
        ...state,
        listings: updatedListings,
        newCars: updatedNewCars,
        usedCars: updatedUsedCars,
        selectedCar: state.selectedCar?.id === id ? updatedCar : state.selectedCar,
      };
    }
    
    // 刪除車輛
    case ACTIONS.DELETE_CAR: {
      const carId = action.payload;
      // 直接從 newCars 和 usedCars 兩者都過濾，避免因 listings 找不到車輛而漏刪
      return {
        ...state,
        listings: state.listings.filter(car => car.id !== carId),
        newCars: state.newCars.filter(car => car.id !== carId),
        usedCars: state.usedCars.filter(car => car.id !== carId),
        selectedCar: state.selectedCar?.id === carId ? null : state.selectedCar,
      };
    }
    
    // 收藏操作
    case ACTIONS.TOGGLE_FAVORITE: {
      const carId = normalizeId(action.payload);
      const favorites = normalizeFavorites(state.favorites);
      const isFavorited = favorites.includes(carId);
      return {
        ...state,
        favorites: isFavorited
          ? favorites.filter(id => id !== carId)
          : [...favorites, carId],
      };
    }
    
    case ACTIONS.SET_FAVORITES:
      return {
        ...state,
        favorites: normalizeFavorites(action.payload),
      };
    
    // 選擇和展示
    case ACTIONS.SELECT_CAR:
      return {
        ...state,
        selectedCar: action.payload,
      };
    
    case ACTIONS.DESELECT_CAR:
      return {
        ...state,
        selectedCar: null,
      };
    
    case ACTIONS.SET_ACTIVE_CONTACT:
      return {
        ...state,
        activeContactId: action.payload,
      };
    
    case ACTIONS.CLEAR_ACTIVE_CONTACT:
      return {
        ...state,
        activeContactId: null,
      };
    
    // 篩選和排序
    case ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };
    
    case ACTIONS.RESET_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
      };
    
    case ACTIONS.SET_SORT:
      return {
        ...state,
        sortBy: action.payload,
      };
    
    // 批量操作
    case ACTIONS.RESET_ALL:
      return initialState;
    
    default:
      return state;
  }
}

// Provider 組件
export function CarProvider({ children }) {
  const [state, dispatch] = useReducer(carReducer, initialState);
  
  // Helper: build a safe favorites key for current user
  const getFavoritesKeyForUser = useCallback((userObj) => {
    if (!userObj) return 'favorites_guest';
    if (userObj.id) return `favorites_id_${String(userObj.id)}`;
    if (userObj.email) return `favorites_email_${encodeURIComponent(String(userObj.email).toLowerCase())}`;
    return 'favorites_guest';
  }, []);

  // 從 localStorage 載入已刊登但未上傳到後端的車（保留 client-side 產生的 id）
  useEffect(() => {
    let postedNew = [];
    let postedUsed = [];

    try {
      postedNew = JSON.parse(localStorage.getItem('postedNewCars') || '[]');
      postedUsed = JSON.parse(localStorage.getItem('postedUsedCars') || '[]');
      if (Array.isArray(postedNew) && postedNew.length > 0) {
        dispatch({ type: ACTIONS.SET_NEW_CARS, payload: postedNew });
      }
      if (Array.isArray(postedUsed) && postedUsed.length > 0) {
        dispatch({ type: ACTIONS.SET_USED_CARS, payload: postedUsed });
      }
    } catch (err) {
      // ignore parse errors
    }

    // 向後端請求所有已刊登的車，並以後端資料為準清除已刪除的快取
    fetch('http://localhost:3001/api/cars')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.cars) {
          // 後端現存的所有 _dbId 集合（用來判斷 localStorage 的車是否仍存在）
          const backendDbIds = new Set(data.cars.map(car => car.id));

          // 為後端數據添加前綴
          const backendNew = data.cars
            .filter(car => car.carType === 'new')
            .map(car => ({
              ...car,
              id: 1000000 + car.id,
              _dbId: car.id
            }));
          const backendUsed = data.cars
            .filter(car => car.carType === 'used')
            .map(car => ({
              ...car,
              id: 1000000 + car.id,
              _dbId: car.id
            }));

          // 過濾 localStorage 快取：只保留後端仍存在的車（_dbId 在後端有的才留）
          // 沒有 _dbId 的是本地暫存（尚未同步到後端），一律保留
          const validPostedNew = postedNew.filter(
            car => !car._dbId || backendDbIds.has(car._dbId)
          );
          const validPostedUsed = postedUsed.filter(
            car => !car._dbId || backendDbIds.has(car._dbId)
          );

          // 如果有過期資料被清除，更新 localStorage
          if (validPostedNew.length !== postedNew.length) {
            localStorage.setItem('postedNewCars', JSON.stringify(validPostedNew));
          }
          if (validPostedUsed.length !== postedUsed.length) {
            localStorage.setItem('postedUsedCars', JSON.stringify(validPostedUsed));
          }

          // 合併：後端資料 + 本地未同步的（去除重複）
          const mergeAndDedupe = (localCars, backendCars) => {
            const deduped = backendCars.filter(
              backendCar => !localCars.some(local => local._dbId === backendCar._dbId)
            );
            const seenIds = new Set();
            return [...localCars, ...deduped].filter(car => {
              if (seenIds.has(car.id)) return false;
              seenIds.add(car.id);
              return true;
            });
          };

          const finalNew = mergeAndDedupe(validPostedNew, backendNew);
          const finalUsed = mergeAndDedupe(validPostedUsed, backendUsed);

          dispatch({ type: ACTIONS.SET_NEW_CARS, payload: finalNew });
          dispatch({ type: ACTIONS.SET_USED_CARS, payload: finalUsed });
        }
      })
      .catch(error => console.error('載入車輛數據失敗:', error));
  }, []);
  
  // Track previous favorites to detect actual changes
  const prevFavoritesRef = useRef(null);

  // 初始載入 user-specific favorites 必須優先執行
  useEffect(() => {
    const loadFavoritesForCurrentUser = () => {
      try {
        const userData = localStorage.getItem('user');
        const userObj = userData ? JSON.parse(userData) : null;
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const favKey = getFavoritesKeyForUser(userObj);
        const saved = isLoggedIn
          ? localStorage.getItem(favKey)
          : localStorage.getItem('favorites_guest') || localStorage.getItem('favorites');
        const parsed = saved ? JSON.parse(saved) : [];
        dispatch({ type: ACTIONS.SET_FAVORITES, payload: normalizeFavorites(parsed) });
      } catch (err) {
        console.error('[CarContext] Error loading favorites:', err);
        dispatch({ type: ACTIONS.SET_FAVORITES, payload: [] });
      }
    };

    loadFavoritesForCurrentUser();
    
    const handleStorage = (e) => {
      const isFavoritesEvent = Boolean(e && e.key && e.key.startsWith('favorites_'));
      if (!e || e.key === 'user' || e.key === 'isLoggedIn' || isFavoritesEvent) {
        loadFavoritesForCurrentUser();
      }
    };
    
    const handleUserChanged = () => {
      loadFavoritesForCurrentUser();
    };
    
    // listen to storage events (other tabs) and custom event 'userChanged' (same-tab)
    window.addEventListener('storage', handleStorage);
    window.addEventListener('userChanged', handleUserChanged);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('userChanged', handleUserChanged);
    };
  }, [getFavoritesKeyForUser]);
  
  // 只在 favorites 實際改變時（即用戶操作 TOGGLE_FAVORITE），保存到 localStorage
  useEffect(() => {
    const normalized = normalizeFavorites(state.favorites);
    
    // If ref is null, this is the initial load from localStorage
    if (prevFavoritesRef.current === null) {
      prevFavoritesRef.current = normalized;
      return; // Don't save on initial load
    }
    
    // Check if favorites actually changed
    const prevNormalized = normalizeFavorites(prevFavoritesRef.current);
    const favoritesChanged = JSON.stringify(normalized) !== JSON.stringify(prevNormalized);
    
    if (favoritesChanged) {
      prevFavoritesRef.current = normalized;
      
      try {
        const userData = localStorage.getItem('user');
        const userObj = userData ? JSON.parse(userData) : null;
        const favKey = getFavoritesKeyForUser(userObj);
        localStorage.setItem(favKey, JSON.stringify(normalized));
      } catch (err) {
        console.error('[CarContext] Error saving favorites:', err);
        // fallback to guest key
        localStorage.setItem('favorites_guest', JSON.stringify(normalized));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.favorites]);

  // 獨立同步 newCars/usedCars 到 localStorage，確保刪除後立即更新
  useEffect(() => {
    // 初始掛載時跳過（避免覆蓋後端 API 尚未載入時的空陣列）
    if (prevFavoritesRef.current === null) return;
    localStorage.setItem('postedNewCars', JSON.stringify(state.newCars || []));
    localStorage.setItem('postedUsedCars', JSON.stringify(state.usedCars || []));
  }, [state.newCars, state.usedCars]);
  
  // Memoized 的 action 方法
  const actions = useMemo(() => ({
    setNewCars: (cars) => dispatch({ type: ACTIONS.SET_NEW_CARS, payload: cars }),
    setUsedCars: (cars) => dispatch({ type: ACTIONS.SET_USED_CARS, payload: cars }),
    setListings: (listings) => dispatch({ type: ACTIONS.SET_LISTINGS, payload: listings }),
    addNewCar: (car) => dispatch({ type: ACTIONS.ADD_NEW_CAR, payload: car, generatedId: Date.now() }),
    addUsedCar: (car) => dispatch({ type: ACTIONS.ADD_USED_CAR, payload: car, generatedId: Date.now() }),
    updateCar: (car) => dispatch({ type: ACTIONS.UPDATE_CAR, payload: car }),
    deleteCar: (carId) => dispatch({ type: ACTIONS.DELETE_CAR, payload: carId }),
    toggleFavorite: (carId) => dispatch({ type: ACTIONS.TOGGLE_FAVORITE, payload: carId }),
    setFavorites: (favorites) => dispatch({ type: ACTIONS.SET_FAVORITES, payload: favorites }),
    selectCar: (car) => dispatch({ type: ACTIONS.SELECT_CAR, payload: car }),
    deselectCar: () => dispatch({ type: ACTIONS.DESELECT_CAR }),
    setActiveContact: (carId) => dispatch({ type: ACTIONS.SET_ACTIVE_CONTACT, payload: carId }),
    clearActiveContact: () => dispatch({ type: ACTIONS.CLEAR_ACTIVE_CONTACT }),
    setFilters: (filters) => dispatch({ type: ACTIONS.SET_FILTERS, payload: filters }),
    resetFilters: () => dispatch({ type: ACTIONS.RESET_FILTERS }),
    setSort: (sortBy) => dispatch({ type: ACTIONS.SET_SORT, payload: sortBy }),
    resetAll: () => dispatch({ type: ACTIONS.RESET_ALL }),
  }), []);
  
  const value = {
    state,
    ...actions,
  };
  
  return (
    <CarContext.Provider value={value}>
      {children}
    </CarContext.Provider>
  );
}

// Custom Hook - 使用 CarContext
export function useCar() {
  const context = React.useContext(CarContext);
  if (!context) {
    throw new Error('useCar 必須在 CarProvider 內部使用');
  }
  return context;
}
