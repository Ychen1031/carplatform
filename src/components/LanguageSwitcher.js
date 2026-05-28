import { Select } from 'antd';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const options = [
    { value: 'zh-TW', label: t('language.zhTw') },
    { value: 'en', label: t('language.en') },
    { value: 'ja', label: t('language.ja') },
  ];

  return (
    <Select
      size="small"
      value={i18n.language}
      options={options}
      onChange={(value) => i18n.changeLanguage(value)}
      aria-label={t('header.language')}
      style={{ minWidth: 108 }}
    />
  );
}

export default LanguageSwitcher;
