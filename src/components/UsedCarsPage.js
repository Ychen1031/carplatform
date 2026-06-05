import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Input, Select, Modal, Form, Empty, Space, Tag, Drawer } from 'antd';
import { HeartOutlined, HeartFilled, PhoneOutlined, CarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { TYPE_KEY_MAP, FUEL_KEY_MAP, TRANSMISSION_KEY_MAP, CITY_KEY_MAP } from '../utils/localeMaps';
import { NEW_CAR_BRANDS } from '../constants/brands';
import { USED_CARS_DATA } from '../constants/usedCarsData';
import { useCar } from '../contexts/CarContext';
import { useToast } from '../contexts/ToastContext';
import '../styles/NewCarsPage.css';
import '../styles/UsedCarsPage.css';

function UsedCarsPage() {
  const { t, i18n } = useTranslation();
  const { success } = useToast();
  const { state, toggleFavorite } = useCar();
  const navigate = useNavigate();
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);
  // 為靜態中古車數據添加 ID 前綴以避免與後端數據衝突
  // 靜態數據 ID 範圍: 600000+ (id + 600000)
  const staticUsedCars = useMemo(
    () => USED_CARS_DATA.map(car => ({ ...car, id: 600000 + car.id })),
    []
  );
  const allCars = useMemo(() => [...staticUsedCars, ...state.usedCars], [staticUsedCars, state.usedCars]);
  const [filters, setFilters] = useState({
    keyword: '',
    brand: '',
    type: '',
    city: '',
    priceRange: '',
    fuel: '',
  });
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const handleFavoriteClick = (carId) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      setLoginPromptVisible(true);
      return;
    }

    const normalizedId = String(carId);
    const isAdding = !state.favorites.includes(normalizedId);
    
    if (isAdding) {
      success(t('usedCars.favAdded'));
    } else {
      success(t('usedCars.favRemoved'));
    }

    toggleFavorite(carId);
  };

  const isFavorited = (carId) => state.favorites.includes(String(carId));

  const allBrands = useMemo(
    () => [...new Set(allCars.map((car) => car.brand))],
    [allCars]
  );

  const carTypes = useMemo(
    () => [...new Set(allCars.map((car) => car.type))],
    [allCars]
  );

  const fuelTypes = useMemo(
    () => [...new Set(allCars.map((car) => car.fuel))],
    [allCars]
  );

  const allCities = useMemo(
    () => [...new Set(allCars.map((car) => car.city))],
    [allCars]
  );

  const filteredCars = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return allCars.filter((car) => {
      const keywordMatch = keyword.length === 0 || car.title.toLowerCase().includes(keyword) || car.brand.toLowerCase().includes(keyword);
      const brandMatch = filters.brand === '' || car.brand === filters.brand;
      const typeMatch = filters.type === '' || car.type === filters.type;
      const fuelMatch = filters.fuel === '' || car.fuel === filters.fuel;
      const cityMatch = filters.city === '' || car.city === filters.city;

      let priceMatch = true;
      if (filters.priceRange === '0-100') {
        priceMatch = car.price < 1000000;
      } else if (filters.priceRange === '100-150') {
        priceMatch = car.price >= 1000000 && car.price < 1500000;
      } else if (filters.priceRange === '150+') {
        priceMatch = car.price >= 1500000;
      }

      return keywordMatch && brandMatch && typeMatch && fuelMatch && cityMatch && priceMatch;
    });
  }, [filters, allCars]);

  const localize = (ns, raw) => {
    if (!raw || raw === '') return t('common.all');
    const keyMap = 
      ns === 'types' ? TYPE_KEY_MAP : 
      ns === 'fuels' ? FUEL_KEY_MAP : 
      ns === 'transmissions' ? TRANSMISSION_KEY_MAP : 
      ns === 'cities' ? CITY_KEY_MAP : 
      undefined;
    const key = keyMap ? (keyMap[raw] || raw) : raw;
    const result = t(`${ns}.${key}`, { defaultValue: raw });
    if (ns === 'cities') {
      console.log('[UsedCarsPage] localize city:', { raw, key, result, lang: i18n.language });
    }
    return result;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleBrandClick = (brand) => {
    setSelectedBrand(selectedBrand?.id === brand.id ? null : brand);
    if (brand.name !== selectedBrand?.name) {
      setFilters((prev) => ({ ...prev, brand: brand.name }));
    } else {
      setFilters((prev) => ({ ...prev, brand: '' }));
    }
  };

  const handleContactClick = () => {
    setActionModal('contact');
  };

  const handleTestDriveClick = () => {
    setActionModal('testdrive');
  };

  const handleFormSubmit = async () => {
    const inquiryTitle = actionModal === 'contact'
      ? t('usedCars.inquiryTitleContact')
      : t('usedCars.inquiryTitleTestDrive');

    // 根據 actionModal 類型決定 subject
    const subject = actionModal === 'contact' ? 'contact_dealer' : 'test_drive';
    const message = `${inquiryTitle}：${selectedCar?.title || t('common.all')}`;

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
        setActionModal('success');
        setContactForm({ name: '', phone: '', email: '' });
        setTimeout(() => setActionModal(null), 3000);
      } else {
        alert('提交失敗，請稍後再試');
      }
    } catch (error) {
      console.error('提交表單錯誤:', error);
      alert('提交失敗，請檢查網路連線');
    }
  };

  return (
    <div className="new-cars-page used-cars-page">
      {/* Hero 區塊 */}
      <div className="new-cars-hero">
        <div className="new-cars-hero-content">
          <h1>{t('usedCars.title')}</h1>
          <p>{t('usedCars.subtitle')}</p>
        </div>
      </div>

      {/* 品牌展示區 */}
      <div className="brands-showcase" style={{ padding: '48px 24px', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>{t('usedCars.hotBrands')}</h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '32px' }}>{t('usedCars.hotBrandsHint')}</p>
          <Row gutter={[16, 16]}>
            {NEW_CAR_BRANDS.map((brand) => (
              <Col key={brand.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  onClick={() => handleBrandClick(brand)}
                  style={{
                    textAlign: 'center',
                    borderColor: selectedBrand?.id === brand.id ? '#d9863d' : undefined,
                    borderWidth: selectedBrand?.id === brand.id ? '2px' : '1px',
                    backgroundColor: selectedBrand?.id === brand.id ? '#fef5f0' : 'white'
                  }}
                >
                  <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <img 
                      src={brand.icon} 
                      alt={brand.localName}
                      style={{ maxHeight: '100%', maxWidth: '100%' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextElementSibling) {
                          e.target.nextElementSibling.style.display = 'flex';
                        }
                      }}
                    />
                    <div style={{ display: 'none', fontSize: '24px', fontWeight: 'bold', color: '#d9863d' }}>
                      {brand.localName}
                    </div>
                  </div>
                  <h4 style={{ margin: '8px 0' }}>{brand.localName}</h4>
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: '4px 0' }}>{brand.name}</p>
                  <p style={{ color: '#999', fontSize: '0.85rem' }}>{brand.description}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* 主容器 */}
      <div style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 24px' }}>
        <Row gutter={24}>
          {/* 篩選側欄 */}
          <Col xs={24} md={6}>
            <Card title={t('usedCars.filterTitle')} style={{ position: 'sticky', top: '20px' }}>
              <Form layout="vertical" size="small">
                <Form.Item label={t('usedCars.search')}>
                  <Input
                    name="keyword"
                    value={filters.keyword}
                    onChange={handleFilterChange}
                    placeholder={t('usedCars.searchPlaceholder')}
                    allowClear
                  />
                </Form.Item>

                <Form.Item label={t('usedCars.brand')}>
                  <Select
                    name="brand"
                    value={filters.brand}
                    onChange={(value) => handleFilterChange({ target: { name: 'brand', value } })}
                    options={[{ value: '', label: t('common.all') }, ...allBrands.map(b => ({ value: b, label: b }))]}
                  />
                </Form.Item>

                <Form.Item label={t('usedCars.type')}>
                  <Select
                    name="type"
                    value={filters.type}
                    onChange={(value) => handleFilterChange({ target: { name: 'type', value } })}
                    options={[{ value: '', label: t('common.all') }, ...carTypes.map(typeVal => ({ value: typeVal, label: localize('types', typeVal) }))]}
                  />
                </Form.Item>

                <Form.Item label={t('usedCars.fuel')}>
                  <Select
                    name="fuel"
                    value={filters.fuel}
                    onChange={(value) => handleFilterChange({ target: { name: 'fuel', value } })}
                    options={[{ value: '', label: t('common.all') }, ...fuelTypes.map(fVal => ({ value: fVal, label: localize('fuels', fVal) }))]}
                  />
                </Form.Item>

                <Form.Item label={t('usedCars.city')}>
                  <Select
                    name="city"
                    value={filters.city}
                    onChange={(value) => handleFilterChange({ target: { name: 'city', value } })}
                    options={[{ value: '', label: t('common.all') }, ...allCities.map(c => ({ value: c, label: localize('cities', c) }))]}
                  />
                </Form.Item>

                <Form.Item label={t('usedCars.priceRange')}>
                  <Select
                    name="priceRange"
                    value={filters.priceRange}
                    onChange={(value) => handleFilterChange({ target: { name: 'priceRange', value } })}
                    options={[
                      { value: '', label: t('usedCars.allPrice') },
                      { value: '0-100', label: t('usedCars.priceRanges.0_100') },
                      { value: '100-150', label: t('usedCars.priceRanges.100_150') },
                      { value: '150+', label: t('usedCars.priceRanges.150_plus') }
                    ]}
                  />
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* 列表區 */}
          <Col xs={24} md={18}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 8px 0' }}>{t('usedCars.usedCarsTitle')}</h2>
              <p style={{ color: '#666', margin: 0 }}>{t('usedCars.results', { count: filteredCars.length })}</p>
            </div>

            {filteredCars.length === 0 ? (
              <Empty
                description={t('usedCars.empty')}
                style={{ padding: '48px 0' }}
              >
                <p style={{ color: '#999' }}>{t('usedCars.emptyTip')}</p>
              </Empty>
            ) : (
              <Row gutter={[16, 16]}>
                {filteredCars.map((car) => (
                  <Col key={car.id} xs={24} sm={12} lg={8}>
                    <Card
                      hoverable
                      onClick={() => setSelectedCar(car)}
                      cover={
                        <div style={{
                          position: 'relative',
                          paddingBottom: '66.67%',
                          overflow: 'hidden',
                          backgroundColor: '#f0f0f0'
                        }}>
                          <img
                            src={car.image}
                            alt={car.title}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '0.9rem'
                          }}>
                            {car.year}年款
                          </div>
                        </div>
                      }
                      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                      bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                    >
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>{car.title}</h3>
                      <Space wrap style={{ marginBottom: '12px' }}>
                        <Tag>{localize('types', car.type)}</Tag>
                        <Tag>{localize('fuels', car.fuel)}</Tag>
                        <Tag>{localize('transmissions', car.transmission)}</Tag>
                      </Space>
                      <div style={{ marginBottom: '12px', fontSize: '0.9rem', color: '#666' }}>
                        <p style={{ margin: '2px 0' }}><strong>{t('usedCars.city')}:</strong> {localize('cities', car.city)}</p>
                        <p style={{ margin: '2px 0' }}><strong>里程:</strong> {car.mileage.toLocaleString()} KM</p>
                        <p style={{ margin: '2px 0' }}><strong>引擎:</strong> {car.engine}</p>
                        <p style={{ margin: '2px 0', color: '#d9863d', fontSize: '1.1rem', fontWeight: 'bold' }}>
                          NT$ {car.price.toLocaleString()}
                        </p>
                      </div>
                      <Button type="primary" block style={{ marginTop: 'auto' }}>
                        {t('usedCars.inquiryCard')}
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </div>

      {/* 詳細資訊 Drawer */}
      <Drawer
        title={selectedCar?.title}
        placement="right"
        onClose={() => setSelectedCar(null)}
        open={!!selectedCar}
        width={500}
      >
        {selectedCar && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <img 
                src={selectedCar.image} 
                alt={selectedCar.title}
                style={{ width: '100%', borderRadius: '8px', marginBottom: '12px' }}
              />
              <h3 style={{ margin: '0 0 4px 0' }}>{selectedCar.title}</h3>
              <p style={{ color: '#666', margin: 0 }}>{selectedCar.year}年款 • 認證好車</p>
            </div>

            {/* 基本資訊 */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '12px' }}>{t('usedCars.basicInfo')}</h4>
              <Row gutter={12}>
                <Col span={12}>
                  <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '4px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9rem' }}>{t('usedCars.brand')}</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedCar.brand}</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '4px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9rem' }}>{t('usedCars.type')}</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{localize('types', selectedCar.type)}</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '4px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9rem' }}>{t('usedCars.year')}</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedCar.year}年</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '4px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9rem' }}>{t('usedCars.city')}</p>
                     <p style={{ margin: 0, fontWeight: 'bold' }}>{localize('cities', selectedCar.city)}</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '4px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9rem' }}>{t('usedCars.mileage')}</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedCar.mileage.toLocaleString()} KM</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '4px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9rem' }}>{t('usedCars.fuel')}</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{localize('fuels', selectedCar.fuel)}</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '4px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9rem' }}>{t('usedCars.transmission')}</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{localize('transmissions', selectedCar.transmission)}</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '4px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9rem' }}>{t('usedCars.engine')}</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedCar.engine}</p>
                  </div>
                </Col>
                <Col span={24}>
                  <div style={{ backgroundColor: '#fef5f0', padding: '12px', borderRadius: '4px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9rem' }}>{t('usedCars.price')}</p>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#d9863d', fontSize: '1.2rem' }}>
                      NT$ {selectedCar.price.toLocaleString()}
                    </p>
                  </div>
                </Col>
              </Row>
            </div>

            {/* 可選顏色 */}
            {selectedCar.colors && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '12px' }}>{t('usedCars.colors')}</h4>
                <Space wrap>
                  {selectedCar.colors.map(color => (
                    <Tag key={color}>{color}</Tag>
                  ))}
                </Space>
              </div>
            )}

            {/* 主要配置 */}
            {selectedCar.features && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '12px' }}>{t('usedCars.features')}</h4>
                <ul style={{ paddingLeft: '20px', marginBottom: 0 }}>
                  {selectedCar.features.map((feature, idx) => (
                    <li key={idx} style={{ marginBottom: '6px', color: '#333' }}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 操作按鈕 */}
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Button 
                type="primary" 
                size="large" 
                block
                icon={<PhoneOutlined />}
                onClick={handleContactClick}
              >
                {t('usedCars.inquiryTitleContact')}
              </Button>
              <Button 
                size="large" 
                block
                icon={<CarOutlined />}
                onClick={handleTestDriveClick}
              >
                {t('usedCars.inquiryTitleTestDrive')}
              </Button>
              <Button
                size="large"
                block
                type={isFavorited(selectedCar.id) ? 'primary' : 'default'}
                icon={isFavorited(selectedCar.id) ? <HeartFilled /> : <HeartOutlined />}
                onClick={() => handleFavoriteClick(selectedCar.id)}
              >
                {isFavorited(selectedCar.id) ? '已收藏' : '加入收藏'}
              </Button>
            </Space>
          </div>
        )}
      </Drawer>

      {/* 聯絡/試駕模態框 */}
      <Modal
        title={actionModal === 'contact' ? t('usedCars.inquiryTitleContact') : actionModal === 'testdrive' ? t('usedCars.inquiryTitleTestDrive') : ''}
        open={actionModal === 'contact' || actionModal === 'testdrive'}
        onCancel={() => setActionModal(null)}
        footer={null}
        width={500}
      >
        {(actionModal === 'contact' || actionModal === 'testdrive') && (
          <Form
            layout="vertical"
            onFinish={handleFormSubmit}
            requiredMark={(label, { required }) =>
              required ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ color: '#ff4d4f', fontSize: 14, lineHeight: 1 }}>*</span>
                  {label}
                </span>
              ) : label
            }
          >
            <p style={{ color: '#666', marginBottom: '16px' }}>
              {actionModal === 'contact'
                ? t('usedCars.inquiryIntroContact')
                : t('usedCars.inquiryIntroTestDrive')}
            </p>
            <Form.Item
              name="name"
              label={t('usedCars.inquiryName')}
              rules={[{ required: true, message: t('usedCars.inquiryNameRequired') }]}
            >
              <Input
                placeholder={t('usedCars.inquiryNamePlaceholder')}
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={t('usedCars.inquiryPhone')}
              rules={[{ required: true, message: t('usedCars.inquiryPhoneRequired') }]}
            >
              <Input
                placeholder={t('usedCars.inquiryPhonePlaceholder')}
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={t('usedCars.inquiryEmail')}
              rules={[{ required: true, message: t('usedCars.inquiryEmailRequired') }]}
            >
              <Input
                type="email"
                placeholder={t('usedCars.inquiryEmailPlaceholder')}
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large">
                {actionModal === 'contact' ? t('usedCars.inquirySubmitContact') : t('usedCars.inquirySubmitTestDrive')}
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* 成功訊息模態框 */}
      <Modal
        title={t('usedCars.inquirySuccessTitle')}
        open={actionModal === 'success'}
        onOk={() => setActionModal(null)}
        footer={null}
        centered
      >
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{
            fontSize: '48px',
            color: '#2f866f',
            marginBottom: '16px'
          }}>
            ✓
          </div>
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{t('usedCars.inquirySuccessBody')}</p>
          <p style={{ color: '#666', marginBottom: '16px' }}>{t('usedCars.inquirySuccessSubtext')}</p>
          <Button type="primary" onClick={() => setActionModal(null)} block>
            {t('usedCars.inquiryClose')}
          </Button>
        </div>
      </Modal>

      {/* 未登入提示 Modal */}
      <Modal
        title="請先登入"
        open={loginPromptVisible}
        onCancel={() => setLoginPromptVisible(false)}
        footer={null}
        centered
        width={360}
      >
        <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
          <p style={{ fontSize: '1rem', marginBottom: '8px', fontWeight: 500 }}>收藏車輛需要先登入</p>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '24px' }}>登入後即可收藏喜愛的車輛，並在「我的收藏」隨時查看。</p>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="primary"
              block
              size="large"
              onClick={() => { setLoginPromptVisible(false); navigate('/login'); }}
            >
              前往登入
            </Button>
            <Button block onClick={() => setLoginPromptVisible(false)}>
              稍後再說
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
}

export default UsedCarsPage;
