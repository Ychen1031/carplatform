import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCar } from '../contexts/CarContext';
import '../styles/EditCarPage.css';
import { useToast } from '../contexts/ToastContext';

function EditCarPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { carId } = useParams();
  const { updateCar } = useCar();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
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
    seller: '',
    phone: '',
    email: '',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'
  const [errors, setErrors] = useState({});

  // 從帶前綴的 carId 提取實際的數據庫 ID
  // 支援多個 ID 範圍：後端數據 (1000000+), 靜態新車 (500000+), 靜態中古車 (600000+)
  const getDbCarId = (prefixedId) => {
    const id = parseInt(prefixedId);
    if (id >= 1000000) {
      // 後端數據 ID
      return id - 1000000;
    }
    // 靜態或臨時 ID - 無法編輯
    return null;
  };

  const dbCarId = getDbCarId(carId);

  // 加載車輛資料
  useEffect(() => {
    const fetchCar = async () => {
      // 檢查是否為有效的資料庫 ID
      if (dbCarId === null) {
        showToast(t('editCar.title'), 'error');
        navigate('/my-listings');
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/api/cars/${dbCarId}`);
        const data = await response.json();

        if (data.success) {
          setFormData({
            title: data.car.title || '',
            carType: data.car.carType || 'used',
            brand: data.car.brand || '',
            model: data.car.model || '',
            year: data.car.year || new Date().getFullYear(),
            price: data.car.price || '',
            mileage: data.car.mileage || '',
            fuel: data.car.fuel || '',
            transmission: data.car.transmission || '',
            engine: data.car.engine || '',
            type: data.car.type || '',
            city: data.car.city || '',
            condition: data.car.condition || '',
            colors: Array.isArray(data.car.colors) ? data.car.colors : [],
            features: Array.isArray(data.car.features) ? data.car.features : [],
            description: data.car.description || '',
            seller: data.car.seller || '',
            phone: data.car.phone || '',
            email: data.car.email || '',
            image: data.car.image || '',
          });
          if (data.car.image) {
            setImagePreview(data.car.image);
          }
        } else {
          showToast(t('messages.errorLoad'), 'error');
          navigate('/my-listings');
        }
      } catch (error) {
        console.error('載入車輛失敗:', error);
        showToast(t('messages.errorConnect'), 'error');
        navigate('/my-listings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCar();
  }, [dbCarId, navigate, showToast, t]);

  // 表單輸入改變
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除該欄位的錯誤
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 複選框改變
  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const list = prev[field];
      if (checked) {
        return {
          ...prev,
          [field]: [...list, value]
        };
      } else {
        return {
          ...prev,
          [field]: list.filter(item => item !== value)
        };
      }
    });
  };

  // 本地圖片上傳
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast(t('messages.errorLoad'), 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      showToast(t('messages.errorLoad'), 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setImagePreview(base64);
      setFormData(prev => ({ ...prev, image: base64 }));
    };
    reader.readAsDataURL(file);
  };

  // 圖片 URL 輸入
  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image: url }));
    setImagePreview(url || null);
  };

  // 清除圖片
  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  // 驗證表單
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = t('editCar.titleField') + ' ' + t('post.validBrand').split('請')[0];
    if (!formData.brand) newErrors.brand = t('post.validBrand');
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = t('post.validPrice');
    if (!formData.seller.trim()) newErrors.seller = t('post.validSellerName');
    if (!formData.phone.trim()) newErrors.phone = t('post.validSellerPhone');
    if (!formData.city) newErrors.city = t('post.validCity');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      if (showToast && typeof showToast === 'function') {
        showToast(t('editCar.save'), 'error');
      }
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`http://localhost:3001/api/cars/${dbCarId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          mileage: formData.mileage ? parseInt(formData.mileage) : 0,
          year: parseInt(formData.year),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 返回的數據需要加上 1000000 前綴並保存 _dbId 以保持一致性
        const updatedCar = { ...data.car, id: 1000000 + data.car.id, _dbId: data.car.id };
        updateCar(updatedCar);
        if (showToast && typeof showToast === 'function') {
          showToast(t('editProfile.updated'), 'success');
        }
        navigate('/my-listings');
      } else {
        if (showToast && typeof showToast === 'function') {
          showToast(data.message || t('messages.errorLoad'), 'error');
        }
      }
    } catch (error) {
      console.error('更新失敗:', error);
      if (showToast && typeof showToast === 'function') {
        showToast(t('editCar.saving'), 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="edit-car-page">
        <div className="loading">{t('editCar.loading')}</div>
      </div>
    );
  }

  return (
    <div className="edit-car-page">
      <div className="edit-car-container">
        <div className="edit-car-header">
          <h1>{t('editCar.title')}</h1>
          <button className="btn-back" onClick={() => navigate('/my-listings')}>
            {t('editCar.back')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-car-form">
          <div className="form-section">
            <h2>{t('editCar.basicInfo')}</h2>

            <div className="form-group">
              <label>
                {t('editCar.titleField')} <span className="required">*</span>
                {errors.title && <span className="error-text">{errors.title}</span>}
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Toyota Corolla 2021"
                className={errors.title ? 'input-error' : ''}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  {t('post.carType')} <span className="required">*</span>
                </label>
                <select name="carType" value={formData.carType} onChange={handleInputChange}>
                  <option value="used">{t('post.usedCar')}</option>
                  <option value="new">{t('post.newCar')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  {t('editCar.brand')} <span className="required">*</span>
                  {errors.brand && <span className="error-text">{errors.brand}</span>}
                </label>
                <select name="brand" value={formData.brand} onChange={handleInputChange} className={errors.brand ? 'input-error' : ''}>
                  <option value="">{t('post.selectBrand')}</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Mazda">Mazda</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Ford">Ford</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="Tesla">Tesla</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('post.model')}</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="Corolla"
                />
              </div>

              <div className="form-group">
                <label>
                  {t('post.year')} <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  {t('editCar.city')} <span className="required">*</span>
                  {errors.city && <span className="error-text">{errors.city}</span>}
                </label>
                <select name="city" value={formData.city} onChange={handleInputChange} className={errors.city ? 'input-error' : ''}>
                  <option value="">{t('post.selectCity')}</option>
                  <option value="台北">台北</option>
                  <option value="新北">新北</option>
                  <option value="桃園">桃園</option>
                  <option value="新竹">新竹</option>
                  <option value="台中">台中</option>
                  <option value="台南">台南</option>
                  <option value="高雄">高雄</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  {t('post.typeLabel')}
                </label>
                <select name="type" value={formData.type} onChange={handleInputChange}>
                  <option value="">{t('post.selectType')}</option>
                  <option value="轎車">{t('types.sedan')}</option>
                  <option value="休旅車">{t('types.suv')}</option>
                  <option value="貨車">{t('types.truck')}</option>
                  <option value="跑車">{t('types.sports')}</option>
                  <option value="其他">{t('types.other')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>{t('editCar.basicInfo')}</h2>

            <div className="form-row">
              <div className="form-group">
                <label>
                  {t('editCar.price')} <span className="required">*</span>
                  {errors.price && <span className="error-text">{errors.price}</span>}
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className={errors.price ? 'input-error' : ''}
                />
              </div>

              <div className="form-group">
                <label>{t('post.mileage')}</label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('post.fuel')}</label>
                <select name="fuel" value={formData.fuel} onChange={handleInputChange}>
                  <option value="">{t('post.selectFuel')}</option>
                  <option value="汽油">{t('fuels.gasoline')}</option>
                  <option value="柴油">{t('fuels.diesel')}</option>
                  <option value="油電">{t('fuels.hybrid')}</option>
                  <option value="純電">{t('fuels.ev')}</option>
                  <option value="其他">{t('fuels.other')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('post.transmission')}</label>
                <select name="transmission" value={formData.transmission} onChange={handleInputChange}>
                  <option value="">{t('post.selectTransmission')}</option>
                  <option value="手排">{t('transmissions.mt')}</option>
                  <option value="自排">{t('transmissions.at')}</option>
                  <option value="CVT">{t('transmissions.cvt')}</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>{t('post.engine')}</label>
              <input
                type="text"
                name="engine"
                value={formData.engine}
                onChange={handleInputChange}
                placeholder="1600cc"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>{t('post.colors')}</h2>
            <div className="checkbox-group">
              {[
                { key: 'black', value: '黑色' },
                { key: 'white', value: '白色' },
                { key: 'silver', value: '銀色' },
                { key: 'red', value: '紅色' },
                { key: 'blue', value: '藍色' },
                { key: 'gray', value: '灰色' },
              ].map(({ key, value }) => (
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

          <div className="form-section">
            <h2>{t('post.features')}</h2>
            <div className="checkbox-group">
              {[
                { key: 'panoramicRoof', value: '全景天窗' },
                { key: 'leatherSeats', value: '皮革座椅' },
                { key: 'reverseCamera', value: '倒車影像' },
                { key: 'cruiseControl', value: '定速巡航' },
                { key: 'intelligentDrive', value: '智能駕駛' },
              ].map(({ key, value }) => (
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

          <div className="form-section">
            <h2>{t('post.condition')} &amp; {t('post.description')}</h2>

            <div className="form-group">
              <label>{t('post.condition')}</label>
              <select name="condition" value={formData.condition} onChange={handleInputChange}>
                <option value="">{t('post.selectCondition')}</option>
                <option value="優">{t('conditions.excellent')}</option>
                <option value="良">{t('conditions.good')}</option>
                <option value="尚可">{t('conditions.fair')}</option>
                <option value="維修中">{t('conditions.repairing')}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('post.description')}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('post.descriptionPlaceholder')}
                rows="5"
              />
            </div>
          </div>

          <div className="form-section image-section">
            <h2>{t('post.vehicleImages')}</h2>
            <p className="form-hint">{t('post.imageHint')}</p>

            <div className="image-mode-tabs">
              <button
                type="button"
                className={`image-tab ${imageMode === 'url' ? 'active' : ''}`}
                onClick={() => setImageMode('url')}
              >
                {t('post.urlTab')}
              </button>
              <button
                type="button"
                className={`image-tab ${imageMode === 'upload' ? 'active' : ''}`}
                onClick={() => setImageMode('upload')}
              >
                {t('post.uploadTab')}
              </button>
            </div>

            {imageMode === 'url' ? (
              <div className="form-group">
                <label>{t('post.url')}</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image.startsWith('data:') ? '' : formData.image}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/car.jpg"
                />
              </div>
            ) : (
              <div className="form-group">
                <label>{t('post.imageSelectLabel')}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                />
              </div>
            )}

            {imagePreview ? (
              <div className="image-preview-wrapper">
                <div className="image-preview-box">
                  <img
                    src={imagePreview}
                    alt={t('post.imagePreviewAlt')}
                    className="image-preview-img"
                    onError={() => setImagePreview(null)}
                  />
                  <button
                    type="button"
                    className="btn-remove-img"
                    onClick={handleRemoveImage}
                    title={t('post.clearImage')}
                  >
                    ✕
                  </button>
                </div>
                <p className="image-preview-hint">{t('post.imagePreviewAlt')}</p>
              </div>
            ) : (
              <div className="image-placeholder">
                <span className="image-placeholder-icon">🖼️</span>
                <p>{t('post.imageUrlPrompt')}</p>
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>{t('post.sellerInfo')}</h2>

            <div className="form-row">
              <div className="form-group">
                <label>
                  {t('editCar.seller')} <span className="required">*</span>
                  {errors.seller && <span className="error-text">{errors.seller}</span>}
                </label>
                <input
                  type="text"
                  name="seller"
                  value={formData.seller}
                  onChange={handleInputChange}
                  className={errors.seller ? 'input-error' : ''}
                />
              </div>

              <div className="form-group">
                <label>
                  {t('editCar.phone')} <span className="required">*</span>
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'input-error' : ''}
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('contact.email')}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/my-listings')}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-save" disabled={isSaving}>
              {isSaving ? t('editCar.saving') : t('editCar.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCarPage;
