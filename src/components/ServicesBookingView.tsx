import React, { useState, useRef } from 'react';
import { Service, Language, Appointment, CategoryItem, SiteSettings, Coupon } from '../types';
import { TIME_SLOTS } from '../data/mockData';
import { PriceTag } from './PriceTag';
import { SmartImage } from './SmartImage';
import { getOptimizedImageUrl } from '../lib/cloudinary';

const HighlightText: React.FC<{ text?: string; query: string }> = ({ text, query }) => {
  if (!text) return null;
  if (!query || !query.trim()) return <>{text}</>;

  const trimmed = query.trim();
  try {
    const regex = new RegExp(`(${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === trimmed.toLowerCase() ? (
            <mark key={i} className="bg-[#D4AF37] text-[#121212] font-black rounded px-1.5 py-0.5 shadow-2xs mx-0.5 inline-block">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  } catch {
    return <>{text}</>;
  }
};

interface ServicesBookingViewProps {
  services: Service[];
  selectedCategory: string; // 'all' or category id
  setSelectedCategory: (cat: string) => void;
  language: Language;
  onConfirmBooking: (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => void;
  categories: CategoryItem[];
  siteSettings: SiteSettings;
  coupons?: Coupon[];
  onUseCoupon?: (couponCode: string) => void;
}

export const ServicesBookingView: React.FC<ServicesBookingViewProps> = ({
  services,
  selectedCategory,
  setSelectedCategory,
  language,
  onConfirmBooking,
  categories,
  siteSettings,
  coupons = [],
  onUseCoupon,
}) => {
  const isArabic = language === 'ar';

  // Selected Services Array (Supports multiple selection)
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);

  const toggleServiceSelection = (service: Service) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const removeServiceSelection = (serviceId: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  // Number of Persons / Guests
  const [numberOfPersons, setNumberOfPersons] = useState<number>(1);

  const baseServicesPriceQAR = selectedServices.reduce((sum, s) => sum + (s.priceQAR || 0), 0);
  const totalPriceQAR = baseServicesPriceQAR * numberOfPersons;
  const totalDurationMinutes = selectedServices.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) * numberOfPersons;

  // Coupon Code State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Coupon Discount Calculation
  let discountAmount = 0;
  if (appliedCoupon && totalPriceQAR > 0) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((totalPriceQAR * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(totalPriceQAR, appliedCoupon.discountValue);
    }
  }
  const finalPriceQAR = Math.max(0, totalPriceQAR - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) {
      setCouponError(isArabic ? 'يرجى إدخال كود الخصم' : 'Please enter a coupon code');
      return;
    }

    const found = coupons.find((c) => c.code.trim().toUpperCase() === cleanCode);
    if (!found) {
      setCouponError(isArabic ? 'كود الخصم غير صحيح أو غير موجود' : 'Invalid coupon code');
      return;
    }
    if (!found.isActive) {
      setCouponError(isArabic ? 'كود الخصم هذا غير مفعل حالياً' : 'This coupon code is inactive');
      return;
    }
    if (found.usedCount >= found.maxUses) {
      setCouponError(isArabic ? 'للأسف، اكتمل الحد الأقصى لاستخدام كود الخصم هذا' : 'Coupon usage limit reached');
      return;
    }

    setAppliedCoupon(found);
    setCouponSuccess(
      isArabic
        ? `تم تطبيق كود الخصم (${found.code}) بنجاح!`
        : `Coupon code (${found.code}) applied successfully!`
    );
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    setCouponSuccess('');
  };

  // Calendar Date selection state (Default: Today's date YYYY-MM-DD)
  const [selectedBookingDate, setSelectedBookingDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  // Preferred Time selection state
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('11:30 AM');
  const [isCustomTime, setIsCustomTime] = useState<boolean>(false);
  const [customTimeInput, setCustomTimeInput] = useState<string>('');

  // Form Inputs (Email removed)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+974 ');

  // Form Error state
  const [formError, setFormError] = useState('');

  // Search Query state
  const [searchQuery, setSearchQuery] = useState('');

  // Combined Category Filter Items (including "All")
  const allCategoryOption: CategoryItem = { id: 'all', label: 'All Services', arabicLabel: 'جميع الخدمات' };
  const filterCategories = [allCategoryOption, ...categories];

  const filteredServices = services.filter((s) => {
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const catObj = categories.find((c) => c.id === s.category);
      const catLabel = catObj?.label.toLowerCase() || '';
      const catArabicLabel = catObj?.arabicLabel.toLowerCase() || '';

      const matchTitle = (s.title || '').toLowerCase().includes(query);
      const matchArabicTitle = (s.arabicTitle || '').toLowerCase().includes(query);
      const matchDesc = (s.description || '').toLowerCase().includes(query);
      const matchArabicDesc = (s.arabicDescription || '').toLowerCase().includes(query);
      const matchCat = catLabel.includes(query) || catArabicLabel.includes(query) || (s.category || '').toLowerCase().includes(query);

      return matchTitle || matchArabicTitle || matchDesc || matchArabicDesc || matchCat;
    }

    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      setFormError(isArabic ? 'يرجى اختيار خدمة واحدة على الأقل من القائمة أولاً' : 'Please select at least one service from the menu.');
      return;
    }
    if (!selectedBookingDate) {
      setFormError(isArabic ? 'يرجى تحديد تاريخ الحجز' : 'Please select an appointment date.');
      return;
    }
    if (!selectedTimeSlot && !customTimeInput) {
      setFormError(isArabic ? 'يرجى تحديد توقيت الموعد' : 'Please select an appointment time.');
      return;
    }
    if (!fullName.trim() || !phone.trim() || phone.trim() === '+974') {
      setFormError(isArabic ? 'يرجى إكمال جميع حقول الحجز' : 'Please complete all required booking fields.');
      return;
    }

    setFormError('');

    const finalTimeSlot = isCustomTime && customTimeInput ? customTimeInput : selectedTimeSlot;

    const nameParts = fullName.trim().split(' ');
    const initials = nameParts.length > 1 
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : nameParts[0].substring(0, 2).toUpperCase();

    const serviceIds = selectedServices.map((s) => s.id).join(', ');
    const serviceNamesList = selectedServices.map((s) => (isArabic ? s.arabicTitle : s.title)).join(' + ');
    let serviceNameSummary = serviceNamesList;
    if (numberOfPersons > 1) {
      serviceNameSummary = `${serviceNamesList} (${numberOfPersons} ${isArabic ? 'أفراد' : 'persons'})`;
    } else if (selectedServices.length > 1) {
      serviceNameSummary = `${serviceNamesList} (${isArabic ? 'الإجمالي' : 'Total'}: ${finalPriceQAR} ${isArabic ? 'ر.ق' : 'QAR'})`;
    }

    const priceDisplaySummary = finalPriceQAR > 0
      ? `${finalPriceQAR} ${isArabic ? 'ر.ق' : 'QAR'}`
      : (selectedServices[0] ? (isArabic ? (selectedServices[0].arabicPrice || `${selectedServices[0].priceQAR} ر.ق`) : (selectedServices[0].priceDisplay || `${selectedServices[0].priceQAR} QAR`)) : '');

    const servicesBreakdown = selectedServices.map((s) => ({
      id: s.id,
      title: isArabic ? (s.arabicTitle || s.title) : s.title,
      priceQAR: s.priceQAR,
      priceDisplay: isArabic ? (s.arabicPrice || `${s.priceQAR} ر.ق`) : (s.priceDisplay || `${s.priceQAR} QAR`)
    }));

    onConfirmBooking({
      clientName: fullName,
      clientInitials: initials,
      clientEmail: '',
      clientPhone: phone,
      serviceId: serviceIds,
      serviceName: serviceNameSummary,
      numberOfPersons,
      priceQAR: finalPriceQAR,
      originalPriceQAR: totalPriceQAR > 0 ? totalPriceQAR : undefined,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      priceDisplay: priceDisplaySummary,
      servicesBreakdown,
      date: selectedBookingDate,
      time: finalTimeSlot,
    });

    setFullName('');
    setPhone('+974 ');
    setNumberOfPersons(1);
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    setCouponSuccess('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10 min-h-screen">
      
      {/* Hero Header */}
      <section className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-[#121212] text-[#D4AF37] border border-[#D4AF37]/40 px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-xs">
          <span>🇶🇦</span>
          <span>{isArabic ? 'الأسعار المعلنة بالريال القطري (ر.ق)' : 'Prices in Qatari Riyal (QAR)'}</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl text-[#121212] mb-3 font-extrabold">
          {isArabic ? 'قائمة الخدمات والحجز الفوري' : 'Luxury Beauty Services & Reservation'}
        </h1>
        <p className="text-[#3a3528] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium mb-6">
          {isArabic
            ? 'اختاري الخدمة المناسبة لكِ واستكملي بيانات الحجز بسهولة لضمان موعدكِ الملكي في صالون غلو بريتي بالدوحة.'
            : 'Explore our bespoke hair, nail, skincare, and makeup offerings in West Bay, Doha.'}
        </p>

        {/* Quick Search Bar */}
        <div className="max-w-xl mx-auto relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isArabic
                  ? 'ابحثي عن خدمة بالاسم أو الفئة (مثل: شعر، بديكير، فايشل، مكياج)...'
                  : 'Search services by name or category (e.g. Hair, Nails, Facial, Makeup)...'
              }
              className="w-full bg-white border-2 border-[#D4AF37]/40 focus:border-[#121212] rounded-2xl py-3.5 px-11 text-sm text-[#121212] placeholder-gray-400 font-medium shadow-sm focus:outline-none transition-all"
            />
            <span className="material-symbols-outlined absolute text-gray-400 text-xl pointer-events-none ltr:left-4 rtl:right-4">
              search
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute text-gray-400 hover:text-gray-700 p-1 rounded-full cursor-pointer transition-colors ltr:right-3 rtl:left-3"
                title={isArabic ? 'مسح البحث' : 'Clear search'}
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
          {searchQuery.trim() && (
            <div className="mt-2 flex items-center justify-between text-xs px-2 text-gray-600 font-semibold">
              <span>
                {isArabic
                  ? `نتائج البحث عن "${searchQuery}": ${filteredServices.length} خدمة`
                  : `Search results for "${searchQuery}": ${filteredServices.length} service(s)`}
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#9b0044] hover:underline font-bold cursor-pointer"
              >
                {isArabic ? 'إلغاء البحث' : 'Reset search'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Category Tabs & Services Cards */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Category Filter Tabs & Multi-select Hint */}
          <div className="space-y-3">
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {filterCategories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#121212] text-[#FFFDF0] shadow-md border border-[#D4AF37]'
                        : 'bg-[#FFFDF5] text-[#121212] border border-[#D4AF37]/40 hover:border-[#121212] hover:bg-[#FAF4E1]'
                    }`}
                  >
                    {isArabic ? cat.arabicLabel : cat.label}
                  </button>
                );
              })}
            </div>

            <div className="bg-[#FAF6ED] border border-[#D4AF37]/50 rounded-2xl p-3 px-4 flex items-center justify-between text-xs text-[#121212] font-bold shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#D4AF37]">checklist</span>
                <span>
                  {isArabic
                    ? 'يمكنكِ تحديد أكثر من خدمة للحجز في نفس الموعد'
                    : 'You can select multiple services for a single appointment'}
                </span>
              </div>
              <span className="bg-[#121212] text-[#FFFDF0] border border-[#D4AF37]/50 px-2.5 py-1 rounded-full font-bold text-[11px] whitespace-nowrap">
                {isArabic ? `${selectedServices.length} خدمات محددة` : `${selectedServices.length} Selected`}
              </span>
            </div>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredServices.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 bg-white rounded-2xl p-8 text-center border border-[#D4AF37]/30 space-y-3">
                <span className="material-symbols-outlined text-4xl text-gray-300">search_off</span>
                <h3 className="font-extrabold text-gray-700 text-base">
                  {isArabic ? 'لم نجد أية خدمات تطابق بحثكِ' : 'No matching services found'}
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  {isArabic
                    ? 'جربي كتابة كلمات بحث أخرى أو تصفح جميع الفئات.'
                    : 'Try searching with different keywords or view all categories.'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="inline-flex items-center gap-1.5 bg-[#121212] text-[#D4AF37] border border-[#D4AF37] px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  {isArabic ? 'عرض جميع الخدمات' : 'Show All Services'}
                </button>
              </div>
            ) : (
              filteredServices.map((service) => {
              const isSelected = selectedServices.some((s) => s.id === service.id);
              const serviceCatObj = categories.find((c) => c.id === service.category);
              const serviceCatName = isArabic
                ? (serviceCatObj?.arabicLabel || serviceCatObj?.label || service.category)
                : (serviceCatObj?.label || service.category);

              return (
                <div
                  key={service.id}
                  onClick={() => toggleServiceSelection(service)}
                  className={`bg-white p-5 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer relative ${
                    isSelected 
                      ? 'border-[#121212] bg-[#FAF6ED] shadow-xl scale-[1.01]' 
                      : 'border-[#D4AF37]/30 hover:border-[#D4AF37] hover:shadow-md'
                  }`}
                >
                  {/* Selected Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                    {isSelected ? (
                      <span className="bg-[#121212] text-[#D4AF37] border border-[#D4AF37] rounded-full px-2.5 py-0.5 shadow-md text-xs font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        <span>{isArabic ? 'محددة' : 'Selected'}</span>
                      </span>
                    ) : (
                      <span className="bg-white/95 text-[#121212] border border-[#D4AF37]/50 rounded-full px-2.5 py-0.5 text-xs font-bold flex items-center gap-1 shadow-2xs">
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span>{isArabic ? 'إضافة' : 'Add'}</span>
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Image */}
                  <div className="w-full h-44 mb-4 overflow-hidden rounded-xl bg-[#e5e2e1] border border-[#D4AF37]/20 relative">
                    <SmartImage
                      src={service.imageUrl}
                      alt={service.title}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    {/* Category Overlay Tag */}
                    <div className="absolute bottom-2 ltr:left-2 rtl:right-2">
                      <span className="bg-[#121212]/85 backdrop-blur-xs text-[#D4AF37] text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-[#D4AF37]/40 shadow-xs">
                        <HighlightText text={serviceCatName} query={searchQuery} />
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="font-display text-lg font-extrabold text-[#121212]">
                        <HighlightText
                          text={isArabic ? service.arabicTitle : service.title}
                          query={searchQuery}
                        />
                      </h3>
                      <div className="text-end bg-[#121212] text-[#D4AF37] px-2.5 py-1 rounded-lg font-extrabold text-sm border border-[#D4AF37]/40 whitespace-nowrap ms-2">
                        <PriceTag
                          priceQAR={service.priceQAR}
                          priceDisplay={service.priceDisplay}
                          arabicPrice={service.arabicPrice}
                          isArabic={isArabic}
                        />
                      </div>
                    </div>

                    <p className="text-[#3a3528] text-xs leading-relaxed mb-3 font-medium">
                      <HighlightText
                        text={isArabic ? service.arabicDescription : service.description}
                        query={searchQuery}
                      />
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="flex justify-end items-center border-t border-[#D4AF37]/20 pt-3 mt-2 text-xs font-semibold">
                    <span className={isSelected ? "text-[#121212] font-bold" : "text-[#B8860B] font-bold"}>
                      {isSelected 
                        ? (isArabic ? '✓ محددة (انقري للإلغاء)' : '✓ Selected (Click to remove)') 
                        : (isArabic ? '+ انقري لإضافة الخدمة' : '+ Click to add service')}
                    </span>
                  </div>

                </div>
              );
            })
            )}
          </div>

        </div>

        {/* Right Column: Reservation Widget Box */}
        <div id="booking-form" className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-2xl border-2 border-[#D4AF37]/40">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl text-[#121212] font-extrabold">
                {isArabic ? 'تأكيد حجز الموعد' : 'Reserve Appointment'}
              </h2>
              <span className="text-xs bg-[#FAF6ED] text-[#121212] border border-[#D4AF37]/50 font-bold px-2.5 py-1 rounded-md">
                🇶🇦 {isArabic ? 'الدوحة' : 'Doha'}
              </span>
            </div>

            {/* Selected Services Box */}
            <div className="mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#121212]">
                  {isArabic ? `الخدمات المختارة (${selectedServices.length}):` : `Selected Services (${selectedServices.length}):`}
                </span>
                {selectedServices.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedServices([])}
                    className="text-[11px] text-red-600 hover:underline font-bold cursor-pointer"
                  >
                    {isArabic ? 'إلغاء الكل' : 'Clear All'}
                  </button>
                )}
              </div>

              {selectedServices.length === 0 ? (
                <div className="p-4 bg-[#FAF6ED] rounded-2xl border border-dashed border-[#121212]/30 text-center text-xs text-[#121212] font-semibold">
                  {isArabic ? 'لم تقمي باختيار أي خدمة بعد. انقري على إحدى الخدمات لإضافتها للحجز.' : 'No services selected yet. Click any service to add it to your reservation.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedServices.map((service) => {
                    const optSrc = getOptimizedImageUrl(service.imageUrl, { width: 100 });
                    return (
                      <div
                        key={service.id}
                        className="p-3 bg-[#FAF6ED] rounded-xl border border-[#D4AF37]/40 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        {optSrc ? (
                          <img
                            key={optSrc}
                            src={optSrc}
                            alt={service.title}
                            loading="lazy"
                            decoding="async"
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-lg object-cover border border-[#D4AF37] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-stone-200 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
                            <span className="material-symbols-outlined text-lg">spa</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-[#1c1b1b] truncate">
                            {isArabic ? service.arabicTitle : service.title}
                          </h4>
                        </div>
                        <div className="text-end flex items-center gap-2">
                          <span className="font-extrabold text-[#121212] text-xs">
                            <PriceTag
                              priceQAR={service.priceQAR}
                            priceDisplay={service.priceDisplay}
                            arabicPrice={service.arabicPrice}
                            isArabic={isArabic}
                          />
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeServiceSelection(service.id);
                          }}
                          className="text-[#121212] hover:bg-[#121212] hover:text-white rounded-full p-0.5 transition-colors cursor-pointer"
                          title={isArabic ? 'حذف هذه الخدمة' : 'Remove service'}
                        >
                          <span className="material-symbols-outlined text-sm block">close</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}

              {/* Total Price & Duration Summary with Coupon Support */}
              {selectedServices.length > 0 && (
                <div className="space-y-3">
                  
                  {/* Number of Persons / Guests Selector */}
                  <div className="bg-[#FAF6ED] p-3 rounded-2xl border border-[#D4AF37]/50 shadow-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-[#121212] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-[#D4AF37]">group</span>
                        <span>{isArabic ? 'عدد الأشخاص / الضيوف:' : 'Number of Guests:'}</span>
                      </label>
                      <span className="text-xs font-black text-[#9b0044] bg-white border border-[#D4AF37]/40 px-2 py-0.5 rounded-lg shadow-2xs">
                        {numberOfPersons} {isArabic ? (numberOfPersons === 1 ? 'شخص واحد' : numberOfPersons === 2 ? 'شخصين' : 'أشخاص') : (numberOfPersons === 1 ? 'Person' : 'Persons')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNumberOfPersons((prev) => Math.max(1, prev - 1))}
                        disabled={numberOfPersons <= 1}
                        className="w-9 h-9 rounded-xl bg-white border-2 border-[#D4AF37] disabled:opacity-40 text-[#121212] font-black text-lg flex items-center justify-center cursor-pointer hover:bg-[#121212] hover:text-[#D4AF37] transition-all shadow-2xs"
                        title={isArabic ? 'إنقاص عدد الأشخاص' : 'Decrease persons'}
                      >
                        -
                      </button>

                      <div className="flex-1 grid grid-cols-5 gap-1">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setNumberOfPersons(num)}
                            className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              numberOfPersons === num
                                ? 'bg-[#121212] text-[#D4AF37] border-[#D4AF37] shadow-xs'
                                : 'bg-white text-[#121212] border-gray-200 hover:border-[#D4AF37]'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setNumberOfPersons((prev) => prev + 1)}
                        className="w-9 h-9 rounded-xl bg-white border-2 border-[#D4AF37] text-[#121212] font-black text-lg flex items-center justify-center cursor-pointer hover:bg-[#121212] hover:text-[#D4AF37] transition-all shadow-2xs"
                        title={isArabic ? 'زيادة عدد الأشخاص' : 'Increase persons'}
                      >
                        +
                      </button>
                    </div>

                    {numberOfPersons > 1 && baseServicesPriceQAR > 0 && (
                      <p className="text-[11px] text-stone-600 font-bold text-end pt-1">
                        💡 {isArabic ? `حساب السعر: (${baseServicesPriceQAR} ر.ق × ${numberOfPersons} أشخاص = ${totalPriceQAR} ر.ق)` : `Calculation: (${baseServicesPriceQAR} QAR × ${numberOfPersons} persons = ${totalPriceQAR} QAR)`}
                      </p>
                    )}
                  </div>

                  {/* Coupon Code Input Box */}
                  <div className="bg-[#FAF6ED] p-3 rounded-2xl border border-[#D4AF37]/50 shadow-xs">
                    <label className="block text-xs font-bold text-[#121212] mb-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#D4AF37]">confirmation_number</span>
                      <span>{isArabic ? 'كود الخصم / الكوبون:' : 'Promo / Discount Code:'}</span>
                    </label>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl text-xs">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                          <div>
                            <span className="font-extrabold text-emerald-900 block">
                              {appliedCoupon.code} ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `${appliedCoupon.discountValue} ${isArabic ? 'ر.ق' : 'QAR'}`} {isArabic ? 'خصم' : 'OFF'})
                            </span>
                            <span className="text-[10px] text-emerald-700">
                              {isArabic ? `قيمة الخصم: -${discountAmount} ر.ق` : `Discount: -${discountAmount} QAR`}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-xs font-bold text-red-600 hover:text-red-800 underline bg-white px-2 py-1 rounded-lg border border-red-200 cursor-pointer"
                        >
                          {isArabic ? 'إلغاء الكود' : 'Remove'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={isArabic ? 'مثال: GLOW10' : 'e.g., GLOW10'}
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value);
                            setCouponError('');
                          }}
                          className="flex-1 uppercase border border-[#D4AF37]/50 rounded-xl px-3 py-1.5 text-xs font-bold bg-white focus:outline-none focus:border-[#121212]"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="btn-burgundy px-4 py-1.5 rounded-xl font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                        >
                          {isArabic ? 'تطبيق الكود' : 'Apply'}
                        </button>
                      </div>
                    )}

                    {couponError && (
                      <p className="text-[11px] font-bold text-red-600 mt-1.5 bg-red-50 p-1.5 rounded-lg border border-red-200">
                        {couponError}
                      </p>
                    )}
                    {couponSuccess && !appliedCoupon && (
                      <p className="text-[11px] font-bold text-emerald-700 mt-1.5 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                        {couponSuccess}
                      </p>
                    )}
                  </div>

                  {/* Summary Box */}
                  <div className="p-3.5 bg-gradient-to-r from-[#121212] to-[#262626] text-white rounded-2xl space-y-2 shadow-md border border-[#D4AF37]/50">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[11px] text-[#D4AF37] font-bold block">
                          {isArabic ? `الإجمالي (${selectedServices.length} خدمات):` : `Total (${selectedServices.length} services):`}
                        </span>
                      </div>
                      <div className="text-end">
                        {appliedCoupon && discountAmount > 0 ? (
                          <div>
                            <span className="text-xs text-gray-400 line-through block font-medium">
                              {totalPriceQAR} {isArabic ? 'ر.ق' : 'QAR'}
                            </span>
                            <span className="font-extrabold text-lg text-[#D4AF37]">
                              {finalPriceQAR} {isArabic ? 'ر.ق' : 'QAR'}
                            </span>
                          </div>
                        ) : (
                          <span className="font-extrabold text-lg text-[#D4AF37]">
                            {totalPriceQAR} {isArabic ? 'ر.ق' : 'QAR'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-5" id="bookingForm">
              
              {/* Date Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#121212] mb-2">
                  {isArabic ? 'اختر تاريخ الموعد المناسب:' : 'Select Appointment Date:'}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedBookingDate}
                    onChange={(e) => setSelectedBookingDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        (e.currentTarget as any).showPicker?.();
                      } catch {}
                    }}
                    onFocus={(e) => {
                      try {
                        (e.currentTarget as any).showPicker?.();
                      } catch {}
                    }}
                    className="w-full border-2 border-[#D4AF37]/50 rounded-xl py-2.5 px-3.5 bg-[#FFFDF5] focus:bg-white focus:outline-none focus:border-[#121212] text-sm font-bold text-[#1c1b1b] cursor-pointer"
                  />
                </div>
              </div>

              {/* Time Slots & Custom Time Input */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#121212]">
                    {isArabic ? 'توقيت الموعد المفضل:' : 'Preferred Time Slot:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !isCustomTime;
                      setIsCustomTime(nextState);
                      if (nextState && !customTimeInput) {
                        const defaultCustom = isArabic ? '05:00 مساءً' : '05:00 PM';
                        setCustomTimeInput(defaultCustom);
                        setSelectedTimeSlot(defaultCustom);
                      } else if (nextState && customTimeInput) {
                        setSelectedTimeSlot(customTimeInput);
                      }
                    }}
                    className="text-xs font-bold text-[#121212] underline hover:opacity-80 flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm text-[#D4AF37]">schedule</span>
                    <span>
                      {isArabic 
                        ? (isCustomTime ? 'العودة للمواعيد المتاحة' : 'تحديد موعد مخصص ⏱️') 
                        : (isCustomTime ? 'Standard Slots' : 'Custom Time ⏱️')}
                    </span>
                  </button>
                </div>

                {!isCustomTime ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-1.5">
                      {TIME_SLOTS.map((slot) => {
                        const isSlotSelected = selectedTimeSlot === slot && !isCustomTime;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setSelectedTimeSlot(slot);
                              setIsCustomTime(false);
                            }}
                            className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                              isSlotSelected
                                ? 'bg-[#121212] text-[#FFFDF0] border-[#D4AF37] shadow-sm'
                                : 'border-[#D4AF37]/40 text-[#121212] bg-[#FAF6ED] hover:bg-[#FAF4E1]'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomTime(true);
                          if (!customTimeInput) {
                            const defaultCustom = isArabic ? '05:00 مساءً' : '05:00 PM';
                            setCustomTimeInput(defaultCustom);
                            setSelectedTimeSlot(defaultCustom);
                          }
                        }}
                        className="text-[11px] font-bold text-[#665a3c] hover:text-[#121212] cursor-pointer underline flex items-center justify-end gap-1 ms-auto"
                      >
                        <span className="material-symbols-outlined text-xs">edit_calendar</span>
                        <span>{isArabic ? 'غير مناسبك المواعيد؟ انقري لتحديد توقيت آخر مخصص' : 'Need a different time? Click to set custom time'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-[#FAF6ED] border-2 border-[#D4AF37]/60 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b border-[#D4AF37]/30 pb-2">
                      <label className="block text-xs font-bold text-[#121212]">
                        {isArabic ? '⏱️ تحديد موعد مخصص:' : '⏱️ Custom Time Selection:'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomTime(false)}
                        className="text-[11px] text-[#121212] font-bold underline cursor-pointer"
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>

                    {/* Full Dropdown Selector for Desktop & Mobile */}
                    <div>
                      <label className="text-[11px] text-[#665a3c] font-bold block mb-1">
                        {isArabic ? 'اختاري الموعد المناسب من القائمة الكاملة:' : 'Select from full time list:'}
                      </label>
                      <select
                        value={customTimeInput}
                        onChange={(e) => {
                          setCustomTimeInput(e.target.value);
                          setSelectedTimeSlot(e.target.value);
                        }}
                        className="w-full border-2 border-[#D4AF37] rounded-xl py-2 px-3 bg-white text-xs font-extrabold text-[#121212] focus:outline-none cursor-pointer"
                      >
                        {[
                          '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
                          '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
                          '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
                          '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
                          '09:00 PM', '09:30 PM', '10:00 PM'
                        ].map((opt) => {
                          const displayOpt = isArabic 
                            ? opt.replace('AM', 'صباحاً').replace('PM', 'مساءً') 
                            : opt;
                          return (
                            <option key={opt} value={displayOpt}>
                              {displayOpt}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Manual Typing Field */}
                    <div className="pt-2 border-t border-[#D4AF37]/30">
                      <span className="text-[11px] text-[#665a3c] font-bold block mb-1">
                        {isArabic ? 'أو اكتبي الموعد يدوياً:' : 'Or type time manually:'}
                      </span>
                      <input
                        type="text"
                        placeholder={isArabic ? 'مثال: 05:30 مساءً' : 'e.g. 05:30 PM'}
                        value={customTimeInput}
                        onChange={(e) => {
                          setCustomTimeInput(e.target.value);
                          setSelectedTimeSlot(e.target.value);
                        }}
                        className="w-full border border-[#D4AF37]/50 rounded-xl py-2 px-3 bg-white text-xs font-bold text-[#121212] focus:outline-none"
                      />
                    </div>

                    {customTimeInput && (
                      <p className="text-[11px] font-bold text-[#121212] flex items-center gap-1 bg-white p-2 rounded-xl border border-[#D4AF37]/40">
                        <span className="material-symbols-outlined text-xs text-[#D4AF37]">check_circle</span>
                        <span>{isArabic ? `التوقيت المخصص المحدد: ${customTimeInput}` : `Selected custom time: ${customTimeInput}`}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Client Info Inputs (Email Field Removed) */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#3a3528] mb-1">
                    {isArabic ? 'الاسم الكامل:' : 'Full Name:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isArabic ? 'مثال: شيخة الكواري' : 'e.g., Sheikha Al-Kuwari'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-[#D4AF37]/40 rounded-xl py-2.5 px-3 bg-[#FFFDF5] focus:bg-white focus:outline-none focus:border-[#121212] text-sm text-[#1c1b1b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3a3528] mb-1">
                    {isArabic ? 'رقم الهاتف القطري:' : 'Qatar Phone Number:'}
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    required
                    placeholder="+974 5512 3456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-[#D4AF37]/40 rounded-xl py-2.5 px-3 bg-[#FFFDF5] focus:bg-white focus:outline-none focus:border-[#121212] text-sm text-[#1c1b1b] text-left"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">
                  {formError}
                </p>
              )}

              {/* Confirm Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-burgundy w-full py-3.5 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">verified</span>
                  <span>{isArabic ? 'تأكيد الحجز الفوري' : 'Confirm Instant Booking'}</span>
                </button>
              </div>
            </form>

            {/* Direct WhatsApp Quick Booking Option */}
            <div className="mt-4 pt-4 border-t border-[#D4AF37]/20 text-center">
              <p className="text-xs text-[#594045] font-semibold mb-2">
                {isArabic ? 'أو يمكنكِ الحجز المباشر عبر الواتساب:' : 'Or book directly via WhatsApp:'}
              </p>
              <a
                href={`https://wa.me/${siteSettings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  isArabic
                    ? `مرحباً، أود حجز الخدمات التالية: ${
                        selectedServices.map((s) => s.arabicTitle).join(' + ') || 'خدمات التجميل'
                      }${totalPriceQAR > 0 ? ` (المجموع: ${totalPriceQAR} ر.ق)` : ''}`
                    : `Hello, I would like to book: ${
                        selectedServices.map((s) => s.title).join(' + ') || 'Beauty Services'
                      }${totalPriceQAR > 0 ? ` (Total: ${totalPriceQAR} QAR)` : ''}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#1ebd53] text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-base">chat</span>
                <span>{isArabic ? 'حجز سريع عبر واتساب الصالون' : 'Quick WhatsApp Reservation'}</span>
              </a>
            </div>

          </div>
        </div>

      </div>

      {/* Mobile Sticky Booking Footer Bar */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#121212] text-[#FFFDF0] p-3.5 px-4 border-t-2 border-[#D4AF37] shadow-2xl flex items-center justify-between lg:hidden animate-fade-in">
          <div>
            <div className="text-[11px] text-[#D4AF37] font-extrabold flex items-center gap-1">
              <span>{selectedServices.length} {isArabic ? 'خدمات محددة' : 'Selected'}</span>
              {numberOfPersons > 1 && <span>({numberOfPersons} {isArabic ? 'أفراد' : 'persons'})</span>}
            </div>
            <div className="text-base font-black text-white">
              {finalPriceQAR} {isArabic ? 'ر.ق' : 'QAR'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-gold px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <span>{isArabic ? 'متابعة الحجز' : 'Proceed'}</span>
            <span className="material-symbols-outlined text-sm">arrow_downward</span>
          </button>
        </div>
      )}
    </div>
  );
};
