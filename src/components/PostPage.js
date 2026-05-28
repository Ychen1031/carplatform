import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import logger from '../utils/logger';
import { useCar } from '../contexts/CarContext';
import '../styles/PostPage.css';

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

    // 驗證文件數量和大小
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        alert(`檔案 ${file.name} 超過 5MB 限制`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} 不是有效的圖片格式`);
        return false;
      }
      return true;
    });

    if (imagePreviews.length + validFiles.length > maxFiles) {
      alert(`最多只能上傳 ${maxFiles} 張圖片`);
      return;
    }

    // 生成預覽
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });

    // 存儲文件
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
    
    // 驗證所有必填欄位
    const errors = [];
    
    if (!formData.brand) errors.push('請選擇品牌');
    if (!formData.model) errors.push('請輸入車型');
    if (!formData.type) errors.push('請選擇車型分類');
    if (!formData.price) errors.push('請輸入價格');
    if (!formData.fuel) errors.push('請選擇燃料類型');
    if (!formData.transmission) errors.push('請選擇變速箱');
    if (!formData.city) errors.push('請選擇地點');
    
    if (formData.carType === 'used' && !formData.condition) {
      errors.push('請選擇車況');
    }
    
    if (!formData.sellerName) errors.push('請輸入賣家姓名');
    if (!formData.sellerPhone) errors.push('請輸入賣家電話');
    
    if (imageMode === 'upload' && (formData.carImages.length === 0 || imagePreviews.length === 0)) {
      errors.push('必須上傳至少一張車輛圖片，或改用圖片網址');
    }
    if (imageMode === 'url' && !imageUrl.trim()) {
      errors.push('請輸入圖片網址');
    }

    if (errors.length > 0) {
      logger.warn('刊登表單驗證失敗', { errors });
      alert(errors.join('\n'));
      return;
    }

    // 構建車輛數據
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
      // 圖片：優先使用 URL 模式，否則使用預設圖（Base64 太大不送到伺服器）
      image: imageMode === 'url' && imageUrl.trim()
        ? imageUrl.trim()
        : 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80',
      title: `${formData.brand} ${formData.model} ${formData.year}`,
      imageUrlPreview: imageMode === 'url' ? imageUrl.trim() : (imagePreviews[0] || null),
    };

    // 獲取登入的用戶 ID
    const userData = localStorage.getItem('user');
    const userId = userData ? JSON.parse(userData).id : null;

    setIsLoading(true);

    // 發送到後端 API
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
          alert('刊登失敗：' + (data.message || '未知錯誤'));
          setIsLoading(false);
          return;
        }

        // 使用後端返回的完整車輛數據（包含真實數據庫 ID）更新本地 context
        // 為了保持 ID 一致性，添加 1000000 前綴，並保存原始 _dbId
        if (formData.carType === 'new') {
          addNewCar({ ...data.car, id: 1000000 + data.car.id, _dbId: data.car.id });
        } else {
          addUsedCar({ ...data.car, id: 1000000 + data.car.id, _dbId: data.car.id });
        }

        // 記錄表單提交
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

        // 提交成功
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
        alert('刊登失敗，請檢查連線並重試');
        setIsLoading(false);
      });
  };

  const carBrands = ['Toyota', 'Honda', 'Mazda', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Porsche', 'Volkswagen', 'Ford', '其他'];
  const carTypes = ['轎車', 'SUV', '小型車', '掀背車', '跑車', '休旅車'];
  const fuelTypes = ['汽油', '柴油', '混合動力', '電動'];
  const transmissions = ['手動', '自動', '無段變速'];
  const conditions = ['優秀', '良好', '普通', '需要修復'];
  const colorOptions = ['黑色', '白色', '銀色', '紅色', '藍色', '金色', '棕色', '灰色'];
  const featuresList = ['全景天窗', '皮革座椅', '倒車影像', '定速巡航', '自動停車', '智能駕駛', '安全氣囊', '後排座椅加熱'];
  const cities = ['台北', '新北', '桃園', '新竹', '苗栗', '台中', '彰化', '南投', '嘉義', '台南', '高雄', '屏東', '宜蘭', '花蓮', '台東'];

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
                  <label htmlFor="brand">品牌 *</label>
                  <select
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                  >
                    <option value="">請選擇品牌</option>
                    {carBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="model">車型 *</label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="如：Corolla Cross"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="year">年份</label>
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
                  <label htmlFor="type">車型分類 *</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">請選擇</option>
                    {carTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="price">價格 (NT$) *</label>
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
                    <label htmlFor="mileage">里程 (KM)</label>
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
                  <label htmlFor="fuel">燥料類型 *</label>
                  <select
                    id="fuel"
                    name="fuel"
                    value={formData.fuel}
                    onChange={handleChange}
                    required
                  >
                    <option value="">請選擇</option>
                    {fuelTypes.map((fuel) => (
                      <option key={fuel} value={fuel}>
                        {fuel}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="transmission">變速箱 *</label>
                  <select
                    id="transmission"
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    required
                  >
                    <option value="">請選擇</option>
                    {transmissions.map((trans) => (
                      <option key={trans} value={trans}>
                        {trans}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="engine">引擎</label>
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
                  <label htmlFor="city">地點 *</label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  >
                    <option value="">請選擇城市</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.carType === 'used' && (
                  <div className="form-group">
                    <label htmlFor="condition">車況 *</label>
                    <select
                      id="condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      required
                    >
                      <option value="">請選擇</option>
                      {conditions.map((cond) => (
                        <option key={cond} value={cond}>
                          {cond}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* 車輛特徵 */}
            <div className="form-section">
              <h2>車輛特徵</h2>

              <div className="form-group">
                <label>顏色</label>
                <div className="checkbox-grid">
                  {colorOptions.map((color) => (
                    <label key={color} className="checkbox-label">
                      <input
                        type="checkbox"
                        value={color}
                        checked={formData.colors.includes(color)}
                        onChange={(e) => handleCheckboxChange(e, 'colors')}
                      />
                      {color}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>主要配置</label>
                <div className="checkbox-grid">
                  {featuresList.map((feature) => (
                    <label key={feature} className="checkbox-label">
                      <input
                        type="checkbox"
                        value={feature}
                        checked={formData.features.includes(feature)}
                        onChange={(e) => handleCheckboxChange(e, 'features')}
                      />
                      {feature}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">車輛說明</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="請詳細描述您的車輛狀況、保養情況等..."
                  rows="6"
                ></textarea>
              </div>
            </div>

            {/* 車輛圖片 */}
            <div className="form-section post-image-section">
              <h2>車輛圖片 *</h2>
              <p className="form-hint">上傳本地圖片或貼上圖片網址，至少提供一種</p>

              {/* 切換分頁 */}
              <div className="image-mode-tabs">
                <button
                  type="button"
                  className={`image-tab ${imageMode === 'upload' ? 'active' : ''}`}
                  onClick={() => setImageMode('upload')}
                >
                  📁 上傳圖片
                </button>
                <button
                  type="button"
                  className={`image-tab ${imageMode === 'url' ? 'active' : ''}`}
                  onClick={() => setImageMode('url')}
                >
                  🔗 圖片網址
                </button>
              </div>

              {/* 上傳模式 */}
              {imageMode === 'upload' && (
                <>
                  <div className="form-group">
                    <label htmlFor="carImages">選擇圖片（最多 5 張，每張不超過 5MB）</label>
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
                      <h3>圖片預覽 ({imagePreviews.length}/5)</h3>
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
                    <label htmlFor="imageUrl">圖片網址</label>
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
                          alt="圖片網址預覽"
                          className="image-preview-img"
                          onError={() => setImageUrlPreview(null)}
                        />
                        <button
                          type="button"
                          className="btn-remove-img"
                          onClick={() => { setImageUrl(''); setImageUrlPreview(null); }}
                          title="清除"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="image-preview-hint">圖片網址預覽</p>
                    </div>
                  ) : imageUrl ? (
                    <div className="image-placeholder">
                      <span className="image-placeholder-icon">⚠️</span>
                      <p>無法載入此圖片，請確認網址是否正確</p>
                    </div>
                  ) : (
                    <div className="image-placeholder">
                      <span className="image-placeholder-icon">🖼️</span>
                      <p>輸入網址後將顯示預覽</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 賣家信息 */}
            <div className="form-section">
              <h2>賣家信息</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sellerName">姓名 *</label>
                  <input
                    type="text"
                    id="sellerName"
                    name="sellerName"
                    value={formData.sellerName}
                    onChange={handleChange}
                    placeholder="請輸入您的姓名"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sellerPhone">電話 *</label>
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
                <label htmlFor="sellerEmail">電子郵件</label>
                <input
                  type="email"
                  id="sellerEmail"
                  name="sellerEmail"
                  value={formData.sellerEmail}
                  onChange={handleChange}
                  placeholder="您的電子郵件"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading ? '刊登中...' : '立即刊登'}
              </button>
              <p className="form-note">
                💡 提示：完整的車輛信息能幫助您吸引更多買家。請盡可能詳細填寫。
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* 優勢說明 */}
      <section className="post-benefits">
        <div className="container">
          <h2>為什麼選擇好車平台刊登？</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">✓</div>
              <h3>完全免費</h3>
              <p>刊登、編輯、延長都完全免費，無隱藏費用</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">✓</div>
              <h3>快速成交</h3>
              <p>龐大買家群體，平均 14 天內成交</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">✓</div>
              <h3>專業服務</h3>
              <p>24/7 客服支持，協助您完成交易</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">✓</div>
              <h3>安全交易</h3>
              <p>提供購車保障和完整的交易文件協助</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PostPage;
