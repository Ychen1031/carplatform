import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCar } from '../contexts/CarContext';
import { useToast } from '../contexts/ToastContext';
import '../styles/MyListingsPage.css';

function MyListingsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { deleteCar } = useCar();
  const { showToast } = useToast();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // 取得使用者已發佈的車輛
  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          navigate('/login');
          return;
        }

        const user = JSON.parse(userData);
        const response = await fetch(`http://localhost:3001/api/users/${user.id}/cars`);
        const data = await response.json();

        if (data.success) {
          // 為後端數據添加 1000000 前綴
          const carsWithPrefix = (data.cars || []).map(car => ({
            ...car,
            id: 1000000 + car.id,
            _dbId: car.id  // 保存原始數據庫 ID
          }));
          setListings(carsWithPrefix);
        } else {
          if (showToast && typeof showToast === 'function') {
            showToast(t('myListings.empty'), 'error');
          }
        }
      } catch (error) {
        console.error('載入車源列表失敗:', error);
        if (showToast && typeof showToast === 'function') {
          showToast(t('common.loading'), 'error');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserListings();
  }, [navigate, showToast]);

  // 排序邏輯
  const getSortedListings = () => {
    const sorted = [...listings];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.posted_at) - new Date(b.posted_at));
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      default:
        break;
    }
    return sorted;
  };

  // 從帶前綴的 carId 提取實際的數據庫 ID
  // 只有後端數據 (1000000+) 才能刪除
  const getDbCarId = (prefixedId) => {
    const id = parseInt(prefixedId);
    if (id >= 1000000) {
      return id - 1000000;
    }
    // 靜態或臨時 ID - 無法刪除
    return null;
  };

  // 刪除車輛
  const handleDelete = async (carId) => {
    try {
      const dbCarId = getDbCarId(carId);
      const response = await fetch(`http://localhost:3001/api/cars/${dbCarId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setListings(prev => prev.filter(car => car.id !== carId));
        deleteCar(carId);
        setDeleteConfirm(null);
        if (showToast && typeof showToast === 'function') {
          showToast(t('myListings.confirmDelete'), 'success');
        }
      } else {
        if (showToast && typeof showToast === 'function') {
          showToast(data.message || t('myListings.delete'), 'error');
        }
      }
    } catch (error) {
      console.error('刪除失敗:', error);
      if (showToast && typeof showToast === 'function') {
        showToast(t('myListings.delete'), 'error');
      }
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  };

  // 格式化價格
  const formatPrice = (price) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const sortedListings = getSortedListings();

  if (isLoading) {
    return (
      <div className="my-listings-page">
        <div className="loading">{t('messages.loading')}</div>
      </div>
    );
  }

  return (
    <div className="my-listings-page">
      <div className="my-listings-container">
        <div className="listings-header">
          <h1>{t('myListings.title')}</h1>
          <button className="btn-post-new" onClick={() => navigate('/post')}>
            {t('myListings.postNew')}
          </button>
        </div>

        {listings.length === 0 ? (
          <div className="empty-state">
            <p>{t('myListings.empty')}</p>
            <button className="btn-post-first" onClick={() => navigate('/post')}>
              {t('myListings.postFirst')}
            </button>
          </div>
        ) : (
          <>
            <div className="listings-toolbar">
              <div className="sort-control">
                <label>{t('myListings.sortBy')}</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">{t('myListings.newest')}</option>
                  <option value="oldest">{t('myListings.oldest')}</option>
                  <option value="price-high">{t('myListings.priceHigh')}</option>
                  <option value="price-low">{t('myListings.priceLow')}</option>
                </select>
              </div>
              <div className="listings-count">
                {t('myListings.count', { count: listings.length })}
              </div>
            </div>

            <div className="listings-grid">
              {sortedListings.map(car => (
                <div key={car.id} className="listing-card">
                  <div className="listing-image">
                    {car.image ? (
                      <img src={car.image} alt={car.title} />
                    ) : (
                      <div className="image-placeholder">無圖片</div>
                    )}
                    <div className={`car-type-badge ${car.carType === 'new' ? 'new' : 'used'}`}>
                      {car.carType === 'new' ? t('myListings.newCar') : t('myListings.usedCar')}
                    </div>
                  </div>

                  <div className="listing-content">
                    <h3 className="listing-title">{car.title}</h3>

                    <div className="listing-info">
                      <div className="info-row">
                        <span className="label">{t('myListings.brand')}</span>
                        <span className="value">{car.brand} {car.model}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">{t('myListings.year')}</span>
                        <span className="value">{car.year}年</span>
                      </div>
                      <div className="info-row">
                        <span className="label">{t('myListings.city')}</span>
                        <span className="value">{car.city}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">{t('myListings.mileage')}</span>
                        <span className="value">{car.mileage?.toLocaleString() || '0'}公里</span>
                      </div>
                    </div>

                    <div className="listing-price">
                      {formatPrice(car.price)}
                    </div>

                    <div className="listing-meta">
                      <span className="posted-date">
                        {t('myListings.postedAt', { date: formatDate(car.posted_at) })}
                      </span>
                    </div>

                    <div className="listing-actions">
                      <button
                        className="btn-edit"
                        onClick={() => navigate(`/edit-car/${car.id}`)}
                      >
                        {t('myListings.edit')}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => setDeleteConfirm(car.id)}
                      >
                        {t('myListings.delete')}
                      </button>
                    </div>

                    {deleteConfirm === car.id && (
                      <div className="delete-confirm">
                        <p>{t('myListings.deleteConfirm')}</p>
                        <div className="confirm-actions">
                          <button
                            className="btn-cancel"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            {t('myListings.cancel')}
                          </button>
                          <button
                            className="btn-confirm-delete"
                            onClick={() => handleDelete(car.id)}
                          >
                            {t('myListings.confirmDelete')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyListingsPage;
