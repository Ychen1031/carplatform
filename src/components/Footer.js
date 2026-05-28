import React from 'react';
import { Layout, Row, Col, Divider, Space, Tag } from 'antd';
import '../styles/Footer.css';

function Footer() {
  const footerLinkStyle = { color: 'rgba(0,0,0,0.65)', textDecoration: 'none' };
  const footerLinkHoverStyle = { color: '#d9863d' };

  const FooterLink = ({ href, children }) => (
    <a 
      href={href}
      style={footerLinkStyle}
      onMouseEnter={(e) => e.target.style.color = footerLinkHoverStyle.color}
      onMouseLeave={(e) => e.target.style.color = footerLinkStyle.color}
    >
      {children}
    </a>
  );

  return (
    <Layout.Footer style={{ background: '#fafafa', padding: '48px 24px 24px' }}>
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={12} md={6}>
          <h3 style={{ marginBottom: '16px', fontWeight: 600 }}>新車</h3>
          <Space direction="vertical" style={{ width: '100%' }}>
            <FooterLink href="#models">車型大全</FooterLink>
            <FooterLink href="#articles">汽車文章</FooterLink>
            <FooterLink href="#news">汽車新聞</FooterLink>
            <FooterLink href="#compare">車型對比</FooterLink>
            <FooterLink href="#ranking">汽車排行</FooterLink>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <h3 style={{ marginBottom: '16px', fontWeight: 600 }}>中古車</h3>
          <Space direction="vertical" style={{ width: '100%' }}>
            <FooterLink href="#used">購置中古車</FooterLink>
            <FooterLink href="#merchant">中古車商</FooterLink>
            <FooterLink href="#price">收費標準</FooterLink>
            <FooterLink href="#personal">個人賣車</FooterLink>
            <FooterLink href="#selection">嚴選中古車</FooterLink>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <h3 style={{ marginBottom: '16px', fontWeight: 600 }}>聯絡我們</h3>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              <strong>電話</strong>: 02-1234-5678
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              (週一至週日 09:00-18:00)
            </div>
            <div>
              <strong>傳真</strong>: 02-1234-5679
            </div>
            <div>
              <strong>信箱</strong>: Service@goodcar.com.tw
            </div>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <h3 style={{ marginBottom: '16px', fontWeight: 600 }}>其他服務</h3>
          <Space direction="vertical" style={{ width: '100%' }}>
            <FooterLink href="#investment">投資者專區</FooterLink>
            <FooterLink href="#about">關於我們</FooterLink>
            <FooterLink href="#social">社會公益</FooterLink>
            <FooterLink href="#privacy">隱私權聲明</FooterLink>
            <FooterLink href="#terms">服務條款</FooterLink>
          </Space>
        </Col>
      </Row>

      <Divider style={{ margin: '24px 0' }} />

      <Row justify="space-between" align="middle" gutter={16}>
        <Col xs={24} sm={12}>
          <p style={{ margin: 0, color: 'rgba(0,0,0,0.65)', fontSize: '12px' }}>
            Copyright © 2024-2026 by Good Car Technology Co., Ltd. All Rights reserved.
          </p>
        </Col>
        <Col xs={24} sm={12}>
          <Space wrap justify="flex-end">
            <Tag color="gold">🏅 認證平台</Tag>
            <Tag>✓ SGS</Tag>
            <Tag color="green">🌍 環保認證</Tag>
          </Space>
        </Col>
      </Row>
    </Layout.Footer>
  );
}

export default Footer;
