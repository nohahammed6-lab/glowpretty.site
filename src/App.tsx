import { useState, useEffect } from 'react';
import {
  ViewMode,
  Language,
  Service,
  Appointment,
  AppointmentStatus,
  Review,
  AdminStat,
  CategoryItem,
  GalleryItem,
  SiteSettings,
  AboutContent,
  Supervisor,
  UserSession,
  Coupon,
} from './types';
import {
  INITIAL_SERVICES,
  INITIAL_APPOINTMENTS,
  INITIAL_REVIEWS,
  INITIAL_CATEGORIES,
  INITIAL_GALLERY,
  INITIAL_SITE_SETTINGS,
  INITIAL_ABOUT_CONTENT,
  INITIAL_SUPERVISORS,
  INITIAL_COUPONS,
} from './data/mockData';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { ServicesBookingView } from './components/ServicesBookingView';
import { AdminDashboard } from './components/AdminDashboard';
import { BookingModal } from './components/BookingModal';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { NewServiceModal } from './components/NewServiceModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { NotificationToast } from './components/NotificationToast';
import {
  subscribeToDoc,
  subscribeToDocArray,
  saveDoc,
  saveDocArray,
  hasLocalCache,
  preloadAllDatabaseData,
} from './lib/firebase';

export default function App() {
  // Initial Sync state for first-time device visits to eliminate flashing old mock data
  const [isInitialSyncing, setIsInitialSyncing] = useState<boolean>(() => !hasLocalCache());

  // Navigation & Language & Theme
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [language, setLanguage] = useState<Language>('ar'); // Default to Arabic for Qatar
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('glow_theme');
      return saved === 'dark' || saved === 'light' ? saved : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('glow_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    } catch (err) {
      console.error(err);
    }
  }, [theme]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userSession, setUserSession] = useState<UserSession>({ role: 'owner' });

  // Dynamic Application State with localStorage/sessionStorage Persistence & Firestore Real-time Sync
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = sessionStorage.getItem('glow_categories') || localStorage.getItem('glow_categories');
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [services, setServices] = useState<Service[]>(() => {
    try {
      const saved = sessionStorage.getItem('glow_services') || localStorage.getItem('glow_services');
      if (saved) {
        const parsed: Service[] = JSON.parse(saved);
        return parsed.map((srv) => {
          if (!srv.imageUrl || !srv.imageUrl.trim()) {
            const fallback = INITIAL_SERVICES.find((s) => s.id === srv.id);
            return fallback && fallback.imageUrl ? { ...srv, imageUrl: fallback.imageUrl } : srv;
          }
          return srv;
        });
      }
      return INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = sessionStorage.getItem('glow_appointments') || localStorage.getItem('glow_appointments');
      if (saved) {
        const parsed: Appointment[] = JSON.parse(saved);
        return parsed.filter((item) => item && Boolean(item.clientName || item.serviceName));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = sessionStorage.getItem('glow_reviews') || localStorage.getItem('glow_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    try {
      const saved = sessionStorage.getItem('glow_gallery') || localStorage.getItem('glow_gallery');
      return saved ? JSON.parse(saved) : INITIAL_GALLERY;
    } catch {
      return INITIAL_GALLERY;
    }
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = sessionStorage.getItem('glow_site_settings') || localStorage.getItem('glow_site_settings');
      return saved ? JSON.parse(saved) : INITIAL_SITE_SETTINGS;
    } catch {
      return INITIAL_SITE_SETTINGS;
    }
  });

  const [aboutContent, setAboutContent] = useState<AboutContent>(() => {
    try {
      const saved = sessionStorage.getItem('glow_about_content') || localStorage.getItem('glow_about_content');
      return saved ? JSON.parse(saved) : INITIAL_ABOUT_CONTENT;
    } catch {
      return INITIAL_ABOUT_CONTENT;
    }
  });

  const [supervisors, setSupervisors] = useState<Supervisor[]>(() => {
    try {
      const saved = sessionStorage.getItem('glow_supervisors') || localStorage.getItem('glow_supervisors');
      return saved ? JSON.parse(saved) : INITIAL_SUPERVISORS;
    } catch {
      return INITIAL_SUPERVISORS;
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = sessionStorage.getItem('glow_coupons') || localStorage.getItem('glow_coupons');
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  const [ownerPin, setOwnerPin] = useState<string>(() => {
    try {
      const resetDone = localStorage.getItem('glow_pin_reset_100200300');
      if (!resetDone) {
        localStorage.setItem('glow_owner_pin', '100200300');
        localStorage.setItem('glow_pin_reset_100200300', 'true');
        saveDoc('owner_pin', { pin: '100200300' });
        return '100200300';
      }
      const saved = localStorage.getItem('glow_owner_pin');
      return saved && saved !== '1234' ? saved : '100200300';
    } catch {
      return '100200300';
    }
  });

  // Perform immediate parallel prefetch and establish real-time Firestore listeners
  useEffect(() => {
    let isMounted = true;

    // Fast batch prefetch
    preloadAllDatabaseData()
      .then((preloaded) => {
        if (!isMounted) return;
        if (preloaded.siteSettings) setSiteSettings(preloaded.siteSettings);
        if (preloaded.categories && preloaded.categories.length > 0) setCategories(preloaded.categories);
        if (preloaded.services && preloaded.services.length > 0) {
          const enriched = preloaded.services.map((srv) => {
            if (!srv.imageUrl || !srv.imageUrl.trim()) {
              const fallback = INITIAL_SERVICES.find((s) => s.id === srv.id);
              return fallback && fallback.imageUrl ? { ...srv, imageUrl: fallback.imageUrl } : srv;
            }
            return srv;
          });
          setServices(enriched);
        }
        if (preloaded.appointments) {
          const validItems = preloaded.appointments
            .filter((item) => Boolean(item && (item.clientName || item.serviceName)))
            .map((item, idx) => ({
              ...item,
              id: item.id || `apt-pre-${idx}`,
            }));
          setAppointments(validItems);
        }
        if (preloaded.reviews && preloaded.reviews.length > 0) setReviews(preloaded.reviews);
        if (preloaded.gallery && preloaded.gallery.length > 0) setGallery(preloaded.gallery);
        if (preloaded.aboutContent) setAboutContent(preloaded.aboutContent);
        if (preloaded.supervisors) setSupervisors(preloaded.supervisors);
        if (preloaded.coupons) setCoupons(preloaded.coupons);
        if (preloaded.ownerPin) setOwnerPin(preloaded.ownerPin);
      })
      .finally(() => {
        if (isMounted) {
          setIsInitialSyncing(false);
        }
      });

    // Safety fallback timeout to ensure UI is never stuck on slow networks
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        setIsInitialSyncing(false);
      }
    }, 1000);

    // Continuous Real-time Listeners across all devices
    const unsubSite = subscribeToDoc<SiteSettings>('site_settings', (data) => setSiteSettings(data), INITIAL_SITE_SETTINGS);
    const unsubCat = subscribeToDocArray<CategoryItem>('categories', (items) => setCategories(items), INITIAL_CATEGORIES);
    const unsubSrv = subscribeToDocArray<Service>('services', (items) => {
      const enriched = (items && items.length > 0 ? items : INITIAL_SERVICES).map((srv) => {
        if (!srv.imageUrl || !srv.imageUrl.trim()) {
          const fallback = INITIAL_SERVICES.find((s) => s.id === srv.id);
          return fallback && fallback.imageUrl ? { ...srv, imageUrl: fallback.imageUrl } : srv;
        }
        return srv;
      });
      setServices(enriched);
    }, INITIAL_SERVICES);
    const unsubApt = subscribeToDocArray<Appointment>('appointments', (items) => {
      const validItems = (items || [])
        .filter((item) => Boolean(item && (item.clientName || item.serviceName)))
        .map((item, idx) => ({
          ...item,
          id: item.id || `apt-fixed-${idx}`,
        }));

      setAppointments(validItems);
    }, []);
    const unsubRev = subscribeToDocArray<Review>('reviews', (items) => setReviews(items), INITIAL_REVIEWS);
    const unsubGal = subscribeToDocArray<GalleryItem>('gallery', (items) => setGallery(items), INITIAL_GALLERY);
    const unsubAbt = subscribeToDoc<AboutContent>('about_content', (data) => setAboutContent(data), INITIAL_ABOUT_CONTENT);
    const unsubSup = subscribeToDocArray<Supervisor>('supervisors', (items) => {
      const hasCleanedSup = localStorage.getItem('glow_supervisors_clean_v1');
      if (!hasCleanedSup) {
        saveDocArray('supervisors', []);
        try {
          localStorage.setItem('glow_supervisors', JSON.stringify([]));
          localStorage.setItem('glow_supervisors_clean_v1', 'true');
        } catch {}
        setSupervisors([]);
        return;
      }
      const sanitized = (items || []).filter(Boolean).map((sup, idx) => ({
        ...sup,
        id: sup.id || `sup-fixed-${idx}`,
      }));
      setSupervisors(sanitized);
    }, INITIAL_SUPERVISORS);
    const unsubCpn = subscribeToDocArray<Coupon>('coupons', (items) => setCoupons(items), INITIAL_COUPONS);
    const unsubPin = subscribeToDoc<{ pin: string }>('owner_pin', (data) => setOwnerPin(data?.pin && data.pin !== '1234' ? data.pin : '100200300'), { pin: '100200300' });

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      unsubSite();
      unsubCat();
      unsubSrv();
      unsubApt();
      unsubRev();
      unsubGal();
      unsubAbt();
      unsubSup();
      unsubCpn();
      unsubPin();
    };
  }, []);

  const handleUpdateOwnerPin = (newPin: string) => {
    setOwnerPin(newPin);
    saveDoc('owner_pin', { pin: newPin });
    try {
      localStorage.setItem('glow_owner_pin', newPin);
    } catch {
      // ignore
    }
  };

  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [adminLoginInitialTab, setAdminLoginInitialTab] = useState<'owner' | 'supervisor'>('owner');

  const handleOpenAdminLogin = (tab: 'owner' | 'supervisor') => {
    setAdminLoginInitialTab(tab);
    setAdminLoginModalOpen(true);
  };

  // Calculate real-time dynamic statistics
  const computedStats: AdminStat = {
    totalBookings: appointments.length,
    bookingsGrowth: appointments.length > 0 ? '+100%' : '0%',
    todayRevenueQAR: appointments.reduce((sum, apt) => {
      if (apt.status === 'Cancelled') return sum;
      if (typeof apt.priceQAR === 'number' && apt.priceQAR > 0) return sum + apt.priceQAR;
      const srv = services.find((s) => s.id === apt.serviceId);
      return sum + (srv ? srv.priceQAR : 0);
    }, 0),
    revenueGrowth: appointments.length > 0 ? '+100%' : '0%',
    activeServicesCount: services.length,
    customerSatisfaction:
      reviews.length > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 5.0,
  };

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('glow_categories', JSON.stringify(categories));
    } catch (e) { console.error(e); }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('glow_services', JSON.stringify(services));
    } catch (e) { console.error(e); }
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem('glow_appointments', JSON.stringify(appointments));
    } catch (e) { console.error(e); }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem('glow_reviews', JSON.stringify(reviews));
    } catch (e) { console.error(e); }
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem('glow_gallery', JSON.stringify(gallery));
    } catch (e) { console.error(e); }
  }, [gallery]);

  useEffect(() => {
    try {
      localStorage.setItem('glow_site_settings', JSON.stringify(siteSettings));
    } catch (e) { console.error(e); }
  }, [siteSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('glow_about_content', JSON.stringify(aboutContent));
    } catch (e) { console.error(e); }
  }, [aboutContent]);

  useEffect(() => {
    try {
      localStorage.setItem('glow_supervisors', JSON.stringify(supervisors));
    } catch (e) { console.error(e); }
  }, [supervisors]);

  useEffect(() => {
    try {
      localStorage.setItem('glow_coupons', JSON.stringify(coupons));
    } catch (e) { console.error(e); }
  }, [coupons]);

  // Coupon Management Handlers
  const handleUseCoupon = (code: string) => {
    setCoupons((prev) => {
      const nextCoupons = prev.map((c) =>
        c.code.toUpperCase() === code.toUpperCase()
          ? { ...c, usedCount: (c.usedCount || 0) + 1 }
          : c
      );
      saveDocArray('coupons', nextCoupons);
      return nextCoupons;
    });
  };

  const handleSaveCoupon = (coupon: Coupon) => {
    setCoupons((prev) => {
      const exists = prev.some((c) => c.id === coupon.id);
      const nextCoupons = exists
        ? prev.map((c) => (c.id === coupon.id ? coupon : c))
        : [coupon, ...prev];
      saveDocArray('coupons', nextCoupons);
      return nextCoupons;
    });
    showToast(language === 'ar' ? 'تم حفظ كود الخصم بنجاح' : 'Coupon code saved.');
  };

  const handleDeleteCoupon = (id: string) => {
    setCoupons((prev) => {
      const nextCoupons = prev.filter((c) => c.id !== id);
      saveDocArray('coupons', nextCoupons);
      return nextCoupons;
    });
    showToast(language === 'ar' ? 'تم حذف كود الخصم' : 'Coupon deleted.');
  };

  // Modals & Toast State
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [newAppointmentModalOpen, setNewAppointmentModalOpen] = useState(false);
  const [newServiceModalOpen, setNewServiceModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync RTL direction & check URL hash for admin secret entrance
  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }

    // Check if URL hash is #admin or #manager
    if (window.location.hash === '#admin' || window.location.hash === '#manager') {
      setAdminLoginModalOpen(true);
    }

    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.hash === '#manager') {
        setAdminLoginModalOpen(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [language]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  // Handlers for Client Booking
  const handleConfirmBooking = (
    bookingData: Omit<Appointment, 'id' | 'createdAt' | 'status'>
  ) => {
    const newApt: Appointment = {
      ...bookingData,
      id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    setAppointments((prev) => {
      const nextAppointments = [newApt, ...prev];
      saveDocArray('appointments', nextAppointments);
      return nextAppointments;
    });

    setConfirmedAppointment(newApt);
    showToast(
      language === 'ar'
        ? `تم حجز الموعد بنجاح للعميلة ${newApt.clientName}!`
        : `Appointment reserved for ${newApt.clientName}!`
    );
  };

  // Handlers for Admin - Appointments
  const handleUpdateAppointmentStatus = (id: string, newStatus: AppointmentStatus) => {
    setAppointments((prev) => {
      const nextAppointments = prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
      saveDocArray('appointments', nextAppointments);
      return nextAppointments;
    });
    showToast(
      language === 'ar' ? `تم تغيير حالة الحجز إلى: ${newStatus}` : `Status updated to ${newStatus}`
    );
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => {
      const nextAppointments = prev.filter((a) => a.id !== id);
      saveDocArray('appointments', nextAppointments);
      return nextAppointments;
    });
    showToast(language === 'ar' ? 'تم حذف الموعد' : 'Appointment deleted.');
  };

  const handleAddAppointmentAdmin = (
    newAptData: Omit<Appointment, 'id' | 'createdAt'>
  ) => {
    const newApt: Appointment = {
      ...newAptData,
      id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    setAppointments((prev) => {
      const nextAppointments = [newApt, ...prev];
      saveDocArray('appointments', nextAppointments);
      return nextAppointments;
    });
    showToast(language === 'ar' ? 'تم إضافة حجز جديد بنجاح' : 'New appointment added.');
  };

  // Handlers for Admin - Categories
  const handleAddCategory = (cat: CategoryItem) => {
    setCategories((prev) => {
      const nextCategories = [...prev, cat];
      saveDocArray('categories', nextCategories);
      return nextCategories;
    });
    showToast(language === 'ar' ? `تم إضافة تصنيف: ${cat.arabicLabel}` : `Category added: ${cat.label}`);
  };

  const handleUpdateCategory = (cat: CategoryItem) => {
    setCategories((prev) => {
      const nextCategories = prev.map((c) => (c.id === cat.id ? cat : c));
      saveDocArray('categories', nextCategories);
      return nextCategories;
    });
    showToast(language === 'ar' ? 'تم تحديث التصنيف' : 'Category updated.');
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => {
      const nextCategories = prev.filter((c) => c.id !== id);
      saveDocArray('categories', nextCategories);
      return nextCategories;
    });
    showToast(language === 'ar' ? 'تم حذف التصنيف' : 'Category deleted.');
  };

  // Handlers for Admin - Services
  const handleAddServiceAdmin = (newService: Service) => {
    setServices((prev) => {
      const nextServices = [...prev, newService];
      saveDocArray('services', nextServices);
      return nextServices;
    });
    showToast(language === 'ar' ? `تم إضافة خدمة: ${newService.arabicTitle}` : `New service added.`);
  };

  const handleUpdateServiceAdmin = (updatedService: Service) => {
    setServices((prev) => {
      const nextServices = prev.map((s) => (s.id === updatedService.id ? updatedService : s));
      saveDocArray('services', nextServices);
      return nextServices;
    });
    showToast(language === 'ar' ? 'تم تحديث بيانات الخدمة' : 'Service updated.');
  };

  const handleDeleteServiceAdmin = (id: string) => {
    setServices((prev) => {
      const nextServices = prev.filter((s) => s.id !== id);
      saveDocArray('services', nextServices);
      return nextServices;
    });
    showToast(language === 'ar' ? 'تم حذف الخدمة من القائمة' : 'Service deleted.');
  };

  // Handlers for Admin - Site Settings
  const handleUpdateSiteSettings = (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);
    saveDoc('site_settings', newSettings);
    showToast(language === 'ar' ? 'تم حفظ بيانات الموقع والتواصل بنجاح' : 'Site settings saved.');
  };

  // Handlers for Admin - Gallery
  const handleAddGalleryItem = (item: GalleryItem) => {
    setGallery((prev) => {
      const nextGallery = [item, ...prev];
      saveDocArray('gallery', nextGallery);
      return nextGallery;
    });
    showToast(language === 'ar' ? 'تم إضافة الصورة لمعرض الصور' : 'Gallery item added.');
  };

  const handleUpdateGalleryItem = (updatedItem: GalleryItem) => {
    setGallery((prev) => {
      const nextGallery = prev.map((g) => (g.id === updatedItem.id ? updatedItem : g));
      saveDocArray('gallery', nextGallery);
      return nextGallery;
    });
    showToast(language === 'ar' ? 'تم تحديث الصورة بالمعرض' : 'Gallery item updated.');
  };

  const handleDeleteGalleryItem = (id: string) => {
    setGallery((prev) => {
      const nextGallery = prev.filter((g) => g.id !== id);
      saveDocArray('gallery', nextGallery);
      return nextGallery;
    });
    showToast(language === 'ar' ? 'تم حذف الصورة من المعرض' : 'Gallery item deleted.');
  };

  // Handlers for Admin - Supervisors Management
  const handleAddSupervisor = (sup: Supervisor) => {
    setSupervisors((prev) => {
      const nextSupervisors = [sup, ...prev];
      saveDocArray('supervisors', nextSupervisors);
      return nextSupervisors;
    });
    showToast(language === 'ar' ? `تم إضافة المشرف: ${sup.name}` : `Supervisor ${sup.name} added.`);
  };

  const handleUpdateSupervisor = (updatedSup: Supervisor) => {
    setSupervisors((prev) => {
      const nextSupervisors = prev.map((s) => (s.id === updatedSup.id ? updatedSup : s));
      saveDocArray('supervisors', nextSupervisors);
      return nextSupervisors;
    });
    showToast(language === 'ar' ? 'تم تحديث بيانات وصلاحيات المشرف' : 'Supervisor updated.');
  };

  const handleDeleteSupervisor = (id: string) => {
    setSupervisors((prev) => {
      const nextSupervisors = prev.filter((s) => s.id !== id);
      saveDocArray('supervisors', nextSupervisors);
      return nextSupervisors;
    });
    showToast(language === 'ar' ? 'تم حذف حساب المشرف' : 'Supervisor deleted.');
  };

  // Handlers for Admin - About Content
  const handleUpdateAboutContent = (about: AboutContent) => {
    setAboutContent(about);
    saveDoc('about_content', about);
    showToast(language === 'ar' ? 'تم حفظ النبذة التعريفية للصالون' : 'About section updated.');
  };

  // Handlers for Admin/Client - Reviews
  const handleAddReview = (review: Review) => {
    setReviews((prev) => {
      const nextReviews = [review, ...prev];
      saveDocArray('reviews', nextReviews);
      return nextReviews;
    });
    showToast(language === 'ar' ? 'شكراً لكِ! تم إضافة تقييمكِ بنجاح.' : 'Thank you! Your review has been submitted.');
  };

  const handleUpdateReview = (review: Review) => {
    setReviews((prev) => {
      const nextReviews = prev.map((r) => (r.id === review.id ? review : r));
      saveDocArray('reviews', nextReviews);
      return nextReviews;
    });
    showToast(language === 'ar' ? 'تم تعديل التقييم بنجاح' : 'Review updated successfully.');
  };

  const handleDeleteReview = (id: string) => {
    setReviews((prev) => {
      const nextReviews = prev.filter((r) => r.id !== id);
      saveDocArray('reviews', nextReviews);
      return nextReviews;
    });
    showToast(language === 'ar' ? 'تم حذف التقييم' : 'Review deleted.');
  };

  if (isInitialSyncing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2a0011] via-[#3f0018] to-[#1a000a] text-white flex flex-col items-center justify-center p-6 select-none" dir="rtl">
        <div className="max-w-md w-full text-center flex flex-col items-center animate-fade-in">
          {/* Logo & Glow Circle */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#D4AF37]/25 blur-2xl rounded-full scale-125 animate-pulse"></div>
            <div className="relative w-24 h-24 rounded-full border-2 border-[#D4AF37] bg-[#530025] flex items-center justify-center shadow-2xl shadow-[#D4AF37]/20">
              <span className="material-symbols-outlined text-4xl text-[#D4AF37] animate-spin-slow">
                spa
              </span>
            </div>
          </div>

          {/* Salon Title */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#D4AF37] font-serif mb-2 tracking-wide">
            صالون جلو بريتي للتجميل
          </h1>
          <p className="text-xs md:text-sm text-pink-200/80 mb-8 font-medium">
            Glow Pretty Beauty Salon • قطر
          </p>

          {/* Sync Progress Indicator */}
          <div className="w-full bg-[#1c000b]/80 border border-[#D4AF37]/30 rounded-2xl p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-center gap-3 text-sm text-[#ffd9df] mb-4">
              <span className="material-symbols-outlined text-[#D4AF37] text-xl animate-spin">
                sync
              </span>
              <span className="font-semibold">جاري مزامنة أحدث الخدمات والأسعار من قاعدة البيانات...</span>
            </div>

            {/* Glowing Golden Bar */}
            <div className="w-full bg-[#3a0018] h-2 rounded-full overflow-hidden p-0.5 border border-[#D4AF37]/20">
              <div className="h-full bg-gradient-to-r from-[#D4AF37] via-[#fff2af] to-[#D4AF37] rounded-full animate-pulse w-full"></div>
            </div>

            <p className="text-[11px] text-pink-300/60 mt-3">
              اتصال مباشر وفوري • يظهر لكِ أحدث العروض والخدمات مباشرة
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-body bg-[#fcf9f8] text-[#1c1b1b] selection:bg-[#ffd9df] selection:text-[#3f0018]">
      
      {/* Active Admin Indicator Bar */}
      {viewMode === 'admin' && (
        <div className="bg-[#8f003f] text-[#D4AF37] px-6 py-2 border-b border-[#D4AF37]/50 flex items-center justify-between text-xs font-bold shadow-md sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#D4AF37]">admin_panel_settings</span>
            <span>
              {userSession.role === 'owner'
                ? language === 'ar'
                  ? 'أنتِ الآن في لوحة تحكم المدير العام للصالون 👑'
                  : 'Salon Manager Console (Owner) 👑'
                : language === 'ar'
                ? `لوحة تحكم المشرف: ${userSession.supervisorData?.name || ''} 🔑`
                : `Supervisor Console: ${userSession.supervisorData?.name || ''} 🔑`}
            </span>
          </div>
          <button
            onClick={() => setViewMode('home')}
            className="bg-[#D4AF37] text-[#3f0018] hover:bg-white px-3.5 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            <span>{language === 'ar' ? 'العودة لموقع العملاء' : 'Back to Client Site'}</span>
          </button>
        </div>
      )}

      {/* Top Header */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        onBookNowClick={() => {
          setViewMode('booking');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onAdminLoginClick={(tab) => {
          if (viewMode === 'admin') {
            setViewMode('home');
          } else {
            handleOpenAdminLogin(tab);
          }
        }}
        siteSettings={siteSettings}
      />

      {/* Main View Canvas */}
      <div className="flex-1">
        {viewMode === 'home' && (
          <HomeView
            setViewMode={setViewMode}
            language={language}
            reviews={reviews}
            services={services}
            onAddReview={handleAddReview}
            onSelectServiceCategory={(cat) => setSelectedCategory(cat)}
            aboutContent={aboutContent}
            gallery={gallery}
            siteSettings={siteSettings}
            categories={categories}
          />
        )}

        {viewMode === 'booking' && (
          <ServicesBookingView
            services={services}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            language={language}
            onConfirmBooking={(bookingData) => {
              handleConfirmBooking(bookingData);
              if (bookingData.couponCode) {
                handleUseCoupon(bookingData.couponCode);
              }
            }}
            categories={categories}
            siteSettings={siteSettings}
            coupons={coupons}
            onUseCoupon={handleUseCoupon}
          />
        )}

        {viewMode === 'admin' && (
          <AdminDashboard
            appointments={appointments}
            services={services}
            stats={computedStats}
            language={language}
            categories={categories}
            gallery={gallery}
            siteSettings={siteSettings}
            aboutContent={aboutContent}
            reviews={reviews}
            supervisors={supervisors}
            coupons={coupons}
            onSaveCoupon={handleSaveCoupon}
            onAddCoupon={handleSaveCoupon}
            onUpdateCoupon={handleSaveCoupon}
            onDeleteCoupon={handleDeleteCoupon}
            userSession={userSession}
            ownerPin={ownerPin}
            onUpdateOwnerPin={handleUpdateOwnerPin}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onDeleteAppointment={handleDeleteAppointment}
            onOpenNewAppointmentModal={() => setNewAppointmentModalOpen(true)}
            onOpenNewServiceModal={() => setNewServiceModalOpen(true)}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onUpdateService={handleUpdateServiceAdmin}
            onDeleteService={handleDeleteServiceAdmin}
            onUpdateSiteSettings={handleUpdateSiteSettings}
            onAddGalleryItem={handleAddGalleryItem}
            onUpdateGalleryItem={handleUpdateGalleryItem}
            onDeleteGalleryItem={handleDeleteGalleryItem}
            onAddSupervisor={handleAddSupervisor}
            onUpdateSupervisor={handleUpdateSupervisor}
            onDeleteSupervisor={handleDeleteSupervisor}
            onUpdateAboutContent={handleUpdateAboutContent}
            onAddReview={handleAddReview}
            onUpdateReview={handleUpdateReview}
            onDeleteReview={handleDeleteReview}
            onBackToClientView={() => setViewMode('home')}
          />
        )}
      </div>

      {/* Footer (Hidden in Admin Console for full dashboard view) */}
      {viewMode !== 'admin' && (
        <Footer
          setViewMode={setViewMode}
          language={language}
          siteSettings={siteSettings}
          onAdminLoginClick={(tab) => handleOpenAdminLogin(tab)}
        />
      )}

      {/* Modals & Toast Alerts */}
      <BookingModal
        appointment={confirmedAppointment}
        language={language}
        onClose={() => {
          setConfirmedAppointment(null);
          setSelectedCategory('all');
          setViewMode('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <NewAppointmentModal
        services={services}
        coupons={coupons}
        isOpen={newAppointmentModalOpen}
        onClose={() => setNewAppointmentModalOpen(false)}
        onAdd={(newApt) => {
          handleAddAppointmentAdmin(newApt);
          if (newApt.couponCode) {
            handleUseCoupon(newApt.couponCode);
          }
        }}
      />

      <NewServiceModal
        isOpen={newServiceModalOpen}
        onClose={() => setNewServiceModalOpen(false)}
        onAdd={handleAddServiceAdmin}
        categories={categories}
      />

      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        supervisors={supervisors}
        initialTab={adminLoginInitialTab}
        ownerPin={ownerPin}
        onSuccess={(session) => {
          setUserSession(session);
          setViewMode('admin');
          const title =
            session.role === 'owner'
              ? language === 'ar'
                ? 'تم الدخول بصلحية المدير العام'
                : 'Logged in as Owner'
              : language === 'ar'
              ? `مرحباً المشرفة ${session.supervisorData?.name || ''}`
              : `Welcome Supervisor ${session.supervisorData?.name || ''}`;
          showToast(title);
        }}
        language={language}
      />

      <NotificationToast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

    </div>
  );
}
