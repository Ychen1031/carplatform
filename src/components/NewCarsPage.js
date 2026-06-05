import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Input, Select, Modal, Form, Empty, Space, Tag, Drawer } from 'antd';
import { HeartOutlined, HeartFilled, PhoneOutlined, CarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { TYPE_KEY_MAP, FUEL_KEY_MAP, TRANSMISSION_KEY_MAP } from '../utils/localeMaps';
import { NEW_CAR_BRANDS } from '../constants/brands';
import { NEW_CARS_DATA } from '../constants/newCarsData';
import { useCar } from '../contexts/CarContext';
import { useToast } from '../contexts/ToastContext';
import '../styles/NewCarsPage.css';

function NewCarsPage() {
  const { t } = useTranslation();
  const { success } = useToast();
  const { state, toggleFavorite } = useCar();
  const navigate = useNavigate();
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);
  // 為靜態新車數據添加 ID 前綴以避免與後端數據衝突
  // 靜態數據 ID 範圍: 500000+ (id + 500000)
  const staticNewCars = useMemo(
    () => NEW_CARS_DATA.map(car => ({ ...car, id: 500000 + car.id })),
    []
  );
  const allCars = useMemo(() => [...staticNewCars, ...state.newCars], [staticNewCars, state.newCars]);
  const [filters, setFilters] = useState({
    keyword: '',
    brand: '',
    type: '',
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
      success(t('newCars.favAdded'));
    } else {
      success(t('newCars.favRemoved'));
    }

    toggleFavorite(carId);
  };

  const isFavorited = (carId) => state.favorites.includes(String(carId));

  const allBrands = useMemo(() => [...new Set(allCars.map((car) => car.brand))], [allCars]);

  const carTypes = useMemo(() => [...new Set(allCars.map((car) => car.type))], [allCars]);

  const fuelTypes = useMemo(() => [...new Set(allCars.map((car) => car.fuel))], [allCars]);

  const localize = (ns, raw) => {
    if (!raw || raw === '') return t('common.all');
    const keyMap = ns === 'types' ? TYPE_KEY_MAP : ns === 'fuels' ? FUEL_KEY_MAP : TRANSMISSION_KEY_MAP;
    const key = keyMap[raw] || raw;
    return t(`${ns}.${key}`, { defaultValue: raw });
  };

  const filteredCars = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return allCars.filter((car) => {
      const keywordMatch = keyword.length === 0 || car.title.toLowerCase().includes(keyword) || car.brand.toLowerCase().includes(keyword);
      const brandMatch = filters.brand === '' || car.brand === filters.brand;
      const typeMatch = filters.type === '' || car.type === filters.type;
      const fuelMatch = filters.fuel === '' || car.fuel === filters.fuel;

      let priceMatch = true;
      if (filters.priceRange === '0-100') {
        priceMatch = car.price < 1000000;
      } else if (filters.priceRange === '100-200') {
        priceMatch = car.price >= 1000000 && car.price < 2000000;
      } else if (filters.priceRange === '200+') {
        priceMatch = car.price >= 2000000;
      }

      return keywordMatch && brandMatch && typeMatch && fuelMatch && priceMatch;
    });
  }, [filters, allCars]);

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
      ? t('newCars.inquiryTitleContact')
      : t('newCars.inquiryTitleTestDrive');

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
    <div className="new-cars-page">
      {/* Hero 區塊 */}
      <div className="new-cars-hero">
        <div className="new-cars-hero-content">
          <h1>{t('newCars.title')}</h1>
          <p>{t('newCars.subtitle')}</p>
        </div>
      </div>

      {/* 品牌展示區 */}
      <div className="brands-showcase" style={{ padding: '48px 24px', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>{t('newCars.hotBrands')}</h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '32px' }}>{t('newCars.hotBrandsHint')}</p>
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
            <Card title={t('newCars.filterTitle')} style={{ position: 'sticky', top: '20px' }}>
              <Form layout="vertical" size="small">
                <Form.Item label={t('newCars.search')}>
                  <Input
                    name="keyword"
                    value={filters.keyword}
                    onChange={handleFilterChange}
                    placeholder={t('newCars.searchPlaceholder')}
                    allowClear
                  />
                </Form.Item>

                <Form.Item label={t('newCars.brand')}>
                  <Select
                    name="brand"
                    value={filters.brand}
                    onChange={(value) => handleFilterChange({ target: { name: 'brand', value } })}
                    options={[{ value: '', label: t('common.all') }, ...allBrands.map(b => ({ value: b, label: b }))]}
                  />
                </Form.Item>

                <Form.Item label={t('newCars.type')}>
                  <Select
                    name="type"
                    value={filters.type}
                    onChange={(value) => handleFilterChange({ target: { name: 'type', value } })}
                    options={[{ value: '', label: t('common.all') }, ...carTypes.map(typeVal => ({ value: typeVal, label: localize('types', typeVal) }))]}
                  />
                </Form.Item>

                <Form.Item label={t('newCars.fuel')}>
                  <Select
                    name="fuel"
                    value={filters.fuel}
                    onChange={(value) => handleFilterChange({ target: { name: 'fuel', value } })}
                    options={[{ value: '', label: t('common.all') }, ...fuelTypes.map(fVal => ({ value: fVal, label: localize('fuels', fVal) }))]}
                  />
                </Form.Item>

                <Form.Item label={t('newCars.priceRange')}>
                  <Select
                    name="priceRange"
                    value={filters.priceRange}
                    onChange={(value) => handleFilterChange({ target: { name: 'priceRange', value } })}
                    options={[
                      { value: '', label: t('newCars.allPrice') },
                      { value: '0-100', label: t('newCars.priceRanges.0_100') },
                      { value: '100-200', label: t('newCars.priceRanges.100_200') },
                      { value: '200+', label: t('newCars.priceRanges.200_plus') }
                    ]}
                  />
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* 列表區 */}
          <Col xs={24} md={18}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 8px 0' }}>{t('newCars.newCarsTitle')}</h2>
              <p style={{ color: '#666', margin: 0 }}>{t('newCars.results', { count: filteredCars.length })}</p>
            </div>

            {filteredCars.length === 0 ? (
              <Empty
                description={t('newCars.empty')}
                style={{ padding: '48px 0' }}
              >
                <p style={{ color: '#999' }}>{t('newCars.emptyTip')}</p>
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
                        <p style={{ margin: '2px 0' }}><strong>引擎:</strong> {car.engine}</p>
                        <p style={{ margin: '2px 0', color: '#d9863d', fontSize: '1.1rem', fontWeight: 'bold' }}>
                          NT$ {car.price.toLocaleString()}
                        </p>
                      </div>
                      <Button type="primary" block style={{ marginTop: 'auto' }}>
                        {t('newCars.inquiryCard')}
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
              <p style={{ color: '#666', margin: 0 }}>{selectedCar.year}年新款 • 官方認證</p>
            </div>

            {/* 基本資訊 */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '12px' }}>{t('newCars.basicInfo')}</h4>
              <Row gutter={12}>
                <Col span={12}>
                  <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '4px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9rem' }}>{t('newCars.brand')}</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedCar.brand}</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '4px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9rem' }}>{t('newCars.type')}</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{localize('types', selectedCar.type)}</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '4px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9rem' }}>{t('newCars.fuel')}</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{localize('fuels', selectedCar.fuel)}</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '4px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9rem' }}>{t('newCars.transmission')}</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{localize('transmissions', selectedCar.transmission)}</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '4px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9rem' }}>{t('newCars.engine')}</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedCar.engine}</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '4px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9rem' }}>{t('newCars.price')}</p>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#d9863d', fontSize: '1.1rem' }}>
                      NT$ {selectedCar.price.toLocaleString()}
                    </p>
                  </div>
                </Col>
              </Row>
            </div>

            {/* 可選顏色 */}
            {selectedCar.colors && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '12px' }}>{t('newCars.colors')}</h4>
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
                <h4 style={{ marginBottom: '12px' }}>{t('newCars.features')}</h4>
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
                {t('newCars.inquiryTitleContact')}
              </Button>
              <Button 
                size="large" 
                block
                icon={<CarOutlined />}
                onClick={handleTestDriveClick}
              >
                {t('newCars.inquiryTitleTestDrive')}
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
        title={actionModal === 'contact' ? t('newCars.inquiryTitleContact') : actionModal === 'testdrive' ? t('newCars.inquiryTitleTestDrive') : ''}
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
                ? t('newCars.inquiryIntroContact')
                : t('newCars.inquiryIntroTestDrive')}
            </p>
            <Form.Item
              name="name"
              label={t('newCars.inquiryName')}
              rules={[{ required: true, message: t('newCars.inquiryNameRequired') }]}
            >
              <Input 
                placeholder={t('newCars.inquiryNamePlaceholder')}
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={t('newCars.inquiryPhone')}
              rules={[{ required: true, message: t('newCars.inquiryPhoneRequired') }]}
            >
              <Input 
                placeholder={t('newCars.inquiryPhonePlaceholder')}
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={t('newCars.inquiryEmail')}
              rules={[{ required: true, message: t('newCars.inquiryEmailRequired') }]}
            >
              <Input 
                type="email"
                placeholder={t('newCars.inquiryEmailPlaceholder')}
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large">
                {actionModal === 'contact' ? t('newCars.inquirySubmitContact') : t('newCars.inquirySubmitTestDrive')}
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* 成功訊息模態框 */}
      <Modal
        title={t('newCars.inquirySuccessTitle')}
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
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{t('newCars.inquirySuccessBody')}</p>
          <p style={{ color: '#666', marginBottom: '16px' }}>{t('newCars.inquirySuccessSubtext')}</p>
          <Button type="primary" onClick={() => setActionModal(null)} block>
            {t('newCars.inquiryClose')}
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

export default NewCarsPage;
