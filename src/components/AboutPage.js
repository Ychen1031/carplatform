import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/AboutPage.css';

function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="about-page">
      {/* 關於我們標題區 */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>{t('about.title')}</h1>
          <p className="hero-subtitle">{t('about.subtitle')}</p>
        </div>
      </section>

      {/* 公司介紹 */}
      <section className="about-intro">
        <div className="container">
          <h2>{t('about.storyTitle')}</h2>
          <p>{t('about.story1')}</p>
          <p>{t('about.story2')}</p>
        </div>
      </section>

      {/* 核心價值 */}
      <section className="about-values">
        <div className="container">
          <h2>{t('about.valuesTitle')}</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🔍</div>
              <h3>{t('about.transparent')}</h3>
              <p>所有車輛資訊完整披露，包括維修紀錄、事故史和真實里程，讓消費者做出最好的決定。</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🛡️</div>
              <h3>{t('about.quality')}</h3>
              <p>每台車都經過專業技師檢測，提供買家保障和退貨服務，讓購車更加放心。</p>
            </div>
            <div className="value-card">
              <div className="value-icon">💰</div>
              <h3>{t('about.fairPrice')}</h3>
              <p>採用國際評估標準，確保車輛價格合理，買家和賣家都能獲得最大價值。</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>{t('about.service')}</h3>
              <p>24/7 客戶支持團隊，從看車、試駕到成交，全程提供專業且親切的服務。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 關鍵數字 */}
      <section className="about-stats">
        <div className="container">
          <h2>{t('about.achievements')}</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">50,000+</div>
              <div className="stat-label">成功交易</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">活躍賣家</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">100+</div>
              <div className="stat-label">旗下展間</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">4.8/5</div>
              <div className="stat-label">客戶評分</div>
            </div>
          </div>
        </div>
      </section>

      {/* 推薦理由 */}
      <section className="about-reasons">
        <div className="container">
          <h2>{t('about.whyTitle')}</h2>
          <div className="reasons-list">
            <div className="reason-item">
              <span className="reason-number">01</span>
              <h3>最大的車源庫</h3>
              <p>超過 10,000 台認證好車，涵蓋所有主流品牌和價格範圍</p>
            </div>
            <div className="reason-item">
              <span className="reason-number">02</span>
              <h3>智能匹配系統</h3>
              <p>根據您的需求和預算，智能推薦最適合的車款</p>
            </div>
            <div className="reason-item">
              <span className="reason-number">03</span>
              <h3>完整的檢測報告</h3>
              <p>每台車都有詳細的 200+ 項檢測報告，掌握車況全貌</p>
            </div>
            <div className="reason-item">
              <span className="reason-number">04</span>
              <h3>便利的融資方案</h3>
              <p>與多家銀行合作，提供靈活的貸款和分期方案</p>
            </div>
            <div className="reason-item">
              <span className="reason-number">05</span>
              <h3>免費保修服務</h3>
              <p>購買後享受 3-6 個月的免費保修和道路救援</p>
            </div>
            <div className="reason-item">
              <span className="reason-number">06</span>
              <h3>交易保障承諾</h3>
              <p>提供交易保障金，確保交易安全，放心交易</p>
            </div>
          </div>
        </div>
      </section>

      {/* 聯絡方式 */}
      <section className="about-contact">
        <div className="container">
          <h2>{t('about.contactTitle')}</h2>
          <div className="contact-grid">
            <div className="contact-card">
              <h4>📞 電話</h4>
              <p>0800-888-888</p>
              <small>週一至週日 09:00-21:00</small>
            </div>
            <div className="contact-card">
              <h4>📧 電子郵件</h4>
              <p>support@haoche.tw</p>
              <small>24 小時內回覆</small>
            </div>
            <div className="contact-card">
              <h4>📍 實體展間</h4>
              <p>台北、新北、台中、台南等全台 100+ 家</p>
              <small>前往最近的展間洽詢</small>
            </div>
            <div className="contact-card">
              <h4>💬 線上客服</h4>
              <p>Facebook、Line 客服</p>
              <small>即時回應您的問題</small>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
