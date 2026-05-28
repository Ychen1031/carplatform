import { Row, Col, Card, Button, Tag, Space, Empty } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

function ListingsPanel({ filteredListings, activeContactId, onToggleContact }) {
  const { t, i18n } = useTranslation();

  const fuelLabelMap = {
    Gasoline: '汽油',
    Diesel: '柴油',
    Hybrid: '油電',
    EV: '純電',
  };

  const transmissionLabelMap = {
    AT: '自排',
    MT: '手排',
    CVT: 'CVT',
    'Single Speed': '單速',
  };

  const numberFormat = new Intl.NumberFormat(i18n.language);

  return (
    <section aria-label="車源列表" style={{ padding: '24px 0' }}>
      {/* 標題區 */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>{t('listings.title')}</h2>
        <p style={{ color: '#666', margin: 0 }}>{t('listings.results', { count: filteredListings.length })}</p>
      </div>

      {/* 空狀態 */}
      {filteredListings.length === 0 ? (
        <Empty
          description={t('listings.empty')}
          style={{ margin: '48px 0' }}
        >
          <p style={{ color: '#999' }}>{t('listings.emptyTip')}</p>
        </Empty>
      ) : (
        /* 卡片網格 */
        <Row gutter={[24, 24]}>
          {filteredListings.map((car) => {
            // 調試：輸出所有 ID 以檢查重複項
            const isDuplicate = filteredListings.filter(c => c.id === car.id).length > 1;
            if (isDuplicate) {
              console.warn(`[ListingsPanel] ⚠️ 重複 ID: ${car.id}`, car);
            }
            
            return (
              <Col key={car.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    <div style={{ 
                      position: 'relative', 
                      width: '100%', 
                      paddingBottom: '62.5%', 
                      overflow: 'hidden',
                      backgroundColor: '#f0f0f0'
                    }}>
                      <img 
                        src={car.image} 
                        alt={car.title} 
                        loading="lazy"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  }
                  style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                  bodyStyle={{
                    padding: '12px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* 標題和價格 */}
                  <div style={{ marginBottom: '8px' }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', lineHeight: 1.3 }}>
                      {car.title}
                    </h3>
                    <strong style={{ color: '#d9863d', fontSize: '1.1rem' }}>
                      NT$ {numberFormat.format(car.price)}
                    </strong>
                  </div>

                  {/* 規格 */}
                  <div style={{ marginBottom: '12px' }}>
                    <Space wrap size={4}>
                      <Tag size="small">{t('listings.year')} {car.year}</Tag>
                      <Tag size="small">{t('listings.mileage')} {numberFormat.format(car.mileage)} km</Tag>
                      <Tag size="small">{fuelLabelMap[car.fuel] || car.fuel}</Tag>
                      <Tag size="small">{transmissionLabelMap[car.transmission] || car.transmission}</Tag>
                      <Tag size="small">{car.city}</Tag>
                    </Space>
                  </div>

                  {/* 賣家 */}
                  <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: '#666' }}>
                    {t('listings.seller')}：{car.seller}
                  </div>

                  {/* 操作按鈕 */}
                  <Button
                    type="primary"
                    icon={<PhoneOutlined />}
                    onClick={() => onToggleContact(car.id)}
                    block
                    size="small"
                    style={{ marginTop: 'auto' }}
                  >
                    {activeContactId === car.id ? t('listings.hideContact') : t('listings.showContact')}
                  </Button>

                  {/* 聯絡電話 */}
                  {activeContactId === car.id && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      backgroundColor: '#fafafa',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      color: '#333',
                      textAlign: 'center'
                    }}>
                      <strong>{t('listings.phone')}：{car.phone}</strong>
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </section>
  );
}

export default ListingsPanel;
