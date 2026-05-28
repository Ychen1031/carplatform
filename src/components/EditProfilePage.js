import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/EditProfilePage.css';

function EditProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!userData || !isLoggedIn) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: ''
    });
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (!user.id) {
      setError(t('messages.errorLoad'));
      return;
    }

    if (!formData.email) {
      setError(t('login.validation.emailRequired'));
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError(t('login.validation.passwordLength'));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`http://localhost:3001/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || t('editProfile.updated'));
        setIsLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      setMessage(t('editProfile.updated'));
      setFormData((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setError(t('messages.errorConnect'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-container">
        <div className="edit-profile-card">
          <h1>{t('editProfile.title')}</h1>

          <form onSubmit={handleSubmit} className="edit-profile-form">
            <div className="form-group email-display">
              <label>{t('editProfile.email')}</label>
              <div className="email-value">{formData.email}</div>
            </div>

            <div className="form-group">
              <label htmlFor="name">{t('editProfile.name')}</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('login.namePlaceholder')}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('editProfile.password')}</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t('editProfile.passwordPlaceholder')}
                disabled={isLoading}
              />
            </div>

            {error && <div className="status error">{error}</div>}
            {message && <div className="status success">{message}</div>}

            <div className="actions">
              <button type="submit" disabled={isLoading}>
                {isLoading ? t('editProfile.saving') : t('editProfile.save')}
              </button>
              <button type="button" className="secondary" onClick={() => navigate('/')} disabled={isLoading}>
                {t('editProfile.backHome')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfilePage;
