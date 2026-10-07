import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CURRENCIES } from '../data/initialData';
import {
  Server,
  Gamepad2,
  Cpu,
  Globe,
  ChevronDown,
  X,
  Shield,
  User as UserIcon,
  LogOut,
  Layers,
  Menu,
  CreditCard,
  Zap,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    siteSettings,
    currency,
    setCurrency,
    user,
    logout,
    setIsAuthModalOpen,
    setAuthModalTab,
    openCheckout,
    isAnnouncementVisible,
    dismissAnnouncement,
    currentPage,
    navigateTo,
  } = useApp();

  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
    setIsCurrencyDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 text-slate-800 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      {/* Top Announcement Bar */}
      {isAnnouncementVisible && siteSettings.announcementActive && (
        <div className="w-full border-b border-slate-200 bg-slate-50/90 py-1.5 px-4 text-xs text-slate-500 flex items-center justify-between">
          <div className="flex-1 text-center flex items-center justify-center gap-2">
            <span className="font-medium">{siteSettings.announcementText}</span>
            <span className="font-mono font-bold bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-100 text-[11px]">
              {siteSettings.announcementCoupon}
            </span>
          </div>
          <button
            onClick={dismissAnnouncement}
            className="text-slate-400 hover:text-slate-700 p-1 transition-colors"
            title="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navbar matching Gabrun Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Zone */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => {
              navigateTo('home');
              closeDropdowns();
            }}
            className="flex items-center gap-2.5 group cursor-pointer text-left"
          >
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform font-display text-xs">
              HX
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-950 font-display">
              {siteSettings.brandName || 'HelzerX Cloud'}
            </span>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-500">
            {/* Services Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('services')}
                className={`flex items-center gap-1 px-3 py-2 rounded-full transition-colors ${
                  activeDropdown === 'services' || currentPage.startsWith('services')
                    ? 'text-violet-700 bg-violet-50'
                    : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>Services</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {activeDropdown === 'services' && (
                <div
                  className="absolute left-0 mt-2 w-64 bg-white text-slate-800 border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    onClick={() => {
                      navigateTo('services-minecraft');
                      closeDropdowns();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50 flex items-center gap-3 transition"
                  >
                    <Gamepad2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Minecraft Servers</p>
                      <p className="text-[10px] text-slate-500">Purpur, Paper &amp; Bedrock</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      navigateTo('services-vps');
                      closeDropdowns();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50 flex items-center gap-3 transition"
                  >
                    <Cpu className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Cloud VPS</p>
                      <p className="text-[10px] text-slate-500">AMD Ryzen 9 NVMe</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      navigateTo('services-vds');
                      closeDropdowns();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50 flex items-center gap-3 transition"
                  >
                    <Server className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Dedicated VDS</p>
                      <p className="text-[10px] text-slate-500">100% Dedicated vCPUs</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      navigateTo('services-bot-hosting');
                      closeDropdowns();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50 flex items-center gap-3 transition"
                  >
                    <Zap className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Bot &amp; App Hosting</p>
                      <p className="text-[10px] text-slate-500">Node.js, Python 24/7</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                navigateTo('plans');
                closeDropdowns();
              }}
              className="px-3 py-2 rounded-full hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Plans
            </button>
            <button
              onClick={() => {
                navigateTo('locations');
                closeDropdowns();
              }}
              className="px-3 py-2 rounded-full hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Locations
            </button>
            <button
              onClick={() => {
                navigateTo('pricing');
                closeDropdowns();
              }}
              className="px-3 py-2 rounded-full hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Pricing
            </button>
            <button
              onClick={() => {
                navigateTo('hardware');
                closeDropdowns();
              }}
              className="px-3 py-2 rounded-full hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Hardware
            </button>
            <button
              onClick={() => {
                navigateTo('support');
                closeDropdowns();
              }}
              className="px-3 py-2 rounded-full hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Support
            </button>
          </nav>
        </div>

        {/* Right Zone: Currency Selector + Gabrun Pill Button [ ☷ Menu ] + [ Deploy ] */}
        <div className="flex items-center gap-3">
          {/* Currency Pill */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold transition"
            >
              <span>{currency.code}</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {isCurrencyDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-32 bg-white text-slate-800 border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in duration-100"
                onMouseLeave={() => setIsCurrencyDropdownOpen(false)}
              >
                {CURRENCIES.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => {
                      setCurrency(curr);
                      setIsCurrencyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-between ${
                      currency.code === curr.code ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span>{curr.code}</span>
                    <span className="text-[10px] text-slate-400">{curr.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Logged In state */}
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => navigateTo('admin')}
                  className="flex items-center gap-1.5 rounded-full bg-cyan-400 text-black px-3.5 py-2 text-xs font-black hover:bg-cyan-300 shadow-md shadow-cyan-500/25 transition cursor-pointer"
                  title="Open Admin Control Center"
                >
                  <Shield className="w-3.5 h-3.5 text-black" />
                  <span>Admin Panel</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => { window.location.assign('/client-dashboard'); }}
                className="flex items-center gap-2 rounded-full bg-[#0b0f19] px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 shadow-md transition"
              >
                <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                <span className="max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
              </button>
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-full hover:bg-white/15 text-slate-400 hover:text-slate-700 transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Login Button */}
              <button
                type="button"
                onClick={() => {
                  window.location.assign('/login');
                }}
                className="flex items-center gap-2 rounded-full bg-[#0b0f19] px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 shadow-md transition cursor-pointer"
              >
                <span className="grid grid-cols-2 gap-0.5">
                  <span className="h-1 w-1 rounded-sm bg-white" />
                  <span className="h-1 w-1 rounded-sm bg-white" />
                  <span className="h-1 w-1 rounded-sm bg-white" />
                  <span className="h-1 w-1 rounded-sm bg-white" />
                </span>
                <span>Login</span>
              </button>

              {/* Sign Up Button matching the new auth design */}
              <button
                type="button"
                onClick={() => {
                  window.location.assign('/signup');
                }}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#7934f5] to-[#591bc9] hover:from-[#6a25e6] hover:to-[#4a12b8] px-5 py-2 text-xs font-extrabold text-white shadow-md shadow-purple-500/25 transition cursor-pointer"
              >
                <span>Sign Up</span>
              </button>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              onClick={() => {
                navigateTo('services-minecraft');
                setIsMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-slate-50 text-left hover:bg-violet-50"
            >
              Minecraft Hosting
            </button>
            <button
              onClick={() => {
                navigateTo('services-vps');
                setIsMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-slate-50 text-left hover:bg-violet-50"
            >
              Cloud VPS
            </button>
            <button
              onClick={() => {
                navigateTo('plans');
                setIsMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-slate-50 text-left hover:bg-violet-50"
            >
              Game Plans
            </button>
            <button
              onClick={() => {
                navigateTo('locations');
                setIsMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-slate-50 text-left hover:bg-violet-50"
            >
              Locations
            </button>
          </div>

          <div className="pt-2 border-t border-white/10 space-y-2">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.location.assign('/client-dashboard');
                  }}
                  className="flex-1 rounded-full bg-slate-950 py-3 text-center text-xs font-bold text-white shadow-md flex items-center justify-center gap-2"
                >
                  <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Client Area ({user.name})</span>
                </button>
                {user.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      navigateTo('admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 rounded-full bg-violet-100 text-violet-700 py-3 text-center text-xs font-black shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.location.assign('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 rounded-full bg-[#0b0f19] py-3 text-center text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.location.assign('/signup');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 rounded-full bg-gradient-to-r from-[#7934f5] to-[#591bc9] py-3 text-center text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('admin');
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 rounded-full bg-slate-100 text-slate-700 py-3 text-center text-xs font-bold shadow-md flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-violet-600" />
                  <span>Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
