import { useTranslation } from 'react-i18next';

function HeroSection({ listingCount, brandCount, cityCount }) {
  const { t } = useTranslation();

  return (
    <header className="hero">
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-brand">
          <span className="hero-brand-dot" />
          <strong>{t('header.brandName')}</strong>
        </div>
        <p className="eyebrow">{t('hero.badge')}</p>
        <h1>{t('hero.title')}</h1>
        <p className="hero-copy">{t('hero.copy')}</p>
        <div className="hero-metrics">
          <div>
            <span>{listingCount}</span>
            <p>{t('hero.listings')}</p>
          </div>
          <div>
            <span>{brandCount}</span>
            <p>{t('hero.brands')}</p>
          </div>
          <div>
            <span>{cityCount}</span>
            <p>{t('hero.cities')}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeroSection;
