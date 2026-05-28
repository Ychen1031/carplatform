import { useMemo } from 'react';
import FiltersPanel from './FiltersPanel';
import HeroSection from './HeroSection';
import ListingsPanel from './ListingsPanel';
import { useCar } from '../contexts/CarContext';
import { useFavoritesPersist } from '../hooks/useFavoritesPersist';
import { INITIAL_LISTINGS } from '../constants/listings';
import { NEW_CAR_BRANDS } from '../constants/brands';

const ALL_OPTION = '';

function HomePage() {
  const { state, setFilters, setSort, setActiveContact } = useCar();
  useFavoritesPersist('carFavorites'); // 自動同步收藏夾
  
  // 為首頁初始列表添加前綴以避免 ID 衝突 (400000+)
  const staticInitialListings = useMemo(
    () => INITIAL_LISTINGS.map(car => ({ ...car, id: 400000 + car.id })),
    []
  );
  
  // 組合所有可預約車源：首頁初始列表 + 用戶刊登的新車和中古車
  const allListings = useMemo(
    () => [...staticInitialListings, ...state.newCars, ...state.usedCars],
    [staticInitialListings, state.newCars, state.usedCars]
  );

  // 從 Context 獲取其他狀態
  const { filters, sortBy, activeContactId } = state;

  const allBrands = useMemo(
    () => [...new Set(allListings.map((item) => item.brand))],
    [allListings]
  );

  const allCities = useMemo(
    () => [...new Set(allListings.map((item) => item.city))],
    [allListings]
  );

  // 篩選邏輯
  const filteredListings = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();

    return allListings
      .filter((car) => {
        const keywordMatch =
          keyword.length === 0 ||
          car.title.toLowerCase().includes(keyword) ||
          car.brand.toLowerCase().includes(keyword) ||
          car.city.toLowerCase().includes(keyword);

        const priceMatch =
          filters.maxPrice === '' || car.price <= Number(filters.maxPrice);
        const yearMatch =
          filters.minYear === '' || car.year >= Number(filters.minYear);
        const brandMatch = filters.brand === '' || car.brand === filters.brand;
        const cityMatch = filters.city === '' || car.city === filters.city;

        return keywordMatch && priceMatch && yearMatch && brandMatch && cityMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          return a.price - b.price;
        }

        if (sortBy === 'year-desc') {
          return b.year - a.year;
        }

        if (sortBy === 'mileage-asc') {
          return a.mileage - b.mileage;
        }

        return 0;
      });
  }, [filters, allListings, sortBy]);

  // 處理篩選變化
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({ [name]: value });
  };

  // 處理排序變化
  const handleSortChange = (event) => {
    setSort(event.target.value);
  };

  // 處理聯繫方式展開/隱藏
  const handleToggleContact = (id) => {
    setActiveContact(activeContactId === id ? null : id);
  };

  return (
    <>
      <HeroSection
        listingCount={allListings.length}
        brandCount={NEW_CAR_BRANDS.length}
        cityCount={allCities.length - 1}
      />

      <main className="main-layout">
        <FiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          allBrands={allBrands}
          allCities={allCities}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />

        <ListingsPanel
          filteredListings={filteredListings}
          activeContactId={activeContactId}
          onToggleContact={handleToggleContact}
        />
      </main>
    </>
  );
}

export default HomePage;
