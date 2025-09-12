import React, { useState } from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 dark:from-slate-700 dark:to-slate-600 hover:from-amber-200 hover:to-amber-300 dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group"
        title={t('language.select')}
      >
        <div className="flex items-center space-x-1">
          <Languages className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
            {currentLanguage?.flag}
          </span>
          <ChevronDown className={`h-3 w-3 text-amber-600 dark:text-amber-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-luxury border border-neutral-200/50 dark:border-slate-600/50 py-2 z-50 animate-slide-up">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code as 'fr' | 'en');
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-amber-50 dark:hover:bg-slate-700 transition-all duration-200 ${
                language === lang.code 
                  ? 'bg-amber-50 dark:bg-slate-700 text-amber-700 dark:text-amber-300' 
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;