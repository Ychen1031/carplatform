import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Space } from 'antd';
import { LogoutOutlined, UserOutlined, HeartOutlined, CarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import logger from '../utils/logger';
import LanguageSwitcher from './LanguageSwitcher';
import '../styles/Header.css';

function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    const userData = localStorage.getItem('user');
    if (loggedInStatus === 'true' && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoginClick = () => {
    logger.click(t('header.login'), { currentPage: location.pathname });
  };

  const handleLogoClick = () => {
    logger.navigate(t('header.home'), location.pathname);
  };

  const handleNavigation = (pageName) => {
    logger.navigate(pageName, location.pathname);
  };

  const navMenus = [
    {
      key: 'home',
      label: t('header.home'),
      to: '/',
      groups: [
        {
          title: t('header.home'),
          items: [
            { label: t('hero.listings'), to: '/new-cars' },
            { label: t('hero.brands'), to: '/new-cars' },
            { label: t('hero.cities'), to: '/used-cars' },
            { label: t('footer.carArticles'), to: '/new-cars/articles' },
            { label: t('footer.carNews'), to: '/new-cars/news' },
          ],
        },
      ],
    },
    {
      key: 'new-cars',
      label: t('header.newCars'),
      to: '/new-cars',
      groups: [
        {
          title: t('header.newCars'),
          items: [
            { label: t('footer.modelLibrary'), to: '/new-cars' },
            { label: t('footer.carCompare'), to: '/new-cars' },
            { label: t('footer.carRanking'), to: '/used-cars' },
          ],
        },
      ],
    },
    {
      key: 'used-cars',
      label: t('header.usedCars'),
      to: '/used-cars',
      groups: [
        {
          title: t('header.usedCars'),
          items: [
            { label: t('footer.usedPurchase'), to: '/used-cars' },
            { label: t('footer.merchant'), to: '/used-cars' },
            { label: t('footer.pricing'), to: '/contact' },
            { label: t('footer.personalSale'), to: '/post' },
            { label: t('footer.selection'), to: '/used-cars' },
          ],
        },
      ],
    },
    {
      key: 'about',
      label: t('header.about'),
      to: '/about',
      groups: [
        {
          title: t('header.about'),
          items: [
            { label: t('about.title'), to: '/about' },
            { label: t('about.storyTitle'), to: '/about' },
            { label: t('about.valuesTitle'), to: '/about' },
            { label: t('about.achievements'), to: '/about' },
            { label: t('about.contactTitle'), to: '/contact' },
          ],
        },
      ],
    },
    {
      key: 'contact',
      label: t('header.contact'),
      to: '/contact',
      groups: [
        {
          title: t('header.contact'),
          items: [
            { label: t('contact.methods'), to: '/contact' },
            { label: t('contact.sendMessage'), to: '/contact' },
            { label: t('contact.faq'), to: '/contact' },
            { label: t('contact.replyTime'), to: '/contact' },
          ],
        },
      ],
    },
  ];

  const handlePostClick = () => {
    const isLoggedInNow = localStorage.getItem('isLoggedIn') === 'true';
    logger.navigate(t('header.freePost'), location.pathname);
    logger.click(t('header.freePost'));
    if (!isLoggedInNow) {
      navigate('/login');
      return;
    }
    navigate('/post');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setUser(null);
    logger.click(t('header.logout'));
    try { window.dispatchEvent(new Event('userChanged')); } catch (e) {}
    navigate('/');
  };

  const menuItems = [
    { key: 'my-listings', icon: <CarOutlined />, label: t('header.myListings'), to: '/my-listings' },
    { key: 'favorites', icon: <HeartOutlined />, label: t('header.favorites'), to: '/favorites' },
    { key: 'profile-edit', icon: <UserOutlined />, label: t('header.editProfile'), to: '/profile/edit' },
  ];

  const getInitial = () => (user?.name || user?.email || '?').slice(0, 1).toUpperCase();
  const getDisplayName = () => user?.name || user?.email || '';

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">

        {/* ── Logo ── */}
        <Link to="/" className="site-logo" onClick={handleLogoClick}>
          <img src="/car-logo.png" alt="好車平台 logo" className="site-logo-img" />
          <div className="site-logo-text">
            <span className="site-logo-name">{t('header.brandName')}</span>
            <span className="site-logo-tagline">{t('header.tagline')}</span>
          </div>
        </Link>

        {/* ── Nav ── */}
        <nav className="site-nav">
          {navMenus.map(menu => (
            <div key={menu.key} className="site-nav-item">
              <Link
                to={menu.to}
                className={`site-nav-link${isActive(menu.to) ? ' active' : ''}`}
                onClick={() => handleNavigation(menu.label)}
              >
                <span>{menu.label}</span>
                <span className="site-nav-caret">▾</span>
              </Link>

              <div className="site-nav-mega" aria-label={`${menu.label} submenu`}>
                <div className="site-nav-mega-grid">
                  {menu.groups.map((group) => (
                    <div key={group.title} className="site-nav-mega-group">
                      <div className="site-nav-mega-title">{group.title}</div>
                      <div className="site-nav-mega-links">
                        {group.items.map((item) => (
                          <Link
                            key={`${menu.key}-${item.label}`}
                            to={item.to}
                            className="site-nav-mega-link"
                            onClick={() => handleNavigation(item.label)}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        {/* ── Actions ── */}
        <Space size={10} className="site-actions">
          {isLoggedIn && user ? (
            <div className="profile-wrap" ref={menuRef}>
              <button
                className={`profile-trigger${menuOpen ? ' open' : ''}`}
                onClick={() => setMenuOpen(o => !o)}
              >
                <span className="profile-avatar">{getInitial()}</span>
                <span className="profile-trigger-text">{t('header.welcome', { name: getDisplayName() })}</span>
                <span className={`profile-caret${menuOpen ? ' open' : ''}`}>▾</span>
              </button>

              {menuOpen && (
                <div className="profile-menu">
                  <div className="profile-menu-header">
                    <div className="profile-menu-title">{getDisplayName()}</div>
                    <div className="profile-menu-email">{user.email}</div>
                  </div>

                  {menuItems.map(item => (
                    <Link
                      key={item.key}
                      to={item.to}
                      className="profile-menu-item"
                      onClick={() => { handleNavigation(item.label); setMenuOpen(false); }}
                    >
                      <span className="profile-menu-item-icon">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}

                  <button
                    className="profile-menu-item danger"
                    onClick={() => { setMenuOpen(false); handleLogout(); }}
                  >
                    <span className="profile-menu-item-icon"><LogoutOutlined /></span>
                    {t('header.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              className="btn-header-login"
              onClick={handleLoginClick}
            >
              <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>{t('header.login')}</Link>
            </Button>
          )}

          <LanguageSwitcher />

          <Button
            className="btn-header-post"
            onClick={handlePostClick}
          >
            {t('header.freePost')}
          </Button>
        </Space>

      </div>
    </header>
  );
}

export default Header;
