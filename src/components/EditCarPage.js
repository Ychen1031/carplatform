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
  }, [dbCarId, navigate, showToast]);

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

    if (!formData.title.trim()) newErrors.title = '標題為必填';
    if (!formData.brand) newErrors.brand = '品牌為必填';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = '價格為必填且需大於 0';
    if (!formData.seller.trim()) newErrors.seller = '賣家名稱為必填';
    if (!formData.phone.trim()) newErrors.phone = '電話為必填';
    if (!formData.city) newErrors.city = '城市為必填';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      if (showToast && typeof showToast === 'function') {
        showToast('請填完所有必填欄位', 'error');
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
          showToast('車輛資訊已成功更新', 'success');
        }
        navigate('/my-listings');
      } else {
        if (showToast && typeof showToast === 'function') {
          showToast(data.message || '更新失敗', 'error');
        }
      }
    } catch (error) {
      console.error('更新失敗:', error);
      if (showToast && typeof showToast === 'function') {
        showToast('更新失敗，請稍後再試', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="edit-car-page">
        <div className="loading">載入中...</div>
      </div>
    );
  }

  return (
    <div className="edit-car-page">
      <div className="edit-car-container">
        <div className="edit-car-header">
          <h1>編輯車輛資訊</h1>
          <button className="btn-back" onClick={() => navigate('/my-listings')}>
            返回
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-car-form">
          <div className="form-section">
            <h2>基本資訊</h2>

            <div className="form-group">
              <label>
                標題 <span className="required">*</span>
                {errors.title && <span className="error-text">{errors.title}</span>}
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="例如：Toyota Corolla 2021 自排"
                className={errors.title ? 'input-error' : ''}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  車輛類型 <span className="required">*</span>
                </label>
                <select name="carType" value={formData.carType} onChange={handleInputChange}>
                  <option value="used">中古車</option>
                  <option value="new">新車</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  品牌 <span className="required">*</span>
                  {errors.brand && <span className="error-text">{errors.brand}</span>}
                </label>
                <select name="brand" value={formData.brand} onChange={handleInputChange} className={errors.brand ? 'input-error' : ''}>
                  <option value="">選擇品牌</option>
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
                <label>型號</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="例如：Corolla"
                />
              </div>

              <div className="form-group">
                <label>
                  年份 <span className="required">*</span>
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
                  城市 <span className="required">*</span>
                  {errors.city && <span className="error-text">{errors.city}</span>}
                </label>
                <select name="city" value={formData.city} onChange={handleInputChange} className={errors.city ? 'input-error' : ''}>
                  <option value="">選擇城市</option>
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
                  類型
                </label>
                <select name="type" value={formData.type} onChange={handleInputChange}>
                  <option value="">選擇類型</option>
                  <option value="轎車">轎車</option>
                  <option value="休旅車">休旅車</option>
                  <option value="貨車">貨車</option>
                  <option value="跑車">跑車</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>車輛規格</h2>

            <div className="form-row">
              <div className="form-group">
                <label>
                  價格 (元) <span className="required">*</span>
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
                <label>里程數 (公里)</label>
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
                <label>燃油類型</label>
                <select name="fuel" value={formData.fuel} onChange={handleInputChange}>
                  <option value="">選擇燃油類型</option>
                  <option value="汽油">汽油</option>
                  <option value="柴油">柴油</option>
                  <option value="混合動力">混合動力</option>
                  <option value="電動">電動</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div className="form-group">
                <label>變速箱</label>
                <select name="transmission" value={formData.transmission} onChange={handleInputChange}>
                  <option value="">選擇變速箱</option>
                  <option value="手動">手動</option>
                  <option value="自動">自動</option>
                  <option value="無段">無段</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>引擎排氣量</label>
              <input
                type="text"
                name="engine"
                value={formData.engine}
                onChange={handleInputChange}
                placeholder="例如：1600cc"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>外觀顏色</h2>
            <div className="checkbox-group">
              {['黑色', '白色', '銀色', '紅色', '藍色', '灰色'].map(color => (
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

          <div className="form-section">
            <h2>車輛特色</h2>
            <div className="checkbox-group">
              {['天窗', '皮椅', '倒車雷達', '定速巡航', '導航系統', 'Bluetooth'].map(feature => (
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

          <div className="form-section">
            <h2>車況與描述</h2>

            <div className="form-group">
              <label>車況</label>
              <select name="condition" value={formData.condition} onChange={handleInputChange}>
                <option value="">選擇車況</option>
                <option value="優">優</option>
                <option value="良">良</option>
                <option value="尚可">尚可</option>
                <option value="維修中">維修中</option>
              </select>
            </div>

            <div className="form-group">
              <label>描述</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="詳細描述車輛狀況、特點等..."
                rows="5"
              />
            </div>
          </div>

          <div className="form-section image-section">
            <h2>車輛圖片</h2>
            <p className="form-hint">可上傳本地圖片或輸入圖片網址，建議使用清晰的車輛照片</p>

            <div className="image-mode-tabs">
              <button
                type="button"
                className={`image-tab ${imageMode === 'url' ? 'active' : ''}`}
                onClick={() => setImageMode('url')}
              >
                🔗 圖片網址
              </button>
              <button
                type="button"
                className={`image-tab ${imageMode === 'upload' ? 'active' : ''}`}
                onClick={() => setImageMode('upload')}
              >
                📁 上傳圖片
              </button>
            </div>

            {imageMode === 'url' ? (
              <div className="form-group">
                <label>圖片網址</label>
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
                <label>選擇圖片（最大 5MB）</label>
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
                    alt="車輛圖片預覽"
                    className="image-preview-img"
                    onError={() => setImagePreview(null)}
                  />
                  <button
                    type="button"
                    className="btn-remove-img"
                    onClick={handleRemoveImage}
                    title="移除圖片"
                  >
                    ✕
                  </button>
                </div>
                <p className="image-preview-hint">目前圖片預覽</p>
              </div>
            ) : (
              <div className="image-placeholder">
                <span className="image-placeholder-icon">🖼️</span>
                <p>尚未設定圖片</p>
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>賣家資訊</h2>

            <div className="form-row">
              <div className="form-group">
                <label>
                  名稱 <span className="required">*</span>
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
                  電話 <span className="required">*</span>
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
              <label>電子郵件</label>
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
              取消
            </button>
            <button type="submit" className="btn-save" disabled={isSaving}>
              {isSaving ? '保存中...' : '保存變更'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCarPage;
