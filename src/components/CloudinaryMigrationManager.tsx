import React, { useState, useEffect, useRef } from 'react';
import {
  DiscoveredImage,
  AppDataForMigration,
  DatabaseUpdateCallbacks,
  discoverAllImages,
  migrateSingleImage,
  persistMigratedUrl,
  isCloudinaryUrl,
} from '../lib/migrationService';

interface CloudinaryMigrationManagerProps {
  appData: AppDataForMigration;
  callbacks?: DatabaseUpdateCallbacks;
  isArabic?: boolean;
}

export const CloudinaryMigrationManager: React.FC<CloudinaryMigrationManagerProps> = ({
  appData,
  callbacks,
  isArabic = true,
}) => {
  const [discoveredImages, setDiscoveredImages] = useState<DiscoveredImage[]>([]);
  const [isMigrating, setIsMigrating] = useState<boolean>(false);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [activeStepText, setActiveStepText] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'success' | 'failed' | 'already_migrated'>('all');
  const [notice, setNotice] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);

  const isMigratingRef = useRef<boolean>(false);
  isMigratingRef.current = isMigrating;

  // Scan and discover images when component mounts or when underlying data changes
  useEffect(() => {
    const list = discoverAllImages(appData);
    setDiscoveredImages((prevList) => {
      // If we already have state in prevList (e.g., failed statuses or intermediate progress), preserve statuses!
      if (prevList.length === 0) return list;

      const prevMap = new Map<string, DiscoveredImage>(prevList.map((img) => [img.id, img]));
      return list.map((item) => {
        const prev = prevMap.get(item.id);
        if (prev) {
          // If previous attempt had failed or was success, preserve that status
          return {
            ...item,
            status: prev.status === 'migrating' ? 'pending' : prev.status,
            error: prev.error,
            newSecureUrl: prev.newSecureUrl || item.newSecureUrl,
            currentUrl: prev.newSecureUrl || item.currentUrl,
            isCloudinary: isCloudinaryUrl(item.currentUrl) || isCloudinaryUrl(prev.newSecureUrl || ''),
          };
        }
        return item;
      });
    });
  }, [appData]);

  // Derived Statistics
  const totalCount = discoveredImages.length;
  const migratedCount = discoveredImages.filter(
    (img) => img.status === 'success' || img.status === 'already_migrated' || isCloudinaryUrl(img.currentUrl)
  ).length;
  const failedCount = discoveredImages.filter((img) => img.status === 'failed').length;
  const pendingCount = discoveredImages.filter((img) => img.status === 'pending').length;
  const progressPercent = totalCount > 0 ? Math.round((migratedCount / totalCount) * 100) : 0;

  // Source breakdowns
  const sourceBreakdown = {
    service: discoveredImages.filter((img) => img.sourceType === 'service').length,
    gallery: discoveredImages.filter((img) => img.sourceType === 'gallery').length,
    about: discoveredImages.filter((img) => img.sourceType === 'about').length,
    site_settings: discoveredImages.filter((img) => img.sourceType === 'site_settings').length,
    category: discoveredImages.filter((img) => img.sourceType === 'category').length,
    review: discoveredImages.filter((img) => img.sourceType === 'review').length,
  };

  // Start Migration Process
  const handleStartMigration = async () => {
    const pendingItems = discoveredImages.filter(
      (img) => img.status === 'pending' || img.status === 'failed'
    );

    if (pendingItems.length === 0) {
      setNotice({
        type: 'success',
        text: isArabic
          ? '✨ جميع الصور في الموقع مرحلة بالفعل إلى Cloudinary بنجاح!'
          : '✨ All images in the website are already migrated to Cloudinary!',
      });
      return;
    }

    setIsMigrating(true);
    isMigratingRef.current = true;
    setNotice({
      type: 'info',
      text: isArabic
        ? '⏳ جاري بدء ترحيل الصور القديمة إلى Cloudinary...'
        : '⏳ Starting migration of old images to Cloudinary...',
    });

    for (let i = 0; i < discoveredImages.length; i++) {
      if (!isMigratingRef.current) {
        setNotice({
          type: 'info',
          text: isArabic ? '⏸️ تم إيقاف عملية الترحيل مؤقتاً.' : '⏸️ Migration paused.',
        });
        break;
      }

      const img = discoveredImages[i];
      if (img.status === 'already_migrated' || img.status === 'success') {
        continue;
      }

      setActiveImageId(img.id);
      setActiveStepText(
        isArabic
          ? `جاري تحميل وعرض ${img.sourceLabel}...`
          : `Processing ${img.sourceLabel}...`
      );

      // Update image state to 'migrating'
      setDiscoveredImages((prev) =>
        prev.map((item) => (item.id === img.id ? { ...item, status: 'migrating', progress: 10, error: undefined } : item))
      );

      try {
        setActiveStepText(
          isArabic
            ? `جاري تحويل الصورة المرفوعة لـ Cloudinary...`
            : `Uploading image to Cloudinary...`
        );

        // Upload to Cloudinary
        const secureUrl = await migrateSingleImage(img, (pct) => {
          setDiscoveredImages((prev) =>
            prev.map((item) => (item.id === img.id ? { ...item, progress: Math.max(10, pct) } : item))
          );
        });

        // Persist into database & local state
        setActiveStepText(
          isArabic
            ? `جاري حفظ الرابط الآمن (secure_url) في قاعدة البيانات...`
            : `Saving secure_url to database...`
        );
        await persistMigratedUrl(img, secureUrl, appData, callbacks);

        // Update item status to success
        setDiscoveredImages((prev) =>
          prev.map((item) =>
            item.id === img.id
              ? {
                  ...item,
                  status: 'success',
                  currentUrl: secureUrl,
                  newSecureUrl: secureUrl,
                  isCloudinary: true,
                  progress: 100,
                  error: undefined,
                }
              : item
          )
        );
      } catch (err: any) {
        console.error(`Migration error for ${img.sourceLabel}:`, err);
        const errMsg = err?.message || (isArabic ? 'فشل الترحيل إلى Cloudinary' : 'Migration failed');

        // Record error and mark as failed
        setDiscoveredImages((prev) =>
          prev.map((item) =>
            item.id === img.id
              ? {
                  ...item,
                  status: 'failed',
                  error: errMsg,
                  progress: 0,
                }
              : item
          )
        );
      }

      // Small pause between items to keep browser thread smooth
      await new Promise((r) => setTimeout(r, 200));
    }

    setIsMigrating(false);
    setActiveImageId(null);
    setActiveStepText('');
  };

  // Pause Migration
  const handleStopMigration = () => {
    setIsMigrating(false);
    isMigratingRef.current = false;
    setNotice({
      type: 'info',
      text: isArabic ? '⏸️ تم طلب إيقاف الترحيل.' : '⏸️ Pause requested.',
    });
  };

  // Single Retry for a specific failed image
  const handleRetrySingle = async (itemToRetry: DiscoveredImage) => {
    setActiveImageId(itemToRetry.id);
    setActiveStepText(
      isArabic
        ? `جاري إعادة محاولة ترحيل ${itemToRetry.sourceLabel}...`
        : `Retrying ${itemToRetry.sourceLabel}...`
    );

    setDiscoveredImages((prev) =>
      prev.map((item) => (item.id === itemToRetry.id ? { ...item, status: 'migrating', progress: 10, error: undefined } : item))
    );

    try {
      const secureUrl = await migrateSingleImage(itemToRetry, (pct) => {
        setDiscoveredImages((prev) =>
          prev.map((item) => (item.id === itemToRetry.id ? { ...item, progress: Math.max(10, pct) } : item))
        );
      });

      await persistMigratedUrl(itemToRetry, secureUrl, appData, callbacks);

      setDiscoveredImages((prev) =>
        prev.map((item) =>
          item.id === itemToRetry.id
            ? {
                ...item,
                status: 'success',
                currentUrl: secureUrl,
                newSecureUrl: secureUrl,
                isCloudinary: true,
                progress: 100,
                error: undefined,
              }
            : item
        )
      );

      setNotice({
        type: 'success',
        text: isArabic
          ? `✨ تم بنجاح ترحيل صورة (${itemToRetry.sourceLabel}) إلى Cloudinary!`
          : `✨ Successfully migrated image (${itemToRetry.sourceLabel})!`,
      });
    } catch (err: any) {
      const errMsg = err?.message || (isArabic ? 'فشل الترحيل' : 'Retry failed');
      setDiscoveredImages((prev) =>
        prev.map((item) =>
          item.id === itemToRetry.id
            ? {
                ...item,
                status: 'failed',
                error: errMsg,
                progress: 0,
              }
            : item
        )
      );
    } finally {
      setActiveImageId(null);
      setActiveStepText('');
    }
  };

  const filteredImages = discoveredImages.filter((img) => {
    if (filter === 'all') return true;
    if (filter === 'already_migrated') return img.status === 'already_migrated' || img.status === 'success';
    return img.status === filter;
  });

  const failedImages = discoveredImages.filter((img) => img.status === 'failed');

  return (
    <div className="space-y-6 text-start">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#121212] via-[#2a1720] to-[#121212] p-5 sm:p-6 rounded-3xl text-white shadow-xl border border-[#D4AF37]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#D4AF37] text-2xl">cloud_sync</span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-[#D4AF37]">
              {isArabic ? 'ترحيل الصور القديمة إلى Cloudinary ☁️' : 'Migrate Old Images to Cloudinary ☁️'}
            </h3>
          </div>
          <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
            {isArabic
              ? 'يقوم هذا النظام بفحص جميع صور الموقع القديمة (الخدمات، المعرض، عن الصالون، الإعدادات) ونقل نسخ منها تلقائياً إلى Cloudinary وتحديث روابط قاعدة البيانات بصورة آمنة وغير مدمرة.'
              : 'Automatically inspects all legacy images and migrates them safely to Cloudinary without deleting original records or files.'}
          </p>
        </div>

        {/* Cloud Config Badge */}
        <div className="bg-black/40 border border-[#D4AF37]/40 rounded-2xl px-3.5 py-2 text-[11px] font-mono text-[#D4AF37] shrink-0">
          <div>Cloud Name: <span className="text-white font-bold">qazdrpcx</span></div>
          <div>Upload Preset: <span className="text-white font-bold">site2_images</span></div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-[11px] font-bold text-gray-500 mb-1">
            {isArabic ? 'إجمالي الصور المكتشفة' : 'Total Images Discovered'}
          </div>
          <div className="text-2xl font-black text-[#121212]">{totalCount}</div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 mb-1">
            {isArabic ? 'تم الترحيل لـ Cloudinary' : 'Migrated to Cloudinary'}
          </div>
          <div className="text-2xl font-black text-emerald-800 flex items-center gap-1">
            <span>{migratedCount}</span>
            <span className="text-xs text-emerald-600 font-bold">({progressPercent}%)</span>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700 mb-1">
            {isArabic ? 'الصور المتبقية' : 'Remaining Images'}
          </div>
          <div className="text-2xl font-black text-amber-800">{pendingCount}</div>
        </div>

        <div className="bg-red-50 p-4 rounded-2xl border border-red-200 shadow-xs">
          <div className="text-[11px] font-bold text-red-700 mb-1">
            {isArabic ? 'صور فشل نقلها' : 'Failed Migrations'}
          </div>
          <div className="text-2xl font-black text-red-800">{failedCount}</div>
        </div>
      </div>

      {/* Overall Progress Bar & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/30 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm text-[#594045] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#9b0044] text-lg">auto_mode</span>
              <span>{isArabic ? 'نسبة إنجاز الترحيل الكلية' : 'Overall Migration Progress'}</span>
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {migratedCount} {isArabic ? 'من أصل' : 'of'} {totalCount} {isArabic ? 'صورة مرفوعة على Cloudinary' : 'images hosted on Cloudinary'}
            </p>
          </div>

          {/* Action Control Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isMigrating ? (
              <button
                onClick={handleStartMigration}
                disabled={totalCount === 0}
                className="btn-burgundy px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">play_arrow</span>
                <span>
                  {migratedCount > 0
                    ? isArabic ? 'استكمال الترحيل' : 'Resume Migration'
                    : isArabic ? 'بدء الترحيل إلى Cloudinary' : 'Start Cloudinary Migration'}
                </span>
              </button>
            ) : (
              <button
                onClick={handleStopMigration}
                className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">pause</span>
                <span>{isArabic ? 'إيقاف الترحيل مؤقتاً' : 'Pause Migration'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden border border-gray-200">
          <div
            className="bg-gradient-to-r from-[#9b0044] via-[#D4AF37] to-emerald-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Currently Processing Status Indicator */}
        {isMigrating && activeStepText && (
          <div className="p-3 bg-[#fdf5f7] border border-[#9b0044]/30 rounded-xl flex items-center gap-3 animate-pulse">
            <span className="material-symbols-outlined text-[#9b0044] animate-spin text-xl">progress_activity</span>
            <div className="text-xs font-bold text-[#9b0044] flex-1 truncate">{activeStepText}</div>
          </div>
        )}

        {/* Notice alert */}
        {notice && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              notice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : notice.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <span className="material-symbols-outlined text-base shrink-0">info</span>
            <span>{notice.text}</span>
          </div>
        )}
      </div>

      {/* Sources Breakdown Pills */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
        <h5 className="text-xs font-bold text-[#594045]">
          {isArabic ? 'ملخص الصور المكتشفة حسب الأقسام:' : 'Discovered Images Breakdown:'}
        </h5>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg border font-medium">
            ✂️ {isArabic ? 'الخدمات' : 'Services'}: <strong className="text-[#9b0044]">{sourceBreakdown.service}</strong>
          </span>
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg border font-medium">
            🖼️ {isArabic ? 'المعرض' : 'Gallery'}: <strong className="text-[#9b0044]">{sourceBreakdown.gallery}</strong>
          </span>
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg border font-medium">
            🏰 {isArabic ? 'عن الصالون' : 'About'}: <strong className="text-[#9b0044]">{sourceBreakdown.about}</strong>
          </span>
          {sourceBreakdown.site_settings > 0 && (
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg border font-medium">
              ⚙️ {isArabic ? 'الإعدادات' : 'Settings'}: <strong className="text-[#9b0044]">{sourceBreakdown.site_settings}</strong>
            </span>
          )}
          {sourceBreakdown.category > 0 && (
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg border font-medium">
              🏷️ {isArabic ? 'التصنيفات' : 'Categories'}: <strong className="text-[#9b0044]">{sourceBreakdown.category}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Failed Images Section (if any failed) */}
      {failedImages.length > 0 && (
        <div className="bg-red-50 p-5 rounded-2xl border border-red-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
            <span className="material-symbols-outlined text-red-600 text-xl">error</span>
            <span>{isArabic ? `الصور التي فشل نقلها (${failedImages.length})` : `Failed Images (${failedImages.length})`}</span>
          </div>
          <p className="text-xs text-red-700">
            {isArabic
              ? 'لم تؤثر عملية الترحيل على عمل الموقع، وتم الاحتفاظ بالرابط الأصلي كما هو. يمكنك مراجعة سبب الخطأ وإعادة المحاولة بنقرة واحدة.'
              : 'Failed migrations kept their original URLs intact. Review error details below and retry.'}
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {failedImages.map((failedItem) => (
              <div
                key={failedItem.id}
                className="bg-white p-3 rounded-xl border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border bg-gray-100 shrink-0 flex items-center justify-center">
                    {failedItem.currentUrl && failedItem.currentUrl.trim() ? (
                      <img src={failedItem.currentUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-gray-400 text-sm">broken_image</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-800 truncate">{failedItem.sourceLabel}</div>
                    <div className="text-red-600 text-[11px] font-medium truncate">{failedItem.error}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRetrySingle(failedItem)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  <span>{isArabic ? 'إعادة المحاولة' : 'Retry'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Inventory List & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <h4 className="font-bold text-sm text-[#594045] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#9b0044] text-lg">list_alt</span>
            <span>{isArabic ? 'سجل جميع صور الموقع وتفاصيل الترحيل' : 'Detailed Inventory & Status'}</span>
          </h4>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                filter === 'all'
                  ? 'bg-[#121212] text-[#D4AF37]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isArabic ? `الكل (${totalCount})` : `All (${totalCount})`}
            </button>
            <button
              onClick={() => setFilter('already_migrated')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                filter === 'already_migrated'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {isArabic ? `Cloudinary (${migratedCount})` : `Cloudinary (${migratedCount})`}
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                filter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              {isArabic ? `قيد الترحيل (${pendingCount})` : `Pending (${pendingCount})`}
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                filter === 'failed'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              {isArabic ? `فشل (${failedCount})` : `Failed (${failedCount})`}
            </button>
          </div>
        </div>

        {/* Images List */}
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto pr-1">
          {filteredImages.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500 font-medium">
              {isArabic ? 'لا توجد صور مطابقة لهذا الفلتر' : 'No images match this filter'}
            </div>
          ) : (
            filteredImages.map((img) => (
              <div key={img.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-50 flex items-center justify-center">
                    {img.currentUrl && img.currentUrl.trim() ? (
                      <img src={img.currentUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-gray-400 text-base">image</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[#121212] truncate">{img.sourceLabel}</div>
                    <div className="text-[11px] font-mono text-gray-400 truncate max-w-md">
                      {img.currentUrl}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  {img.status === 'already_migrated' || img.status === 'success' ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                      <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                      <span>Cloudinary ☁️</span>
                    </span>
                  ) : img.status === 'migrating' ? (
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-blue-200 animate-pulse">
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      <span>{img.progress || 10}%</span>
                    </span>
                  ) : img.status === 'failed' ? (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-red-200">
                      <span className="material-symbols-outlined text-sm text-red-600">error</span>
                      <span>{isArabic ? 'فشل' : 'Failed'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
                      <span className="material-symbols-outlined text-sm text-amber-600">hourglass_empty</span>
                      <span>{isArabic ? 'بانتظار النقل' : 'Pending'}</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
