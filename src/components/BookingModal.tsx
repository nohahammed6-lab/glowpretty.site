import React from 'react';
import { Appointment, Language } from '../types';

interface BookingModalProps {
  appointment: Appointment | null;
  language: Language;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  appointment,
  language,
  onClose,
}) => {
  if (!appointment) return null;
  const isArabic = language === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FFFDF5] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 shadow-2xl border-2 border-[#D4AF37] relative text-center transform transition-all animate-scale-up">
        {/* Top Decorative Gold & Black Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#121212] via-[#D4AF37] to-[#121212]" />

        {/* Floating Sparkle / Success Badge */}
        <div className="relative mx-auto mb-5 w-20 h-20">
          <div className="absolute inset-0 bg-[#D4AF37]/25 rounded-full animate-ping" />
          <div className="relative w-20 h-20 bg-gradient-to-tr from-[#121212] to-[#262626] rounded-full flex items-center justify-center text-[#D4AF37] shadow-xl border-2 border-[#D4AF37]">
            <span className="material-symbols-outlined text-4xl font-extrabold text-[#D4AF37]">task_alt</span>
          </div>
        </div>

        {/* Header */}
        <span className="inline-block bg-[#FAF6ED] text-[#121212] border border-[#D4AF37]/50 px-3.5 py-1 rounded-full text-xs font-bold mb-2">
          {isArabic ? '✨ تم تأكيد طلب الحجز بنجاح' : '✨ Booking Request Confirmed'}
        </span>

        <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#121212] mb-2 leading-tight">
          {isArabic ? 'شكراً لكِ، يسعدنا استقبالكِ! 🌸' : 'Thank You! We Can’t Wait to Welcome You! 🌸'}
        </h3>
        
        <p className="text-sm text-[#3a3528] mb-6 max-w-md mx-auto leading-relaxed">
          {isArabic
            ? 'تم تسجيل طلب حجزكِ بنجاح في نظام صالون جلو بريتي. سنقوم بالتواصل معكِ قريباً لتأكيد الموعد النهائي.'
            : 'Your appointment request has been recorded in our system. Our team will contact you shortly to confirm.'}
        </p>

        {/* Detailed Ticket Card */}
        <div className="bg-[#FAF6ED] p-5 rounded-2xl border border-[#D4AF37]/50 text-start space-y-3 mb-6 shadow-xs text-xs sm:text-sm relative overflow-hidden">
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-[#D4AF37]/15 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex justify-between items-center border-b border-[#D4AF37]/30 pb-2.5">
            <span className="text-[#121212] font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-[#D4AF37]">person</span>
              {isArabic ? 'اسم العميلة:' : 'Client Name:'}
            </span>
            <span className="font-extrabold text-[#121212]">{appointment.clientName}</span>
          </div>

          <div className="flex justify-between items-center border-b border-[#D4AF37]/30 pb-2.5">
            <span className="text-[#121212] font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-[#D4AF37]">call</span>
              {isArabic ? 'رقم الهاتف:' : 'Phone Number:'}
            </span>
            <span className="font-extrabold text-[#121212]" dir="ltr">{appointment.clientPhone}</span>
          </div>

          <div className="flex justify-between items-start border-b border-[#D4AF37]/30 pb-2.5">
            <span className="text-[#121212] font-bold flex items-center gap-1.5 whitespace-nowrap">
              <span className="material-symbols-outlined text-base text-[#D4AF37]">spa</span>
              {isArabic ? 'الخدمات المختارة:' : 'Service(s):'}
            </span>
            <span className="font-extrabold text-[#121212] text-end max-w-[220px]">
              {appointment.serviceName}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-[#D4AF37]/30 pb-2.5">
            <span className="text-[#121212] font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-[#D4AF37]">calendar_month</span>
              {isArabic ? 'التاريخ والوقت:' : 'Date & Time:'}
            </span>
            <span className="font-extrabold text-[#121212]">
              {appointment.date} — {appointment.time}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-[#3a3528] font-semibold text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-[#D4AF37]">qr_code</span>
              {isArabic ? 'رقم الحجز المرجعي:' : 'Booking Ref:'}
            </span>
            <span className="font-mono text-xs font-bold text-[#121212] bg-white px-2.5 py-1 rounded-md border border-[#D4AF37]">
              {appointment.id}
            </span>
          </div>
        </div>

        {/* Action Button: Return to Home */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-[#121212] to-[#262626] text-[#FFFDF0] py-4 rounded-full font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl hover:from-[#262626] hover:to-[#000000] active:scale-98 transition-all cursor-pointer border border-[#D4AF37] flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg text-[#D4AF37]">home</span>
          <span>{isArabic ? 'العودة للصفحة الرئيسية 🌸' : 'Return to Home Page 🌸'}</span>
        </button>
      </div>
    </div>
  );
};

