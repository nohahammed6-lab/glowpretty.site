import React, { useState } from 'react';
import { Service, Language, Review } from '../types';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReview: (review: Review) => void;
  services: Service[];
  language: Language;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  onAddReview,
  services,
  language,
}) => {
  const isArabic = language === 'ar';

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    const colors = ['bg-[#ffd9df]', 'bg-[#f4dce4]', 'bg-[#e1bec4]', 'bg-[#f5e6d3]'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newReview: Review = {
      id: `rev-${Date.now().toString().slice(-5)}`,
      name: name.trim(),
      role: role.trim() || (isArabic ? 'عميلة موثوقة' : 'Verified Client'),
      avatarColor: randomColor,
      rating,
      comment: comment.trim(),
      serviceName: serviceName || undefined,
      date: new Date().toISOString().split('T')[0],
    };

    onAddReview(newReview);
    setName('');
    setRole('');
    setServiceName('');
    setRating(5);
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-[#D4AF37]/40 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header Decor */}
        <div className="absolute top-0 right-0 left-0 h-3 bg-gradient-to-r from-[#D4AF37] via-[#9b0044] to-[#D4AF37]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 text-gray-400 hover:text-[#9b0044] bg-gray-100 hover:bg-[#ffd9df] p-2 rounded-full transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="text-center mt-2 mb-6">
          <div className="w-14 h-14 bg-[#fdf5f7] border border-[#D4AF37] text-[#9b0044] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            <span className="material-symbols-outlined text-2xl">rate_review</span>
          </div>
          <h3 className="font-display font-extrabold text-2xl text-[#9b0044]">
            {isArabic ? 'أضيفي تقييمكِ وانطباعكِ' : 'Write Your Review'}
          </h3>
          <p className="text-xs text-[#594045] mt-1 font-semibold">
            {isArabic
              ? 'رأيكِ يهمنا جداً ويساعدنا على تقديم أرقى خدمات التجميل في الدوحة'
              : 'Your feedback helps us maintain royal beauty standards in Qatar.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating Selection */}
          <div className="text-center bg-[#fdf5f7] p-4 rounded-2xl border border-[#D4AF37]/30">
            <label className="block text-xs font-bold text-[#8f003f] mb-2">
              {isArabic ? 'التقييم بالنجوم:' : 'Select Star Rating:'}
            </label>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 cursor-pointer text-[#D4AF37]"
                >
                  <span className={`material-symbols-outlined text-3xl ${
                    star <= (hoverRating || rating) ? 'filled' : 'opacity-30'
                  }`}>
                    star
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Client Name */}
          <div>
            <label className="block text-xs font-bold text-[#594045] mb-1">
              {isArabic ? 'اسمكِ الكريم *:' : 'Your Name *:'}
            </label>
            <input
              type="text"
              required
              placeholder={isArabic ? 'مثال: نورة المري' : 'e.g., Noura Al-Marri'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 focus:border-[#9b0044] rounded-xl p-3 text-sm font-semibold bg-white outline-none transition-all"
            />
          </div>

          {/* Service Selected */}
          <div>
            <label className="block text-xs font-bold text-[#594045] mb-1">
              {isArabic ? 'الخدمة التي قمتِ بتجربتها (اختياري):' : 'Service Experienced (Optional):'}
            </label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full border border-gray-300 focus:border-[#9b0044] rounded-xl p-3 text-sm font-semibold bg-white outline-none transition-all"
            >
              <option value="">{isArabic ? '-- اختر الخدمة --' : '-- Select Service --'}</option>
              {services.map((srv) => (
                <option key={srv.id} value={isArabic ? srv.arabicTitle : srv.title}>
                  {isArabic ? srv.arabicTitle : srv.title}
                </option>
              ))}
            </select>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-[#594045] mb-1">
              {isArabic ? 'تعليقكِ وتقييمكِ للخدمة *:' : 'Your Review & Comments *:'}
            </label>
            <textarea
              required
              rows={4}
              placeholder={isArabic ? 'اكتبي تفاصيل تجربتكِ مع الصالون والخدمة...' : 'Write details about your salon experience...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-300 focus:border-[#9b0044] rounded-xl p-3 text-sm bg-white outline-none transition-all font-semibold"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              className="w-full btn-burgundy py-3 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">send</span>
              <span>{isArabic ? 'إرسال التقييم' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
