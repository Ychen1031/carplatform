import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import logger from '../utils/logger';
import { useCar } from '../contexts/CarContext';
import '../styles/PostPage.css';

// Color key to display label mapping
const COLOR_KEYS = [
  { key: 'black', value: '黑色' },
  { key: 'white', value: '白色' },
  { key: 'silver', value: '銀色' },
  { key: 'red', value: '紅色' },
  { key: 'blue', value: '藍色' },
  { key: 'gold', value: '金色' },
  { key: 'brown', value: '棕色' },
  { key: 'gray', value: '灰色' },
];

// Feature key to display label mapping
const FEATURE_KEYS = [
  { key: 'panoramicRoof', value: '全景天窗' },
  { key: 'leatherSeats', value: '皮革座椅' },
  { key: 'reverseCamera', value: '倒車影像' },
  { key: 'cruiseControl', value: '定速巡航' },
  { key: 'autoParking', value: '自動停車' },
  { key: 'intelligentDrive', value: '智能駕駛' },
  { key: 'airbags', value: '安全氣囊' },
  { key: 'rearHeatedSeats', value: '後排座椅加熱' },
];

// Type key arrays for select options
const CAR_TYPE_KEYS = [
  { key: 'sedan', value: '轎車' },
  { key: 'suv', value: 'SUV' },
  { key: 'compact', value: '小型車' },
  { key: 'hatchback', value: '掀背車' },
  { key: 'sports', value: '跑車' },
];

const FUEL_TYPE_KEYS = [
  { key: 'gasoline', value: '汽油' },
  { key: 'diesel', value: '柴油' },
  { key: 'hybrid', value: '油電' },
  { key: 'ev', value: '純電' },
  { key: 'gasoline_hybrid', value: '汽油/油電' },
];

const TRANSMISSION_KEYS = [
  { key: 'mt', value: '手排' },
  { key: 'at', value: '自排' },
  { key: 'cvt', value: 'CVT' },
];

const CONDITION_KEYS = [
  { key: 'excellent', value: '優' },
  { key: 'good', value: '良' },
  { key: 'fair', value: '尚可' },
  { key: 'repairing', value: '維修中' },
];

