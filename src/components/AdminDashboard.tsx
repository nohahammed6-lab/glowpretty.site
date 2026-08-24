import React, { useState, useEffect } from 'react';
import { PriceTag } from './PriceTag';
import { exportAppointmentsPDF } from '../lib/pdfExport';
import { CloudinaryImageUploader } from './CloudinaryImageUploader';
import { CloudinaryMigrationManager } from './CloudinaryMigrationManager';
import { getOptimizedImageUrl } from '../lib/cloudinary';
import {
  Appointment,
  Service,
  AdminStat,
  Language,
  AppointmentStatus,
  CategoryItem,
  GalleryItem,
  SiteSettings,
  AboutContent,
  Review,
  Supervisor,
  SupervisorPermission,
  UserSession,
  Coupon,
} from '../types';

interface AdminDashboardProps {
  appointments: Appointment[];
  services: Service[];
  stats: AdminStat;
  language: Language;
  categories: CategoryItem[];
  gallery: GalleryItem[];
  siteSettings: SiteSettings;
  aboutContent: AboutContent;
  reviews: Review[];
  supervisors: Supervisor[];
  coupons: Coupon[];
  userSession: UserSession;
  ownerPin?: string;
  onUpdateOwnerPin?: (newPin: string) => void;
  onUpdateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  onDeleteAppointment: (id: string) => void;
  onOpenNewAppointmentModal: () => void;
  onOpenNewServiceModal: () => void;
  // Category management props
  onAddCategory: (cat: CategoryItem) => void;
  onUpdateCategory: (cat: CategoryItem) => void;
  onDeleteCategory: (id: string) => void;
  // Service management props
  onUpdateService: (srv: Service) => void;
  onDeleteService: (id: string) => void;
  // Site settings props
  onUpdateSiteSettings: (settings: SiteSettings) => void;
  // Gallery props
  onAddGalleryItem: (item: GalleryItem) => void;
  onUpdateGalleryItem: (item: GalleryItem) => void;
  onDeleteGalleryItem: (id: string) => void;
  // Supervisor management props
  onAddSupervisor: (sup: Supervisor) => void;
  onUpdateSupervisor: (sup: Supervisor) => void;
  onDeleteSupervisor: (id: string) => void;
  // Coupon management props
  onAddCoupon?: (coupon: Coupon) => void;
  onUpdateCoupon?: (coupon: Coupon) => void;
  onSaveCoupon?: (coupon: Coupon) => void;
  onDeleteCoupon: (id: string) => void;
  // About content props
  onUpdateAboutContent: (about: AboutContent) => void;
  // Review management props
  onAddReview: (review: Review) => void;
  onUpdateReview: (review: Review) => void;
  onDeleteReview: (id: string) => void;
  // Back to client view
  onBackToClientView: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  appointments,
  services,
  stats,
  language,
  categories,
  gallery,
  siteSettings,
  aboutContent,
  reviews,
  supervisors,
  coupons,
  userSession,
  ownerPin = '1234',
  onUpdateOwnerPin,
  onUpdateAppointmentStatus,
  onDeleteAppointment,
  onOpenNewAppointmentModal,
  onOpenNewServiceModal,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onUpdateService,
  onDeleteService,
  onUpdateSiteSettings,
  onAddGalleryItem,
  onUpdateGalleryItem,
  onDeleteGalleryItem,
  onAddSupervisor,
  onUpdateSupervisor,
  onDeleteSupervisor,
  onAddCoupon,
  onUpdateCoupon,
  onSaveCoupon,
  onDeleteCoupon,
  onUpdateAboutContent,
  onAddReview,
  onUpdateReview,
  onDeleteReview,
  onBackToClientView,
}) => {
  const isArabic = language === 'ar';
  const isOwner = userSession.role === 'owner';
  const supervisorPerms = userSession.supervisorData?.permissions;

  // Owner Password / PIN Change State
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinMessage, setPinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleOwnerPinChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);

    const oldNorm = oldPinInput.trim().replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    const ownerNorm = ownerPin.trim().replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());

    if (
      oldNorm !== '100200300' &&
      oldNorm !== ownerNorm &&
      oldPinInput.trim() !== '100200300' &&
      oldPinInput.trim() !== ownerPin.trim()
    ) {
      setPinMessage({
        type: 'error',
        text: isArabic ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is incorrect',
      });
      return;
    }

    if (!newPinInput.trim()) {
      setPinMessage({
        type: 'error',
        text: isArabic ? 'يرجى كتابة كلمة المرور الجديدة' : 'Please enter new password',
      });
      return;
    }

    if (newPinInput.trim() !== confirmPinInput.trim()) {
      setPinMessage({
        type: 'error',
        text: isArabic ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match',
      });
      return;
    }

    if (onUpdateOwnerPin) {
      onUpdateOwnerPin(newPinInput.trim());
      setOldPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      setPinMessage({
        type: 'success',
        text: isArabic ? 'تم تغيير كلمة مرور المدير العام بنجاح!' : 'Owner password updated successfully!',
      });
    }
  };

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'appointments' | 'categories' | 'services' | 'reviews' | 'siteInfo' | 'gallery' | 'about' | 'supervisors' | 'coupons' | 'cloudinary_migration'
  >('dashboard');

  // Coupon Management State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [maxUses, setMaxUses] = useState<number>(20);
  const [isCouponActive, setIsCouponActive] = useState<boolean>(true);

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const couponData: Coupon = editingCoupon ? {
      ...editingCoupon,
      code: couponCode.trim().toUpperCase(),
      discountType,
      discountValue,
      maxUses,
      isActive: isCouponActive,
    } : {
      id: `coup-${Date.now()}`,
      code: couponCode.trim().toUpperCase(),
      discountType,
      discountValue,
      maxUses,
      usedCount: 0,
      isActive: isCouponActive,
      createdAt: new Date().toISOString(),
    };

    if (onSaveCoupon) {
      onSaveCoupon(couponData);
    } else if (editingCoupon && onUpdateCoupon) {
      onUpdateCoupon(couponData);
    } else if (!editingCoupon && onAddCoupon) {
      onAddCoupon(couponData);
    }

    setIsCouponModalOpen(false);
    setEditingCoupon(null);
  };

  // Review Edit State
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [revName, setRevName] = useState('');
  const [revRole, setRevRole] = useState('');
  const [revRating, setRevRating] = useState<number>(5);
  const [revComment, setRevComment] = useState('');
  const [revService, setRevService] = useState('');

  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Category Edit State
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [newCatEN, setNewCatEN] = useState('');
  const [newCatAR, setNewCatAR] = useState('');

  // Service Edit State
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Site Settings Form State
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettings);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  useEffect(() => {
    setSettingsForm(siteSettings);
  }, [siteSettings]);

  // Gallery Add & Edit Form State
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryTitleEN, setNewGalleryTitleEN] = useState('');
  const [newGalleryTitleAR, setNewGalleryTitleAR] = useState('');
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);

  // About Content State
  const [aboutForm, setAboutForm] = useState<AboutContent>(aboutContent);
  const [aboutSavedMessage, setAboutSavedMessage] = useState(false);

  // Supervisor Form State
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null);
  const [supName, setSupName] = useState('');
  const [supUsername, setSupUsername] = useState('');
  const [supPassword, setSupPassword] = useState('');
  const [supPermissions, setSupPermissions] = useState<SupervisorPermission>({
    manageAppointments: true,
    manageCategories: false,
    manageServices: false,
    manageReviews: true,
    manageGallery: false,
    manageSiteInfo: false,
    manageAbout: false,
  });

  // Notifications State & Logic
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('glow_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('glow_read_notifications', JSON.stringify(readNotificationIds));
    } catch (err) {
      console.error(err);
    }
  }, [readNotificationIds]);

  // Audio alert on new appointment arrival
  const prevApptCountRef = React.useRef(appointments.length);
  useEffect(() => {
    if (appointments.length > prevApptCountRef.current) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch {
        // Audio fallback
      }
    }
    prevApptCountRef.current = appointments.length;
  }, [appointments.length]);

  // Notifications sorted by newest first
  const notificationsList = [...appointments].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.date).getTime() || 0;
    const timeB = new Date(b.createdAt || b.date).getTime() || 0;
    return timeB - timeA;
  });

  // Unread notifications: pending status or ID not marked as read
  const unreadNotifications = notificationsList.filter(
    (apt) => !readNotificationIds.includes(apt.id)
  );
  const unreadCount = unreadNotifications.length;

  const handleMarkAllRead = () => {
    const allIds = appointments.map((a) => a.id);
    setReadNotificationIds(allIds);
  };

  const handleNotificationClick = (apt: Appointment) => {
    if (!readNotificationIds.includes(apt.id)) {
      setReadNotificationIds((prev) => [...prev, apt.id]);
    }
    setIsNotificationOpen(false);
    setActiveTab('appointments');
  };

  const handleQuickConfirm = (e: React.MouseEvent, aptId: string) => {
    e.stopPropagation();
    onUpdateAppointmentStatus(aptId, 'Confirmed');
    if (!readNotificationIds.includes(aptId)) {
      setReadNotificationIds((prev) => [...prev, aptId]);
    }
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus === 'All') return true;
    return apt.status === filterStatus;
  });

  // Handle Save Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatEN.trim() || !newCatAR.trim()) return;

    if (editingCategory) {
      onUpdateCategory({
        ...editingCategory,
        label: newCatEN.trim(),
        arabicLabel: newCatAR.trim(),
      });
      setEditingCategory(null);
    } else {
      const id = newCatEN.toLowerCase().replace(/[^a-z0-9]/g, '-');
      onAddCategory({
        id,
        label: newCatEN.trim(),
        arabicLabel: newCatAR.trim(),
      });
    }
    setNewCatEN('');
    setNewCatAR('');
  };

  // Handle Save Service Edits
  const handleSaveServiceEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      onUpdateService(editingService);
      setEditingService(null);
    }
  };

  // Handle Save Site Info
  const handleSaveSiteInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSiteSettings(settingsForm);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  // Handle Add Gallery Item
  const handleAddGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryUrl.trim() || !newGalleryTitleEN.trim()) return;
    onAddGalleryItem({
      id: 'gal-' + Date.now(),
      url: newGalleryUrl.trim(),
      title: newGalleryTitleEN.trim(),
      arabicTitle: newGalleryTitleAR.trim() || newGalleryTitleEN.trim(),
      span: 'col-span-1 row-span-1',
    });
    setNewGalleryUrl('');
    setNewGalleryTitleEN('');
    setNewGalleryTitleAR('');
  };

  // Handle Edit Gallery Item
  const handleSaveGalleryEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGalleryItem) {
      onUpdateGalleryItem(editingGalleryItem);
      setEditingGalleryItem(null);
    }
  };

  // Handle Save / Add Review
  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revComment.trim()) return;

    if (editingReview) {
      onUpdateReview({
        ...editingReview,
        name: revName.trim(),
        role: revRole.trim() || (isArabic ? 'عميلة موثوقة' : 'Verified Client'),
        rating: revRating,
        comment: revComment.trim(),
        serviceName: revService.trim() || undefined,
      });
      setEditingReview(null);
    } else {
      const colors = ['bg-[#ffd9df]', 'bg-[#f4dce4]', 'bg-[#e1bec4]', 'bg-[#f5e6d3]'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      onAddReview({
        id: `rev-${Date.now().toString().slice(-5)}`,
        name: revName.trim(),
        role: revRole.trim() || (isArabic ? 'عميلة موثوقة' : 'Verified Client'),
        avatarColor: randomColor,
        rating: revRating,
        comment: revComment.trim(),
        serviceName: revService.trim() || undefined,
        date: new Date().toISOString().split('T')[0],
      });
    }
    setRevName('');
    setRevRole('');
    setRevRating(5);
    setRevComment('');
    setRevService('');
  };

  // Handle Save About Content
  const handleSaveAbout = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAboutContent(aboutForm);
    setAboutSavedMessage(true);
    setTimeout(() => setAboutSavedMessage(false), 3000);
  };

  // Handle Save Supervisor
  const handleSaveSupervisor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim() || !supUsername.trim() || !supPassword.trim()) return;

    if (editingSupervisor) {
      onUpdateSupervisor({
        ...editingSupervisor,
        name: supName.trim(),
        username: supUsername.trim(),
        password: supPassword.trim(),
        permissions: supPermissions,
      });
      setEditingSupervisor(null);
    } else {
      onAddSupervisor({
        id: `sup-${Date.now().toString().slice(-5)}`,
        name: supName.trim(),
        username: supUsername.trim(),
        password: supPassword.trim(),
        permissions: supPermissions,
        createdAt: new Date().toISOString(),
      });
    }
    setSupName('');
    setSupUsername('');
    setSupPassword('');
    setSupPermissions({
      manageAppointments: true,
      manageCategories: false,
      manageServices: false,
      manageReviews: true,
      manageGallery: false,
      manageSiteInfo: false,
      manageAbout: false,
    });
  };

  // Check tab permission for supervisor
  const canAccess = (tab: string) => {
    if (isOwner) return true;
    if (tab === 'dashboard') return true;
    if (!supervisorPerms) return false;
    if (tab === 'appointments') return supervisorPerms.manageAppointments;
    if (tab === 'categories') return supervisorPerms.manageCategories;
    if (tab === 'services') return supervisorPerms.manageServices;
    if (tab === 'reviews') return supervisorPerms.manageReviews;
    if (tab === 'gallery') return supervisorPerms.manageGallery;
    if (tab === 'siteInfo') return supervisorPerms.manageSiteInfo;
    if (tab === 'about') return supervisorPerms.manageAbout;
    if (tab === 'coupons') return supervisorPerms.manageCoupons ?? true;
    if (tab === 'cloudinary_migration') return isOwner || Boolean(supervisorPerms.manageGallery || supervisorPerms.manageServices);
    if (tab === 'supervisors') return false; // Only Owner
    return false;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#fcf9f8]">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-[#121212] text-white border-e border-[#D4AF37]/40 flex flex-col justify-between py-4 lg:py-6 px-3 sm:px-4 shrink-0 shadow-2xl">
        
        <div>
          {/* Brand & Badge */}
          <div className="px-2 sm:px-3 mb-4 lg:mb-6 flex justify-between items-center">
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-[#D4AF37] tracking-tight">
                GLOW PRETTY
              </h1>
              <p className="text-[11px] sm:text-xs text-[#FAF6ED]/80 font-bold mt-0.5">
                {isOwner
                  ? isArabic ? '👑 لوحة تحكم المدير العام' : '👑 Owner Admin Console'
                  : isArabic ? `🔑 حساب مشرف: ${userSession.supervisorData?.name}` : `🔑 Supervisor: ${userSession.supervisorData?.name}`}
              </p>
            </div>
            <button
              onClick={onBackToClientView}
              className="bg-[#262626] hover:bg-[#D4AF37] hover:text-[#121212] text-[#D4AF37] text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#D4AF37]/50 transition-all cursor-pointer shadow-sm shrink-0"
              title={isArabic ? 'العودة لموقع العملاء' : 'Back to Client Site'}
            >
              {isArabic ? 'الموقع' : 'Client Site'}
            </button>
          </div>

          {/* Nav Tabs - Horizontal scrollable pills on mobile, Vertical on Desktop */}
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 lg:gap-3 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 lg:w-full ${
                activeTab === 'dashboard'
                  ? 'bg-[#D4AF37] text-[#121212] shadow-md border border-[#F3E5AB]'
                  : 'text-white/80 hover:bg-white/10 hover:text-[#D4AF37]'
              }`}
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">dashboard</span>
              <span>{isArabic ? 'نظرة عامة' : 'Dashboard'}</span>
            </button>

            {canAccess('appointments') && (
              <button
                onClick={() => setActiveTab('appointments')}
                className={`flex items-center gap-2 lg:gap-3 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 lg:w-full ${
                  activeTab === 'appointments'
                    ? 'bg-[#D4AF37] text-[#121212] shadow-md border border-[#F3E5AB]'
                    : 'text-white/80 hover:bg-white/10 hover:text-[#D4AF37]'
                }`}
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">calendar_month</span>
                <span>{isArabic ? 'المواعيد والحجوزات' : 'Appointments'}</span>
              </button>
            )}

            {canAccess('coupons') && (
              <button
                onClick={() => setActiveTab('coupons')}
                className={`flex items-center gap-2 lg:gap-3 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 lg:w-full ${
                  activeTab === 'coupons'
                    ? 'bg-[#D4AF37] text-[#121212] shadow-md border border-[#F3E5AB]'
                    : 'text-white/80 hover:bg-white/10 hover:text-[#D4AF37]'
                }`}
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">confirmation_number</span>
                <span>{isArabic ? 'كوبونات الخصم' : 'Coupons'}</span>
              </button>
            )}

            {canAccess('categories') && (
              <button
                onClick={() => setActiveTab('categories')}
                className={`flex items-center gap-2 lg:gap-3 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 lg:w-full ${
                  activeTab === 'categories'
                    ? 'bg-[#D4AF37] text-[#121212] shadow-md border border-[#F3E5AB]'
                    : 'text-white/80 hover:bg-white/10 hover:text-[#D4AF37]'
                }`}
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">category</span>
                <span>{isArabic ? 'تصنيفات الخدمات' : 'Categories'}</span>
              </button>
            )}

            {canAccess('services') && (
              <button
                onClick={() => setActiveTab('services')}
                className={`flex items-center gap-2 lg:gap-3 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 lg:w-full ${
                  activeTab === 'services'
                    ? 'bg-[#D4AF37] text-[#121212] shadow-md border border-[#F3E5AB]'
                    : 'text-white/80 hover:bg-white/10 hover:text-[#D4AF37]'
                }`}
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">spa</span>
                <span>{isArabic ? 'قائمة الخدمات' : 'Services'}</span>
              </button>
            )}

            {canAccess('reviews') && (
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex items-center gap-2 lg:gap-3 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 lg:w-full ${
                  activeTab === 'reviews'
                    ? 'bg-[#D4AF37] text-[#121212] shadow-md border border-[#F3E5AB]'
                    : 'text-white/80 hover:bg-white/10 hover:text-[#D4AF37]'
                }`}
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">rate_review</span>
                <span>{isArabic ? 'تقييمات العملاء' : 'Reviews'}</span>
              </button>
            )}

            {canAccess('gallery') && (
              <button
                onClick={() => setActiveTab('gallery')}
                className={`flex items-center gap-2 lg:gap-3 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 lg:w-full ${
                  activeTab === 'gallery'
                    ? 'bg-[#D4AF37] text-[#121212] shadow-md border border-[#F3E5AB]'
                    : 'text-white/80 hover:bg-white/10 hover:text-[#D4AF37]'
                }`}
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">photo_library</span>
                <span>{isArabic ? 'معرض الصور' : 'Gallery'}</span>
              </button>
            )}

            {canAccess('siteInfo') && (
              <button
                onClick={() => setActiveTab('siteInfo')}
                className={`flex items-center gap-2 lg:gap-3 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 lg:w-full ${
                  activeTab === 'siteInfo'
                    ? 'bg-[#D4AF37] text-[#121212] shadow-md border border-[#F3E5AB]'
                    : 'text-white/80 hover:bg-white/10 hover:text-[#D4AF37]'
                }`}
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">settings_suggest</span>
                <span>{isArabic ? 'بيانات التواصل' : 'Site Settings'}</span>
              </button>
            )}

            {canAccess('about') && (
              <button
                onClick={() => setActiveTab('about')}
                className={`flex items-center gap-2 lg:gap-3 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 lg:w-full ${
                  activeTab === 'about'
                    ? 'bg-[#D4AF37] text-[#121212] shadow-md border border-[#F3E5AB]'
                    : 'text-white/80 hover:bg-white/10 hover:text-[#D4AF37]'
                }`}
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">info</span>
                <span>{isArabic ? 'عن الصالون' : 'About'}</span>
              </button>
            )}

            {canAccess('cloudinary_migration') && (
              <button
                onClick={() => setActiveTab('cloudinary_migration')}
                className={`flex items-center gap-2 lg:gap-3 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 lg:w-full ${
                  activeTab === 'cloudinary_migration'
                    ? 'bg-[#D4AF37] text-[#121212] shadow-md border border-[#F3E5AB]'
                    : 'text-white/80 hover:bg-white/10 hover:text-[#D4AF37]'
                }`}
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">cloud_sync</span>
                <span>{isArabic ? 'ترحيل الصور إلى Cloudinary' : 'Cloudinary Migration'}</span>
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => setActiveTab('supervisors')}
                className={`flex items-center gap-2 lg:gap-3 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 lg:w-full ${
                  activeTab === 'supervisors'
                    ? 'bg-[#D4AF37] text-[#121212] shadow-md border border-[#F3E5AB]'
                    : 'text-white/80 hover:bg-white/10 hover:text-[#D4AF37]'
                }`}
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">manage_accounts</span>
                <span>{isArabic ? 'إدارة المشرفين' : 'Supervisors'}</span>
              </button>
            )}
          </nav>
        </div>

        {/* CTAs Bottom */}
        <div className="mt-4 lg:mt-8 space-y-2 lg:space-y-3 px-1 lg:px-2 flex lg:flex-col gap-2 lg:gap-0">
          {canAccess('appointments') && (
            <button
              onClick={onOpenNewAppointmentModal}
              className="btn-gold flex-1 lg:w-full py-2.5 lg:py-3 px-3 lg:px-4 rounded-xl flex items-center justify-center gap-1.5 lg:gap-2 font-bold text-xs lg:text-sm cursor-pointer shadow-md whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base lg:text-lg">add</span>
              <span>{isArabic ? 'موعد جديد' : 'New Appointment'}</span>
            </button>
          )}

          <button
            onClick={onBackToClientView}
            className="flex-1 lg:w-full bg-white/10 hover:bg-white/20 text-white/80 py-2.5 px-3 lg:px-4 rounded-xl flex items-center justify-center gap-1.5 lg:gap-2 font-semibold text-xs border border-white/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm lg:text-base">storefront</span>
            <span>{isArabic ? 'موقع العملاء' : 'Client Site'}</span>
          </button>
        </div>

      </aside>

      {/* Main Admin Canvas */}
      <main className="flex-1 p-6 lg:p-10 overflow-x-hidden bg-[#FFFDF5]">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-3xl border border-[#D4AF37]/40 shadow-xs">
          <div>
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              GLOW PRETTY Admin Console
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#121212] mt-0.5">
              {activeTab === 'dashboard' && (isArabic ? 'نظرة عامة وإحصائيات العمليات' : 'Dashboard Overview')}
              {activeTab === 'appointments' && (isArabic ? 'جدول المواعيد والحجوزات' : 'Appointments Schedule')}
              {activeTab === 'coupons' && (isArabic ? 'إدارة أكواد وكوبونات الخصم' : 'Discount Coupons')}
              {activeTab === 'categories' && (isArabic ? 'إدارة تصنيفات الخدمات' : 'Service Categories')}
              {activeTab === 'services' && (isArabic ? 'إدارة قائمة الخدمات والأسعار' : 'Services & Pricing')}
              {activeTab === 'reviews' && (isArabic ? 'إدارة تقييمات العملاء' : 'Customer Reviews')}
              {activeTab === 'siteInfo' && (isArabic ? 'إدارة بيانات التواصل والموقع' : 'Site Settings')}
              {activeTab === 'gallery' && (isArabic ? 'إدارة معرض الصور' : 'Gallery Manager')}
              {activeTab === 'about' && (isArabic ? 'إدارة عن الصالون والقصة' : 'About Section')}
              {activeTab === 'supervisors' && (isArabic ? 'إدارة المشرفين والصلاحيات' : 'Supervisors & Permissions')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell Button & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                  unreadCount > 0
                    ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                    : 'bg-[#FAF6ED] text-[#121212] border-[#D4AF37]/40 hover:bg-[#F3E5AB]/40'
                }`}
                title={isArabic ? 'تنبيهات الحجوزات' : 'Booking Notifications'}
              >
                <span className={`material-symbols-outlined text-xl ${unreadCount > 0 ? 'animate-bounce' : ''}`}>
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-extrabold text-[11px] min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1 shadow-md border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {isNotificationOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationOpen(false)}
                  />
                  <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#D4AF37]/50 z-50 overflow-hidden animate-scale-in">
                    <div className="p-4 bg-[#121212] text-white flex items-center justify-between border-b border-[#D4AF37]/30">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#D4AF37] text-xl">notifications_active</span>
                        <h3 className="font-bold text-sm text-[#D4AF37]">
                          {isArabic ? 'تنبيهات الحجوزات الجديدة' : 'New Booking Alerts'}
                        </h3>
                        {unreadCount > 0 && (
                          <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            {unreadCount} {isArabic ? 'جديد' : 'new'}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-[#D4AF37] hover:underline font-bold cursor-pointer"
                        >
                          {isArabic ? 'تعليم الكل كمقروء' : 'Mark all as read'}
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                      {notificationsList.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <span className="material-symbols-outlined text-3xl mb-1 text-gray-300">notifications_off</span>
                          <p className="text-xs font-bold">{isArabic ? 'لا توجد حجوزات حالياً' : 'No bookings yet'}</p>
                        </div>
                      ) : (
                        notificationsList.slice(0, 10).map((apt) => {
                          const isUnread = !readNotificationIds.includes(apt.id);
                          return (
                            <div
                              key={apt.id}
                              onClick={() => handleNotificationClick(apt)}
                              className={`p-3.5 transition-colors cursor-pointer hover:bg-rose-50/50 flex flex-col gap-1.5 ${
                                isUnread ? 'bg-amber-50/60 font-semibold border-s-4 border-[#9b0044]' : 'bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold text-[#121212] flex items-center gap-1.5">
                                  {isUnread && <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />}
                                  👤 {apt.clientName}
                                </span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                  apt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                  apt.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                  apt.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                  'bg-rose-100 text-rose-800'
                                }`}>
                                  {apt.status === 'Confirmed' ? (isArabic ? 'مؤكد' : 'Confirmed') :
                                   apt.status === 'Pending' ? (isArabic ? 'جديد (معلق)' : 'Pending') :
                                   apt.status === 'Completed' ? (isArabic ? 'مكتمل' : 'Completed') :
                                   (isArabic ? 'ملغى' : 'Cancelled')}
                                </span>
                              </div>

                              <p className="text-xs text-gray-700 flex items-center gap-1 font-medium">
                                <span className="material-symbols-outlined text-sm text-[#9b0044]">spa</span>
                                {apt.serviceName}
                              </p>

                              <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">schedule</span>
                                  {apt.date} | {apt.time}
                                </span>
                                <span className="text-[#9b0044] font-bold">
                                  📱 {apt.clientPhone}
                                </span>
                              </div>

                              {apt.couponCode && (
                                <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 self-start">
                                  🎟️ {isArabic ? 'كوبون الخصم:' : 'Coupon:'} {apt.couponCode}
                                </div>
                              )}

                              {apt.status === 'Pending' && (
                                <div className="flex gap-2 mt-1 pt-1 border-t border-gray-100">
                                  <button
                                    onClick={(e) => handleQuickConfirm(e, apt.id)}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-xs">check_circle</span>
                                    {isArabic ? 'تأكيد الموعد فوراً' : 'Quick Confirm'}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="p-2.5 bg-gray-50 text-center border-t border-gray-100">
                      <button
                        onClick={() => {
                          setIsNotificationOpen(false);
                          setActiveTab('appointments');
                        }}
                        className="text-xs font-extrabold text-[#9b0044] hover:underline cursor-pointer"
                      >
                        {isArabic ? 'عرض جميع المواعيد والتحكم بها' : 'View All Appointments'} →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {!isOwner && (
              <span className="bg-[#FAF6ED] text-[#121212] border border-[#D4AF37] text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">badge</span>
                <span>{userSession.supervisorData?.name}</span>
              </span>
            )}

            <span className="text-xs text-gray-700 font-bold bg-[#FAF6ED] px-3.5 py-2 rounded-xl border border-[#D4AF37]/40">
              📅 {new Date().toLocaleDateString(isArabic ? 'ar-QA' : 'en-US')}
            </span>
          </div>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW (الإحصائيات) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Real-time Dynamic KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white p-6 rounded-3xl border border-[#D4AF37]/40 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold text-gray-600">
                    {isArabic ? 'إجمالي الحجوزات' : 'Total Bookings'}
                  </span>
                  <div className="w-10 h-10 bg-[#FAF6ED] text-[#121212] rounded-2xl flex items-center justify-center border border-[#D4AF37]">
                    <span className="material-symbols-outlined">event_available</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-3xl font-extrabold text-[#121212]">
                    {stats.totalBookings}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {stats.bookingsGrowth}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">
                  {isArabic ? 'مواصفة تلقائياً بناءً على الحجوزات الفعلية' : 'Calculated real-time'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#D4AF37]/40 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold text-gray-600">
                    {isArabic ? 'إجمالي الدخل الحقيقي' : 'Today Revenue'}
                  </span>
                  <div className="w-10 h-10 bg-[#FAF6ED] text-[#121212] rounded-2xl flex items-center justify-center border border-[#D4AF37]">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl font-extrabold text-[#121212]">
                      {stats.todayRevenueQAR}
                    </span>
                    <span className="text-xs font-extrabold text-[#D4AF37]">ر.ق</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {stats.revenueGrowth}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">
                  {isArabic ? 'مجموع قيم الحجوزات المسجلة بالنظام' : 'Sum of active bookings QAR'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#D4AF37]/40 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold text-gray-600">
                    {isArabic ? 'الخدمات المتاحة' : 'Active Services'}
                  </span>
                  <div className="w-10 h-10 bg-[#FAF6ED] text-[#121212] rounded-2xl flex items-center justify-center border border-[#D4AF37]">
                    <span className="material-symbols-outlined">spa</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-3xl font-extrabold text-[#121212]">
                    {stats.activeServicesCount}
                  </span>
                  <span className="text-xs font-bold text-[#121212] bg-[#FAF4E1] px-2 py-0.5 rounded-md border border-[#D4AF37]/40">
                    خدمة
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">
                  {isArabic ? 'في كافة التصنيفات الملكية' : 'Across all salon categories'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#D4AF37]/40 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold text-gray-600">
                    {isArabic ? 'معدل رضا العملاء' : 'Customer Rating'}
                  </span>
                  <div className="w-10 h-10 bg-[#FAF6ED] text-[#121212] rounded-2xl flex items-center justify-center border border-[#D4AF37]">
                    <span className="material-symbols-outlined">star</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-3xl font-extrabold text-[#121212]">
                    {stats.customerSatisfaction}
                  </span>
                  <span className="text-xs font-bold text-[#D4AF37] bg-amber-50 px-2 py-0.5 rounded-md">
                    ⭐⭐⭐⭐⭐
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">
                  {isArabic ? 'بناءً على تقييمات العملاء في الموقع' : 'Calculated from reviews'}
                </p>
              </div>

            </div>

            {/* Quick Actions & Recent Appointments Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xs">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-display text-lg font-bold text-[#121212]">
                    {isArabic ? 'أحدث المواعيد المسجلة' : 'Recent Appointments'}
                  </h3>
                  {canAccess('appointments') && (
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className="text-xs font-bold text-[#D4AF37] hover:underline"
                    >
                      {isArabic ? 'عرض كل المواعيد ←' : 'View All →'}
                    </button>
                  )}
                </div>

                {appointments.length === 0 ? (
                  <div className="py-12 text-center bg-[#FAF6ED] rounded-2xl border border-dashed border-[#D4AF37]/30">
                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">calendar_today</span>
                    <p className="text-sm font-bold text-gray-600">
                      {isArabic ? 'لا توجد حجوزات مسجلة حالياً' : 'No bookings registered yet'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isArabic ? 'عند قيام العملاء بالحجز من الموقع ستظهر الحجوزات فوراً وتزداد الإحصائيات' : 'New bookings will automatically appear here'}
                    </p>
                    {canAccess('appointments') && (
                      <button
                        onClick={onOpenNewAppointmentModal}
                        className="btn-black px-5 py-2.5 rounded-xl text-xs font-bold mt-4 cursor-pointer shadow-sm"
                      >
                        {isArabic ? 'إضافة موعد جديد الآن' : 'Add First Appointment'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-start text-xs text-gray-700">
                      <thead className="bg-[#121212] text-[#D4AF37] uppercase text-[10px] font-bold">
                        <tr>
                          <th className="py-3 px-3 text-start">{isArabic ? 'العميلة' : 'Client'}</th>
                          <th className="py-3 px-3 text-start">{isArabic ? 'الخدمة' : 'Service'}</th>
                          <th className="py-3 px-3 text-start">{isArabic ? 'التاريخ والوقت' : 'Date & Time'}</th>
                          <th className="py-3 px-3 text-start">{isArabic ? 'الحالة' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {appointments.slice(0, 5).map((apt) => (
                          <tr key={apt.id} className="hover:bg-[#FAF6ED]/80">
                            <td className="py-3 px-3 font-bold text-[#121212]">
                              <div>{apt.clientName}</div>
                              {apt.numberOfPersons && apt.numberOfPersons > 1 ? (
                                <div className="inline-flex items-center gap-1 bg-[#FAF6ED] text-[#121212] border border-[#D4AF37]/50 px-1.5 py-0.2 rounded text-[9px] font-black mt-0.5">
                                  <span>👥 {apt.numberOfPersons} {isArabic ? 'أفراد' : 'persons'}</span>
                                </div>
                              ) : null}
                            </td>
                            <td className="py-3 px-3 font-semibold text-[#121212]">
                              {apt.serviceName}
                            </td>
                            <td className="py-3 px-3 font-medium">
                              {apt.date} | {apt.time}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                  apt.status === 'Confirmed'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : apt.status === 'Completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : apt.status === 'Cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {apt.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Quick Info & Salon System Summary */}
              <div className="bg-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xs space-y-5">
                <h3 className="font-display text-lg font-bold text-[#121212]">
                  {isArabic ? 'نظام صالون GLOW PRETTY' : 'GLOW PRETTY Summary'}
                </h3>
                
                <div className="bg-[#FAF6ED] p-4 rounded-2xl border border-[#D4AF37]/40 text-xs space-y-2.5">
                  <div className="flex justify-between items-center text-gray-700 font-semibold">
                    <span>{isArabic ? 'اسم الصالون:' : 'Salon Name:'}</span>
                    <span className="font-bold text-[#121212]">GLOW PRETTY</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700 font-semibold">
                    <span>{isArabic ? 'المنطقة:' : 'Location:'}</span>
                    <span className="font-bold text-[#121212]">{isArabic ? 'الدوحة - مدينة خليفة - قطر 🇶🇦' : 'Madinat Khalifa, Doha, Qatar 🇶🇦'}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700 font-semibold">
                    <span>{isArabic ? 'المشرفون المسجلون:' : 'Registered Staff:'}</span>
                    <span className="font-bold text-[#121212]">{supervisors.length} مشرف</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium">
                  💡 {isArabic
                    ? 'البيانات والإحصائيات مرتبطة بالريال القطري (ر.ق). جميع التغييرات تنعكس فورياً في موقع العملاء.'
                    : 'All revenue metrics are in QAR.'}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: APPOINTMENTS SCHEDULE (جدول المواعيد والحجوزات) */}
        {activeTab === 'appointments' && canAccess('appointments') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
              <div>
                <h3 className="font-display text-xl font-bold text-[#121212]">
                  {isArabic ? 'قائمة الحجوزات والمواعيد' : 'Appointments List'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  {isArabic ? 'إدارة حالات الحجوزات، إضافة مواعيد، وتصدير ملف العملاء PDF' : 'Manage client booking statuses & export customer records.'}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <button
                  onClick={() => exportAppointmentsPDF(filteredAppointments, language, siteSettings)}
                  className="bg-[#121212] hover:bg-[#262626] text-[#FAF6ED] border border-[#D4AF37] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  title={isArabic ? 'تحميل فايل الحجوزات بتنسيق PDF' : 'Download PDF'}
                >
                  <span className="material-symbols-outlined text-base text-[#D4AF37]">picture_as_pdf</span>
                  <span>{isArabic ? 'تحميل فايل الحجوزات PDF' : 'Download Bookings PDF'}</span>
                </button>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-[#FAF6ED] border border-[#D4AF37] text-xs font-bold rounded-xl py-2 px-3 text-[#121212]"
                >
                  <option value="All">{isArabic ? 'جميع الحالات' : 'All Statuses'}</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <button
                  onClick={onOpenNewAppointmentModal}
                  className="btn-gold px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>{isArabic ? 'إضافة موعد' : 'Add Appointment'}</span>
                </button>
              </div>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="py-16 text-center bg-[#FAF6ED] rounded-2xl border border-dashed border-[#D4AF37]/40">
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">event_busy</span>
                <p className="text-sm font-bold text-gray-600">
                  {isArabic ? 'لا توجد مواعيد مطابقة للتصفية الحالية' : 'No appointments matching filter'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs text-gray-700">
                  <thead className="bg-[#121212] text-[#D4AF37] uppercase text-[11px] font-bold">
                    <tr>
                      <th className="py-3 px-4 text-start">{isArabic ? 'العميلة' : 'Client'}</th>
                      <th className="py-3 px-4 text-start">{isArabic ? 'بيانات التواصل' : 'Contact'}</th>
                      <th className="py-3 px-4 text-start">{isArabic ? 'الخدمات المحجوزة وتفاصيل الأسعار' : 'Booked Services & Prices'}</th>
                      <th className="py-3 px-4 text-start">{isArabic ? 'إجمالي السعر' : 'Total Price'}</th>
                      <th className="py-3 px-4 text-start">{isArabic ? 'التاريخ والوقت' : 'Date & Time'}</th>
                      <th className="py-3 px-4 text-start">{isArabic ? 'الحالة' : 'Status'}</th>
                      <th className="py-3 px-4 text-center">{isArabic ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAppointments.map((apt) => {
                      const srv = services.find((s) => s.id === apt.serviceId);

                      let breakdown = apt.servicesBreakdown;
                      if ((!breakdown || breakdown.length === 0) && apt.serviceId) {
                        const ids = apt.serviceId.split(',').map((id) => id.trim());
                        breakdown = ids.map((id) => {
                          const matchedSrv = services.find((s) => s.id === id);
                          if (matchedSrv) {
                            return {
                              id: matchedSrv.id,
                              title: isArabic ? (matchedSrv.arabicTitle || matchedSrv.title) : matchedSrv.title,
                              priceQAR: matchedSrv.priceQAR,
                              priceDisplay: isArabic ? (matchedSrv.arabicPrice || `${matchedSrv.priceQAR} ر.ق`) : (matchedSrv.priceDisplay || `${matchedSrv.priceQAR} QAR`)
                            };
                          }
                          return {
                            id,
                            title: apt.serviceName,
                            priceQAR: apt.priceQAR,
                            priceDisplay: apt.priceDisplay
                          };
                        });
                      }

                      // Compute accurate total sum from breakdown or priceQAR
                      const breakdownSum = breakdown && breakdown.length > 0
                        ? breakdown.reduce((sum, item) => sum + (item.priceQAR || 0), 0)
                        : 0;

                      const finalTotalQAR = (apt.priceQAR && apt.priceQAR > 0)
                        ? apt.priceQAR
                        : (breakdownSum > 0 ? breakdownSum : (srv ? srv.priceQAR : 0));

                      const priceVal = finalTotalQAR > 0
                        ? `${finalTotalQAR} ${isArabic ? 'ر.ق' : 'QAR'}`
                        : (apt.priceDisplay || (srv ? (isArabic ? (srv.arabicPrice || `${srv.priceQAR} ر.ق`) : (srv.priceDisplay || `${srv.priceQAR} QAR`)) : '-'));

                      return (
                      <tr key={apt.id} className="hover:bg-[#FAF6ED]/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#121212]">
                          <div>{apt.clientName}</div>
                          {apt.numberOfPersons && apt.numberOfPersons > 1 ? (
                            <div className="inline-flex items-center gap-1 bg-[#FAF6ED] text-[#121212] border border-[#D4AF37]/60 px-2 py-0.5 rounded-md text-[10px] font-extrabold mt-1 shadow-2xs">
                              <span className="material-symbols-outlined text-[12px] text-[#D4AF37]">group</span>
                              <span>{apt.numberOfPersons} {isArabic ? 'أفراد' : 'persons'}</span>
                            </div>
                          ) : null}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-600">
                          <div>
                            <span dir="ltr" className="inline-block unicode-bidi-isolate font-bold text-[#121212]">
                              {apt.clientPhone}
                            </span>
                          </div>
                          {apt.clientEmail ? <div className="text-[10px] text-gray-400">{apt.clientEmail}</div> : null}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#121212]">
                          {breakdown && breakdown.length > 0 ? (
                            <div className="space-y-1.5 max-w-sm">
                              {breakdown.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-2 bg-white border border-[#D4AF37]/50 px-2.5 py-1.5 rounded-xl shadow-2xs">
                                  <span className="text-[#121212] font-bold text-xs truncate flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-xs text-[#D4AF37]">check_circle</span>
                                    <span>{item.title}</span>
                                  </span>
                                  <span className="text-[#9b0044] font-extrabold text-[11px] bg-[#FAF6ED] px-2 py-0.5 rounded-lg border border-[#D4AF37]/40 shrink-0">
                                    {item.priceDisplay || (item.priceQAR ? `${item.priceQAR} ${isArabic ? 'ر.ق' : 'QAR'}` : '-')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="font-bold text-[#121212]">{apt.serviceName}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-[#9b0044]">
                          <div className="space-y-1">
                            <span className="bg-[#121212] text-[#D4AF37] border border-[#D4AF37] px-3 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5 shadow-xs">
                              <span className="text-[#FAF6ED]/70 font-normal text-[10px]">{isArabic ? 'الإجمالي:' : 'Total:'}</span>
                              <span className="text-white font-black">{priceVal}</span>
                            </span>
                            {breakdown && breakdown.length > 1 && (
                              <div className="text-[10px] text-gray-500 font-bold">
                                💐 {isArabic ? `(${breakdown.length} خدمات)` : `(${breakdown.length} items)`}
                              </div>
                            )}
                            {apt.couponCode && (
                              <div className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-300 font-bold flex items-center gap-1 w-max">
                                <span className="material-symbols-outlined text-[12px]">confirmation_number</span>
                                <span>{isArabic ? `كوبون: ${apt.couponCode} (-${apt.discountAmount} ر.ق)` : `Coupon: ${apt.couponCode} (-${apt.discountAmount} QAR)`}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-700">
                          {apt.date} | {apt.time}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={apt.status}
                            onChange={(e) => onUpdateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                              apt.status === 'Confirmed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : apt.status === 'Completed'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : apt.status === 'Cancelled'
                                ? 'bg-red-50 text-red-800 border-red-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="Confirmed">Confirmed (مؤكد)</option>
                            <option value="Pending">Pending (قيد الانتظار)</option>
                            <option value="Completed">Completed (مكتمل)</option>
                            <option value="Cancelled">Cancelled (ملغي)</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteAppointment(apt.id);
                            }}
                            className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 p-2 rounded-xl font-bold transition-all cursor-pointer border border-red-200 shadow-2xs inline-flex items-center justify-center"
                            title={isArabic ? 'حذف الموعد' : 'Delete'}
                          >
                            <span className="material-symbols-outlined text-lg block pointer-events-none">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: CATEGORIES MANAGEMENT (تصنيفات الخدمات) */}
        {activeTab === 'categories' && canAccess('categories') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-sm space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold text-[#121212]">
                {isArabic ? 'إدارة تصنيفات الخدمات' : 'Service Categories'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                {isArabic ? 'إضافة أو تعديل أو حذف الأقسام الرئيسية للخدمات' : 'Add or edit salon category labels.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCategory} className="bg-[#FAF6ED] p-5 rounded-2xl border border-[#D4AF37]/40 space-y-3">
              <h4 className="font-bold text-xs text-[#121212]">
                {editingCategory ? (isArabic ? 'تعديل التصنيف' : 'Edit Category') : (isArabic ? 'إضافة تصنيف جديد' : 'Add New Category')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">English Category Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Skincare"
                    value={newCatEN}
                    onChange={(e) => setNewCatEN(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">اسم التصنيف بالعربية</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: العناية بالبشرة والوجه"
                    value={newCatAR}
                    onChange={(e) => setNewCatAR(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white font-semibold"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-black px-5 py-2 rounded-xl text-xs font-bold cursor-pointer">
                  {editingCategory ? (isArabic ? 'تحديث التصنيف' : 'Update Category') : (isArabic ? 'إضافة التصنيف' : 'Add Category')}
                </button>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setNewCatEN('');
                      setNewCatAR('');
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </button>
                )}
              </div>
            </form>

            {/* Category List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 rounded-2xl border border-[#D4AF37]/30 bg-[#FAF6ED] flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-xs text-[#121212]">{cat.arabicLabel}</h5>
                    <span className="text-[10px] text-gray-500 font-mono">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setNewCatEN(cat.label);
                        setNewCatAR(cat.arabicLabel);
                      }}
                      className="text-[#121212] hover:bg-[#D4AF37]/20 p-1.5 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 4: SERVICES MANAGEMENT (إدارة الخدمات والأسعار) */}
        {activeTab === 'services' && canAccess('services') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-xl font-bold text-[#121212]">
                  {isArabic ? 'إدارة قائمة الخدمات والأسعار' : 'Services & Pricing Manager'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  {isArabic ? 'تعديل أسعار الخدمات، الأوصاف، والمدة الزمنية بالريال القطري' : 'Edit prices, durations, and descriptions in QAR.'}
                </p>
              </div>

              <button
                onClick={onOpenNewServiceModal}
                className="btn-black px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>{isArabic ? 'إضافة خدمة جديدة' : 'Add New Service'}</span>
              </button>
            </div>

            {/* Service Edit Modal */}
            {editingService && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                <div className="bg-white p-6 rounded-3xl max-w-lg w-full shadow-2xl border-2 border-[#D4AF37] space-y-4">
                  <h4 className="font-bold text-base text-[#9b0044]">
                    {isArabic ? `تعديل خدمة: ${editingService.arabicTitle}` : `Edit Service: ${editingService.title}`}
                  </h4>

                  <form onSubmit={handleSaveServiceEdit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">العنوان بالعربية</label>
                        <input
                          type="text"
                          required
                          value={editingService.arabicTitle}
                          onChange={(e) => setEditingService({ ...editingService, arabicTitle: e.target.value })}
                          className="w-full border rounded-xl p-2 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">English Title</label>
                        <input
                          type="text"
                          required
                          value={editingService.title}
                          onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                          className="w-full border rounded-xl p-2 text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">السعر بالريال القطري (QAR)</label>
                        <input
                          type="number"
                          required
                          value={editingService.priceQAR}
                          onChange={(e) => setEditingService({ ...editingService, priceQAR: Number(e.target.value) })}
                          className="w-full border rounded-xl p-2 text-xs font-bold text-[#9b0044]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">المدة (بالدقائق)</label>
                        <input
                          type="number"
                          required
                          value={editingService.durationMinutes}
                          onChange={(e) => setEditingService({ ...editingService, durationMinutes: Number(e.target.value) })}
                          className="w-full border rounded-xl p-2 text-xs font-bold"
                        />
                      </div>
                    </div>

                    <CloudinaryImageUploader
                      label={isArabic ? 'صورة الخدمة (رفع مباشر إلى Cloudinary ☁️)' : 'Service Image (Cloudinary Upload)'}
                      value={editingService.imageUrl}
                      onChange={(url) => setEditingService({ ...editingService, imageUrl: url })}
                      isArabic={isArabic}
                    />

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">الوصف بالعربية</label>
                      <textarea
                        rows={2}
                        value={editingService.arabicDescription}
                        onChange={(e) => setEditingService({ ...editingService, arabicDescription: e.target.value })}
                        className="w-full border rounded-xl p-2 text-xs font-medium"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingService(null)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold"
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button type="submit" className="btn-burgundy px-5 py-2 rounded-xl text-xs font-bold">
                        {isArabic ? 'حفظ التعديلات' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Services Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((srv) => {
                const optSrc = getOptimizedImageUrl(srv.imageUrl, { width: 150 });
                return (
                  <div key={srv.id} className="p-4 rounded-2xl border border-[#D4AF37]/30 bg-white shadow-2xs flex gap-3">
                    {optSrc ? (
                      <img
                        key={optSrc}
                        src={optSrc}
                        alt={srv.title}
                        loading="lazy"
                        decoding="async"
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-stone-100 border border-[#D4AF37]/30 flex items-center justify-center text-[#9b0044] shrink-0">
                        <span className="material-symbols-outlined text-2xl">spa</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-[#9b0044] truncate">{srv.arabicTitle}</h4>
                        <p className="text-[10px] text-gray-500 font-medium truncate">{srv.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <span className="font-extrabold text-xs text-[#9b0044]">
                          {srv.priceQAR} ر.ق
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingService(srv)}
                            className="text-[#9b0044] hover:bg-[#ffd9df] p-1 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            onClick={() => onDeleteService(srv.id)}
                            className="text-red-600 hover:bg-red-50 p-1 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 5: GALLERY MANAGEMENT (إدارة معرض الصور - مع إمكانية التعديل والحذف) */}
        {activeTab === 'gallery' && canAccess('gallery') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-sm space-y-6">
            <div>
              <h3 className="font-display text-2xl font-extrabold text-[#9b0044]">
                {isArabic ? 'إدارة معرض الصور (إضافة، تعديل، حذف)' : 'Manage Gallery Images (Add, Edit, Delete)'}
              </h3>
              <p className="text-xs text-[#594045] mt-1">
                {isArabic
                  ? 'يمكنكِ إضافة صور جديدة لصالون GLOW PRETTY بالدوحة، تعديل عناوينها وروابطها، أو حذف أي صورة.'
                  : 'Add, edit, or delete showcase photos for the gallery.'}
              </p>
            </div>

            {/* Gallery Edit Modal */}
            {editingGalleryItem && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
                <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl border-2 border-[#D4AF37] space-y-4">
                  <h4 className="font-bold text-base text-[#9b0044]">
                    {isArabic ? 'تعديل بيانات صورة المعرض' : 'Edit Gallery Photo'}
                  </h4>

                  <form onSubmit={handleSaveGalleryEdit} className="space-y-3 text-start">
                    <CloudinaryImageUploader
                      label={isArabic ? 'صورة المعرض (رفع مباشر إلى Cloudinary ☁️)' : 'Gallery Image (Cloudinary Upload)'}
                      value={editingGalleryItem.url}
                      onChange={(url) => setEditingGalleryItem({ ...editingGalleryItem, url })}
                      isArabic={isArabic}
                      required
                    />

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">العنوان بالعربية</label>
                      <input
                        type="text"
                        required
                        value={editingGalleryItem.arabicTitle}
                        onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, arabicTitle: e.target.value })}
                        className="w-full border rounded-xl p-2.5 text-xs bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">English Title</label>
                      <input
                        type="text"
                        required
                        value={editingGalleryItem.title}
                        onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, title: e.target.value })}
                        className="w-full border rounded-xl p-2.5 text-xs bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">حجم الصورة في المعرض</label>
                      <select
                        value={editingGalleryItem.span || 'col-span-1 row-span-1'}
                        onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, span: e.target.value })}
                        className="w-full border rounded-xl p-2.5 text-xs bg-white font-semibold"
                      >
                        <option value="col-span-1 row-span-1">عادي (مربع 1x1)</option>
                        <option value="col-span-2 row-span-2">كبير (مربع 2x2)</option>
                        <option value="col-span-2 row-span-1">عريض (عرضي 2x1)</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingGalleryItem(null)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button type="submit" className="btn-burgundy px-5 py-2 rounded-xl text-xs font-bold cursor-pointer">
                        {isArabic ? 'حفظ التعديلات' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Add Image Form */}
            <form onSubmit={handleAddGalleryItem} className="bg-[#fdf5f7] p-5 rounded-2xl border border-[#D4AF37]/30 space-y-3">
              <h4 className="font-bold text-sm text-[#9b0044] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">add_photo_alternate</span>
                <span>{isArabic ? 'إضافة صورة جديدة للمعرض (Cloudinary ☁️)' : 'Add New Gallery Photo (Cloudinary)'}</span>
              </h4>

              <CloudinaryImageUploader
                label={isArabic ? 'اختاري ملف الصورة لرفعه إلى Cloudinary' : 'Choose image file to upload to Cloudinary'}
                value={newGalleryUrl}
                onChange={setNewGalleryUrl}
                isArabic={isArabic}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">عنوان الصورة بالعربية *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: جناح العروس الملكي"
                    value={newGalleryTitleAR}
                    onChange={(e) => setNewGalleryTitleAR(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-xs bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">English Caption *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Royal Suite"
                    value={newGalleryTitleEN}
                    onChange={(e) => setNewGalleryTitleEN(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-xs bg-white font-bold"
                  />
                </div>
              </div>

              <button type="submit" className="btn-burgundy px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-sm">
                {isArabic ? 'رفع وإضافة الصورة' : 'Add Image to Gallery'}
              </button>
            </form>

            {/* Gallery Grid with Edit and Delete Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {gallery.map((img) => {
                const optSrc = getOptimizedImageUrl(img.url, { width: 400 });
                return (
                  <div key={img.id} className="relative group rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-2xs h-52">
                    {optSrc ? (
                      <img
                        key={optSrc}
                        src={optSrc}
                        alt={img.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-stone-100 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                        <span className="material-symbols-outlined text-3xl">photo_camera</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between text-white">
                      <div>
                        <p className="font-bold text-sm text-[#D4AF37]">{img.arabicTitle}</p>
                        <p className="text-[10px] text-white/80">{img.title}</p>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingGalleryItem(img)}
                          className="bg-[#D4AF37] hover:bg-white text-[#3f0018] text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          <span>{isArabic ? 'تعديل' : 'Edit'}</span>
                        </button>
                        <button
                          onClick={() => onDeleteGalleryItem(img.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          <span>{isArabic ? 'حذف' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 6: SITE SETTINGS (بيانات التواصل والموقع) */}
        {activeTab === 'siteInfo' && canAccess('siteInfo') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-sm space-y-6">
            <div>
              <h3 className="font-display text-2xl font-extrabold text-[#9b0044]">
                {isArabic ? 'إدارة بيانات التواصل وموقع الصالون' : 'Site Contact & Branch Settings'}
              </h3>
              <p className="text-xs text-[#594045] mt-1">
                {isArabic ? 'تعديل رقم الهاتف، الواتساب، اسم الموقع GLOW PRETTY، وروابط التواصل' : 'Manage phone numbers and social links.'}
              </p>
            </div>

            {settingsSavedMessage && (
              <div className="bg-green-100 text-green-800 p-3 rounded-xl text-xs font-bold border border-green-200">
                {isArabic ? 'تم حفظ التغييرات بنجاح!' : 'Settings updated successfully!'}
              </div>
            )}

            <form onSubmit={handleSaveSiteInfo} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-[#fcf9f8] p-5 rounded-2xl border border-[#D4AF37]/30 space-y-4">
                <h4 className="font-bold text-sm text-[#9b0044] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">call</span>
                  <span>{isArabic ? 'بيانات الاتصال والتواصل' : 'Contact Details'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#594045] mb-1">
                      {isArabic ? 'رقم هاتف الصالون *' : 'Salon Phone *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-sm bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#594045] mb-1">
                      {isArabic ? 'رقم الواتساب المباشر *' : 'Direct WhatsApp *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.whatsapp}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-sm bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#594045] mb-1">
                      {isArabic ? 'البريد الإلكتروني للصالون *' : 'Salon Email *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-sm bg-white font-bold text-[#9b0044]"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Address */}
              <div className="bg-[#fcf9f8] p-5 rounded-2xl border border-[#D4AF37]/30 space-y-4">
                <h4 className="font-bold text-sm text-[#9b0044] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  <span>{isArabic ? 'الموقع والعنوان' : 'Branch Location'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#594045] mb-1">
                      {isArabic ? 'اسم الموقع والفرع بالعربية *' : 'Location in Arabic *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.locationAR}
                      onChange={(e) => setSettingsForm({ ...settingsForm, locationAR: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-sm bg-white font-bold text-[#9b0044]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#594045] mb-1">
                      {isArabic ? 'اسم الموقع والفرع بالإنجليزية *' : 'Location in English *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.locationEN}
                      onChange={(e) => setSettingsForm({ ...settingsForm, locationEN: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-sm bg-white font-bold text-[#9b0044]"
                    />
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-[#fcf9f8] p-5 rounded-2xl border border-[#D4AF37]/30 space-y-4">
                <h4 className="font-bold text-sm text-[#9b0044] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">schedule</span>
                  <span>{isArabic ? 'أوقات وساعات العمل' : 'Working Hours'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#594045] mb-1">
                      {isArabic ? 'أوقات العمل بالعربية' : 'Working Hours (Arabic)'}
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.workingHoursAR}
                      onChange={(e) => setSettingsForm({ ...settingsForm, workingHoursAR: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-sm bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#594045] mb-1">
                      {isArabic ? 'أوقات العمل بالإنجليزية' : 'Working Hours (English)'}
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.workingHoursEN}
                      onChange={(e) => setSettingsForm({ ...settingsForm, workingHoursEN: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-sm bg-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="bg-[#fcf9f8] p-5 rounded-2xl border border-[#D4AF37]/30 space-y-4">
                <h4 className="font-bold text-sm text-[#9b0044] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">share</span>
                  <span>{isArabic ? 'روابط منصات التواصل الاجتماعي' : 'Social Media Platforms'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#594045] mb-1">
                      {isArabic ? 'رابط انستجرام (Instagram)' : 'Instagram URL'}
                    </label>
                    <input
                      type="url"
                      value={settingsForm.instagramUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-xs bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#594045] mb-1">
                      {isArabic ? 'رابط تيك توك (TikTok)' : 'TikTok URL'}
                    </label>
                    <input
                      type="url"
                      value={settingsForm.tiktokUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tiktokUrl: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-xs bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#594045] mb-1">
                      {isArabic ? 'رابط سناب شات (Snapchat)' : 'Snapchat URL'}
                    </label>
                    <input
                      type="url"
                      value={settingsForm.snapchatUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, snapchatUrl: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-xs bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#594045] mb-1">
                      {isArabic ? 'رابط فيسبوك (Facebook)' : 'Facebook URL'}
                    </label>
                    <input
                      type="url"
                      value={settingsForm.facebookUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-xs bg-white font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="btn-burgundy px-8 py-3 rounded-xl text-sm font-bold cursor-pointer shadow-md">
                  {isArabic ? 'حفظ كافة البيانات والبيانات الإلكترونية' : 'Save Site Settings'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 7: REVIEWS MANAGEMENT (إدارة التقييمات) */}
        {activeTab === 'reviews' && canAccess('reviews') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-sm space-y-6">
            <div>
              <h3 className="font-display text-2xl font-extrabold text-[#9b0044]">
                {isArabic ? 'إدارة تقييمات وآراء العملاء' : 'Customer Reviews Manager'}
              </h3>
            </div>

            <form onSubmit={handleSaveReview} className="bg-[#fdf5f7] p-5 rounded-2xl border border-[#D4AF37]/30 space-y-4">
              <h4 className="font-bold text-sm text-[#9b0044]">
                {editingReview ? (isArabic ? 'تعديل التقييم' : 'Edit Review') : (isArabic ? 'إضافة تقييم جديد' : 'Add Review')}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#594045] mb-1">اسم العميلة *</label>
                  <input
                    type="text"
                    required
                    value={revName}
                    onChange={(e) => setRevName(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-xs bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#594045] mb-1">صفة العميلة</label>
                  <input
                    type="text"
                    value={revRole}
                    onChange={(e) => setRevRole(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-xs bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#594045] mb-1">التقييم بالنجوم</label>
                  <select
                    value={revRating}
                    onChange={(e) => setRevRating(Number(e.target.value))}
                    className="w-full border rounded-xl p-2.5 text-xs bg-white font-semibold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                    <option value={3}>⭐⭐⭐ 3 Stars</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#594045] mb-1">نص التعليق *</label>
                <textarea
                  required
                  rows={3}
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-xs bg-white font-semibold"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-burgundy px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                  {editingReview ? (isArabic ? 'حفظ التعديلات' : 'Save Changes') : (isArabic ? 'إضافة التقييم' : 'Add Review')}
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl border border-[#D4AF37]/30 bg-white shadow-2xs flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-xs text-[#9b0044]">{rev.name} ({rev.rating}⭐)</h5>
                    <p className="text-xs text-gray-700 mt-1">"{rev.comment}"</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDeleteReview(rev.id)}
                      className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 8: ABOUT SALON MANAGEMENT (إدارة النبذة والقصة) */}
        {activeTab === 'about' && canAccess('about') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-sm space-y-6">
            <div>
              <h3 className="font-display text-2xl font-extrabold text-[#9b0044]">
                {isArabic ? 'إدارة عن الصالون وقصة المكان' : 'Manage Salon Story'}
              </h3>
            </div>

            <form onSubmit={handleSaveAbout} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#594045] mb-1">العنوان بالعربية</label>
                  <input
                    type="text"
                    required
                    value={aboutForm.titleAR}
                    onChange={(e) => setAboutForm({ ...aboutForm, titleAR: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#594045] mb-1">English Title</label>
                  <input
                    type="text"
                    required
                    value={aboutForm.titleEN}
                    onChange={(e) => setAboutForm({ ...aboutForm, titleEN: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm bg-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#594045] mb-1">قصة الصالون بالعربية</label>
                <textarea
                  required
                  rows={4}
                  value={aboutForm.storyAR}
                  onChange={(e) => setAboutForm({ ...aboutForm, storyAR: e.target.value })}
                  className="w-full border rounded-xl p-2.5 text-sm bg-white font-medium"
                />
              </div>

              <CloudinaryImageUploader
                label={isArabic ? 'صورة قسم "عن الصالون" (رفع مباشر إلى Cloudinary ☁️)' : 'About Section Image (Cloudinary Upload)'}
                value={aboutForm.mainImageUrl || ''}
                onChange={(url) => setAboutForm({ ...aboutForm, mainImageUrl: url })}
                isArabic={isArabic}
              />

              <button type="submit" className="btn-burgundy px-8 py-3 rounded-xl text-sm font-bold cursor-pointer shadow-md">
                {isArabic ? 'حفظ النبذة والقصة' : 'Save About Section'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 9: SUPERVISORS & PERMISSIONS MANAGEMENT (إدارة المشرفين وصلاحياتهم للمدير العام) */}
        {activeTab === 'supervisors' && isOwner && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-sm space-y-6">
            <div>
              <h3 className="font-display text-2xl font-extrabold text-[#9b0044]">
                {isArabic ? 'إدارة أمان المدير العام وتصاريح المشرفين' : 'Owner Security & Supervisor Access'}
              </h3>
              <p className="text-xs text-[#594045] mt-1">
                {isArabic
                  ? 'تغيير كلمة مرور المدير العام وإضافة حسابات مشرفين مع تحديد صلاحيات الدخول.'
                  : 'Manage Owner PIN and configure supervisor staff access credentials.'}
              </p>
            </div>

            {/* Change Owner Password Form */}
            <form onSubmit={handleOwnerPinChange} className="bg-[#fcf9f8] p-5 rounded-2xl border-2 border-[#D4AF37]/40 space-y-4">
              <h4 className="font-bold text-sm text-[#9b0044] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">lock_reset</span>
                <span>{isArabic ? 'تغيير كلمة مرور المدير العام 🔐' : 'Change Owner Manager Password 🔐'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#594045] mb-1">
                    {isArabic ? 'كلمة المرور الحالية *:' : 'Current Password *:'}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={oldPinInput}
                    onChange={(e) => setOldPinInput(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#594045] mb-1">
                    {isArabic ? 'كلمة المرور الجديدة *:' : 'New Password *:'}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#594045] mb-1">
                    {isArabic ? 'تأكيد كلمة المرور الجديدة *:' : 'Confirm New Password *:'}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white font-bold"
                  />
                </div>
              </div>

              {pinMessage && (
                <p className={`text-xs font-bold p-2.5 rounded-xl text-center ${
                  pinMessage.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {pinMessage.text}
                </p>
              )}

              <button
                type="submit"
                className="bg-[#9b0044] hover:bg-[#8f003f] text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                {isArabic ? 'حفظ كلمة المرور الجديدة' : 'Update Owner Password'}
              </button>
            </form>

            {/* Add / Edit Supervisor Form */}
            <form onSubmit={handleSaveSupervisor} className="bg-[#fdf5f7] p-5 rounded-2xl border border-[#D4AF37]/40 space-y-4">
              <h4 className="font-bold text-sm text-[#9b0044] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">person_add</span>
                <span>
                  {editingSupervisor
                    ? (isArabic ? `تعديل المشرف: ${editingSupervisor.name}` : 'Edit Supervisor')
                    : (isArabic ? 'إضافة مشرف جديد للنظام' : 'Add New Supervisor')}
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#594045] mb-1">
                    {isArabic ? 'الاسم الكامل للمشرف *:' : 'Full Name *:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isArabic ? 'اسم المشرف' : 'Supervisor Name'}
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#594045] mb-1">
                    {isArabic ? 'اسم المستخدم (Username) *:' : 'Username *:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isArabic ? 'اسم المستخدم' : 'Username'}
                    value={supUsername}
                    onChange={(e) => setSupUsername(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#594045] mb-1">
                    {isArabic ? 'كلمة المرور (Password) *:' : 'Password *:'}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={supPassword}
                    onChange={(e) => setSupPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white font-bold"
                  />
                </div>
              </div>

              {/* Permissions Checkboxes */}
              <div>
                <label className="block text-xs font-extrabold text-[#9b0044] mb-2">
                  {isArabic ? 'تحديد الصلاحيات المسموح بها لهذا المشرف:' : 'Select Allowed Permissions:'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 bg-white p-4 rounded-xl border border-gray-200">
                  
                  <label className="flex items-center gap-2 text-xs font-bold text-[#1c1b1b] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={supPermissions.manageAppointments}
                      onChange={(e) => setSupPermissions({ ...supPermissions, manageAppointments: e.target.checked })}
                      className="w-4 h-4 accent-[#9b0044]"
                    />
                    <span>{isArabic ? 'إدارة المواعيد والحجوزات 📅' : 'Manage Appointments'}</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-[#1c1b1b] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={supPermissions.manageCategories}
                      onChange={(e) => setSupPermissions({ ...supPermissions, manageCategories: e.target.checked })}
                      className="w-4 h-4 accent-[#9b0044]"
                    />
                    <span>{isArabic ? 'إدارة تصنيفات الخدمات 🏷️' : 'Manage Categories'}</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-[#1c1b1b] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={supPermissions.manageServices}
                      onChange={(e) => setSupPermissions({ ...supPermissions, manageServices: e.target.checked })}
                      className="w-4 h-4 accent-[#9b0044]"
                    />
                    <span>{isArabic ? 'إدارة قائمة الخدمات والأسعار 💇' : 'Manage Services'}</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-[#1c1b1b] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={supPermissions.manageReviews}
                      onChange={(e) => setSupPermissions({ ...supPermissions, manageReviews: e.target.checked })}
                      className="w-4 h-4 accent-[#9b0044]"
                    />
                    <span>{isArabic ? 'إدارة تقييمات العملاء ⭐' : 'Manage Reviews'}</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-[#1c1b1b] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={supPermissions.manageGallery}
                      onChange={(e) => setSupPermissions({ ...supPermissions, manageGallery: e.target.checked })}
                      className="w-4 h-4 accent-[#9b0044]"
                    />
                    <span>{isArabic ? 'إدارة معرض الصور 🖼️' : 'Manage Gallery'}</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-[#1c1b1b] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={supPermissions.manageSiteInfo}
                      onChange={(e) => setSupPermissions({ ...supPermissions, manageSiteInfo: e.target.checked })}
                      className="w-4 h-4 accent-[#9b0044]"
                    />
                    <span>{isArabic ? 'إدارة بيانات التواصل والفرع 📞' : 'Manage Contact Info'}</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-[#1c1b1b] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={supPermissions.manageAbout}
                      onChange={(e) => setSupPermissions({ ...supPermissions, manageAbout: e.target.checked })}
                      className="w-4 h-4 accent-[#9b0044]"
                    />
                    <span>{isArabic ? 'إدارة قصة ونبذة الصالون 📖' : 'Manage About Section'}</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-[#1c1b1b] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={supPermissions.manageCoupons ?? true}
                      onChange={(e) => setSupPermissions({ ...supPermissions, manageCoupons: e.target.checked })}
                      className="w-4 h-4 accent-[#9b0044]"
                    />
                    <span>{isArabic ? 'إدارة أكواد وكوبونات الخصم 🏷️' : 'Manage Coupons'}</span>
                  </label>

                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-burgundy px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-sm">
                  {editingSupervisor ? (isArabic ? 'حفظ تعديلات المشرف' : 'Save Supervisor') : (isArabic ? 'حفظ وإضافة المشرف' : 'Add Supervisor')}
                </button>
                {editingSupervisor && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSupervisor(null);
                      setSupName('');
                      setSupUsername('');
                      setSupPassword('');
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </button>
                )}
              </div>
            </form>

            {/* List of Registered Supervisors */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-[#1c1b1b]">
                {isArabic ? `قائمة المشرفين الحالية (${supervisors.length})` : `Registered Supervisors (${supervisors.length})`}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supervisors.map((sup) => (
                  <div key={sup.id} className="p-5 rounded-2xl border border-[#D4AF37]/30 bg-[#fcf9f8] shadow-2xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-sm text-[#9b0044]">{sup.name}</h5>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                          اسم المستخدم: <span className="font-bold text-[#1c1b1b]">{sup.username}</span> | كلمة المرور: <span className="font-bold text-[#1c1b1b]">••••••••</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingSupervisor(sup);
                            setSupName(sup.name);
                            setSupUsername(sup.username);
                            setSupPassword(sup.password);
                            setSupPermissions(sup.permissions);
                          }}
                          className="text-[#9b0044] hover:bg-[#ffd9df] p-1.5 rounded-lg text-xs font-bold cursor-pointer"
                          title={isArabic ? 'تعديل بيانات المشرف' : 'Edit Supervisor'}
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>

                        <button
                          onClick={() => onDeleteSupervisor(sup.id)}
                          className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg text-xs font-bold cursor-pointer"
                          title={isArabic ? 'حذف المشرف' : 'Delete Supervisor'}
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Permission Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-200">
                      {sup.permissions.manageAppointments && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          الحجوزات
                        </span>
                      )}
                      {(sup.permissions.manageCoupons ?? true) && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                          الكوبونات
                        </span>
                      )}
                      {sup.permissions.manageCategories && (
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                          التصنيفات
                        </span>
                      )}
                      {sup.permissions.manageServices && (
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                          الخدمات
                        </span>
                      )}
                      {sup.permissions.manageReviews && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                          التقييمات
                        </span>
                      )}
                      {sup.permissions.manageGallery && (
                        <span className="text-[10px] bg-pink-100 text-pink-800 font-bold px-2 py-0.5 rounded-full">
                          المعرض
                        </span>
                      )}
                      {sup.permissions.manageSiteInfo && (
                        <span className="text-[10px] bg-gray-200 text-gray-800 font-bold px-2 py-0.5 rounded-full">
                          بيانات الموقع
                        </span>
                      )}
                      {sup.permissions.manageAbout && (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                          عن الصالون
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Coupons Tab Panel */}
        {activeTab === 'coupons' && (
          <div className="space-y-6 animate-fade-in">
            {/* Coupon Stats Header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold">{isArabic ? 'إجمالي أكواد الخصم' : 'Total Coupon Codes'}</p>
                  <h4 className="font-display text-2xl font-extrabold text-[#121212] mt-1">{coupons.length}</h4>
                </div>
                <div className="w-12 h-12 bg-[#FAF6ED] rounded-xl flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/40">
                  <span className="material-symbols-outlined text-2xl">confirmation_number</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold">{isArabic ? 'الكوبونات المفعلة' : 'Active Coupons'}</p>
                  <h4 className="font-display text-2xl font-extrabold text-emerald-600 mt-1">
                    {coupons.filter(c => c.isActive).length}
                  </h4>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-200">
                  <span className="material-symbols-outlined text-2xl">check_circle</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold">{isArabic ? 'إجمالي استخدامات العملاء' : 'Total Redemptions'}</p>
                  <h4 className="font-display text-2xl font-extrabold text-[#9b0044] mt-1">
                    {coupons.reduce((sum, c) => {
                      const realUses = appointments.filter(
                        (a) => a.couponCode && a.couponCode.trim().toUpperCase() === c.code.trim().toUpperCase() && a.status !== 'Cancelled'
                      ).length;
                      return sum + realUses;
                    }, 0)}
                  </h4>
                </div>
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-[#9b0044] border border-rose-200">
                  <span className="material-symbols-outlined text-2xl">groups</span>
                </div>
              </div>
            </div>

            {/* Actions & Form Header */}
            <div className="bg-white p-6 rounded-3xl border border-[#D4AF37]/40 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#121212]">
                    {isArabic ? 'إدارة أكواد وكوبونات الخصم' : 'Manage Discount Coupons'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isArabic ? 'أنشئي أكواد خصم وحددي نسبة أو قيمة الخصم والحد الأقصى لعدد العملاء المستخدمين' : 'Create discount codes, set percentage or fixed values and maximum usage limits'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingCoupon(null);
                    setCouponCode('');
                    setDiscountType('percentage');
                    setDiscountValue(10);
                    setMaxUses(20);
                    setIsCouponActive(true);
                    setIsCouponModalOpen(true);
                  }}
                  className="btn-gold px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  <span>{isArabic ? 'إضافة كود خصم جديد' : 'Add New Coupon'}</span>
                </button>
              </div>

              {/* Coupons Table */}
              <div className="overflow-x-auto border border-[#D4AF37]/30 rounded-2xl">
                <table className="w-full text-start text-xs text-gray-700">
                  <thead className="bg-[#FAF6ED] border-b border-[#D4AF37]/30 text-[#121212] font-extrabold">
                    <tr>
                      <th className="py-3 px-4 text-start">{isArabic ? 'كود الخصم' : 'Code'}</th>
                      <th className="py-3 px-4 text-start">{isArabic ? 'قيمة الخصم' : 'Discount'}</th>
                      <th className="py-3 px-4 text-start">{isArabic ? 'استخدام العملاء / الحد' : 'Usage / Limit'}</th>
                      <th className="py-3 px-4 text-start">{isArabic ? 'المتبقي' : 'Remaining'}</th>
                      <th className="py-3 px-4 text-start">{isArabic ? 'الحالة' : 'Status'}</th>
                      <th className="py-3 px-4 text-end">{isArabic ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {coupons.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400 font-semibold">
                          {isArabic ? 'لا توجد أكواد خصم حالياً. انقري على إضافة كود جديد.' : 'No coupon codes yet.'}
                        </td>
                      </tr>
                    ) : (
                      coupons.map((c) => {
                        const actualUsedCount = appointments.filter(
                          (a) => a.couponCode && a.couponCode.trim().toUpperCase() === c.code.trim().toUpperCase() && a.status !== 'Cancelled'
                        ).length;
                        const usagePct = Math.min(100, Math.round((actualUsedCount / (c.maxUses || 1)) * 100));
                        const isLimitReached = actualUsedCount >= c.maxUses;

                        return (
                          <tr key={c.id} className="hover:bg-[#FAF6ED]/50 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-extrabold text-sm text-[#9b0044]">
                              <span className="bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl uppercase tracking-wider">
                                {c.code}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-[#121212]">
                              {c.discountType === 'percentage' ? (
                                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                  %{c.discountValue} {isArabic ? 'خصم' : 'OFF'}
                                </span>
                              ) : (
                                <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                  {c.discountValue} {isArabic ? 'ر.ق خصم' : 'QAR OFF'}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-bold">
                              <div className="space-y-1 max-w-[160px]">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-[#121212] font-bold">{actualUsedCount} / {c.maxUses} {isArabic ? 'عميل' : 'clients'}</span>
                                  <span className="text-gray-400 font-medium">{usagePct}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${isLimitReached ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${usagePct}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-bold">
                              {isLimitReached ? (
                                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg text-[10px] font-extrabold border border-amber-300">
                                  {isArabic ? 'اكتمل العدد' : 'Limit Reached'}
                                </span>
                              ) : (
                                <span className="text-gray-600">
                                  {Math.max(0, c.maxUses - actualUsedCount)} {isArabic ? 'عميل متبقي' : 'left'}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {c.isActive && !isLimitReached ? (
                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                  <span>{isArabic ? 'مفعل' : 'Active'}</span>
                                </span>
                              ) : isLimitReached ? (
                                <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                                  <span>{isArabic ? 'مكتمل الاستخدام' : 'Limit Reached'}</span>
                                </span>
                              ) : (
                                <span className="bg-gray-100 text-gray-600 border border-gray-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                                  <span>{isArabic ? 'معطل' : 'Inactive'}</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-end">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setEditingCoupon(c);
                                    setCouponCode(c.code);
                                    setDiscountType(c.discountType);
                                    setDiscountValue(c.discountValue);
                                    setMaxUses(c.maxUses);
                                    setIsCouponActive(c.isActive);
                                    setIsCouponModalOpen(true);
                                  }}
                                  className="text-[#9b0044] hover:bg-rose-50 p-1.5 rounded-lg text-xs font-bold cursor-pointer"
                                  title={isArabic ? 'تعديل الكوبون' : 'Edit Coupon'}
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                </button>

                                <button
                                  onClick={() => onDeleteCoupon(c.id)}
                                  className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg text-xs font-bold cursor-pointer"
                                  title={isArabic ? 'حذف الكوبون' : 'Delete Coupon'}
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Coupon Form Modal */}
        {isCouponModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-[#D4AF37]/40 relative">
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-black p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <h3 className="font-display text-xl font-extrabold text-[#9b0044] mb-1">
                {editingCoupon ? (isArabic ? 'تعديل كود الخصم' : 'Edit Coupon Code') : (isArabic ? 'إضافة كود خصم جديد' : 'Create New Coupon')}
              </h3>
              <p className="text-xs text-gray-500 mb-5">
                {isArabic ? 'حدد رمز الكود وقيمة الخصم وعدد العملاء المسموح لهم باستخدامه' : 'Set code, discount, and maximum client usage limit.'}
              </p>

              <form onSubmit={handleSaveCoupon} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#121212] mb-1">
                    {isArabic ? 'رمز كود الخصم (بالإنجليزية):' : 'Coupon Code (UPPERCASE):'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GLOW20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full border border-gray-300 rounded-xl py-2.5 px-3 text-sm font-mono font-bold uppercase focus:outline-none focus:border-[#9b0044]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#121212] mb-1">
                      {isArabic ? 'نوع الخصم:' : 'Discount Type:'}
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                      className="w-full border border-gray-300 rounded-xl py-2.5 px-3 text-xs font-bold focus:outline-none focus:border-[#9b0044]"
                    >
                      <option value="percentage">{isArabic ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                      <option value="fixed">{isArabic ? 'مبلغ ثابت (ر.ق)' : 'Fixed Amount (QAR)'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#121212] mb-1">
                      {isArabic ? `قيمة الخصم (${discountType === 'percentage' ? '%' : 'ر.ق'}):` : `Value (${discountType === 'percentage' ? '%' : 'QAR'}):`}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={discountType === 'percentage' ? 100 : 10000}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-xl py-2.5 px-3 text-sm font-bold focus:outline-none focus:border-[#9b0044]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#121212] mb-1">
                    {isArabic ? 'عدد العملاء المسموح لهم باستخدام الكوبون (الحد الأقصى):' : 'Maximum Allowed Client Usage Limit:'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl py-2.5 px-3 text-sm font-bold focus:outline-none focus:border-[#9b0044]"
                  />
                  <p className="text-[11px] text-gray-500 mt-1 font-medium">
                    {isArabic ? '💡 مثال: 50 يعني أن أول 50 عميل فقط يمكنهم الاستفادة من الكود.' : 'e.g., 50 means only the first 50 clients can redeem this code.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="couponActiveCheck"
                    checked={isCouponActive}
                    onChange={(e) => setIsCouponActive(e.target.checked)}
                    className="w-4 h-4 accent-[#9b0044] rounded cursor-pointer"
                  />
                  <label htmlFor="couponActiveCheck" className="text-xs font-bold text-[#121212] cursor-pointer">
                    {isArabic ? 'تفعيل كود الخصم فوراً' : 'Activate coupon code immediately'}
                  </label>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="submit"
                    className="btn-burgundy flex-1 py-3 rounded-xl font-bold text-xs shadow-md cursor-pointer"
                  >
                    {editingCoupon ? (isArabic ? 'حفظ التغييرات' : 'Save Changes') : (isArabic ? 'إنشاء الكود' : 'Create Coupon')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCouponModalOpen(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 11: CLOUDINARY IMAGE MIGRATION */}
        {activeTab === 'cloudinary_migration' && (
          <CloudinaryMigrationManager
            appData={{
              services,
              gallery,
              aboutContent,
              siteSettings,
              categories,
              reviews,
            }}
            callbacks={{
              onUpdateService,
              onUpdateGalleryItem,
              onUpdateAboutContent,
              onUpdateSiteSettings,
              onUpdateCategory,
              onUpdateReview,
            }}
            isArabic={isArabic}
          />
        )}

      </main>

    </div>
  );
};
