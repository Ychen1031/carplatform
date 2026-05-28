import { Card, Form, Input, Select, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { CITY_KEY_MAP } from '../utils/localeMaps';

function FiltersPanel({
  filters,
  onFilterChange,
  allBrands,
  allCities,
  sortBy,
  onSortChange,
}) {
  const { t, i18n } = useTranslation();

  const localizeCity = (city) => {
    if (!city) return t('common.all');
    const key = CITY_KEY_MAP[city] || city;
    const result = t(`cities.${key}`, { defaultValue: city });
    console.log('[FiltersPanel] localizeCity:', { city, key, result, lang: i18n.language });
    return result;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({
      target: { name, value }
    });
  };

  const handleSelectChange = (name) => (value) => {
    onFilterChange({
      target: { name, value }
    });
  };

  const handleSortChange = (value) => {
    onSortChange({
      target: { value }
    });
  };

  return (
    <Card 
      title={t('filters.title')} 
      style={{ marginBottom: '24px' }}
      headStyle={{ borderBottom: '1px solid #f0f0f0' }}
    >
      <Form layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label={t('filters.keyword')}>
              <Input
                name="keyword"
                value={filters.keyword}
                onChange={handleFilterChange}
                placeholder={t('filters.keywordPlaceholder')}
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item label={t('filters.maxPrice')}>
              <Input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder={t('filters.maxPricePlaceholder')}
                allowClear
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item label={t('filters.minYear')}>
              <Input
                type="number"
                name="minYear"
                value={filters.minYear}
                onChange={handleFilterChange}
                placeholder={t('filters.minYearPlaceholder')}
                allowClear
              />
            </Form.Item>
          </Col>

                <Col xs={24} sm={12} md={8}>
            <Form.Item label={t('filters.brand')}>
              <Select
                name="brand"
                value={filters.brand}
                onChange={handleSelectChange('brand')}
                options={[{ value: '', label: t('common.all') }, ...allBrands.map(brand => ({ value: brand, label: brand }))]}
              />
            </Form.Item>
          </Col>

            <Col xs={24} sm={12} md={8}>
            <Form.Item label={t('filters.city')}>
              <Select
                name="city"
                value={filters.city}
                onChange={handleSelectChange('city')}
                options={[{ value: '', label: t('common.all') }, ...allCities.map(city => ({ value: city, label: localizeCity(city) }))]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item label={t('filters.sort')}>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                options={[
                  { value: 'price-asc', label: t('filters.sortPriceAsc') },
                  { value: 'year-desc', label: t('filters.sortYearDesc') },
                  { value: 'mileage-asc', label: t('filters.sortMileageAsc') }
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

export default FiltersPanel;
