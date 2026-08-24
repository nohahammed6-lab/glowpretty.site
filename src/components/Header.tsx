import React, { useState } from 'react';
import { ViewMode, Language, SiteSettings } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme?: 'light' | 'dark';
  setTheme?: (theme: 'light' | 'dark') => void;
  onBookNowClick: () => void;
  onAdminLoginClick: (tab: 'owner' | 'supervisor') => void;
  siteSettings: SiteSettings;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  language,
  setLanguage,
  theme = 'light',
  setTheme,
  onBookNowClick,
  onAdminLoginClick,
  siteSettings,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isArabic = language === 'ar';

  const toggleLanguage = () => {
    setLanguage(isArabic ? 'en' : 'ar');
  };

  const toggleTheme = () => {
    if (setTheme) {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  const navTo = (target: 'home' | 'booking' | 'gallery' | 'about' | 'contact') => {
    setSidebarOpen(false);
    if (target === 'home') {
      setViewMode('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'booking') {
      setViewMode('booking');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (viewMode !== 'home') {
        setViewMode('home');
        setTimeout(() => {
          document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FFFDF5]/95 backdrop-blur-md border-b border-[#D4AF37]/40 shadow-sm transition-all duration-300">
        <nav className="flex justify-between items-center px-2.5 sm:px-4 md:px-8 py-2.5 sm:py-3.5 w-full max-w-7xl mx-auto gap-1 sm:gap-3">
          
          {/* Left / Start: Side Menu Toggle + Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 sm:p-2 rounded-full text-[#121212] hover:bg-[#121212]/10 transition-colors cursor-pointer shrink-0"
              title={isArabic ? 'افتح القائمة الجانبية' : 'Open Sidebar Menu'}
            >
              <span className="material-symbols-outlined text-2xl">
                menu
              </span>
            </button>

            {/* Brand Logo & Qatar Badge */}
            <div 
              onClick={() => navTo('home')}
              className="cursor-pointer group flex items-center gap-1.5 sm:gap-2 min-w-0"
            >
              <span className="font-display text-base xs:text-lg sm:text-2xl md:text-3xl font-extrabold text-[#121212] tracking-tight group-hover:text-[#333333] transition-colors truncate">
                GLOW PRETTY
              </span>
              <span className="hidden xs:flex bg-[#121212] text-[#D4AF37] border border-[#D4AF37]/60 text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full tracking-wider items-center gap-0.5 sm:gap-1 shadow-2xs shrink-0">
                <span>🇶🇦</span>
                <span>{isArabic ? 'قطر' : 'QATAR'}</span>
              </span>
            </div>
          </div>

          {/* Right Actions: Clean Language Switcher + Theme Toggle + Sleek Book Button */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
            {/* High-Contrast Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-full text-[#121212] hover:bg-[#121212]/10 dark:text-[#FFFDF0] dark:hover:bg-white/10 transition-all cursor-pointer border border-[#D4AF37]/40 flex items-center justify-center bg-white/60 shadow-2xs"
              title={theme === 'dark' ? (isArabic ? 'تفعيل المظهر الفاتح' : 'Switch to Light Mode') : (isArabic ? 'تفعيل المظهر الداكن' : 'Switch to Dark Mode')}
            >
              <span className="material-symbols-outlined text-lg sm:text-xl text-[#D4AF37]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Language Switch Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#121212] hover:bg-[#121212]/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all cursor-pointer border border-[#D4AF37]/30 whitespace-nowrap"
              title={isArabic ? 'Switch to English' : 'التحويل للغة العربية'}
            >
              <span className="material-symbols-outlined text-sm sm:text-base text-[#D4AF37]">language</span>
              <span className="font-extrabold hidden sm:inline">{isArabic ? 'English' : 'العربية'}</span>
              <span className="font-extrabold sm:hidden">{isArabic ? 'EN' : 'عربي'}</span>
            </button>

            {/* Sleek Fancy Book Button */}
            <button
              onClick={onBookNowClick}
              className="btn-black px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full font-extrabold text-[11px] sm:text-xs md:text-sm flex items-center gap-1 sm:gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all border border-[#D4AF37] whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-sm sm:text-base text-[#D4AF37]">calendar_month</span>
              <span>{isArabic ? 'احجزي الآن' : 'Book Now'}</span>
            </button>
          </div>

        </nav>
      </header>

      {/* Slide-Out Side Navigation Drawer (القائمة الجانبية) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          {/* Dark Glass Overlay */}
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {/* Side Drawer Content */}
          <div className={`fixed top-0 bottom-0 w-80 max-w-[85vw] bg-[#FFFDF5] h-full shadow-2xl flex flex-col justify-between border-x border-[#D4AF37]/40 z-10 animate-fade-in overflow-y-auto ${
            isArabic ? 'right-0' : 'left-0'
          }`}>
            
            {/* Top Bar */}
            <div className="p-5 border-b border-[#D4AF37]/40 bg-[#121212] text-white flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-xl text-[#D4AF37] tracking-wide">
                  GLOW PRETTY
                </h3>
                <p className="text-xs text-[#FFFDF0]/80 font-medium">
                  {isArabic ? 'الدوحة، قطر 🇶🇦' : 'Doha, Qatar 🇶🇦'}
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-[#D4AF37] p-1 rounded-full transition-colors"
                aria-label="Close Sidebar"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Navigation Buttons inside Sidebar */}
            <div className="p-5 flex flex-col gap-2.5 flex-1">
              <p className="text-[11px] font-bold text-[#121212] uppercase tracking-wider mb-1">
                {isArabic ? 'تنقل في الموقع' : 'Main Navigation'}
              </p>

              <button
                onClick={() => navTo('home')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-start font-bold transition-all cursor-pointer ${
                  viewMode === 'home'
                    ? 'bg-[#121212] text-[#FFFDF0] shadow-md border border-[#D4AF37]'
                    : 'bg-white hover:bg-[#FAF4E1] text-[#121212] border border-[#D4AF37]/40'
                }`}
              >
                <span className="material-symbols-outlined text-[#D4AF37]">home</span>
                <span>{isArabic ? 'الرئيسية' : 'Home'}</span>
              </button>

              <button
                onClick={() => navTo('booking')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-start font-bold transition-all cursor-pointer ${
                  viewMode === 'booking'
                    ? 'bg-[#121212] text-[#FFFDF0] shadow-md border border-[#D4AF37]'
                    : 'bg-white hover:bg-[#FAF4E1] text-[#121212] border border-[#D4AF37]/40'
                }`}
              >
                <span className="material-symbols-outlined text-[#D4AF37]">spa</span>
                <span>{isArabic ? 'الخدمات والحجز' : 'Services & Booking'}</span>
              </button>

              <button
                onClick={() => navTo('gallery')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-start font-bold bg-white hover:bg-[#FAF4E1] text-[#121212] border border-[#D4AF37]/40 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#D4AF37]">photo_library</span>
                <span>{isArabic ? 'معرض الصور' : 'Gallery'}</span>
              </button>

              <button
                onClick={() => navTo('about')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-start font-bold bg-white hover:bg-[#FAF4E1] text-[#121212] border border-[#D4AF37]/40 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#D4AF37]">info</span>
                <span>{isArabic ? 'عن الصالون' : 'About Salon'}</span>
              </button>

              <button
                onClick={() => navTo('contact')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-start font-bold bg-white hover:bg-[#FAF4E1] text-[#121212] border border-[#D4AF37]/40 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#D4AF37]">call</span>
                <span>{isArabic ? 'اتصل بنا واللوكيشن' : 'Contact & Location'}</span>
              </button>

              {/* High-Contrast Theme Switch Row in Drawer */}
              <div className="mt-2 pt-3 border-t border-[#D4AF37]/30 flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-stone-800 border border-[#D4AF37]/40">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#D4AF37]">
                    {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                  </span>
                  <span className="text-xs font-bold text-[#121212] dark:text-white">
                    {isArabic
                      ? (theme === 'dark' ? 'المظهر الداكن' : 'المظهر الفاتح')
                      : (theme === 'dark' ? 'Dark Mode' : 'Light Mode')}
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer p-0.5 ${
                    theme === 'dark' ? 'bg-[#9b0044]' : 'bg-amber-200'
                  }`}
                  aria-label="Toggle Theme"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform flex items-center justify-center ${
                      theme === 'dark' ? 'translate-x-6 rtl:-translate-x-6 bg-[#D4AF37]' : 'translate-x-0'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[12px] text-black">
                      {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                    </span>
                  </div>
                </button>
              </div>

            </div>

            {/* Quick Contact & WhatsApp Bottom Info */}
            <div className="p-5 border-t border-[#D4AF37]/40 bg-[#FAF6ED]">
              <div className="flex flex-col gap-2 mb-4 text-xs text-[#121212]">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="material-symbols-outlined text-base text-[#D4AF37]">phone</span>
                  <span dir="ltr" className="inline-block unicode-bidi-isolate font-bold">{siteSettings.phone}</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <span className="material-symbols-outlined text-base text-[#D4AF37]">location_on</span>
                  <span className="truncate">{isArabic ? siteSettings.locationAR : siteSettings.locationEN}</span>
                </div>
              </div>

              {/* Instant WhatsApp Button */}
              <a
                href={`https://wa.me/${siteSettings.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">chat</span>
                <span className="text-sm">{isArabic ? 'واتساب الصالون المباشر' : 'Direct WhatsApp'}</span>
              </a>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
