import React, { useState, useEffect } from 'react';
import { Service, Appointment, Coupon } from '../types';
import { TIME_SLOTS } from '../data/mockData';

interface NewAppointmentModalProps {
  services: Service[];
  coupons?: Coupon[];
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newApt: Omit<Appointment, 'id' | 'createdAt'>) => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  services,
  coupons = [],
  isOpen,
  onClose,
  onAdd,
}) => {
  if (!isOpen) return null;

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+974 ');
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [numberOfPersons, setNumberOfPersons] = useState<number>(1);
  const [date, setDate] = useState('2026-08-01');
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const [status, setStatus] = useState<'Confirmed' | 'Pending'>('Confirmed');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    setCouponInput('');
    setAppliedCoupon(null);
    setCouponError('');
    setNumberOfPersons(1);
  }, [isOpen]);

  const selectedService = services.find((s) => s.id === serviceId);
  const basePrice = selectedService ? selectedService.priceQAR : 0;
  const originalPrice = basePrice * numberOfPersons;

  let discountAmount = 0;
  if (appliedCoupon && originalPrice > 0) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((originalPrice * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(originalPrice, appliedCoupon.discountValue);
    }
  }

  const finalPrice = Math.max(0, originalPrice - discountAmount);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      setCouponError('يرجى إدخال كود الخصم');
      return;
    }

    const found = coupons.find((c) => c.code.toUpperCase() === code);
    if (!found) {
      setCouponError('كود الخصم غير صحيح أو غير موجود');
      setAppliedCoupon(null);
      return;
    }

    if (!found.isActive) {
      setCouponError('كود الخصم غير مفعل حالياً');
      setAppliedCoupon(null);
      return;
    }

    if (found.usedCount >= found.maxUses) {
      setCouponError('تجاوز هذا الكوبون الحد الأقصى للاستخدام');
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(found);
    setCouponError('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceObj = services.find((s) => s.id === serviceId);
    let baseServiceName = serviceObj ? serviceObj.arabicTitle || serviceObj.title : 'خدمة تجميل';
    const serviceName = numberOfPersons > 1 ? `${baseServiceName} (${numberOfPersons} أفراد)` : baseServiceName;
    const priceDisplay = `${finalPrice} ر.ق`;
    const servicesBreakdown = serviceObj ? [{
      id: serviceObj.id,
      title: serviceObj.arabicTitle || serviceObj.title,
      priceQAR: finalPrice,
      priceDisplay: `${finalPrice} ر.ق`
    }] : undefined;

    const nameParts = clientName.trim().split(' ');
    const initials = nameParts.length > 1 
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : nameParts[0].substring(0, 2).toUpperCase();

    onAdd({
      clientName,
      clientInitials: initials,
      clientPhone,
      serviceId,
      serviceName,
      numberOfPersons,
      priceQAR: finalPrice,
      originalPriceQAR: discountAmount > 0 ? originalPrice : undefined,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      priceDisplay,
      servicesBreakdown,
      date,
      time,
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 shadow-2xl border-2 border-[#D4AF37]/40 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#6b5a60] hover:text-[#9b0044] p-1"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h3 className="font-display text-2xl font-extrabold text-[#9b0044] mb-1">
          إضافة موعد حجز جديد (قطر 🇶🇦)
        </h3>
        <p className="text-xs text-[#6b5a60] mb-6">تسجيل حجز جديد يدوياً في صالون الدوحة.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#594045] mb-1">
              اسم العميلة
            </label>
            <input
              type="text"
              required
              placeholder="مثال: منيرة الهاجري"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#9b0044]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#594045] mb-1">
              رقم الهاتف (قطر)
            </label>
            <input
              type="tel"
              dir="ltr"
              required
              placeholder="+974 5500 0000"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#9b0044] text-left"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#594045] mb-1">
              اختيار الخدمة
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#9b0044] bg-white font-bold"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.arabicTitle} ({s.priceQAR} ر.ق)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#594045] mb-1">
              عدد الأشخاص / الضيوف
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNumberOfPersons((prev) => Math.max(1, prev - 1))}
                disabled={numberOfPersons <= 1}
                className="w-10 h-10 rounded-xl bg-[#FAF6ED] border-2 border-[#D4AF37] disabled:opacity-40 text-[#121212] font-black text-lg flex items-center justify-center cursor-pointer hover:bg-[#121212] hover:text-[#D4AF37] transition-all"
              >
                -
              </button>
              <div className="flex-1 bg-white border border-gray-300 rounded-xl py-2 px-3 text-center font-black text-sm text-[#121212] flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base text-[#D4AF37]">group</span>
                <span>{numberOfPersons} {numberOfPersons === 1 ? 'شخص واحد' : numberOfPersons === 2 ? 'شخصين' : 'أشخاص'}</span>
              </div>
              <button
                type="button"
                onClick={() => setNumberOfPersons((prev) => prev + 1)}
                className="w-10 h-10 rounded-xl bg-[#FAF6ED] border-2 border-[#D4AF37] text-[#121212] font-black text-lg flex items-center justify-center cursor-pointer hover:bg-[#121212] hover:text-[#D4AF37] transition-all"
              >
                +
              </button>
            </div>
            {numberOfPersons > 1 && selectedService && (
              <p className="text-[11px] font-bold text-[#9b0044] mt-1 text-end">
                إجمالي السعر للخدمة: ({selectedService.priceQAR} ر.ق × {numberOfPersons} = {basePrice * numberOfPersons} ر.ق)
              </p>
            )}
          </div>

          {/* Coupon Code Section */}
          <div className="bg-[#FAF6ED] p-3.5 rounded-2xl border border-[#D4AF37]/40 space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-[#121212] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-[#D4AF37]">local_offer</span>
                <span>كوبون الخصم (اختياري)</span>
              </label>
              {appliedCoupon && (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                  <span>إلغاء الخصم</span>
                </button>
              )}
            </div>

            {!appliedCoupon ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="كود الخصم (مثال: GLOW10)"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponError('');
                    }}
                    className="flex-1 border border-gray-300 rounded-xl py-2 px-3 text-xs uppercase font-bold focus:outline-none focus:border-[#9b0044] bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="bg-[#121212] hover:bg-[#2a2a2a] text-[#D4AF37] border border-[#D4AF37] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all shadow-xs"
                  >
                    تطبيق
                  </button>
                </div>

                {/* Available active coupons chips */}
                {coupons && coupons.filter((c) => c.isActive && c.usedCount < c.maxUses).length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-gray-500 font-bold">كوبونات متوفرة:</span>
                    {coupons
                      .filter((c) => c.isActive && c.usedCount < c.maxUses)
                      .map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setCouponInput(c.code);
                            handleApplyCoupon(c.code);
                          }}
                          className="bg-white hover:bg-[#121212] hover:text-[#D4AF37] border border-[#D4AF37]/50 text-[#121212] text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all cursor-pointer shadow-2xs"
                        >
                          {c.code} ({c.discountType === 'percentage' ? `${c.discountValue}%` : `${c.discountValue} ر.ق`})
                        </button>
                      ))}
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    <span>{couponError}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                  <span>الكوبون المفعل: <strong className="text-emerald-700">{appliedCoupon.code}</strong></span>
                </div>
                <span className="bg-emerald-200 text-emerald-900 text-[11px] px-2 py-0.5 rounded-md">
                  خصم {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `${appliedCoupon.discountValue} ر.ق`}
                </span>
              </div>
            )}

            {/* Price Summary Calculation */}
            {selectedService && (
              <div className="pt-2 border-t border-[#D4AF37]/20 text-xs space-y-1 font-bold">
                <div className="flex justify-between text-gray-600">
                  <span>السعر الأصلي:</span>
                  <span>{originalPrice} ر.ق</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>مبلغ الخصم:</span>
                    <span>- {discountAmount} ر.ق</span>
                  </div>
                )}
                <div className="flex justify-between text-[#121212] font-black text-sm pt-1 border-t border-gray-200">
                  <span>إجمالي المبلغ المستحق:</span>
                  <span className="text-[#9b0044]">{finalPrice} ر.ق</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#594045] mb-1">
                التاريخ
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
                className="w-full border border-gray-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#9b0044] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#594045] mb-1">
                التوقيت
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border border-gray-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#9b0044] bg-white"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#594045] mb-1">
              حالة الحجز الأولى
            </label>
            <div className="flex gap-4 pt-1">
              <label className="flex items-center gap-2 text-sm text-[#1c1b1b] font-bold">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'Confirmed'}
                  onChange={() => setStatus('Confirmed')}
                />
                مؤكد (Confirmed)
              </label>
              <label className="flex items-center gap-2 text-sm text-[#1c1b1b] font-bold">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'Pending'}
                  onChange={() => setStatus('Pending')}
                />
                معلق (Pending)
              </label>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-[#594045] py-3 rounded-xl font-bold text-sm hover:bg-gray-100 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn-burgundy flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer shadow-md"
            >
              حفظ الموعد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
