import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import '../styles/LoginPage.css';

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = t('login.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('login.validation.emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('login.validation.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('login.validation.passwordLength');
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = t('login.validation.nameRequired');
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = t('login.validation.confirmRequired');
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('login.validation.passwordMismatch');
      }
    }

    setErrors(newErrors);
    setSuccessMessage('');
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const base = 'http://localhost:3001';

      if (isLogin) {
        const res = await fetch(`${base}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrors({ submit: data.message || t('login.loginTitle') });
          setIsLoading(false);
          return;
        }

        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
        try { window.dispatchEvent(new Event('userChanged')); } catch (err) {}
        setSuccessMessage('');
        alert(t('login.loginSuccess'));
        navigate('/');
      } else {
        const res = await fetch(`${base}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password, name: formData.name })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrors({ submit: data.message || t('login.registerTitle') });
          setIsLoading(false);
          return;
        }

        setIsLogin(true);
        setFormData({
          email: formData.email,
          password: '',
          confirmPassword: '',
          name: ''
        });
        setErrors({});
        setSuccessMessage(t('login.registerSuccess'));
      }
    } catch (error) {
      setErrors({ submit: t('common.loading') });
    } finally {
      setIsLoading(false);
    }
  };

  const switchToRegister = (e) => {
    e.preventDefault();
    setIsLogin(false);
    setFormData({ email: '', password: '', confirmPassword: '', name: '' });
    setErrors({});
    setSuccessMessage('');
  };

  const switchToLogin = (e) => {
    e.preventDefault();
    setIsLogin(true);
    setFormData({ email: '', password: '', confirmPassword: '', name: '' });
    setErrors({});
    setSuccessMessage('');
  };

  const loginForm = (
    <Form
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
    >
      {successMessage && (
        <Alert message={successMessage} type="success" style={{ marginBottom: 16 }} closable />
      )}
      {errors.submit && (
        <Alert message={errors.submit} type="error" style={{ marginBottom: 16 }} closable />
      )}

      <Form.Item
        label={t('login.email')}
        validateStatus={errors.email ? 'error' : ''}
        help={errors.email}
      >
        <Input
          type="email"
          placeholder={t('login.emailPlaceholder')}
          disabled={isLoading}
          value={formData.email}
          onChange={handleInputChange}
          name="email"
          size="large"
        />
      </Form.Item>

      <Form.Item
        label={t('login.password')}
        validateStatus={errors.password ? 'error' : ''}
        help={errors.password}
      >
        <Input.Password
          placeholder={t('login.passwordPlaceholder')}
          disabled={isLoading}
          value={formData.password}
          onChange={handleInputChange}
          name="password"
          size="large"
        />
      </Form.Item>

      <Form.Item style={{ marginTop: 8 }}>
        <Button type="primary" htmlType="submit" block size="large" loading={isLoading}>
          {t('login.loginButton')}
        </Button>
      </Form.Item>
    </Form>
  );

  const registerForm = (
    <Form
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
    >
      {successMessage && (
        <Alert message={successMessage} type="success" style={{ marginBottom: 16 }} closable />
      )}
      {errors.submit && (
        <Alert message={errors.submit} type="error" style={{ marginBottom: 16 }} closable />
      )}

      <Form.Item
        label={t('login.name')}
        validateStatus={errors.name ? 'error' : ''}
        help={errors.name}
      >
        <Input
          placeholder={t('login.namePlaceholder')}
          disabled={isLoading}
          value={formData.name}
          onChange={handleInputChange}
          name="name"
          size="large"
        />
      </Form.Item>

      <Form.Item
        label={t('login.email')}
        validateStatus={errors.email ? 'error' : ''}
        help={errors.email}
      >
        <Input
          type="email"
          placeholder={t('login.emailPlaceholder')}
          disabled={isLoading}
          value={formData.email}
          onChange={handleInputChange}
          name="email"
          size="large"
        />
      </Form.Item>

      <Form.Item
        label={t('login.password')}
        validateStatus={errors.password ? 'error' : ''}
        help={errors.password}
      >
        <Input.Password
          placeholder={t('login.passwordPlaceholder')}
          disabled={isLoading}
          value={formData.password}
          onChange={handleInputChange}
          name="password"
          size="large"
        />
      </Form.Item>

      <Form.Item
        label={t('login.confirmPassword')}
        validateStatus={errors.confirmPassword ? 'error' : ''}
        help={errors.confirmPassword}
      >
        <Input.Password
          placeholder={t('login.confirmPasswordPlaceholder')}
          disabled={isLoading}
          value={formData.confirmPassword}
          onChange={handleInputChange}
          name="confirmPassword"
          size="large"
        />
      </Form.Item>

      <Form.Item style={{ marginTop: 8 }}>
        <Button type="primary" htmlType="submit" block size="large" loading={isLoading}>
          {t('login.registerButton')}
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card-wrapper">
          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              border: 'none'
            }}
          >
            {isLogin ? (
              <>
                <h2 className="login-title">{t('login.loginTitle')}</h2>
                {loginForm}
                <div className="login-footer-text">
                  <span>{t('login.noAccount')}</span>
                  <a href="#register" onClick={switchToRegister}>{t('login.registerNow')}</a>
                </div>
              </>
            ) : (
              <>
                <h2 className="login-title">{t('login.registerTitle')}</h2>
                {registerForm}
                <div className="login-footer-text">
                  <span>{t('login.alreadyAccount')}</span>
                  <a href="#login" onClick={switchToLogin}>{t('login.signIn')}</a>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
