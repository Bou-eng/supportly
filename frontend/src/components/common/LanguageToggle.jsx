import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageToggle.css';

const LanguageToggle = () => {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'tr', label: 'TR' },
  ];
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const currentIndex = languages.findIndex((language) => language.code === currentLanguage);
  const activeLanguage = languages[currentIndex] || languages[0];

  const toggleLanguage = () => {
    const nextLanguage = languages[(currentIndex + 1) % languages.length] || languages[0];
    i18n.changeLanguage(nextLanguage.code);
  };

  return (
    <button className="lang-toggle-btn" onClick={toggleLanguage} title={t('common.changeLanguage')}>
      <span className="lang-flag">{activeLanguage.label}</span>
    </button>
  );
};

export default LanguageToggle;
