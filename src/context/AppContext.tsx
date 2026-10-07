import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PageRoute,
  AppRouteLocation,
  SiteSettings,
  SiteImagesConfig,
  GameService,
  HostingPlan,
  GeneralService,
  ServerLocation,
  ComparisonRow,
  FaqItem,
  Testimonial,
  BlogPost,
  CouponCode,
  CurrencyConfig,
  UserAccount,
  DeployedServer,
  BillingCycle,
  Invoice,
  SavedCard,
  PaymentGatewaySettings,
  PaymentGatewayType,
  SupportTicket,
  TicketDepartment,
  TicketPriority,
  TicketStatus,
  DomainTld,
  DomainRegistration,
  DnsRecord,
  HostingOrder,
  OrderStatus,
  OrderConfiguration,
  PaymentRecord,
  CustomerRecord,
  StatusComponent,
  StatusIncident,
  ServerNode,
  AdminUserAccount,
  AuditLogEntry,
  Partner,
  CustomerReview,
} from '../types';
import {
  INITIAL_SITE_SETTINGS,
  INITIAL_SITE_IMAGES,
  INITIAL_GAMES,
  INITIAL_PLANS,
  INITIAL_GENERAL_SERVICES,
  INITIAL_SERVER_LOCATIONS,
  INITIAL_COMPARISON_ROWS,
  INITIAL_FAQS,
  INITIAL_TESTIMONIALS,
  INITIAL_BLOG_POSTS,
  INITIAL_COUPONS,
  CURRENCIES,
  INITIAL_USER,
  INITIAL_DEPLOYED_SERVERS,
  INITIAL_SAVED_CARDS,
  INITIAL_INVOICES,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_TLDS,
  INITIAL_ORDERS,
  INITIAL_PAYMENT_RECORDS,
  INITIAL_CUSTOMERS,
  INITIAL_STATUS_COMPONENTS,
  INITIAL_STATUS_INCIDENTS,
  INITIAL_SERVER_NODES,
  INITIAL_ADMIN_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PARTNERS,
  INITIAL_REVIEWS,
} from '../data/initialData';

export interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
  timestamp: number;
}

interface AppContextType {
  // Navigation Routing & URL Hash
  activePage: PageRoute;
  currentPage: PageRoute;
  setActivePage: (page: PageRoute) => void;
  navigateTo: (page: PageRoute | string, params?: Record<string, string>) => void;
  currentRoute: AppRouteLocation;
  activePlanForDetail: HostingPlan | null;
  setActivePlanForDetail: (plan: HostingPlan | null) => void;
  activeGameForDetail: GameService | null;
  setActiveGameForDetail: (game: GameService | null) => void;
  activeServiceForDetail: GeneralService | null;
  setActiveServiceForDetail: (service: GeneralService | null) => void;

  // Site Configuration & Images
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  siteImages: SiteImagesConfig;
  updateSiteImages: (images: Partial<SiteImagesConfig>) => void;

  // Catalog & Products
  games: GameService[];
  addGame: (game: Omit<GameService, 'id'>) => void;
  updateGame: (id: string, game: Partial<GameService>) => void;
  deleteGame: (id: string) => void;

  plans: HostingPlan[];
  addPlan: (plan: Omit<HostingPlan, 'id'>) => void;
  updatePlan: (id: string, plan: Partial<HostingPlan>) => void;
  deletePlan: (id: string) => void;

  services: GeneralService[];
  generalServices: GeneralService[];
  addService: (service: Omit<GeneralService, 'id'>) => void;
  updateService: (id: string, service: Partial<GeneralService>) => void;
  deleteService: (id: string) => void;
  addGeneralService: (service: Omit<GeneralService, 'id'>) => void;
  updateGeneralService: (id: string, service: Partial<GeneralService>) => void;
  deleteGeneralService: (id: string) => void;

  // Domain Management
  tlds: DomainTld[];
  addTld: (tld: Omit<DomainTld, 'id'>) => void;
  updateTld: (id: string, tld: Partial<DomainTld>) => void;
  deleteTld: (id: string) => void;
  registeredDomains: DomainRegistration[];
  registerDomain: (domainName: string, years: number, whoisPrivacy: boolean) => DomainRegistration;
  updateDomainDns: (domainId: string, dnsRecords: DnsRecord[]) => void;

  // Infrastructure & Marketing
  locations: ServerLocation[];
  addLocation: (location: Omit<ServerLocation, 'id'>) => void;
  updateLocation: (id: string, location: Partial<ServerLocation>) => void;
  deleteLocation: (id: string) => void;

  comparisonRows: ComparisonRow[];
  addComparisonRow: (row: Omit<ComparisonRow, 'id'>) => void;
  updateComparisonRow: (id: string, row: Partial<ComparisonRow>) => void;
  deleteComparisonRow: (id: string) => void;

  faqs: FaqItem[];
  addFaq: (faq: Omit<FaqItem, 'id'>) => void;
  updateFaq: (id: string, faq: Partial<FaqItem>) => void;
  deleteFaq: (id: string) => void;

  testimonials: Testimonial[];
  addTestimonial: (testimonial: Omit<Testimonial, 'id'>) => void;
  updateTestimonial: (id: string, testimonial: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;

  // Partners & Review Bar
  partners: Partner[];
  addPartner: (partner: Omit<Partner, 'id'>) => void;
  updatePartner: (id: string, partner: Partial<Partner>) => void;
  deletePartner: (id: string) => void;
  createPartnerApplication: (data: Partial<Partner>) => Partner;

  reviews: CustomerReview[];
  addReview: (review: Omit<CustomerReview, 'id'>) => void;
  updateReview: (id: string, review: Partial<CustomerReview>) => void;
  deleteReview: (id: string) => void;

  blogPosts: BlogPost[];
  addBlogPost: (post: Omit<BlogPost, 'id'>) => void;
  updateBlogPost: (id: string, post: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;

  coupons: CouponCode[];
  addCoupon: (coupon: Omit<CouponCode, 'id'>) => void;
  updateCoupon: (id: string, coupon: Partial<CouponCode>) => void;
  deleteCoupon: (id: string) => void;
  validateCoupon: (code: string) => CouponCode | null;

  // Currency & Formatting
  currency: CurrencyConfig;
  currencies: CurrencyConfig[];
  setCurrency: (currency: CurrencyConfig) => void;
  updateCurrencyRate: (code: string, rateToUsd: number) => void;
  formatPrice: (usdAmount: number, forceCurrency?: CurrencyConfig) => string;

  billingCycle: BillingCycle;
  setBillingCycle: (cycle: BillingCycle) => void;

  // Authentication & Users
  user: UserAccount | null;
  currentUser: UserAccount | null;
  login: (email: string, role?: 'admin' | 'customer', name?: string, provider?: string) => boolean;
  loginWithGoogle: (details?: { email?: string; name?: string }) => Promise<boolean>;
  loginWithApple: (details?: { email?: string; name?: string }) => Promise<boolean>;
  loginWithFacebook: (details?: { email?: string; name?: string }) => Promise<boolean>;
  loginWithGithub: () => boolean;
  loginWithDiscord: () => boolean;
  logout: () => void;
  register: (name: string, email: string) => void;

  // Customer Management (Admin)
  customers: CustomerRecord[];
  updateCustomer: (id: string, customer: Partial<CustomerRecord>) => void;
  banCustomer: (id: string, reason?: string) => void;

  // Orders Management
  orders: HostingOrder[];
  createOrder: (data: {
    plan: HostingPlan;
    billingCycle: BillingCycle;
    configuration: OrderConfiguration;
    couponCode?: string;
    paymentMethod: PaymentGatewayType;
  }) => { order: HostingOrder; invoice: Invoice };
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string) => void;

  // Payments Ledger
  payments: PaymentRecord[];
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'date'>) => PaymentRecord;
  refundPayment: (paymentId: string, reason?: string) => void;

  // Server Management
  deployedServers: DeployedServer[];
  userServers: DeployedServer[];
  deployServer: (plan: HostingPlan, location: string, serverName: string) => DeployedServer;
  toggleServerPower: (id: string, targetStatus?: 'running' | 'offline') => void;
  updateServerPowerState: (id: string, status: 'running' | 'restarting' | 'stopped') => void;
  addServerLog: (id: string, log: string) => void;
  deleteServer: (id: string) => void;

