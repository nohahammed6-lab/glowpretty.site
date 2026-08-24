import React, { useState } from 'react';
import { Service, CategoryItem } from '../types';
import { CloudinaryImageUploader } from './CloudinaryImageUploader';

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newService: Service) => void;
  categories: CategoryItem[];
}

export const NewServiceModal: React.FC<NewServiceModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categories,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(categories[0]?.id || 'hair');
  const [priceQAR, setPriceQAR] = useState<number>(300);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [description, setDescription] = useState('');
  const [arabicTitle, setArabicTitle] = useState('');
  const [arabicDescription, setArabicDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDa1kmAYlPAESsmMTj8fLNVnuNpGhcEbhb_sA3eLnpMjMojqKWbzpWE7m5pe6vWWxJoDMl0RK4X9n8RqVn6gLqu2eLQjajQrq-PP8ilxlnTS7f4B3EbM5MCqmlijpgaCiCrXvqqWvx6qW0kSt2F_MwhawkhFDJOTuPKEsjdsgWvrHl9NyEj2Ul7NVGzl_Ljdejn3Gup7WkjCKLlrbeDw1JEQGITH36Ylrzw7fpRMl4t6jCX52Ffz_ON'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `srv-${Date.now().toString().slice(-4)}`;

    onAdd({
      id,
      title,
      category,
      priceQAR: Number(priceQAR),
      durationMinutes: Number(durationMinutes),
      description,
      arabicTitle: arabicTitle || title,
      arabicPrice: `${priceQAR} ر.ق`,
      arabicDescription: arabicDescription || description,
      imageUrl,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-[#D4AF37]/40 relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#6b5a60] hover:text-[#9b0044] p-1"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h3 className="font-display text-2xl font-extrabold text-[#9b0044] mb-1">
          إضافة خدمة تجميل جديدة (قطر 🇶🇦)
        </h3>
        <p className="text-xs text-[#6b5a60] mb-6">أضيفي خدمة جديدة لقائمة خدمات غلو بريتي بالريال القطري.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#594045] mb-1">
              اسم الخدمة بالإنكليزية
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Keratin Hair Treatment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#9b0044]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9b0044] mb-1">
              اسم الخدمة بالعربية
            </label>
            <input
              type="text"
              required
              placeholder="مثال: علاج الكيراتين الملكي"
              value={arabicTitle}
              onChange={(e) => setArabicTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#9b0044]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#594045] mb-1">
                تصنيف الخدمة
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#9b0044] bg-white font-bold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.arabicLabel} ({c.label})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#594045] mb-1">
                السعر بالريال القطري (ر.ق)
              </label>
              <input
                type="number"
                required
                min="50"
                value={priceQAR}
                onChange={(e) => setPriceQAR(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#9b0044]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#594045] mb-1">
              مدة الجلسة (بالدقائق)
            </label>
            <input
              type="number"
              required
              min="15"
              step="15"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#9b0044]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#594045] mb-1">
              وصف الخدمة بالعربية
            </label>
            <textarea
              required
              rows={2}
              placeholder="شرح مميزات وفوائد الخدمة..."
              value={arabicDescription}
              onChange={(e) => setArabicDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#9b0044]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#594045] mb-1">
              Description in English
            </label>
            <textarea
              required
              rows={2}
              placeholder="Treatment details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#9b0044]"
            />
          </div>

          <CloudinaryImageUploader
            label="صورة الخدمة (رفع مباشر إلى Cloudinary ☁️)"
            value={imageUrl}
            onChange={setImageUrl}
            isArabic={true}
            required
            placeholder="رابط الصورة المرفوعة (secure_url)..."
          />

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
              إضافة للكتالوج
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
