import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/ContactPage.css';

function ContactPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 驗證表單
    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      alert(t('contact.validation'));
      return;
    }
    const postToUrl = (url) => {
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.success) {
            setSubmitStatus('success');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            setTimeout(() => setSubmitStatus(null), 3000);
          } else if (data && data.message && data.message.includes('已儲存到本機資料庫')) {
            setSubmitStatus('success');
            alert(t('contact.submitFail'));
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            setTimeout(() => setSubmitStatus(null), 3000);
          } else {
            throw new Error(data && data.error ? data.error : (data && data.message) || '未知錯誤');
          }
        });
    };

    // 一律送到本機後端，由後端代轉到 Google Apps Script，避免瀏覽器 CORS
    postToUrl('http://localhost:3001/api/messages').catch(err => {
      console.error('送出訊息失敗', err);
      alert(t('contact.submitFail'));
    });
  };

  return (
    <div className="contact-page">
      {/* 聯絡我們標題區 */}
      <section className="contact-hero">
        <div className="hero-content">
          <h1>{t('contact.title')}</h1>
          <p className="hero-subtitle">{t('contact.subtitle')}</p>
        </div>
      </section>

      {/* 主要聯絡區域 */}
      <section className="contact-main">
        <div className="container">
          <div className="contact-wrapper">
            {/* 左側：聯絡資訊 */}
            <div className="contact-info-section">
              <h2>{t('contact.methods')}</h2>

              <div className="info-cards">
                <div className="info-card">
                  <div className="info-icon">📞</div>
                  <h3>{t('contact.phone')}</h3>
                  <p className="info-content">07-381-4526</p>
                  <p className="info-subtext">週一至週五 09:00 - 18:00</p>
                </div>

                <div className="info-card">
                  <div className="info-icon">📧</div>
                  <h3>{t('contact.email')}</h3>
                  <p className="info-content">vhoffice01@nkust.edu.tw</p>
                  <p className="info-subtext">24 小時內回覆</p>
                </div>

                <div className="info-card">
                  <div className="info-icon">📍</div>
                  <h3>辦公室地址</h3>
                  <p className="info-content">824 高雄市燕巢區深中路 58 號</p>
                  <p className="info-subtext">高科大燕巢校區</p>
                </div>

                <div className="info-card">
                  <div className="info-icon">⏰</div>
                  <h3>營業時間</h3>
                  <p className="info-content">週一至週日 09:00 - 18:00</p>
                  <p className="info-subtext">假日照常營業</p>
                </div>
              </div>
            </div>

            {/* 右側：嵌入 Google 表單 或 回退本地表單 */}
            <div className="contact-form-section">
              <h2>{t('contact.sendMessage')}</h2>
              {submitStatus === 'success' && (
                <div className="success-banner">
                  <p>{t('contact.success')}</p>
                </div>
              )}

              {/*
                將下面的 GOOGLE_FORM_EMBED_URL 替換為您 Google 表單的 embed url。
                範例: https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true
              */}
              {(() => {
                const GOOGLE_FORM_EMBED_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true';
                if (GOOGLE_FORM_EMBED_URL && !GOOGLE_FORM_EMBED_URL.includes('YOUR_FORM_ID')) {
                  return (
                    <div className="google-form-embed">
                      <iframe
                        title="Google Form"
                        src={GOOGLE_FORM_EMBED_URL}
                        width="100%"
                        height="700"
                        frameBorder="0"
                        marginHeight="0"
                        marginWidth="0"
                      >{t('contact.formPlaceholderMessage')}</iframe>
                      <p className="embed-note">若無法顯示，請點此在新分頁開啟： <a href={GOOGLE_FORM_EMBED_URL} target="_blank" rel="noreferrer">開啟 Google 表單</a></p>
                    </div>
                  );
                }

                // 回退：原生表單（仍保留，當未設定或為測試用）
                return (
                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group">
                      <label htmlFor="name">{t('contact.name')}</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t('contact.formPlaceholderName')}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="email">{t('contact.email')}</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder={t('contact.formPlaceholderEmail')}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="phone">{t('contact.phone')}</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder={t('contact.formPlaceholderPhone')}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="subject">{t('contact.subject')}</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="">{t('contact.formSelectSubject')}</option>
                        <option value="purchase">{t('contact.optionPurchase')}</option>
                        <option value="sell">{t('contact.optionSell')}</option>
                        <option value="feedback">{t('contact.optionFeedback')}</option>
                        <option value="complaint">{t('contact.optionComplaint')}</option>
                        <option value="other">{t('contact.optionOther')}</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">{t('contact.message')}</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder={t('contact.formPlaceholderMessage')}
                        rows="6"
                        required
                      ></textarea>
                    </div>

                    <button type="submit" className="btn-submit">
                      {t('contact.sendMessage')}
                    </button>
                  </form>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* 常見問題 */}
      <section className="contact-faq">
        <div className="container">
          <h2>{t('contact.faq')}</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>{t('contact.replyTime')}</h3>
              <p>{t('contact.replyTimeAnswer')}</p>
            </div>
            <div className="faq-item">
              <h3>包含什麼服務？</h3>
              <p>聯絡我們可用於任何與購車、出售或平台相關的問題。</p>
            </div>
            <div className="faq-item">
              <h3>假日是否營業？</h3>
              <p>是的，我們假日照常營業。週一至週日上午 9 點至下午 6 點。</p>
            </div>
            <div className="faq-item">
              <h3>是否可以電話預約？</h3>
              <p>可以。請擊打 07-381-4526 以預約試駕或看車時間。</p>
            </div>
            <div className="faq-item">
              <h3>提供停車位嗎？</h3>
              <p>是的，校區內有停車場。提供訪客停車位。</p>
            </div>
            <div className="faq-item">
              <h3>公司位置方便嗎？</h3>
              <p>是的，位於高科大燕巢校區，交通便利。鄰近國道 1 號中山高速公路。</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
