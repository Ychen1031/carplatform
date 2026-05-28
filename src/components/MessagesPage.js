import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/MessagesPage.css';

function MessagesPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/messages')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessages(data.messages || []);
        } else {
          setError(data.message || t('messages.errorLoad'));
        }
      })
      .catch(err => setError(t('messages.errorConnect')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="messages-page">
      <div className="container">
        <h1>{t('messages.title')}</h1>
        {loading && <p>{t('messages.loading')}</p>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && (
          <div className="messages-table">
            <table>
              <thead>
                <tr>
                  <th>{t('messages.time')}</th>
                  <th>{t('messages.name')}</th>
                  <th>{t('messages.email')}</th>
                  <th>{t('messages.phone')}</th>
                  <th>{t('messages.subject')}</th>
                  <th>{t('messages.message')}</th>
                </tr>
              </thead>
              <tbody>
                {messages.map(msg => (
                  <tr key={msg.id}>
                    <td>{new Date(msg.created_at).toLocaleString()}</td>
                    <td>{msg.name}</td>
                    <td>{msg.email}</td>
                    <td>{msg.phone}</td>
                    <td>{msg.subject}</td>
                    <td className="message-cell">{msg.message}</td>
                  </tr>
                ))}
                {messages.length === 0 && (
                  <tr>
                    <td colSpan="6">{t('messages.empty')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessagesPage;
