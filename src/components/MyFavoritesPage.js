import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TYPE_KEY_MAP, FUEL_KEY_MAP, TRANSMISSION_KEY_MAP, CITY_KEY_MAP } from '../utils/localeMaps';
import '../styles/MyFavoritesPage.css';
import { NEW_CARS_DATA } from '../constants/newCarsData';
import { USED_CARS_DATA } from '../constants/usedCarsData';
import { useCar } from '../contexts/CarContext';

function MyFavoritesPage() {
  const { t } = useTranslation();
  const { state, toggleFavorite } = useCar();
  const favoriteIds = useMemo(() => (state.favorites || []).map((id) => String(id)), [state.favorites]);
  // 靜態新車需加 500000 前綴（與 NewCarsPage 一致）
  const staticNewCars = useMemo(() => NEW_CARS_DATA.map(car => ({ ...car, id: 500000 + car.id })), []);
  // 靜態中古車需加 600000 前綴（與 UsedCarsPage 一致）
  const staticUsedCars = useMemo(() => USED_CARS_DATA.map(car => ({ ...car, id: 600000 + car.id })), []);
  const allNewCars = useMemo(() => [...staticNewCars, ...(state.newCars || [])], [staticNewCars, state.newCars]);
  const allUsedCars = useMemo(() => [...staticUsedCars, ...(state.usedCars || [])], [staticUsedCars, state.usedCars]);

  const [selectedCar, setSelectedCar] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const favoriteNewCars = useMemo(() => {
    return allNewCars.filter((car) => favoriteIds.includes(String(car.id)));
  }, [allNewCars, favoriteIds]);

  const favoriteUsedCars = useMemo(() => {
    return allUsedCars.filter((car) => favoriteIds.includes(String(car.id)));
  }, [allUsedCars, favoriteIds]);

  const allFavorites = useMemo(() => {
    return [
      ...favoriteNewCars.map((car) => ({ ...car, type: 'new' })),
      ...favoriteUsedCars.map((car) => ({ ...car, type: 'used' })),
    ];
  }, [favoriteNewCars, favoriteUsedCars]);

  const handleRemoveFavorite = (carId) => {
    toggleFavorite(carId);
  };

  const handleContactClick = () => {
    setActionModal('contact');
  };

  const handleTestDriveClick = () => {
    setActionModal('test-drive');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // 根據 actionModal 類型決定 subject
    const subject = actionModal === 'contact' ? 'contact_dealer' : 'test_drive';
    const message = actionModal === 'contact' 
      ? `聯絡經銷商：${selectedCar?.title || '車源'}`
      : `預約試駕：${selectedCar?.title || '車源'}`;

    const payload = {
      name: contactForm.name,
      email: contactForm.email,
      phone: contactForm.phone,
      subject: subject,
      message: message,
    };

    try {
      const response = await fetch('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        setContactForm({ name: '', phone: '', email: '' });
        setActionModal('success');
        setTimeout(() => {
          setActionModal(null);
        }, 2000);
      } else {
        alert('提交失敗，請稍後再試');
      }
    } catch (error) {
      console.error('提交表單錯誤:', error);
      alert('提交失敗，請檢查網路連線');
    }
  };

    const localize = (ns, raw) => {
      if (!raw || raw === '') return t('common.all');
      const keyMap = 
        ns === 'types' ? TYPE_KEY_MAP : 
        ns === 'fuels' ? FUEL_KEY_MAP : 
        ns === 'transmissions' ? TRANSMISSION_KEY_MAP : 
        ns === 'cities' ? CITY_KEY_MAP : 
        undefined;
      const key = keyMap ? (keyMap[raw] || raw) : raw;
      return t(`${ns}.${key}`, { defaultValue: raw });
    };

  return (
    <div className="my-favorites-page">
      <div className="favorites-container">
        <h1 className="page-title">♡ {t('favorites.title')}</h1>

        {allFavorites.length === 0 ? (
          <div className="empty-favorites">
            <p>{t('favorites.empty')}</p>
            <p className="empty-tip">{t('favorites.emptyTip')}</p>
          </div>
        ) : (
          <>
            {favoriteNewCars.length > 0 && (
              <div className="favorites-section">
                <h2 className="section-title">{t('favorites.newCars', { count: favoriteNewCars.length })}</h2>
                <div className="favorites-grid">
                  {favoriteNewCars.map((car) => (
                    <div 
                      key={car.id} 
                      className="favorite-card"
                      onClick={() => setSelectedCar({ ...car, carType: 'new' })}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-image">
                        <img src={car.image} alt={car.title} />
                      </div>
                      <div className="card-info">
                        <h3>{car.title}</h3>
                        <p className="car-specs">
                          {car.year} • {localize('types', car.type)} • {localize('transmissions', car.transmission)}
                        </p>
                        <div className="card-details">
                          <div className="detail-item">
                            <span>引擎</span>
                            <span>{car.engine}</span>
                          </div>
                          <div className="detail-item">
                            <span>燃料</span>
                            <span>{localize('fuels', car.fuel)}</span>
                          </div>
                        </div>
                        <p className="price">NT$ {car.price.toLocaleString()}</p>
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFavorite(car.id);
                          }}
                        >
                          ♥ {t('favorites.remove')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {favoriteUsedCars.length > 0 && (
              <div className="favorites-section">
                <h2 className="section-title">{t('favorites.usedCars', { count: favoriteUsedCars.length })}</h2>
                <div className="favorites-grid">
                  {favoriteUsedCars.map((car) => (
                    <div 
                      key={car.id} 
                      className="favorite-card used-car"
                      onClick={() => setSelectedCar({ ...car, carType: 'used' })}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-image">
                        <img src={car.image} alt={car.title} />
                      </div>
                      <div className="card-info">
                        <h3>{car.title}</h3>
                        <p className="car-specs">
                          {car.year} • {localize('types', car.type)} • {localize('transmissions', car.transmission)}
                        </p>
                        <div className="card-details">
                          <div className="detail-item">
                            <span>里程</span>
                            <span>{car.mileage.toLocaleString()} km</span>
                          </div>
                          <div className="detail-item">
                            <span>城市</span>
                            <span>{localize('cities', car.city)}</span>
                          </div>
                        </div>
                        <p className="price">NT$ {car.price.toLocaleString()}</p>
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFavorite(car.id);
                          }}
                        >
                          ♥ {t('favorites.remove')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 詳細資訊面板 */}
        {selectedCar && (
          <div className="car-detail-panel" onClick={() => setSelectedCar(null)}>
            <div className="detail-content" onClick={(e) => e.stopPropagation()}>
              <button className="btn-close" onClick={() => setSelectedCar(null)}>✕</button>
              <div className="detail-grid">
                <div className="detail-image">
                  <img src={selectedCar.image} alt={selectedCar.title} />
                </div>
                <div className="detail-info">
                  <h2>{selectedCar.title}</h2>
                  <p className="detail-tagline">
                    {selectedCar.carType === 'new' 
                      ? `${selectedCar.year}年新款 • 官方認證`
                      : `${selectedCar.year}年款 • 認證好車`
                    }
                  </p>

                  <div className="detail-section">
                    <h4>{t('favorites.basicInfo')}</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">{t('favorites.brand')}</span>
                        <span className="value">{selectedCar.brand}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">{t('favorites.model')}</span>
                        <span className="value">{localize('types', selectedCar.type)}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">{t('favorites.fuel')}</span>
                        <span className="value">{localize('fuels', selectedCar.fuel)}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">{t('favorites.transmission')}</span>
                        <span className="value">{localize('transmissions', selectedCar.transmission)}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">{t('favorites.engine')}</span>
                        <span className="value">{selectedCar.engine}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">{t('favorites.listPrice')}</span>
                        <span className="price">NT$ {selectedCar.price.toLocaleString()}</span>
                      </div>
                      {selectedCar.mileage && (
                        <div className="info-item">
                          <span className="label">{t('favorites.mileage')}</span>
                          <span className="value">{selectedCar.mileage.toLocaleString()} km</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>{t('favorites.colors')}</h4>
                    <div className="colors-list">
                      {selectedCar.colors.map((color) => (
                        <span key={color} className="color-tag">{color}</span>
                      ))}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>{t('favorites.features')}</h4>
                    <ul className="features-list">
                      {selectedCar.features.map((feature, idx) => (
                        <li key={idx}>✓ {feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="action-buttons">
                    <button className="btn-contact" onClick={handleContactClick}>📞 {t('favorites.contactDealer')}</button>
                    <button className="btn-test-drive" onClick={handleTestDriveClick}>🚗 {t('favorites.testDrive')}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 聯絡與試駕彈窗 */}
        {actionModal && (
          <div className="modal-overlay" onClick={() => setActionModal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {actionModal === 'contact' && (
                <>
                  <button className="modal-close" onClick={() => setActionModal(null)}>✕</button>
                  <h3>{t('favorites.contactTitle')}</h3>
                  <p>{t('favorites.contactDescription')}</p>
                  <form onSubmit={handleFormSubmit}>
                    <input
                      type="text"
                      name="name"
                      placeholder={t('contact.formPlaceholderName')}
                      value={contactForm.name}
                      onChange={handleFormChange}
                      required
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder={t('contact.formPlaceholderPhone')}
                      value={contactForm.phone}
                      onChange={handleFormChange}
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder={t('contact.formPlaceholderEmail')}
                      value={contactForm.email}
                      onChange={handleFormChange}
                      required
                    />
                    <button type="submit" className="modal-btn">提交</button>
                  </form>
                </>
              )}

              {actionModal === 'test-drive' && (
                <>
                  <button className="modal-close" onClick={() => setActionModal(null)}>✕</button>
                  <h3>預約試駕</h3>
                  <p>想要試試這輛車？請填寫表單預約試駕時間。</p>
                  <form onSubmit={handleFormSubmit}>
                    <input
                      type="text"
                      name="name"
                      placeholder="您的姓名"
                      value={contactForm.name}
                      onChange={handleFormChange}
                      required
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="電話號碼"
                      value={contactForm.phone}
                      onChange={handleFormChange}
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="電郵地址"
                      value={contactForm.email}
                      onChange={handleFormChange}
                      required
                    />
                    <button type="submit" className="modal-btn">預約</button>
                  </form>
                </>
              )}

              {actionModal === 'success' && (
                <div className="success-message">
                  <div className="success-icon">✓</div>
                  <h3>提交成功！</h3>
                  <p>感謝您的提交，我們將在 24 小內與您聯繫。</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyFavoritesPage;
