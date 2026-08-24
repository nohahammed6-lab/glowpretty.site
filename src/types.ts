export interface CategoryItem {
  id: string;
  label: string;
  arabicLabel: string;
}

export interface Service {
  id: string;
  title: string;
  category: string; // e.g. 'hair', 'nails', 'skincare', 'makeup', 'waxing' or custom category ID
  priceQAR: number;
  priceDisplay?: string;
  durationMinutes: number;
  description: string;
  arabicTitle: string;
  arabicPrice?: string;
  arabicDescription: string;
  imageUrl: string;
  isSignature?: boolean;
}

export type AppointmentStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';

export interface AppointmentServiceItem {
  id?: string;
  title: string;
  priceQAR?: number;
  priceDisplay?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed'; // 'percentage' (%) or 'fixed' (QAR)
  discountValue: number; // e.g. 10 for 10% or 50 for 50 QAR
  maxUses: number; // Max users allowed to use this coupon
  usedCount: number; // Current usage count
  isActive: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientInitials: string;
  clientEmail?: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  numberOfPersons?: number;
  priceQAR?: number;
  priceDisplay?: string;
  originalPriceQAR?: number;
  couponCode?: string;
  discountAmount?: number;
  servicesBreakdown?: AppointmentServiceItem[];
  date: string; // YYYY-MM-DD
  time: string; // e.g. "11:30 AM"
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  rating: number;
  comment: string;
  serviceName?: string;
  date?: string;
}

export type Language = 'en' | 'ar';
export type ViewMode = 'home' | 'booking' | 'admin';

export interface AdminStat {
  totalBookings: number;
  bookingsGrowth: string;
  todayRevenueQAR: number;
  revenueGrowth: string;
  activeServicesCount: number;
  customerSatisfaction: number;
}

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  arabicTitle: string;
  span?: string;
}

export interface SiteSettings {
  phone: string;
  whatsapp: string;
  email: string;
  locationEN: string;
  locationAR: string;
  workingHoursEN: string;
  workingHoursAR: string;
  instagramUrl: string;
  tiktokUrl: string;
  snapchatUrl: string;
  facebookUrl: string;
}

export interface SupervisorPermission {
  manageAppointments: boolean;
  manageCategories: boolean;
  manageServices: boolean;
  manageReviews: boolean;
  manageGallery: boolean;
  manageSiteInfo: boolean;
  manageAbout: boolean;
  manageCoupons?: boolean;
}

export interface Supervisor {
  id: string;
  name: string;
  username: string;
  password: string;
  permissions: SupervisorPermission;
  createdAt: string;
}

export type AdminRoleType = 'owner' | 'supervisor';

export interface UserSession {
  role: AdminRoleType;
  supervisorData?: Supervisor;
}

export interface AboutContent {
  titleEN: string;
  titleAR: string;
  storyEN: string;
  storyAR: string;
  featuresEN: string[];
  featuresAR: string[];
}