  // Invoices & Billing
  invoices: Invoice[];
  createInvoice: (plan: HostingPlan, cycle: BillingCycle, couponUsed?: string, location?: string) => Invoice;
  payInvoice: (invoiceId: string, paymentMethod: PaymentGatewayType, transactionId?: string) => boolean;
  updateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => void;
  activeInvoiceModal: Invoice | null;
  setActiveInvoiceModal: (inv: Invoice | null) => void;

  // Saved Cards
  savedCards: SavedCard[];
  addSavedCard: (card: Omit<SavedCard, 'id' | 'createdAt'>) => void;
  removeSavedCard: (cardId: string) => void;
  setDefaultCard: (cardId: string) => void;

  // Payment Gateways Config
  paymentSettings: PaymentGatewaySettings;
  updatePaymentSettings: (settings: Partial<PaymentGatewaySettings>) => void;

  // Support Tickets
  tickets: SupportTicket[];
  createTicket: (data: {
    subject: string;
    department: TicketDepartment;
    priority: TicketPriority;
    message: string;
    relatedServerId?: string;
  }) => SupportTicket;
  replyTicket: (ticketId: string, message: string, asAdmin?: boolean) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  activeTicketModal: SupportTicket | null;
  setActiveTicketModal: (t: SupportTicket | null) => void;

  // Service Status & Incidents
  statusComponents: StatusComponent[];
  updateStatusComponent: (id: string, status: StatusComponent['status']) => void;
  statusIncidents: StatusIncident[];
  createIncident: (incident: Omit<StatusIncident, 'id' | 'createdAt' | 'updatedAt'>) => StatusIncident;
  updateIncident: (id: string, updates: Partial<StatusIncident>) => void;

  // Server Nodes (Infrastructure)
  serverNodes: ServerNode[];
  addServerNode: (node: Omit<ServerNode, 'id'>) => void;
  updateServerNode: (id: string, node: Partial<ServerNode>) => void;
  deleteServerNode: (id: string) => void;

  // Admin Accounts & Staff
  adminUsers: AdminUserAccount[];
  addAdminUser: (admin: Omit<AdminUserAccount, 'id' | 'createdAt'>) => void;
  updateAdminUser: (id: string, admin: Partial<AdminUserAccount>) => void;
  deleteAdminUser: (id: string) => void;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;

  // Modals & Navigation
  isAnnouncementVisible: boolean;
  dismissAnnouncement: () => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'admin';
  setAuthModalTab: (tab: 'login' | 'register' | 'admin') => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  selectedPlanForCheckout: HostingPlan | null;
  openCheckout: (plan: HostingPlan) => void;
  isClientAreaOpen: boolean;
  setIsClientAreaOpen: (open: boolean) => void;
  activeBlogPostModal: BlogPost | null;
  setActiveBlogPostModal: (post: BlogPost | null) => void;

  // Feedback Notifications
  notifications: AppNotification[];
  showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissNotification: (id: string) => void;

  // Reset & Backup
  resetToDefaults: () => void;
  exportConfigJson: () => string;
  importConfigJson: (jsonString: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'arvex_saas_v3_';
const AUTH_SESSION_KEY = 'arvex_auth_session_v1';
const AUTH_SESSION_MAX_IDLE = 24 * 60 * 60 * 1000;

function getAuthSessionUser<T>(): T | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.user || !session?.lastActivity) return null;
    if (Date.now() - Number(session.lastActivity) >= AUTH_SESSION_MAX_IDLE) {
      localStorage.removeItem(AUTH_SESSION_KEY);
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'user');
      return null;
    }
    return session.user as T;
  } catch {
    return null;
  }
}

function saveAuthSession(user: unknown) {
  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
      user,
      lastActivity: Date.now(),
    }));
  } catch {}
}

function touchAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return;
    const session = JSON.parse(raw);
    if (!session?.user) return;
    if (Date.now() - Number(session.lastActivity || 0) >= AUTH_SESSION_MAX_IDLE) {
      localStorage.removeItem(AUTH_SESSION_KEY);
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'user');
      return;
    }
    session.lastActivity = Date.now();
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  } catch {}
}



