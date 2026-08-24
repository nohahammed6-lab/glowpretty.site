import React from 'react';
import { ViewMode, Language, SiteSettings } from '../types';

interface FooterProps {
  setViewMode: (mode: ViewMode) => void;
  language: Language;
  siteSettings: SiteSettings;
  onAdminLoginClick: (tab: 'owner' | 'supervisor') => void;
}

export const Footer: React.FC<FooterProps> = ({
  setViewMode,
  language,
  siteSettings,
  onAdminLoginClick,
}) => {
  const isArabic = language === 'ar';

  return (
    <footer id="contact" className="bg-[#0f0f0f] text-white mt-24 border-t border-[#D4AF37]/40">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 px-6 md:px-16 py-16 w-full max-w-7xl mx-auto">
        
        {/* Brand Column */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-display text-2xl md:text-3xl font-extrabold text-[#D4AF37]">
              GLOW PRETTY
            </span>
            <span className="text-xs bg-[#121212] text-[#D4AF37] border border-[#D4AF37]/60 px-2 py-0.5 rounded font-bold">
              🇶🇦 {isArabic ? 'قطر' : 'Qatar'}
            </span>
          </div>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            {isArabic
              ? 'صالون التجميل الملكي الأول في قطر. نقدم أرقى خدمات العناية بالبشرة، الشعر، والأظافر بأعلى معايير الفخامة والخصوصية.'
              : 'Qatar’s premier luxury beauty and wellness sanctuary in Madinat Khalifa, Doha. Delivering bespoke hair, spa, and nail experiences with absolute discretion.'}
          </p>
          <div className="text-xs text-[#D4AF37] font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">payments</span>
            <span>{isArabic ? 'جميع الأسعار بالريال القطري (ر.ق)' : 'All prices in Qatari Riyal (QAR)'}</span>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-bold text-[#D4AF37] mb-4 text-sm tracking-wider uppercase">
            {isArabic ? 'أقسام الموقع' : 'Quick Navigation'}
          </h4>
          <ul className="space-y-2.5">
            <li>
              <button
                onClick={() => {
                  setViewMode('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-white/70 hover:text-[#D4AF37] transition-all text-sm text-start flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span>{isArabic ? 'الصفحة الرئيسية' : 'Home Page'}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setViewMode('booking');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-white/70 hover:text-[#D4AF37] transition-all text-sm text-start flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span>{isArabic ? 'قائمة الخدمات والحجز' : 'Services & Booking'}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setViewMode('home');
                  setTimeout(() => {
                    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-white/70 hover:text-[#D4AF37] transition-all text-sm text-start flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span>{isArabic ? 'معرض الصور' : 'Gallery'}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setViewMode('home');
                  setTimeout(() => {
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-white/70 hover:text-[#D4AF37] transition-all text-sm text-start flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span>{isArabic ? 'نبذة عن الصالون' : 'About Salon'}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setViewMode('contact');
                  setTimeout(() => {
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-white/70 hover:text-[#D4AF37] transition-all text-sm text-start flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span>{isArabic ? 'تواصل معنا' : 'Contact Us'}</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Working Hours & Location */}
        <div>
          <h4 className="font-bold text-[#D4AF37] mb-4 text-sm tracking-wider uppercase">
            {isArabic ? 'أوقات العمل والفرع' : 'Hours & Location'}
          </h4>
          <div className="text-white/80 text-sm space-y-3">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[#D4AF37] text-base mt-0.5">location_on</span>
              <span>{isArabic ? siteSettings.locationAR : siteSettings.locationEN}</span>
            </div>
            <div className="flex items-start gap-2 pt-1">
              <span className="material-symbols-outlined text-[#D4AF37] text-base mt-0.5">schedule</span>
              <span className="leading-relaxed">
                {isArabic ? siteSettings.workingHoursAR : siteSettings.workingHoursEN}
              </span>
            </div>
          </div>
        </div>

        {/* Contact & Social Platforms */}
        <div>
          <h4 className="font-bold text-[#D4AF37] mb-4 text-sm tracking-wider uppercase">
            {isArabic ? 'تواصل معنا مباشرة' : 'Contact & Socials'}
          </h4>
          <div className="space-y-2 text-sm text-white/80 mb-5">
            <a 
              href={`tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}`} 
              className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors"
            >
              <span className="material-symbols-outlined text-[#D4AF37] text-base">call</span>
              <span dir="ltr" className="inline-block unicode-bidi-isolate font-bold">{siteSettings.phone}</span>
            </a>
            <a 
              href={`https://wa.me/${siteSettings.whatsapp.replace(/[^0-9]/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-[#25D366] transition-colors font-semibold"
            >
              <span className="material-symbols-outlined text-[#25D366] text-base">chat</span>
              <div className="inline-flex items-center gap-1.5">
                <span dir="ltr" className="inline-block unicode-bidi-isolate font-bold">{siteSettings.whatsapp}</span>
                <span className="text-xs">({isArabic ? 'واتساب' : 'WhatsApp'})</span>
              </div>
            </a>
            <a 
              href={`mailto:${siteSettings.email}`} 
              className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors"
            >
              <span className="material-symbols-outlined text-[#D4AF37] text-base">mail</span>
              <span>{siteSettings.email}</span>
            </a>
          </div>

          {/* Social Media Platform Icons */}
          <div className="flex items-center gap-3 pt-2">
            {siteSettings.instagramUrl && (
              <a
                href={siteSettings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center transition-all hover:scale-110 text-[#D4AF37] hover:text-[#121212]"
              >
                <span className="material-symbols-outlined text-lg">photo_camera</span>
              </a>
            )}
            {siteSettings.tiktokUrl && (
              <a
                href={siteSettings.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="TikTok"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center transition-all hover:scale-110 text-[#D4AF37] hover:text-[#121212]"
              >
                <span className="material-symbols-outlined text-lg">videocam</span>
              </a>
            )}
            {siteSettings.snapchatUrl && (
              <a
                href={siteSettings.snapchatUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Snapchat"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center transition-all hover:scale-110 text-[#D4AF37] hover:text-[#121212]"
              >
                <span className="material-symbols-outlined text-lg">ghost</span>
              </a>
            )}
            {siteSettings.facebookUrl && (
              <a
                href={siteSettings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center transition-all hover:scale-110 text-[#D4AF37] hover:text-[#121212]"
              >
                <span className="material-symbols-outlined text-lg">share</span>
              </a>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Rights */}
      <div className="py-6 border-t border-white/10 bg-[#000000] px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center text-xs text-white/60 gap-3">
          <p className="text-center font-medium text-white/70">
            All Copyright @{' '}
            <a
              href="https://instagram.com/solimanmedia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D4AF37] hover:underline font-bold transition-colors"
            >
              solimanMedia
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
