import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageToggle.css';

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('tr') ? 'en' : 'tr';
    i18n.changeLanguage(nextLang);
  };

  const isTurkish = i18n.language.startsWith('tr');

  return (
    <button className="lang-toggle-btn" onClick={toggleLanguage} title="Change Language">
      <span className="lang-flag">{isTurkish ? '🇹🇷 TR' : '🇬🇧 EN'}</span>
    </button>
  );
};

export default LanguageToggle;