const carBrands = ['Toyota', 'Honda', 'Mazda', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Porsche', 'Volkswagen', 'Ford'];
const cities = ['台北', '新北', '桃園', '新竹', '苗栗', '台中', '彰化', '南投', '嘉義', '台南', '高雄', '屏東', '宜蘭', '花蓮', '台東'];

function PostPage() {
  const { t } = useTranslation();
  const { addNewCar, addUsedCar } = useCar();
  const [formData, setFormData] = useState({
    carType: 'used',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    fuel: '',
    transmission: '',
    engine: '',
    type: '',
    city: '',
    condition: '',
    colors: [],
    features: [],
    description: '',
    sellerName: '',
    sellerPhone: '',
    sellerEmail: '',
    carImages: [],
  });

  const [submitStatus, setSubmitStatus] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageMode, setImageMode] = useState('upload'); // 'upload' | 'url'
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrlPreview, setImageUrlPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e, field) => {
    const value = e.target.value;
    setFormData((prev) => {
      const list = prev[field];
      if (list.includes(value)) {
        return {
          ...prev,
          [field]: list.filter((item) => item !== value),
        };
      } else {
        return {
          ...prev,
          [field]: [...list, value],
        };
      }
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        alert(`${file.name} ${t('post.fileSizeError')}`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} ${t('post.fileTypeError')}`);
        return false;
      }
      return true;
    });

    if (imagePreviews.length + validFiles.length > maxFiles) {
      alert(t('post.maxImagesError', { count: maxFiles }));
      return;
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });

    setFormData((prev) => ({
      ...prev,
      carImages: [...prev.carImages, ...validFiles],
    }));
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      carImages: prev.carImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errors = [];
    
    if (!formData.brand) errors.push(t('post.validBrand'));
    if (!formData.model) errors.push(t('post.validModel'));
    if (!formData.type) errors.push(t('post.validType'));
    if (!formData.price) errors.push(t('post.validPrice'));
    if (!formData.fuel) errors.push(t('post.validFuel'));
    if (!formData.transmission) errors.push(t('post.validTransmission'));
    if (!formData.city) errors.push(t('post.validCity'));
    
    if (formData.carType === 'used' && !formData.condition) {
      errors.push(t('post.validCondition'));
    }
    
    if (!formData.sellerName) errors.push(t('post.validSellerName'));
    if (!formData.sellerPhone) errors.push(t('post.validSellerPhone'));
    
    if (imageMode === 'upload' && (formData.carImages.length === 0 || imagePreviews.length === 0)) {
      errors.push(t('post.validImage'));
    }
    if (imageMode === 'url' && !imageUrl.trim()) {
      errors.push(t('post.validImageUrl'));
    }

    if (errors.length > 0) {
      logger.warn('刊登表單驗證失敗', { errors });
      alert(errors.join('\n'));
      return;
    }

    const carData = {
      carType: formData.carType,
      brand: formData.brand,
      model: formData.model,
      year: Number(formData.year),
      price: Number(formData.price),
      mileage: formData.mileage ? Number(formData.mileage) : 0,
      fuel: formData.fuel,
      transmission: formData.transmission,
      engine: formData.engine,
      type: formData.type,
      city: formData.city,
      condition: formData.condition,
      colors: formData.colors,
      features: formData.features,
      description: formData.description,
      seller: formData.sellerName,
      phone: formData.sellerPhone,
      email: formData.sellerEmail || '',
      image: imageMode === 'url' && imageUrl.trim()
        ? imageUrl.trim()
        : 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80',
      title: `${formData.brand} ${formData.model} ${formData.year}`,
      imageUrlPreview: imageMode === 'url' ? imageUrl.trim() : (imagePreviews[0] || null),
    };

    const userData = localStorage.getItem('user');
    const userId = userData ? JSON.parse(userData).id : null;

    setIsLoading(true);

    fetch('http://localhost:3001/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...carData,
        userId
      })
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          alert(t('post.postFail') + ': ' + (data.message || ''));
          setIsLoading(false);
          return;
        }

        if (formData.carType === 'new') {
          addNewCar({ ...data.car, id: 1000000 + data.car.id, _dbId: data.car.id });
        } else {
          addUsedCar({ ...data.car, id: 1000000 + data.car.id, _dbId: data.car.id });
        }

        logger.formSubmit('車輛刊登表單', {
          carType: formData.carType,
          brand: formData.brand,
          model: formData.model,
          price: formData.price,
          year: formData.year,
          sellerName: formData.sellerName,
          city: formData.city,
          features: formData.features.length,
        });

        setSubmitStatus('success');
        logger.info('車輛刊登成功');
        
        setTimeout(() => {
          setSubmitStatus(null);
          setFormData({
            carType: 'used',
            brand: '',
            model: '',
            year: new Date().getFullYear(),
            price: '',
            mileage: '',
            fuel: '',
            transmission: '',
            engine: '',
            type: '',
            city: '',
            condition: '',
            colors: [],
            features: [],
            description: '',
            sellerName: '',
            sellerPhone: '',
            sellerEmail: '',
            carImages: [],
          });
          setImagePreviews([]);
          setImageUrl('');
          setImageUrlPreview(null);
          setImageMode('upload');
          setIsLoading(false);
        }, 2000);
      })
      .catch(error => {
        console.error('刊登失敗:', error);
        alert(t('post.postFail'));
        setIsLoading(false);
      });
  };

  return (
    <div className="post-page">
      {/* 標題區 */}
      <section className="post-hero">
        <div className="hero-content">
          <h1>{t('post.title')}</h1>
          <p className="hero-subtitle">{t('post.subtitle')}</p>
        </div>
      </section>

      {/* 主要表單區 */}
      <section className="post-main">
        <div className="container">
          {submitStatus === 'success' && (
            <div className="success-modal-overlay">
              <div className="success-modal">
                <div className="success-icon">
                  <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="45" fill="#4CAF50" />
                    <path d="M30 50 L45 65 L70 35" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>{t('post.completed')}</h3>
                <p>{t('post.completedDesc')}</p>
                <div className="success-actions">
                  <button type="button" className="btn-modal-close" onClick={() => setSubmitStatus(null)}>
                    {t('post.close')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="post-form">
            {/* 車輛基本信息 */}
            <div className="form-section">
              <h2>{t('post.basicInfo')}</h2>
              
              <div className="form-group">
                <label>{t('post.carType')}</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="carType"
                      value="new"
                      checked={formData.carType === 'new'}
                      onChange={handleChange}
                    />
                    {t('post.newCar')}
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="carType"
                      value="used"
                      checked={formData.carType === 'used'}
                      onChange={handleChange}
                    />
                    {t('post.usedCar')}
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="brand">{t('post.brand')} *</label>
                  <select
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t('post.selectBrand')}</option>
                    {carBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                    <option value="其他">{t('common.other')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="model">{t('post.model')} *</label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder={t('post.modelPlaceholder')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="year">{t('post.year')}</label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="2000"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type">{t('post.typeLabel')} *</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t('common.pleaseSelect')}</option>
                    {CAR_TYPE_KEYS.map(({ key, value }) => (
                      <option key={key} value={value}>
                        {t(`types.${key}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="price">{t('post.price')} *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="999000"
                    required
                  />
                </div>

                {formData.carType === 'used' && (
                  <div className="form-group">
                    <label htmlFor="mileage">{t('post.mileage')}</label>
                    <input
                      type="number"
                      id="mileage"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleChange}
                      placeholder="50000"
                    />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fuel">{t('post.fuel')} *</label>
                  <select
                    id="fuel"
                    name="fuel"
                    value={formData.fuel}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t('common.pleaseSelect')}</option>
                    {FUEL_TYPE_KEYS.map(({ key, value }) => (
                      <option key={key} value={value}>
                        {t(`fuels.${key}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="transmission">{t('post.transmission')} *</label>
                  <select
                    id="transmission"
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t('common.pleaseSelect')}</option>
                    {TRANSMISSION_KEYS.map(({ key, value }) => (
                      <option key={key} value={value}>
                        {t(`transmissions.${key}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="engine">{t('post.engine')}</label>
                  <input
                    type="text"
                    id="engine"
                    name="engine"
                    value={formData.engine}
                    onChange={handleChange}
                    placeholder="1.8L"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">{t('post.city')} *</label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t('post.selectCity')}</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.carType === 'used' && (
                  <div className="form-group">
                    <label htmlFor="condition">{t('post.condition')} *</label>
                    <select
                      id="condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      required
                    >
                      <option value="">{t('common.pleaseSelect')}</option>
                      {CONDITION_KEYS.map(({ key, value }) => (
                        <option key={key} value={value}>
                          {t(`conditions.${key}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* 車輛特徵 */}
            <div className="form-section">
              <h2>{t('post.vehicleFeatures')}</h2>

              <div className="form-group">
                <label>{t('post.colors')}</label>
                <div className="checkbox-grid">
                  {COLOR_KEYS.map(({ key, value }) => (
                    <label key={key} className="checkbox-label">
                      <input
                        type="checkbox"
                        value={value}
                        checked={formData.colors.includes(value)}
                        onChange={(e) => handleCheckboxChange(e, 'colors')}
                      />
                      {t(`colors.${key}`)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>{t('post.features')}</label>
                <div className="checkbox-grid">
                  {FEATURE_KEYS.map(({ key, value }) => (
                    <label key={key} className="checkbox-label">
                      <input
                        type="checkbox"
                        value={value}
                        checked={formData.features.includes(value)}
                        onChange={(e) => handleCheckboxChange(e, 'features')}
                      />
                      {t(`carFeatures.${key}`)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">{t('post.description')}</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t('post.descriptionPlaceholder')}
                  rows="6"
                ></textarea>
              </div>
            </div>

            {/* 車輛圖片 */}
            <div className="form-section post-image-section">
              <h2>{t('post.vehicleImages')} *</h2>
              <p className="form-hint">{t('post.imageHint')}</p>

              {/* 切換分頁 */}
              <div className="image-mode-tabs">
                <button
                  type="button"
                  className={`image-tab ${imageMode === 'upload' ? 'active' : ''}`}
                  onClick={() => setImageMode('upload')}
                >
                  {t('post.uploadTab')}
                </button>
                <button
                  type="button"
                  className={`image-tab ${imageMode === 'url' ? 'active' : ''}`}
                  onClick={() => setImageMode('url')}
                >
                  {t('post.urlTab')}
                </button>
              </div>

              {/* 上傳模式 */}
              {imageMode === 'upload' && (
                <>
                  <div className="form-group">
                    <label htmlFor="carImages">{t('post.imageSelectLabel')}</label>
                    <input
                      type="file"
                      id="carImages"
                      name="carImages"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={imagePreviews.length >= 5}
                    />
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="image-preview-container">
                      <h3>{t('post.imagePreviewTitle')} ({imagePreviews.length}/5)</h3>
                      <div className="image-preview-grid">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="image-preview-item">
                            <img src={preview} alt={`Preview ${index + 1}`} />
                            <button
                              type="button"
                              className="btn-remove-image"
                              onClick={() => handleRemoveImage(index)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 網址模式 */}
              {imageMode === 'url' && (
                <>
                  <div className="form-group">
                    <label htmlFor="imageUrl">{t('post.url')}</label>
                    <input
                      type="url"
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImageUrlPreview(e.target.value || null);
                      }}
                      placeholder="https://example.com/car.jpg"
                    />
                  </div>

                  {imageUrlPreview ? (
                    <div className="url-image-preview">
                      <div className="image-preview-box">
                        <img
                          src={imageUrlPreview}
                          alt={t('post.imagePreviewAlt')}
                          className="image-preview-img"
                          onError={() => setImageUrlPreview(null)}
                        />
                        <button
                          type="button"
                          className="btn-remove-img"
                          onClick={() => { setImageUrl(''); setImageUrlPreview(null); }}
                          title={t('post.clearImage')}
                        >
                          ✕
                        </button>
                      </div>
                      <p className="image-preview-hint">{t('post.imagePreviewAlt')}</p>
                    </div>
                  ) : imageUrl ? (
                    <div className="image-placeholder">
                      <span className="image-placeholder-icon">⚠️</span>
                      <p>{t('post.imageLoadError')}</p>
                    </div>
                  ) : (
                    <div className="image-placeholder">
                      <span className="image-placeholder-icon">🖼️</span>
                      <p>{t('post.imageUrlPrompt')}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 賣家信息 */}
            <div className="form-section">
              <h2>{t('post.sellerInfo')}</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sellerName">{t('post.sellerName')} *</label>
                  <input
                    type="text"
                    id="sellerName"
                    name="sellerName"
                    value={formData.sellerName}
                    onChange={handleChange}
                    placeholder={t('post.sellerNamePlaceholder')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sellerPhone">{t('post.sellerPhone')} *</label>
                  <input
                    type="tel"
                    id="sellerPhone"
                    name="sellerPhone"
                    value={formData.sellerPhone}
                    onChange={handleChange}
                    placeholder="0912-345-678"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="sellerEmail">{t('post.sellerEmail')}</label>
                <input
                  type="email"
                  id="sellerEmail"
                  name="sellerEmail"
                  value={formData.sellerEmail}
                  onChange={handleChange}
                  placeholder={t('post.sellerEmailPlaceholder')}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading ? t('post.posting') : t('post.postNow')}
              </button>
              <p className="form-note">
                {t('post.postTip')}
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* 優勢說明 */}
      <section className="post-benefits">
        <div className="container">
          <h2>{t('post.whyTitle')}</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">✓</div>
              <h3>{t('post.benefit1Title')}</h3>
              <p>{t('post.benefit1Desc')}</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">✓</div>
              <h3>{t('post.benefit2Title')}</h3>
              <p>{t('post.benefit2Desc')}</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">✓</div>
              <h3>{t('post.benefit3Title')}</h3>
              <p>{t('post.benefit3Desc')}</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">✓</div>
              <h3>{t('post.benefit4Title')}</h3>
              <p>{t('post.benefit4Desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PostPage;
