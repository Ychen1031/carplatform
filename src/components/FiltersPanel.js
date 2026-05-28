import { Card, Form, Input, Select, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

function FiltersPanel({
  filters,
  onFilterChange,
  allBrands,
  allCities,
  sortBy,
  onSortChange,
}) {
  const { t } = useTranslation();

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
                options={allBrands.map(brand => ({
                  value: brand,
                  label: brand
                }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item label={t('filters.city')}>
              <Select
                name="city"
                value={filters.city}
                onChange={handleSelectChange('city')}
                options={allCities.map(city => ({
                  value: city,
                  label: city
                }))}
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