function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);
    return parsed ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to persist to localStorage', e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation Route & Hash State
  const initialRouteInput = typeof window !== 'undefined'
    ? (window.location.hash.replace(/^#\/?/, '') || window.location.pathname.replace(/^\/+|\/+$/g, '') || 'home')
    : 'home';
  const initialIsClientDashboard = initialRouteInput.split('/')[0] === 'client-dashboard';
  const [activePage, setActivePage] = useState<PageRoute>(initialIsClientDashboard ? 'client-dashboard' : 'home');
  const [currentRoute, setCurrentRoute] = useState<AppRouteLocation>({
    path: initialIsClientDashboard ? '/client-dashboard' : '/',
    page: initialIsClientDashboard ? 'client-dashboard' : 'home',
    params: {},
  });

  // Dynamic Selected Items for Detailed Pages
  const [activePlanForDetail, setActivePlanForDetail] = useState<HostingPlan | null>(null);
  const [activeGameForDetail, setActiveGameForDetail] = useState<GameService | null>(null);
  const [activeServiceForDetail, setActiveServiceForDetail] = useState<GeneralService | null>(null);

  // Core Configurations
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() =>
    getStored('siteSettings', INITIAL_SITE_SETTINGS)
  );
  const [siteImages, setSiteImages] = useState<SiteImagesConfig>(() =>
    getStored('siteImages', INITIAL_SITE_IMAGES)
  );
  const [games, setGames] = useState<GameService[]>(() =>
    getStored('games', INITIAL_GAMES)
  );
  const [plans, setPlans] = useState<HostingPlan[]>(() =>
    getStored('plans', INITIAL_PLANS)
  );
  const [generalServices, setGeneralServices] = useState<GeneralService[]>(() =>
    getStored('generalServices', INITIAL_GENERAL_SERVICES)
  );
  const [tlds, setTlds] = useState<DomainTld[]>(() =>
    getStored('tlds', INITIAL_TLDS)
  );
  const [registeredDomains, setRegisteredDomains] = useState<DomainRegistration[]>(() =>
    getStored('registeredDomains', [])
  );
  const [locations, setLocations] = useState<ServerLocation[]>(() =>
    getStored('locations', INITIAL_SERVER_LOCATIONS)
  );
  const [comparisonRows, setComparisonRows] = useState<ComparisonRow[]>(() =>
    getStored('comparisonRows', INITIAL_COMPARISON_ROWS)
  );
  const [faqs, setFaqs] = useState<FaqItem[]>(() =>
    getStored('faqs', INITIAL_FAQS)
  );
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() =>
    getStored('testimonials', INITIAL_TESTIMONIALS)
  );
  const [partners, setPartners] = useState<Partner[]>(() =>
    getStored('partners', INITIAL_PARTNERS)
  );
  const [reviews, setReviews] = useState<CustomerReview[]>(() =>
    getStored('reviews', INITIAL_REVIEWS)
  );
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() =>
    getStored('blogPosts', INITIAL_BLOG_POSTS)
  );
  const [coupons, setCoupons] = useState<CouponCode[]>(() =>
    getStored('coupons', INITIAL_COUPONS)
  );
  const [currenciesList, setCurrenciesList] = useState<CurrencyConfig[]>(() =>
    getStored('currenciesList', CURRENCIES)
  );
  const [currency, setCurrencyState] = useState<CurrencyConfig>(() =>
    getStored('currency', CURRENCIES[1] || CURRENCIES[0]) // Default to LKR
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  // Customers & Users
  const [customers, setCustomers] = useState<CustomerRecord[]>(() =>
    getStored('customers', INITIAL_CUSTOMERS)
  );
  const [user, setUser] = useState<UserAccount | null>(() => {
    const sessionUser = getAuthSessionUser<UserAccount>();
    if (sessionUser) return sessionUser;
    const legacyUser = getStored<UserAccount | null>('user', null);
    if (legacyUser) {
      saveAuthSession(legacyUser);
      return legacyUser;
    }
    return null;
  });

  // Reconcile the browser auth state with the real server session on startup.
  // localStorage is only a UI cache; authenticated API routes remain authoritative.
  useEffect(() => {
    let cancelled = false;

    const syncServerSession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
        });

        if (cancelled) return;

        if (response.ok) {
          const data = await response.json().catch(() => null);
          if (data?.authenticated && data?.user) {
            setUser(data.user as UserAccount);
            saveAuthSession(data.user as UserAccount);
            return;
          }
        }

        setUser(null);
        try {
          localStorage.removeItem(AUTH_SESSION_KEY);
          localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'user');
        } catch {}
      } catch {
        // Keep the cached UI state during a temporary network failure.
      }
    };

    void syncServerSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // Orders, Servers & Infrastructure
  const [orders, setOrders] = useState<HostingOrder[]>(() =>
    getStored('orders', INITIAL_ORDERS)
  );
  const [deployedServers, setDeployedServers] = useState<DeployedServer[]>(() =>
    getStored('deployedServers', INITIAL_DEPLOYED_SERVERS)
  );
  const [serverNodes, setServerNodes] = useState<ServerNode[]>(() =>
    getStored('serverNodes', INITIAL_SERVER_NODES)
  );

  // Billing, Ledger & Gateways
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    getStored('invoices', INITIAL_INVOICES)
  );
  const [payments, setPayments] = useState<PaymentRecord[]>(() =>
    getStored('payments', INITIAL_PAYMENT_RECORDS)
  );
  const [savedCards, setSavedCards] = useState<SavedCard[]>(() =>
    getStored('savedCards', INITIAL_SAVED_CARDS)
  );
  const [paymentSettings, setPaymentSettings] = useState<PaymentGatewaySettings>(() =>
    getStored('paymentSettings', INITIAL_PAYMENT_SETTINGS)
  );

  // Support Tickets
  const [tickets, setTickets] = useState<SupportTicket[]>(() =>
    getStored('tickets', INITIAL_SUPPORT_TICKETS)
  );

  // Service Status & Incidents
  const [statusComponents, setStatusComponents] = useState<StatusComponent[]>(() =>
    getStored('statusComponents', INITIAL_STATUS_COMPONENTS)
  );
  const [statusIncidents, setStatusIncidents] = useState<StatusIncident[]>(() =>
    getStored('statusIncidents', INITIAL_STATUS_INCIDENTS)
  );

  // Admin Users & Staff
  const [adminUsers, setAdminUsers] = useState<AdminUserAccount[]>(() =>
    getStored('adminUsers', INITIAL_ADMIN_USERS)
  );

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() =>
    getStored('auditLogs', INITIAL_AUDIT_LOGS)
  );

  // UI state
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'admin'>('login');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<HostingPlan | null>(null);
  const [isClientAreaOpen, setIsClientAreaOpen] = useState(false);
  const [activeBlogPostModal, setActiveBlogPostModal] = useState<BlogPost | null>(null);
  const [activeInvoiceModal, setActiveInvoiceModal] = useState<Invoice | null>(null);
  const [activeTicketModal, setActiveTicketModal] = useState<SupportTicket | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Sync state to localStorage
  useEffect(() => { setStored('siteSettings', siteSettings); }, [siteSettings]);
  useEffect(() => { setStored('siteImages', siteImages); }, [siteImages]);
  useEffect(() => { setStored('games', games); }, [games]);
  useEffect(() => { setStored('plans', plans); }, [plans]);
  useEffect(() => { setStored('generalServices', generalServices); }, [generalServices]);
  useEffect(() => { setStored('tlds', tlds); }, [tlds]);
  useEffect(() => { setStored('registeredDomains', registeredDomains); }, [registeredDomains]);
  useEffect(() => { setStored('locations', locations); }, [locations]);
  useEffect(() => { setStored('comparisonRows', comparisonRows); }, [comparisonRows]);
  useEffect(() => { setStored('faqs', faqs); }, [faqs]);
  useEffect(() => { setStored('testimonials', testimonials); }, [testimonials]);
  useEffect(() => { setStored('partners', partners); }, [partners]);
  useEffect(() => { setStored('reviews', reviews); }, [reviews]);
  useEffect(() => { setStored('blogPosts', blogPosts); }, [blogPosts]);
  useEffect(() => { setStored('coupons', coupons); }, [coupons]);
  useEffect(() => { setStored('currenciesList', currenciesList); }, [currenciesList]);
  useEffect(() => { setStored('currency', currency); }, [currency]);
  useEffect(() => { setStored('customers', customers); }, [customers]);
  useEffect(() => {
    setStored('user', user);
    if (user) saveAuthSession(user);
    else {
      try { localStorage.removeItem(AUTH_SESSION_KEY); } catch {}
    }
  }, [user]);

  // Keep the authenticated session alive while the user is active.
  // A completely inactive session expires after 24 hours.
  useEffect(() => {
    if (!user) return;

    const activity = () => touchAuthSession();
    const events = ['click','keydown','mousemove','mousedown','touchstart','scroll'];
    events.forEach((event) => window.addEventListener(event, activity, { passive: true }));

    const interval = window.setInterval(() => {
      try {
        const raw = localStorage.getItem(AUTH_SESSION_KEY);
        if (!raw) return;
        const session = JSON.parse(raw);
        if (!session?.user) return;
        if (Date.now() - Number(session.lastActivity || 0) >= AUTH_SESSION_MAX_IDLE) {
          localStorage.removeItem(AUTH_SESSION_KEY);
          localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'user');
          setUser(null);
          showNotification('Your session expired after 24 hours of inactivity.', 'info');
        }
      } catch {}
    }, 60000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, activity));
      window.clearInterval(interval);
    };
  }, [user]);
  useEffect(() => { setStored('orders', orders); }, [orders]);
  useEffect(() => { setStored('deployedServers', deployedServers); }, [deployedServers]);
  useEffect(() => { setStored('serverNodes', serverNodes); }, [serverNodes]);
  useEffect(() => { setStored('invoices', invoices); }, [invoices]);
  useEffect(() => { setStored('payments', payments); }, [payments]);
  useEffect(() => { setStored('savedCards', savedCards); }, [savedCards]);
  useEffect(() => { setStored('paymentSettings', paymentSettings); }, [paymentSettings]);
  useEffect(() => { setStored('tickets', tickets); }, [tickets]);
  useEffect(() => { setStored('statusComponents', statusComponents); }, [statusComponents]);
  useEffect(() => { setStored('statusIncidents', statusIncidents); }, [statusIncidents]);
  useEffect(() => { setStored('adminUsers', adminUsers); }, [adminUsers]);
  useEffect(() => { setStored('auditLogs', auditLogs); }, [auditLogs]);

  // Notifications Toast helper
  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now() + Math.random().toString(36).substr(2, 4),
      message,
      type,
      timestamp: Date.now(),
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotif.id));
    }, 4000);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Advanced Full-Spectrum Route Resolver & Navigation
  const resolveRoute = (inputPath: string): { page: PageRoute; params: Record<string, string>; cleanPath: string } => {
    const raw = inputPath.replace(/^#\/?/, '').replace(/^\//, '');
    const segments = raw.split('/').filter(Boolean);

    if (segments.length === 0 || raw === 'home') {
      return { page: 'home', params: {}, cleanPath: 'home' };
    }

    const first = segments[0];
    const second = segments[1];
    const third = segments[2];

    // Services routes
    if (first === 'services') {
      if (!second) {
        return { page: 'services', params: {}, cleanPath: 'services' };
      }
      if (second === 'minecraft' && !third) {
        return { page: 'services-minecraft', params: { serviceType: 'minecraft' }, cleanPath: 'services/minecraft' };
      }
      if (second === 'minecraft' && third) {
        return { page: 'dynamic-plan', params: { serviceType: 'minecraft', planSlug: third }, cleanPath: `services/minecraft/${third}` };
      }
      if (second === 'game-hosting') {
        if (!third) {
          return { page: 'services-game-hosting', params: { serviceType: 'game-hosting' }, cleanPath: 'services/game-hosting' };
        }
        return { page: 'dynamic-game', params: { gameSlug: third }, cleanPath: `services/game-hosting/${third}` };
      }
      if (second === 'vps') {
        if (third) {
          return { page: 'dynamic-plan', params: { serviceType: 'vps', planSlug: third }, cleanPath: `services/vps/${third}` };
        }
        return { page: 'services-vps', params: { serviceType: 'vps' }, cleanPath: 'services/vps' };
      }
      if (second === 'vds') {
        if (third) {
          return { page: 'dynamic-plan', params: { serviceType: 'vds', planSlug: third }, cleanPath: `services/vds/${third}` };
        }
        return { page: 'services-vds', params: { serviceType: 'vds' }, cleanPath: 'services/vds' };
      }
      if (second === 'web-hosting') {
        if (third) {
          return { page: 'dynamic-plan', params: { serviceType: 'web-hosting', planSlug: third }, cleanPath: `services/web-hosting/${third}` };
        }
        return { page: 'services-web-hosting', params: { serviceType: 'web-hosting' }, cleanPath: 'services/web-hosting' };
      }
      if (second === 'bot-hosting') {
        if (third) {
          return { page: 'dynamic-plan', params: { serviceType: 'bot-hosting', planSlug: third }, cleanPath: `services/bot-hosting/${third}` };
        }
        return { page: 'services-bot-hosting', params: { serviceType: 'bot-hosting' }, cleanPath: 'services/bot-hosting' };
      }
      if (second === 'domains') {
        return { page: 'domains', params: {}, cleanPath: 'domains' };
      }
      // Direct plan under service
      if (third) {
        return { page: 'dynamic-plan', params: { serviceType: second, planSlug: third }, cleanPath: `services/${second}/${third}` };
      }
      return { page: 'dynamic-service', params: { slug: second }, cleanPath: `services/${second}` };
    }

    // Direct plan routing: /plans or /plans/arx-mc-4gb
    if (first === 'plans') {
      if (second) {
        return { page: 'dynamic-plan', params: { planSlug: second }, cleanPath: `plans/${second}` };
      }
      return { page: 'plans', params: {}, cleanPath: 'plans' };
    }

    // Pricing
    if (first === 'pricing') {
      return { page: 'pricing', params: { category: second || 'all' }, cleanPath: 'pricing' };
    }

    // Domains
    if (first === 'domains') {
      return { page: 'domains', params: { subView: second || 'search' }, cleanPath: raw };
    }

    // Checkout
    if (first === 'checkout') {
      return { page: 'checkout', params: { orderId: second || '', planId: second || '' }, cleanPath: raw };
    }

    // Payment
    if (first === 'payment') {
      return { page: 'payment', params: { orderId: second || '', status: third || second || '' }, cleanPath: raw };
    }

    // Customer Dashboard
    if (first === 'dashboard') {
      return { page: 'dashboard', params: { section: second || 'overview', id: third || '' }, cleanPath: raw };
    }

    // Dedicated real client control plane
    if (first === 'client-dashboard') {
      return { page: 'client-dashboard', params: {}, cleanPath: 'client-dashboard' };
    }

    // Support
    if (first === 'support' || first === 'tickets') {
      return { page: 'support', params: { subView: second || 'list', ticketId: third || (second !== 'new' && second !== 'tickets' ? second : '') }, cleanPath: raw };
    }

    // Status
    if (first === 'status') {
      return { page: 'status', params: {}, cleanPath: 'status' };
    }

    // Admin & Admin Login
    if (first === 'admin') {
      if (second === 'login') {
        return { page: 'admin-login', params: {}, cleanPath: 'admin/login' };
      }
      return { page: 'admin', params: { tab: second || 'overview', id: third || '' }, cleanPath: raw };
    }

    // Other general pages
    const generalMap: Record<string, PageRoute> = {
      games: 'games',
      locations: 'locations',
      datacenter: 'datacenter',
      hardware: 'hardware',
      billing: 'billing',
      blog: 'blog',
      about: 'about',
      contact: 'contact',
      terms: 'terms',
      privacy: 'privacy',
      sla: 'sla',
    };

    if (generalMap[first]) {
      return { page: generalMap[first], params: { id: second || '' }, cleanPath: raw };
    }

    return { page: 'not-found', params: { requestedPath: raw }, cleanPath: raw };
  };

  // Routing Handler
  const navigateTo = (pageOrRoute: PageRoute | string, params?: Record<string, string>) => {
    let targetPath = pageOrRoute.replace(/^#\/?/, '').replace(/^\//, '');

    // If a simple page name is passed with params
    if (params?.planSlug && targetPath.includes('services/')) {
      targetPath = `${targetPath}/${params.planSlug}`;
    } else if (params?.gameSlug && targetPath === 'services/game-hosting') {
      targetPath = `services/game-hosting/${params.gameSlug}`;
    } else if (params?.id && !targetPath.includes('/')) {
      targetPath = `${targetPath}/${params.id}`;
    }

    const { page, params: resolvedParams, cleanPath } = resolveRoute(targetPath);
    const combinedParams = { ...resolvedParams, ...(params || {}) };

    setActivePage(page);
    setCurrentRoute({
      path: `/${cleanPath}`,
      page,
      params: combinedParams,
    });

    window.location.hash = `/${cleanPath}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync with Hash on load and hashchange
  useEffect(() => {
    const handleHash = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '');
      const rawPathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
      const routeInput = rawHash || rawPathname || 'home';
      const { page, params, cleanPath } = resolveRoute(routeInput);

      setActivePage(page);
      setCurrentRoute({
        path: `/${cleanPath}`,
        page,
        params,
      });

      // Synchronize active detail objects if relevant
      if (params.planSlug) {
        const matchPlan = plans.find(
          (p) => p.slug === params.planSlug || p.id === params.planSlug
        );
        if (matchPlan) setActivePlanForDetail(matchPlan);
      }
      if (params.gameSlug) {
        const matchGame = games.find(
          (g) => g.slug === params.gameSlug || g.id === params.gameSlug
        );
        if (matchGame) setActiveGameForDetail(matchGame);
      }
      if (params.slug) {
        const matchService = generalServices.find(
          (s) => s.slug === params.slug || s.id === params.slug
        );
        if (matchService) setActiveServiceForDetail(matchService);
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, [plans, games, generalServices]);

  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...settings }));
    showNotification('Site settings updated successfully.');
  };

  const updateSiteImages = (images: Partial<SiteImagesConfig>) => {
    setSiteImages((prev) => ({ ...prev, ...images }));
    showNotification('Website images and banners updated.');
  };

  const addGame = (game: Omit<GameService, 'id'>) => {
    const newGame: GameService = { ...game, id: 'game-' + Date.now() };
    setGames((prev) => [...prev, newGame]);
    showNotification(`Game "${game.name}" added to catalog.`);
  };
  const updateGame = (id: string, game: Partial<GameService>) => {
    setGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...game } : g)));
    showNotification('Game details updated.');
  };
  const deleteGame = (id: string) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
    showNotification('Game removed from catalog.');
  };

  const addPlan = (plan: Omit<HostingPlan, 'id'>) => {
    const newPlan: HostingPlan = { ...plan, id: 'plan-' + Date.now() };
    setPlans((prev) => [...prev, newPlan]);
    showNotification(`Hosting plan "${plan.name}" created.`);
  };
  const updatePlan = (id: string, plan: Partial<HostingPlan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...plan } : p)));
    showNotification('Plan updated successfully.');
  };
  const deletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    showNotification('Plan removed.');
  };

  const addGeneralService = (service: Omit<GeneralService, 'id'>) => {
    const newService: GeneralService = {
      ...service,
      id: 'srv-' + Date.now(),
      active: service.active ?? true,
      startingPrice: service.startingPrice ?? 9.99,
      features: service.features ?? ['Instant Setup', '24/7 Support'],
    };
    setGeneralServices((prev) => [...prev, newService]);
    showNotification(`Service "${service.title}" added.`);
  };
  const updateGeneralService = (id: string, service: Partial<GeneralService>) => {
    setGeneralServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...service } : s)));
    showNotification('Service details updated.');
  };
  const deleteGeneralService = (id: string) => {
    setGeneralServices((prev) => prev.filter((s) => s.id !== id));
    showNotification('Service deleted.');
  };

  const addLocation = (location: Omit<ServerLocation, 'id'>) => {
    const newLoc: ServerLocation = { ...location, id: 'loc-' + Date.now() };
    setLocations((prev) => [...prev, newLoc]);
    showNotification(`Location "${location.city}" added.`);
  };
  const updateLocation = (id: string, location: Partial<ServerLocation>) => {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...location } : l)));
    showNotification('Location node updated.');
  };
  const deleteLocation = (id: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
    showNotification('Location removed.');
  };

  const addComparisonRow = (row: Omit<ComparisonRow, 'id'>) => {
    const newRow: ComparisonRow = { ...row, id: 'comp-' + Date.now() };
    setComparisonRows((prev) => [...prev, newRow]);
  };
  const updateComparisonRow = (id: string, row: Partial<ComparisonRow>) => {
    setComparisonRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...row } : r)));
  };
  const deleteComparisonRow = (id: string) => {
    setComparisonRows((prev) => prev.filter((r) => r.id !== id));
  };

  const addFaq = (faq: Omit<FaqItem, 'id'>) => {
    const newFaq: FaqItem = { ...faq, id: 'faq-' + Date.now() };
    setFaqs((prev) => [...prev, newFaq]);
  };
  const updateFaq = (id: string, faq: Partial<FaqItem>) => {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...faq } : f)));
  };
  const deleteFaq = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const addTestimonial = (testimonial: Omit<Testimonial, 'id'>) => {
    const newTest: Testimonial = { ...testimonial, id: 'test-' + Date.now() };
    setTestimonials((prev) => [...prev, newTest]);
  };
  const updateTestimonial = (id: string, testimonial: Partial<Testimonial>) => {
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, ...testimonial } : t)));
  };
  const deleteTestimonial = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

  // Partners Handlers
  const addPartner = (partner: Omit<Partner, 'id'>) => {
    const newPartner: Partner = {
      ...partner,
      id: 'part-' + Date.now(),
      active: partner.active !== false,
      sortOrder: partner.sortOrder ?? (partners.length + 1),
    };
    setPartners((prev) => [...prev, newPartner]);
    showNotification(`Partner ${newPartner.name} added successfully!`, 'success');
  };
  const updatePartner = (id: string, partnerUpdates: Partial<Partner>) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...partnerUpdates } : p))
    );
    showNotification('Partner updated successfully!', 'success');
  };
  const deletePartner = (id: string) => {
    setPartners((prev) => prev.filter((p) => p.id !== id));
    showNotification('Partner removed from network.', 'info');
  };
  const createPartnerApplication = (data: Partial<Partner>): Partner => {
    const newPartner: Partner = {
      id: 'part-' + Date.now(),
      name: data.name || 'Anonymous Creator',
      tagline: data.description || 'Community Partner',
      category: data.category || 'Creator',
      platform: data.platform,
      url: data.url,
      description: data.description,
      followers: data.followers || '1,000+',
      logoUrl: data.logoUrl || '',
      accent: 'from-cyan-400 to-indigo-500',
      glow: 'shadow-cyan-500/20',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      active: true,
      sortOrder: (partners || []).length + 1,
    };
    setPartners((prev) => [...prev, newPartner]);
    return newPartner;
  };

  // Review Bar Handlers
  const addReview = (review: Omit<CustomerReview, 'id'>) => {
    const newReview: CustomerReview = {
      ...review,
      id: 'rev-' + Date.now(),
      active: review.active !== false,
      sortOrder: review.sortOrder ?? (reviews.length + 1),
    };
    setReviews((prev) => [...prev, newReview]);
    showNotification(`Review from ${newReview.name} added!`, 'success');
  };
  const updateReview = (id: string, reviewUpdates: Partial<CustomerReview>) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...reviewUpdates } : r))
    );
    showNotification('Review updated successfully!', 'success');
  };
  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    showNotification('Review deleted.', 'info');
  };

  const addBlogPost = (post: Omit<BlogPost, 'id'>) => {
    const newPost: BlogPost = { ...post, id: 'blog-' + Date.now() };
    setBlogPosts((prev) => [...prev, newPost]);
    showNotification('New article published.');
  };
  const updateBlogPost = (id: string, post: Partial<BlogPost>) => {
    setBlogPosts((prev) => prev.map((b) => (b.id === id ? { ...b, ...post } : b)));
    showNotification('Article updated.');
  };
  const deleteBlogPost = (id: string) => {
    setBlogPosts((prev) => prev.filter((b) => b.id !== id));
  };

  const addCoupon = (coupon: Omit<CouponCode, 'id'>) => {
    const newCoupon: CouponCode = { ...coupon, id: 'cpn-' + Date.now() };
    setCoupons((prev) => [...prev, newCoupon]);
    showNotification(`Coupon ${coupon.code} created.`);
  };
  const updateCoupon = (id: string, coupon: Partial<CouponCode>) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...coupon } : c)));
  };
  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };
  const validateCoupon = (code: string): CouponCode | null => {
    const normalized = code.trim().toUpperCase();
    const found = (coupons || []).find(
      (c) => c.code.toUpperCase() === normalized && c.active
    );
    return found || null;
  };

  const setCurrency = (c: CurrencyConfig) => {
    setCurrencyState(c);
    showNotification(`Currency switched to ${c.label}`);
  };

  const updateCurrencyRate = (code: string, rateToUsd: number) => {
    setCurrenciesList((prev) =>
      prev.map((c) => (c.code === code ? { ...c, rateToUsd } : c))
    );
    if (currency.code === code) {
      setCurrencyState((prev) => ({ ...prev, rateToUsd }));
    }
    showNotification(`Exchange rate for ${code} set to ${rateToUsd}`);
  };

  const formatPrice = (usdAmount: number, forceCurrency?: CurrencyConfig): string => {
    const curr = forceCurrency || currency;
    const converted = usdAmount * curr.rateToUsd;
    if (curr.code === 'LKR') {
      return `Rs. ${Math.round(converted).toLocaleString()}`;
    }
    if (curr.code === 'JPY') {
      return `¥${Math.round(converted).toLocaleString()}`;
    }
    return `${curr.symbol}${converted.toFixed(2)}`;
  };

  // Authentication
  const login = (
    email: string,
    role: 'admin' | 'customer' = 'customer',
    name?: string,
    provider: 'email' | 'google' | 'github' | 'discord' = 'email'
  ): boolean => {
    const defaultUser: UserAccount = {
      id: 'usr-' + Date.now(),
      email,
      name: name || email.split('@')[0],
      role,
      provider,
      avatar:
        role === 'admin'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString(),
    };
    saveAuthSession(defaultUser);
    setStored('user', defaultUser);
    setUser(defaultUser);
    showNotification(`Signed in as ${defaultUser.name} (${role})`);
    return true;
  };

  // Social authentication is intentionally fail-closed until a real provider-side
  // OAuth/OIDC flow is configured. Never trust client-supplied email/name as identity.
  const socialAuthUnavailable = async (provider: string): Promise<boolean> => {
    showNotification(
      `${provider} sign-in is temporarily unavailable. Use email + verification code.`,
      'error'
    );
    return false;
  };

  const loginWithGoogle = async (_details?: { email?: string; name?: string }): Promise<boolean> =>
    socialAuthUnavailable('Google');

  const loginWithApple = async (_details?: { email?: string; name?: string }): Promise<boolean> =>
    socialAuthUnavailable('Apple');

  const loginWithFacebook = async (_details?: { email?: string; name?: string }): Promise<boolean> =>
    socialAuthUnavailable('Facebook');

  const loginWithGithub = (): boolean => {
    const githubUser: UserAccount = {
      id: 'usr-github-' + Date.now(),
      email: 'dev@github.com',
      name: 'GitHub Developer',
      role: 'customer',
      provider: 'github',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString(),
    };
    saveAuthSession(githubUser);
    setStored('user', githubUser);
    setUser(githubUser);
    showNotification('Authenticated via GitHub!');
    return true;
  };

  const loginWithDiscord = (): boolean => {
    const discordUser: UserAccount = {
      id: 'usr-discord-' + Date.now(),
      email: 'gamer@discord.gg',
      name: 'Discord Gamer',
      role: 'customer',
      provider: 'discord',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString(),
    };
    saveAuthSession(discordUser);
    setStored('user', discordUser);
    setUser(discordUser);
    showNotification('Connected with Discord ID!');
    return true;
  };

  const logout = () => {
    try { localStorage.removeItem(AUTH_SESSION_KEY); } catch {}
    setStored('user', null);
    try { localStorage.removeItem('arvex_admin_token'); } catch {}
    setUser(null);
    showNotification('Logged out successfully.', 'info');
  };

  const register = (name: string, email: string) => {
    const newUser: UserAccount = {
      id: 'usr-' + Date.now(),
      name,
      email,
      role: 'customer',
      provider: 'email',
      createdAt: new Date().toISOString(),
    };
    saveAuthSession(newUser);
    setStored('user', newUser);
    setUser(newUser);
    showNotification(`Account created! Welcome to HelzerX Cloud, ${name}`);
  };

  // Server Deployments
  const deployServer = (plan: HostingPlan, location: string, serverName: string): DeployedServer => {
    const game = (games || []).find((g) => g.id === plan.gameId);
    const newServer: DeployedServer = {
      id: 'srv-' + Math.random().toString(36).substring(2, 8),
      userId: user?.id || 'guest',
      serverName: serverName || `${plan.name} Node`,
      gameId: plan.gameId,
      gameName: game ? game.name : plan.subtitle,
      planName: plan.name,
      status: 'running',
      ipAddress: `198.51.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 250 + 2)}`,
      port: Math.floor(Math.random() * 10000 + 20000),
      ramUsagePercent: 32,
      ramUsageGb: 4.2,
      cpuUsage: 14.5,
      cpuUsagePercent: 12,
      diskUsagePercent: 24,
      location,
      createdAt: new Date().toISOString(),
      logs: [
        `[${new Date().toLocaleTimeString()} INFO]: Provisioning AMD Ryzen 9 9950X cluster node in ${location}...`,
        `[${new Date().toLocaleTimeString()} INFO]: 100% PCIe 5.0 NVMe isolated container allocated.`,
        `[${new Date().toLocaleTimeString()} INFO]: Corero 3.2Tbps DDoS scrubber routing enabled.`,
        `[${new Date().toLocaleTimeString()} INFO]: Pterodactyl daemon initialized on port.`,
        `[${new Date().toLocaleTimeString()} INFO]: Server state changed to RUNNING. All systems nominal.`,
      ],
    };

    setDeployedServers((prev) => [newServer, ...prev]);
    showNotification(`Server "${newServer.serverName}" deployed successfully in ${location}!`);
    return newServer;
  };

  const toggleServerPower = (id: string, targetStatus?: 'running' | 'offline') => {
    setDeployedServers((prev) =>
      prev.map((srv) => {
        if (srv.id === id) {
          const nextStatus = targetStatus || (srv.status === 'running' ? 'offline' : 'running');
          return {
            ...srv,
            status: nextStatus,
            logs: [
              ...(srv.logs || []),
              `[${new Date().toLocaleTimeString()} SYSTEM]: Server state switched to ${nextStatus.toUpperCase()}`,
            ],
          };
        }
        return srv;
      })
    );
  };

  const updateServerPowerState = (id: string, status: 'running' | 'restarting' | 'stopped') => {
    setDeployedServers((prev) =>
      prev.map((srv) => {
        if (srv.id === id) {
          return {
            ...srv,
            status,
            logs: [
              ...(srv.logs || []),
              `[${new Date().toLocaleTimeString()} SYSTEM]: Power action '${status.toUpperCase()}' applied.`,
            ],
          };
        }
        return srv;
      })
    );
    showNotification(`Server power state updated to ${status}.`);
  };

  const addServerLog = (id: string, log: string) => {
    setDeployedServers((prev) =>
      prev.map((srv) => {
        if (srv.id === id) {
          return {
            ...srv,
            logs: [...(srv.logs || []).slice(-60), `[${new Date().toLocaleTimeString()} INPUT]: ${log}`],
          };
        }
        return srv;
      })
    );
  };

  const deleteServer = (id: string) => {
    setDeployedServers((prev) => prev.filter((s) => s.id !== id));
    showNotification('Server destroyed and removed.', 'info');
  };

  // Invoices & Billing
  const createInvoice = (
    plan: HostingPlan,
    cycle: BillingCycle,
    couponUsed?: string,
    location: string = 'Dallas, TX'
  ): Invoice => {
    let price = plan.monthlyPrice;
    if (cycle === 'quarterly') price = plan.quarterlyPrice || plan.monthlyPrice * 3 * 0.9;
    if (cycle === 'yearly') price = plan.yearlyPrice || plan.monthlyPrice * 12 * 0.8;

    let discount = 0;
    if (couponUsed) {
      const c = validateCoupon(couponUsed);
      if (c) {
        discount = (price * c.discountPercentage) / 100;
      }
    }
    const finalAmount = Math.max(0, price - discount);
    const lkrAmount = finalAmount * 305.0;

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user?.id || 'guest',
      userEmail: user?.email || 'customer@helzerx.cloud',
      userName: user?.name || 'Valued Customer',
      amountUsd: finalAmount,
      amountLocal: lkrAmount,
      currency: currency.code,
      status: 'unpaid',
      items: [
        {
          description: `${plan.name} (${plan.ram}, ${plan.cpu}, ${plan.storage}) - Node: ${location}`,
          period: `${new Date().toLocaleDateString()} - ${new Date(Date.now() + 30 * 86400000).toLocaleDateString()}`,
          amountUsd: price,
          quantity: 1,
        },
      ],
      subtotalUsd: price,
      taxUsd: 0,
      discountUsd: discount,
      couponUsed,
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      notes: `Order for ${plan.subtitle || plan.name} hosted at ${location}`,
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  };

  const payInvoice = (invoiceId: string, paymentMethod: PaymentGatewayType, transactionId?: string): boolean => {
    const txn = transactionId || `TXN-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: 'paid',
            paymentMethod,
            transactionId: txn,
            paidAt: new Date().toISOString(),
          };
        }
        return inv;
      })
    );
    showNotification(`Invoice ${invoiceId} marked as PAID via ${paymentMethod.toUpperCase()}`);
    return true;
  };

  const updateInvoiceStatus = (invoiceId: string, status: Invoice['status']) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status } : inv))
    );
    showNotification(`Invoice status updated to ${status.toUpperCase()}`);
  };

  // Saved Cards Management
  const addSavedCard = (cardData: Omit<SavedCard, 'id' | 'createdAt'>) => {
    const newCard: SavedCard = {
      ...cardData,
      id: 'card-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setSavedCards((prev) => [newCard, ...prev]);
    showNotification(`Card ending in •••• ${cardData.last4} saved.`);
  };

  const removeSavedCard = (cardId: string) => {
    setSavedCards((prev) => prev.filter((c) => c.id !== cardId));
    showNotification('Card removed from payment methods.');
  };

  const setDefaultCard = (cardId: string) => {
    setSavedCards((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: c.id === cardId,
      }))
    );
    showNotification('Default billing card updated.');
  };

  // Payment Gateways Settings
  const updatePaymentSettings = (settings: Partial<PaymentGatewaySettings>) => {
    setPaymentSettings((prev) => ({ ...prev, ...settings }));
    showNotification('Payment gateway credentials and settings saved.');
  };

  // Support Tickets
  const createTicket = (data: {
    subject: string;
    department: TicketDepartment;
    priority: TicketPriority;
    message: string;
    relatedServerId?: string;
  }): SupportTicket => {
    const relatedServer = (deployedServers || []).find((s) => s.id === data.relatedServerId);
    const newTicket: SupportTicket = {
      id: 'tkt-' + Date.now(),
      ticketNumber: `#TKT-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user?.id || 'guest',
      userEmail: user?.email || 'guest@helzerx.cloud',
      userName: user?.name || 'Customer',
      subject: data.subject,
      department: data.department,
      priority: data.priority,
      status: 'Open',
      relatedServerId: data.relatedServerId,
      relatedServerName: relatedServer?.serverName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-' + Date.now(),
          senderId: user?.id || 'guest',
          senderName: user?.name || 'Customer',
          senderRole: 'customer',
          senderAvatar: user?.avatar,
          message: data.message,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);
    showNotification(`Support Ticket ${newTicket.ticketNumber} opened! Our staff will respond shortly.`);
    return newTicket;
  };

  const replyTicket = (ticketId: string, message: string, asAdmin: boolean = false) => {
    const newMessage = {
      id: 'msg-' + Date.now(),
      senderId: asAdmin ? 'staff-admin' : user?.id || 'user',
      senderName: asAdmin ? 'HelzerX Staff Support' : user?.name || 'Customer',
      senderRole: (asAdmin ? 'staff' : 'customer') as 'staff' | 'customer',
      senderAvatar: asAdmin
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
        : user?.avatar,
      message,
      timestamp: new Date().toISOString(),
    };

    setTickets((prev) =>
      prev.map((tkt) => {
        if (tkt.id === ticketId) {
          const nextStatus: TicketStatus = asAdmin ? 'Staff-Reply' : 'Customer-Reply';
          return {
            ...tkt,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
            messages: [...(tkt.messages || []), newMessage],
          };
        }
        return tkt;
      })
    );
    showNotification('Reply sent.');
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus) => {
    setTickets((prev) =>
      prev.map((tkt) => (tkt.id === ticketId ? { ...tkt, status, updatedAt: new Date().toISOString() } : tkt))
    );
    showNotification(`Ticket status changed to ${status}`);
  };

  const openCheckout = (plan: HostingPlan) => {
    setSelectedPlanForCheckout(plan);
    setIsCheckoutModalOpen(false);
    navigateTo('checkout', { planId: plan.id });
  };

  const dismissAnnouncement = () => {
    setIsAnnouncementVisible(false);
  };

  // Domain Management
  const addTld = (tld: Omit<DomainTld, 'id'>) => {
    const newTld: DomainTld = { ...tld, id: 'tld-' + Date.now() };
    setTlds((prev) => [...prev, newTld]);
    showNotification(`TLD ${tld.tld} added.`);
  };

  const updateTld = (id: string, tld: Partial<DomainTld>) => {
    setTlds((prev) => prev.map((t) => (t.id === id ? { ...t, ...tld } : t)));
    showNotification('TLD pricing updated.');
  };

  const deleteTld = (id: string) => {
    setTlds((prev) => prev.filter((t) => t.id !== id));
    showNotification('TLD removed.');
  };

  const registerDomain = (domainName: string, years: number, whoisPrivacy: boolean): DomainRegistration => {
    const tldExt = '.' + domainName.split('.').slice(1).join('.');
    const tld = tlds.find((t) => t.tld === tldExt) || tlds[0];
    const pricePerYear = tld ? tld.registerPriceUsd : 12.99;
    const totalCost = pricePerYear * years + (whoisPrivacy ? 2.99 * years : 0);

    const newReg: DomainRegistration = {
      id: 'dom-' + Date.now(),
      userId: user?.id || 'guest',
      userEmail: user?.email || 'customer@helzerx.cloud',
      domainName: domainName.toLowerCase().trim(),
      status: 'active',
      registrationDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + years * 365 * 86400000).toISOString(),
      autoRenew: true,
      whoisPrivacy,
      nameservers: ['ns1.helzerxcloud.net', 'ns2.helzerxcloud.net', 'ns3.helzerxcloud.net'],
      dnsRecords: [
        {
          id: 'dns-1',
          type: 'A',
          name: '@',
          content: '198.51.100.24',
          ttl: 3600,
        },
        {
          id: 'dns-2',
          type: 'CNAME',
          name: 'www',
          content: domainName.toLowerCase().trim(),
          ttl: 3600,
        },
      ],
    };

    setRegisteredDomains((prev) => [newReg, ...prev]);

    // Also record payment & invoice
    const inv: Invoice = {
      id: 'inv-dom-' + Date.now(),
      invoiceNumber: `INV-DOM-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user?.id || 'guest',
      userEmail: user?.email || 'customer@helzerx.cloud',
      userName: user?.name || 'Valued Customer',
      amountUsd: totalCost,
      amountLocal: totalCost * currency.rateToUsd,
      currency: currency.code,
      status: 'paid',
      paymentMethod: 'card',
      items: [
        {
          description: `Domain Registration: ${newReg.domainName} (${years} Year${years > 1 ? 's' : ''})`,
          period: `${new Date().toLocaleDateString()} - ${new Date(Date.now() + years * 365 * 86400000).toLocaleDateString()}`,
          amountUsd: totalCost,
          quantity: 1,
        },
      ],
      subtotalUsd: totalCost,
      taxUsd: 0,
      discountUsd: 0,
      dueDate: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      transactionId: `TXN-DOM-${Date.now()}`,
    };
    setInvoices((prev) => [inv, ...prev]);

    showNotification(`Domain ${domainName} successfully registered! Nameservers activated.`);
    return newReg;
  };

  const updateDomainDns = (domainId: string, dnsRecords: DnsRecord[]) => {
    setRegisteredDomains((prev) =>
      prev.map((d) => (d.id === domainId ? { ...d, dnsRecords } : d))
    );
    showNotification('DNS zone file saved & propagated.');
  };

  // Orders Management
  const createOrder = (data: {
    plan: HostingPlan;
    billingCycle: BillingCycle;
    configuration: OrderConfiguration;
    couponCode?: string;
    paymentMethod: PaymentGatewayType;
  }): { order: HostingOrder; invoice: Invoice } => {
    let basePrice = data.plan.monthlyPrice;
    if (data.billingCycle === 'quarterly') basePrice = data.plan.quarterlyPrice || data.plan.monthlyPrice * 3 * 0.9;
    if (data.billingCycle === 'yearly') basePrice = data.plan.yearlyPrice || data.plan.monthlyPrice * 12 * 0.8;

    let discount = 0;
    if (data.couponCode) {
      const c = validateCoupon(data.couponCode);
      if (c) {
        discount = (basePrice * c.discountPercentage) / 100;
      }
    }
    const finalAmount = Math.max(0, basePrice - discount);

    const inv = createInvoice(data.plan, data.billingCycle, data.couponCode, data.configuration.location);
    inv.status = 'paid';
    inv.paymentMethod = data.paymentMethod;
    inv.paidAt = new Date().toISOString();
    inv.transactionId = `TXN-ORD-${Date.now()}`;

    const newOrder: HostingOrder = {
      id: 'ord-' + Date.now(),
      orderNumber: `ARX-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: user?.id || 'guest',
      userEmail: user?.email || 'customer@helzerx.cloud',
      userName: user?.name || 'Valued Customer',
      planId: data.plan.id,
      planName: data.plan.name,
      serviceType: data.plan.serviceType || 'game-hosting',
      billingCycle: data.billingCycle,
      configuration: data.configuration,
      amountUsd: finalAmount,
      currency: currency.code,
      discountUsd: discount,
      couponCode: data.couponCode,
      status: 'Active',
      paymentMethod: data.paymentMethod,
      invoiceId: inv.id,
      transactionId: inv.transactionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Auto-deploy server instance
    const srv = deployServer(data.plan, data.configuration.location, data.configuration.hostname);
    newOrder.serverId = srv.id;

    setOrders((prev) => [newOrder, ...prev]);

    // Record payment in ledger
    const pmt: PaymentRecord = {
      id: 'pay-' + Date.now(),
      paymentId: `PMT-${Date.now()}`,
      orderId: newOrder.id,
      invoiceId: inv.id,
      userId: user?.id || 'guest',
      customerName: user?.name || 'Valued Customer',
      customerEmail: user?.email || 'customer@helzerx.cloud',
      provider: data.paymentMethod,
      amount: finalAmount,
      currency: currency.code,
      status: 'success',
      transactionId: inv.transactionId || `TXN-${Date.now()}`,
      date: new Date().toISOString(),
      notes: `Payment for ${data.plan.name} (${data.billingCycle})`,
    };
    setPayments((prev) => [pmt, ...prev]);

    // Add Audit Log
    addAuditLog({
      actorName: user?.name || 'Customer',
      actorEmail: user?.email || 'customer@helzerx.cloud',
      actorRole: user?.role || 'customer',
      action: 'ORDER_CREATED',
      targetType: 'order',
      targetId: newOrder.id,
      details: `New order ${newOrder.orderNumber} for ${data.plan.name} ($${finalAmount}) via ${data.paymentMethod}`,
      ipAddress: '198.51.100.42',
    });

    showNotification(`Order ${newOrder.orderNumber} processed & node provisioned!`);
    return { order: newOrder, invoice: inv };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    showNotification(`Order status changed to ${status.toUpperCase()}`);
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled' } : o))
    );
    showNotification('Order cancelled.');
  };

  // Payments Ledger
  const recordPayment = (paymentData: Omit<PaymentRecord, 'id' | 'date'>): PaymentRecord => {
    const pmt: PaymentRecord = {
      ...paymentData,
      id: 'pay-' + Date.now(),
      date: new Date().toISOString(),
    };
    setPayments((prev) => [pmt, ...prev]);
    showNotification(`Payment of ${formatPrice(paymentData.amount)} recorded.`);
    return pmt;
  };

  const refundPayment = (paymentId: string, reason?: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'refunded' } : p))
    );
    showNotification(`Payment ${paymentId} refunded. ${reason || ''}`);
  };

  // Customer Management
  const updateCustomer = (id: string, updates: Partial<CustomerRecord>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showNotification('Customer record updated.');
  };

  const banCustomer = (id: string, reason: string = 'Policy violation') => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'banned', notes: reason } : c))
    );
    showNotification(`Customer banned: ${reason}`, 'error');
  };

  // Status & Incidents
  const updateStatusComponent = (id: string, status: StatusComponent['status']) => {
    setStatusComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c))
    );
    showNotification('Service component status updated.');
  };

  const createIncident = (incident: Omit<StatusIncident, 'id' | 'createdAt' | 'updatedAt'>): StatusIncident => {
    const newInc: StatusIncident = {
      ...incident,
      id: 'inc-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStatusIncidents((prev) => [newInc, ...prev]);
    showNotification(`Incident reported: ${incident.title}`);
    return newInc;
  };

  const updateIncident = (id: string, updates: Partial<StatusIncident>) => {
    setStatusIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? { ...inc, ...updates, updatedAt: new Date().toISOString() }
          : inc
      )
    );
    showNotification('Incident updated.');
  };

  // Server Nodes (Infrastructure)
  const addServerNode = (node: Omit<ServerNode, 'id'>) => {
    const newNode: ServerNode = { ...node, id: 'node-' + Date.now() };
    setServerNodes((prev) => [...prev, newNode]);
    showNotification(`Infrastructure node ${node.name} registered.`);
  };

  const updateServerNode = (id: string, node: Partial<ServerNode>) => {
    setServerNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...node } : n))
    );
    showNotification('Server node updated.');
  };

  const deleteServerNode = (id: string) => {
    setServerNodes((prev) => prev.filter((n) => n.id !== id));
    showNotification('Server node removed.');
  };

  // Admin Users & Staff
  const addAdminUser = (admin: Omit<AdminUserAccount, 'id' | 'createdAt'>) => {
    const newAdmin: AdminUserAccount = {
      ...admin,
      id: 'adm-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setAdminUsers((prev) => [...prev, newAdmin]);
    showNotification(`Staff user ${admin.name} created.`);
  };

  const updateAdminUser = (id: string, admin: Partial<AdminUserAccount>) => {
    setAdminUsers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...admin } : a))
    );
    showNotification('Staff user updated.');
  };

  const deleteAdminUser = (id: string) => {
    setAdminUsers((prev) => prev.filter((a) => a.id !== id));
    showNotification('Staff user removed.');
  };

  // Audit Logs
  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newLog: AuditLogEntry = {
      ...entry,
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...(prev || []).slice(0, 99)]);
  };

  const resetToDefaults = () => {
    setSiteSettings(INITIAL_SITE_SETTINGS);
    setSiteImages(INITIAL_SITE_IMAGES);
    setGames(INITIAL_GAMES);
    setPlans(INITIAL_PLANS);
    setGeneralServices(INITIAL_GENERAL_SERVICES);
    setTlds(INITIAL_TLDS);
    setRegisteredDomains([]);
    setLocations(INITIAL_SERVER_LOCATIONS);
    setComparisonRows(INITIAL_COMPARISON_ROWS);
    setFaqs(INITIAL_FAQS);
    setTestimonials(INITIAL_TESTIMONIALS);
    setPartners(INITIAL_PARTNERS);
    setReviews(INITIAL_REVIEWS);
    setBlogPosts(INITIAL_BLOG_POSTS);
    setCoupons(INITIAL_COUPONS);
    setCurrenciesList(CURRENCIES);
    setCurrencyState(CURRENCIES[1] || CURRENCIES[0]);
    setCustomers(INITIAL_CUSTOMERS);
    setUser(INITIAL_USER);
    setOrders(INITIAL_ORDERS);
    setDeployedServers(INITIAL_DEPLOYED_SERVERS);
    setServerNodes(INITIAL_SERVER_NODES);
    setInvoices(INITIAL_INVOICES);
    setPayments(INITIAL_PAYMENT_RECORDS);
    setSavedCards(INITIAL_SAVED_CARDS);
    setPaymentSettings(INITIAL_PAYMENT_SETTINGS);
    setTickets(INITIAL_SUPPORT_TICKETS);
    setStatusComponents(INITIAL_STATUS_COMPONENTS);
    setStatusIncidents(INITIAL_STATUS_INCIDENTS);
    setAdminUsers(INITIAL_ADMIN_USERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.clear();
    showNotification('Reset all configurations to factory defaults.', 'info');
  };

  const exportConfigJson = (): string => {
    const config = {
      siteSettings,
      siteImages,
      games,
      plans,
      generalServices,
      tlds,
      locations,
      comparisonRows,
      faqs,
      testimonials,
      partners,
      reviews,
      blogPosts,
      coupons,
      currenciesList,
      paymentSettings,
      serverNodes,
      statusComponents,
    };
    return JSON.stringify(config, null, 2);
  };

  const importConfigJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.siteSettings) setSiteSettings(data.siteSettings);
      if (data.siteImages) setSiteImages(data.siteImages);
      if (data.games) setGames(data.games);
      if (data.plans) setPlans(data.plans);
      if (data.generalServices) setGeneralServices(data.generalServices);
      if (data.tlds) setTlds(data.tlds);
      if (data.locations) setLocations(data.locations);
      if (data.comparisonRows) setComparisonRows(data.comparisonRows);
      if (data.faqs) setFaqs(data.faqs);
      if (data.testimonials) setTestimonials(data.testimonials);
      if (data.partners) setPartners(data.partners);
      if (data.reviews) setReviews(data.reviews);
      if (data.blogPosts) setBlogPosts(data.blogPosts);
      if (data.coupons) setCoupons(data.coupons);
      if (data.currenciesList) setCurrenciesList(data.currenciesList);
      if (data.paymentSettings) setPaymentSettings(data.paymentSettings);
      if (data.serverNodes) setServerNodes(data.serverNodes);
      if (data.statusComponents) setStatusComponents(data.statusComponents);
      showNotification('Configuration backup imported successfully!');
      return true;
    } catch (e) {
      console.error('Invalid JSON import', e);
      showNotification('Failed to parse JSON file.', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        currentPage: activePage,
        setActivePage,
        navigateTo,
        currentRoute,
        activePlanForDetail,
        setActivePlanForDetail,
        activeGameForDetail,
        setActiveGameForDetail,
        activeServiceForDetail,
        setActiveServiceForDetail,

        siteSettings,
        updateSiteSettings,
        siteImages,
        updateSiteImages,

        games,
        addGame,
        updateGame,
        deleteGame,

        plans,
        addPlan,
        updatePlan,
        deletePlan,

        services: generalServices,
        generalServices,
        addService: addGeneralService,
        updateService: updateGeneralService,
        deleteService: deleteGeneralService,
        addGeneralService,
        updateGeneralService,
        deleteGeneralService,

        tlds,
        addTld,
        updateTld,
        deleteTld,
        registeredDomains,
        registerDomain,
        updateDomainDns,

        locations,
        addLocation,
        updateLocation,
        deleteLocation,

        comparisonRows,
        addComparisonRow,
        updateComparisonRow,
        deleteComparisonRow,

        faqs,
        addFaq,
        updateFaq,
        deleteFaq,

        testimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,

        partners,
        addPartner,
        updatePartner,
        deletePartner,
        createPartnerApplication,

        reviews,
        addReview,
        updateReview,
        deleteReview,

        blogPosts,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,

        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        validateCoupon,

        currency,
        currencies: currenciesList,
        setCurrency,
        updateCurrencyRate,
        formatPrice,

        billingCycle,
        setBillingCycle,

        user,
        currentUser: user,
        login,
        loginWithGoogle,
        loginWithApple,
        loginWithFacebook,
        loginWithGithub,
        loginWithDiscord,
        logout,
        register,

        customers,
        updateCustomer,
        banCustomer,

        orders,
        createOrder,
        updateOrderStatus,
        cancelOrder,

        payments,
        recordPayment,
        refundPayment,

        deployedServers,
        userServers: deployedServers,
        deployServer,
        toggleServerPower,
        updateServerPowerState,
        addServerLog,
        deleteServer,

        invoices,
        createInvoice,
        payInvoice,
        updateInvoiceStatus,
        activeInvoiceModal,
        setActiveInvoiceModal,

        savedCards,
        addSavedCard,
        removeSavedCard,
        setDefaultCard,

        paymentSettings,
        updatePaymentSettings,

        tickets,
        createTicket,
        replyTicket,
        updateTicketStatus,
        activeTicketModal,
        setActiveTicketModal,

        statusComponents,
        updateStatusComponent,
        statusIncidents,
        createIncident,
        updateIncident,

        serverNodes,
        addServerNode,
        updateServerNode,
        deleteServerNode,

        adminUsers,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,

        auditLogs,
        addAuditLog,

        isAnnouncementVisible,
        dismissAnnouncement,
        isAdminOpen,
        setIsAdminOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        selectedPlanForCheckout,
        openCheckout,
        isClientAreaOpen,
        setIsClientAreaOpen,
        activeBlogPostModal,
        setActiveBlogPostModal,

        notifications,
        showNotification,
        dismissNotification,

        resetToDefaults,
        exportConfigJson,
        importConfigJson,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-2xl border text-xs font-medium flex items-center justify-between transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
              notif.type === 'error'
                ? 'bg-red-950/90 text-red-200 border-red-500/40 backdrop-blur-md'
                : notif.type === 'info'
                ? 'bg-slate-900/90 text-slate-200 border-slate-700/60 backdrop-blur-md'
                : 'bg-[#0f172a]/95 text-cyan-200 border-cyan-500/40 backdrop-blur-md'
            }`}
          >
            <span>{notif.message}</span>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
