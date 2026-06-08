import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Col, Input, Row, Select, Space, Tag } from 'antd';
import { FileTextOutlined, FireOutlined, SearchOutlined, SyncOutlined, LinkOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import '../styles/CarInsightsPage.css';

const PAGE_CONFIG = {
  articles: {
    titleKey: 'newCars.articlesPageTitle',
    subtitleKey: 'newCars.articlesPageSubtitle',
    toggleLabelKey: 'newCars.pageSwitchNews',
    toggleTo: '/new-cars/news',
    toggleIcon: <FireOutlined />,
    countKey: 'newCars.articlesCount',
    emptyKey: 'newCars.articleEmpty',
    emptyTipKey: 'newCars.articleEmptyTip',
  },
  news: {
    titleKey: 'newCars.newsPageTitle',
    subtitleKey: 'newCars.newsPageSubtitle',
    toggleLabelKey: 'newCars.pageSwitchArticles',
    toggleTo: '/new-cars/articles',
    toggleIcon: <FileTextOutlined />,
    countKey: 'newCars.newsCount',
    emptyKey: 'newCars.newsEmpty',
    emptyTipKey: 'newCars.newsEmptyTip',
  },
};

function normalizeFetchedItem(item, variant) {
  const category = item.category || (variant === 'articles' ? 'buying-guide' : 'market');
  const summary = item.summary || (Array.isArray(item.content) && item.content[0]) || item.title || '';

  return {
    ...item,
    category,
    summary,
    source: item.source || (variant === 'articles' ? 'News' : 'News'),
    date: item.date || '',
    tags: Array.isArray(item.tags) ? item.tags : [],
    content: Array.isArray(item.content) && item.content.length > 0 ? item.content.filter(Boolean) : [summary],
  };
}

const CATEGORY_ZH = {
  'powertrain': '動力系統',
  'ownership': '用車心得',
  'test-drive': '試駕評測',
  'buying-guide': '購車指南',
  'market': '市場資訊',
  'safety': '安全科技',
  'ev': '電動車',
  'electric': '電動車',
  'suv': 'SUV',
  'sedan': '轎車',
  'comparison': '比較評測',
  'industry': '產業動態',
  'launch': '新車發表',
  'recall': '召回公告',
  'policy': '法規政策',
};

const localizeCategory = (value) => CATEGORY_ZH[value] || value;

function CarInsightsPage({ variant }) {
  const { t } = useTranslation();
  const config = PAGE_CONFIG[variant] || PAGE_CONFIG.articles;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [newsDate, setNewsDate] = useState('');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('all');
  const [clickedButton, setClickedButton] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadInsights = async () => {
      setLoading(true);
      setLoadError('');

      try {
        const response = await fetch(`http://localhost:3001/api/car-insights?type=${encodeURIComponent(variant)}`);
        if (!response.ok) throw new Error(`伺服器錯誤 (${response.status})`);
        const result = await response.json();
        if (!result.success || !Array.isArray(result.items)) {
          throw new Error(result?.message || '載入失敗');
        }

        if (!cancelled) {
          setItems(result.items.map((item) => normalizeFetchedItem(item, variant)));
          if (result.date) setNewsDate(result.date);
        }
      } catch (error) {
        if (!cancelled) {
          setItems([]);
          // Only show user-friendly errors, not raw JSON parse errors
          const msg = error.message && !error.message.includes('token') ? error.message : '無法連線到新聞伺服器，請稍後再試';
          setLoadError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInsights();

    return () => {
      cancelled = true;
    };
  }, [variant]);

  const categories = useMemo(() => {
    const values = [...new Set(items.map((item) => item.category))];
    return [{ value: 'all', label: t('common.all') }, ...values.map((value) => ({ value, label: localizeCategory(value) }))];
  }, [items, t]);

  const filteredItems = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery =
        query.length === 0 ||
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        item.source.toLowerCase().includes(query);
      const matchesCategory = category === 'all' || item.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, items, keyword]);

  const featuredTags = useMemo(() => {
    const counts = new Map();
    filteredItems.forEach((item) => {
      item.tags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);
  }, [filteredItems]);

  return (
    <div className="car-insights-page">
      <section className="car-insights-hero">
        <div className="car-insights-hero-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <Tag color="red" style={{ fontWeight: 600, fontSize: 13 }}>
              Yahoo 汽機車
            </Tag>
            {newsDate && (
              <Tag icon={<SyncOutlined />} color="blue" style={{ fontSize: 12 }}>
                今日更新 {newsDate}
              </Tag>
            )}
          </div>
          <h1>{t(config.titleKey)}</h1>
          <p>{t(config.subtitleKey)}</p>
          {loadError ? <p className="car-insights-hero-note" style={{ color: '#faad14', fontSize: 13 }}>{loadError}</p> : null}
          <Space className="car-insights-switcher" size={12} wrap>
            <Link to="/new-cars/articles">
              <Button
                className={`car-insights-switch-btn${clickedButton === 'articles' ? ' is-clicked' : ''}`}
                icon={<FileTextOutlined />}
                type={variant === 'articles' ? 'primary' : 'default'}
                onMouseDown={() => { setClickedButton('articles'); setTimeout(() => setClickedButton(null), 180); }}
              >
                {t('newCars.pageSwitchArticles')}
              </Button>
            </Link>
            <Link to="/new-cars/news">
              <Button
                className={`car-insights-switch-btn${clickedButton === 'news' ? ' is-clicked' : ''}`}
                icon={<FireOutlined />}
                type={variant === 'news' ? 'primary' : 'default'}
                onMouseDown={() => { setClickedButton('news'); setTimeout(() => setClickedButton(null), 180); }}
              >
                {t('newCars.pageSwitchNews')}
              </Button>
            </Link>
            {/* 已移除回新車展示按鈕 */}
          </Space>
        </div>
      </section>

      <section className="car-insights-toolbar">
        <div className="car-insights-toolbar-inner">
          <Input
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t('newCars.searchContentPlaceholder')}
            allowClear
            className="car-insights-search"
          />
          <Select
            value={category}
            onChange={setCategory}
            options={categories}
            className="car-insights-select"
          />
        </div>
      </section>

      <section className="car-insights-content">
        <div className="car-insights-layout">
          <div className="car-insights-main">
            <div className="car-insights-section-head">
              <div>
                <h2>{t(config.countKey, { count: filteredItems.length })}</h2>
                <p>{variant === 'articles' ? t('newCars.featuredTags') : t('newCars.detailTitle')}</p>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <Card className="car-insights-empty">
                {loading ? <p>{t('common.loading')}</p> : null}
                <h3>{t(config.emptyKey)}</h3>
                <p>{t(config.emptyTipKey)}</p>
              </Card>
            ) : (
              <Row gutter={[16, 16]}>
                {filteredItems.map((item) => (
                  <Col key={item.id} xs={24} sm={12} lg={8}>
                    <Card
                      className={`car-insights-card${item.isYahoo ? ' car-insights-card--yahoo' : ''}`}
                      hoverable
                      onClick={() => (item.url || item.link) && window.open(item.url || item.link, '_blank', 'noopener')}
                      style={{ cursor: (item.url || item.link) ? 'pointer' : 'default' }}
                    >
                      <div className="car-insights-card-topline">
                        <Tag color={variant === 'articles' ? 'volcano' : 'geekblue'}>{localizeCategory(item.category)}</Tag>
                        {item.isYahoo && (
                          <Tag color="red" style={{ fontWeight: 600 }}>Yahoo 汽機車</Tag>
                        )}
                        <span className="car-insights-card-meta">
                          {item.source} · {item.date ? new Date(item.date).toLocaleDateString('zh-TW') : ''}
                          {(item.url || item.link) && <LinkOutlined style={{ marginLeft: 6, opacity: 0.45, fontSize: 11 }} />}
                        </span>
                      </div>
                      <h3>{item.title}</h3>
                      <p className="car-insights-summary">{item.summary}</p>
                      <Space wrap>
                        {item.tags.map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>

          <aside className="car-insights-sidebar">
            <Card title={t('newCars.featuredTags')} className="car-insights-sidebar-card">
              <div className="car-insights-tag-cloud">
                {featuredTags.length > 0 ? featuredTags.map((tag) => <Tag key={tag}>{tag}</Tag>) : <span>—</span>}
              </div>
            </Card>
            <Card title={t('newCars.detailTitle')} className="car-insights-sidebar-card">
              <div className="car-insights-side-copy">
                <p>{variant === 'articles' ? t('newCars.articleEmptyTip') : t('newCars.newsEmptyTip')}</p>
                <p>{variant === 'articles' ? t('newCars.pageSwitchNews') : t('newCars.pageSwitchArticles')}</p>
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default CarInsightsPage;
