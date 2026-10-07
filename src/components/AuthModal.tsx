import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  KeyRound,
  RefreshCw,
  Fingerprint,
  Check,
  Smartphone,
  ChevronRight,
  Sparkles,
  Layers,
  Building,
  MapPin,
  Globe,
  Phone,
} from 'lucide-react';

const COUNTRY_OPTIONS = [
  { code: 'LK', name: 'Sri Lanka', dial: '+94' },
  { code: 'US', name: 'United States', dial: '+1' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'SG', name: 'Singapore', dial: '+65' },
  { code: 'DE', name: 'Germany', dial: '+49' },
  { code: 'AU', name: 'Australia', dial: '+61' },
  { code: 'CA', name: 'Canada', dial: '+1' },
  { code: 'IN', name: 'India', dial: '+91' },
  { code: 'JP', name: 'Japan', dial: '+81' },
  { code: 'FR', name: 'France', dial: '+33' },
  { code: 'NL', name: 'Netherlands', dial: '+31' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { code: 'MY', name: 'Malaysia', dial: '+60' },
  { code: 'NZ', name: 'New Zealand', dial: '+64' },
];

const AuthModalContent: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    login,
    loginWithGoogle,
    loginWithApple,
    loginWithFacebook,
    setIsAdminOpen,
    siteSettings,
  } = useApp();

  const [mode, setMode] = useState<'auth' | 'forgot' | 'verify-register'>('auth');
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Oracle-like Registration fields
  const [accountType, setAccountType] = useState<'individual' | 'corporate'>('individual');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [country, setCountry] = useState('Sri Lanka');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phoneDial, setPhoneDial] = useState('+94');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // 2FA / OTP State
  const [challengeId, setChallengeId] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [devOtpCode, setDevOtpCode] = useState('');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(45);

  // Social Auth Modal helper state
  const [socialPrompt, setSocialPrompt] = useState<{
    open: boolean;
    provider: 'google' | 'apple' | 'facebook';
    email: string;
    name: string;
  } | null>(null);

  // Security & feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Reset states on modal open/close
  useEffect(() => {
    if (!isAuthModalOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setChallengeId('');
      setDevOtpCode('');
      setOtpDigits(['', '', '', '', '', '']);
      setMode('auth');
      setSocialPrompt(null);
    }
  }, [isAuthModalOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen && !busy) {
        setIsAuthModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, busy, setIsAuthModalOpen]);

  // 2FA timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (challengeId && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [challengeId, resendTimer]);

  const focusOtpInput = () => {
    if (!challengeId) return;
    const timer = window.setTimeout(() => otpInputRefs.current[0]?.focus(), 50);
    return () => window.clearTimeout(timer);
  };

  useEffect(() => {
    if (!isAuthModalOpen || !challengeId) return;
    return focusOtpInput();
  }, [isAuthModalOpen, challengeId]);

  if (!isAuthModalOpen) return null;

  const isDedicatedAuthPage =
    typeof window !== 'undefined' &&
    ['/login', '/signup', '/register'].includes(window.location.pathname.toLowerCase());

  const leaveAuthPage = (destination = '/') => {
    if (busy) return;
    window.location.assign(destination);
  };

  const close = (destination?: string) => {
    if (busy) return;
    setIsAuthModalOpen(false);
    setErrorMsg('');
    setSuccessMsg('');
    setChallengeId('');

    // Dedicated authentication pages must never fall back to a blank auth shell.
    // After a successful/closed auth flow, return to the public site.
    if (isDedicatedAuthPage) {
      window.location.assign(destination || '/');
    }
  };

  const handleTabChange = (tab: 'login' | 'register' | 'admin') => {
    if (isDedicatedAuthPage && tab !== 'admin') {
      window.location.assign(tab === 'register' ? '/signup' : '/login');
      return;
    }
    setAuthModalTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
    setChallengeId('');
    setDevOtpCode('');
    setOtpDigits(['', '', '', '', '', '']);
    setMode('auth');
  };

  // Password Strength Calculation (Enterprise Standard)
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200', text: 'text-slate-400' };
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 25;
    if (/\d/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;

    if (score <= 25) return { score, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    if (score <= 50) return { score, label: 'Medium', color: 'bg-amber-500', text: 'text-amber-600' };
    if (score <= 75) return { score, label: 'Strong', color: 'bg-indigo-500', text: 'text-indigo-600' };
    return { score, label: 'Enterprise 256-Bit', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const pwStrength = calculatePasswordStrength(password);

  // OTP Handling
  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }
    newDigits[index] = clean.slice(-1);
    setOtpDigits(newDigits);
    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const digits = pasted.padEnd(6, '').slice(0, 6).split('');
    setOtpDigits(Array.from({ length: 6 }, (_, i) => digits[i] || ''));
    otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const fillTestOtp = (codeToUse?: string) => {
    const target = (codeToUse || devOtpCode || '123456').replace(/\D/g, '').slice(0, 6);
    const digits = target.padEnd(6, '0').split('');
    setOtpDigits(digits);
  };

  const resendOtpCode = async () => {
    if (resendTimer > 0 || !challengeId) return;
    setBusy(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to resend verification code.');
      setResendTimer(45);
      if (data.devCode) setDevOtpCode(data.devCode);
      setSuccessMsg(data.message || 'A fresh verification code was sent to your email.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error resending code.');
    } finally {
      setBusy(false);
    }
  };

  const serverUserLogin = (r: any) => {
    if (r?.user) {
      login(
        r.user.email,
        r.user.role === 'admin' ? 'admin' : 'customer',
        r.user.name,
        r.user.provider || 'email'
      );
    }
  };

  // Submit Handler for Form
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const fullOtp = otpDigits.join('');

    // STEP A: Handle OTP Verification
    if (challengeId) {
      if (!/^\d{6}$/.test(fullOtp)) {
        setErrorMsg('Please enter the complete 6-digit verification code.');
        return;
      }
      setBusy(true);
      try {
        const endpoint =
          authModalTab === 'admin'
            ? '/api/admin/verify-otp'
            : mode === 'forgot'
            ? '/api/auth/reset-password'
            : mode === 'verify-register'
            ? '/api/auth/verify-email-otp'
            : '/api/auth/verify-login-otp';

        const body =
          authModalTab === 'admin'
            ? { challengeId, code: fullOtp }
            : mode === 'forgot'
            ? { challengeId, code: fullOtp, password }
            : { challengeId, code: fullOtp };

        const res = await fetch(endpoint, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || 'Invalid 6-digit verification code.');
        }

        if (authModalTab === 'admin') {
          localStorage.setItem('arvex_admin_token', data.token || 'admin-verified');
          serverUserLogin(data);
          setSuccessMsg('Root Administrator verified.');
          setTimeout(() => {
            close();
            setIsAdminOpen(true);
          }, 500);
        } else if (mode === 'forgot') {
          setSuccessMsg('Password reset successfully! Please log in.');
          setChallengeId('');
          setOtpDigits(['', '', '', '', '', '']);
          setPassword('');
          setMode('auth');
          setAuthModalTab('login');
        } else {
          serverUserLogin(data);
          setSuccessMsg('Account verified & saved to database. Welcome to HelzerX Cloud!');
          setTimeout(() => close('/#/client-dashboard'), 500);
        }
      } catch (err: any) {
        setFailedAttempts((prev) => prev + 1);
        setErrorMsg(err.message || 'Authentication code failed.');
      } finally {
        setBusy(false);
      }
      return;
    }

    // STEP B: Forgot Password Initiation
    if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMsg('Please enter your account email to receive a recovery code.');
        return;
      }
      setBusy(true);
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to dispatch password reset code.');
        setChallengeId(data.challengeId || 'mock-reset-challenge');
        if (data.devCode) setDevOtpCode(data.devCode);
        setSuccessMsg(data.message || 'A 6-digit recovery code has been sent to your email.');
      } catch (err: any) {
        setErrorMsg(err.message || 'Unable to send the password reset code. Please try again.');
      } finally {
        setBusy(false);
      }
      return;
    }

    // STEP C: Regular Login / Admin
    if (authModalTab !== 'register') {
      if (!email.trim() || !password) {
        setErrorMsg('Please enter your email and password.');
        return;
      }

      setBusy(true);
      try {
        const endpoint = authModalTab === 'admin' ? '/api/admin/login' : '/api/auth/login';
        const res = await fetch(endpoint, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || 'Invalid credentials.');
        }

        if (data.requiresTwoFactor && data.challengeId) {
          setChallengeId(data.challengeId);
          if (data.devCode) setDevOtpCode(data.devCode);
          setResendTimer(45);
          setSuccessMsg(data.message || 'Enter your 2FA verification code.');
          return;
        }

        serverUserLogin(data);
        setSuccessMsg('Identity verified. Loading cloud environment...');
        setTimeout(() => close('/#/client-dashboard'), 500);
      } catch (err: any) {
        setFailedAttempts((prev) => prev + 1);
        setErrorMsg(err.message || 'Failed to authenticate.');
      } finally {
        setBusy(false);
      }
      return;
    }

    // STEP D: Oracle-Style Full Registration
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Please enter your First Name and Last Name.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    if (!address.trim() || !city.trim()) {
      setErrorMsg('Please enter your Street Address and City.');
      return;
    }

    if (!phoneNumber.trim()) {
      setErrorMsg('Please enter your Contact Phone Number.');
      return;
    }

    setBusy(true);
    try {
      const fullPhone = `${phoneDial} ${phoneNumber.trim()}`;
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          name: fullName,
          email: email.trim().toLowerCase(),
          password,
          accountType,
          company: company.trim(),
          country,
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          phone: fullPhone,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register account.');
      }

      if (data.verificationRequired && data.challengeId) {
        setChallengeId(data.challengeId);
        if (data.devCode) setDevOtpCode(data.devCode);
        setMode('verify-register');
        setResendTimer(45);
        setSuccessMsg(data.message || 'A 6-digit verification code has been dispatched to your email.');
      } else {
        login(email.trim().toLowerCase(), 'customer', fullName);
        setSuccessMsg('Account created & saved in database! Signing in...');
        setTimeout(() => close('/#/client-dashboard'), 500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration error occurred.');
    } finally {
      setBusy(false);
    }
  };

  // Social buttons stay fail-closed until a real provider OAuth/OIDC flow is configured.
  const handleSocialClick = (provider: 'google' | 'apple' | 'facebook') => {
    setErrorMsg('');
    setSuccessMsg('');
    setSocialPrompt(null);
    setErrorMsg(
      `${provider[0].toUpperCase() + provider.slice(1)} sign-in is not enabled yet. Please use email authentication with verification.`
    );
  };

  const confirmSocialAuth = async () => {
    if (!socialPrompt) return;
    setBusy(true);
    setErrorMsg('');
    try {
      if (socialPrompt.provider === 'google') {
        await loginWithGoogle({ email: socialPrompt.email, name: socialPrompt.name });
      } else if (socialPrompt.provider === 'apple') {
        await loginWithApple({ email: socialPrompt.email, name: socialPrompt.name });
      } else {
        await loginWithFacebook({ email: socialPrompt.email, name: socialPrompt.name });
      }
      setSuccessMsg(`Authenticated via ${socialPrompt.provider.toUpperCase()} & saved to database.`);
      setSocialPrompt(null);
      setTimeout(close, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Social authentication error.');
    } finally {
      setBusy(false);
    }
  };

  const isRegisterTab = authModalTab === 'register';

  return (
    <div
      className={
        isDedicatedAuthPage
          ? "fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-[#f8fafc] p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          : "fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-3 sm:p-6 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      }
    >
      
      {/* Outer Card matching Dribbble Picture: Wide rounded-3xl container */}
      <div className={`relative w-full ${isRegisterTab ? 'max-w-[1080px]' : 'max-w-[980px]'} overflow-hidden rounded-[36px] bg-white shadow-[0_30px_90px_-20px_rgba(76,29,149,0.35)] border border-slate-100 flex flex-col lg:flex-row my-auto transition-all`}>
        
        {/* Public modal close button is hidden on dedicated auth routes. */}
        {!isDedicatedAuthPage && (
          <button
            type="button"
            onClick={close}
            className="absolute right-5 top-5 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-700 hover:text-slate-900 backdrop-blur-md transition cursor-pointer"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* LEFT COLUMN: Clean White Form Zone (Picture Authentic) */}
        <div className={`w-full ${isRegisterTab ? 'lg:w-[58%]' : 'lg:w-[54%]'} p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative bg-white`}>
          
          <div className="max-h-[82vh] overflow-y-auto pr-1 sm:pr-2">
            
            {/* Top Brand / System Logo matching Picture */}
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                {/* Dual-wave purple rounded badge from reference image */}
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7934f5] to-[#591bc9] shadow-md shadow-purple-500/25">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M4 9c4-4 8 4 12 0" />
                    <path d="M8 15c4-4 8 4 12 0" />
                  </svg>
                </div>
                <div>
                  <span className="font-extrabold tracking-tight text-slate-900 text-base font-display">
                    {siteSettings?.brandName || 'HelzerX Cloud'}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Enterprise Protected</span>
                  </div>
                </div>
              </div>

              {/* Mode Switcher Pills (Customer vs Staff) */}
              <div className="flex items-center gap-1 rounded-full bg-[#f4f5fa] p-1 border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-full transition cursor-pointer ${
                    authModalTab !== 'admin'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Portal
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('admin')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-full transition cursor-pointer ${
                    authModalTab === 'admin'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Staff
                </button>
              </div>
            </div>

            {/* Heading & Subtitle strictly matching the picture */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                {challengeId
                  ? 'Verify authentication code'
                  : mode === 'forgot'
                  ? 'Reset your password'
                  : authModalTab === 'admin'
                  ? 'Staff Security Login'
                  : authModalTab === 'register'
                  ? 'Create Cloud Account'
                  : 'Welcome to login system'}
              </h2>
              <p className="text-xs sm:text-sm text-[#8e92a4] mt-1.5 font-medium">
                {challengeId
                  ? 'Enter the 6-digit authentication token sent to your email.'
                  : mode === 'forgot'
                  ? 'Enter your registered email to receive an account recovery code.'
                  : authModalTab === 'admin'
                  ? 'Sign in with your hardware-verified administrator credentials.'
                  : authModalTab === 'register'
                  ? 'Complete your cloud profile with verified address & billing information below'
                  : 'Sign in by entering the infomation below'}
              </p>
            </div>

            {/* Error & Success Feedback alerts */}
            {errorMsg && (
              <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 animate-in fade-in">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="font-semibold leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span className="font-semibold leading-relaxed">{successMsg}</span>
              </div>
            )}

            {/* FORM CONTAINER */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* STEP 1: OTP Entry View if Challenge is Active */}
              {challengeId ? (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex justify-between gap-2">
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpInputRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={handleOtpPaste}
                        autoComplete={i === 0 ? 'one-time-code' : 'off'}
                        aria-label={`Verification code digit ${i + 1}`}
                        className="h-13 w-11 sm:w-13 text-center text-xl font-mono font-black rounded-2xl bg-[#f4f5fa] border border-[#e4e7f2] text-purple-900 focus:bg-white focus:border-[#7934f5] focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition shadow-inner"
                      />
                    ))}
                  </div>

                  {/* Dev Code Helper for Instant Preview Testing */}
                  {devOtpCode && (
                    <div className="flex items-center justify-between rounded-xl bg-purple-50 border border-purple-200/80 px-3.5 py-2 text-xs text-purple-900">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                        <span className="font-bold">Code: {devOtpCode}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => fillTestOtp(devOtpCode)}
                        className="font-bold text-purple-700 hover:text-purple-900 underline text-[11px] cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}

                  {/* Resend timer */}
                  <div className="flex items-center justify-between text-xs text-[#8e92a4] pt-1 font-medium">
                    <span>Didn&apos;t receive code? Check Spam/Promotions too.</span>
                    {resendTimer > 0 ? (
                      <span className="font-mono text-purple-600">Resend in {resendTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={resendOtpCode}
                        className="font-bold text-purple-600 hover:text-purple-800 underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>
              ) : isRegisterTab ? (
                /* STEP 2A: Oracle Cloud-Style Registration Form */
                <div className="space-y-4">
                  {/* Account Type Selector (Oracle Cloud style: Individual vs Corporate) */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAccountType('individual')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                          accountType === 'individual'
                            ? 'bg-purple-50 border-purple-400 text-purple-700 shadow-sm'
                            : 'bg-[#f4f5fa] border-[#e4e7f2] text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <UserIcon className="h-3.5 w-3.5" />
                        <span>Individual (Personal)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccountType('corporate')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                          accountType === 'corporate'
                            ? 'bg-purple-50 border-purple-400 text-purple-700 shadow-sm'
                            : 'bg-[#f4f5fa] border-[#e4e7f2] text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Building className="h-3.5 w-3.5" />
                        <span>Corporate (Company)</span>
                      </button>
                    </div>
                  </div>

                  {/* First Name & Last Name (2 columns) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        First Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a0a5b8]">
                          <UserIcon className="h-3.5 w-3.5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. Alex"
                          className="w-full pl-9 pr-3.5 py-3 rounded-2xl bg-[#f4f5fa] border border-[#e4e7f2] text-xs text-slate-800 placeholder:text-[#a0a5b8] focus:bg-white focus:border-[#7934f5] focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Last Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a0a5b8]">
                          <UserIcon className="h-3.5 w-3.5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="e.g. Perera"
                          className="w-full pl-9 pr-3.5 py-3 rounded-2xl bg-[#f4f5fa] border border-[#e4e7f2] text-xs text-slate-800 placeholder:text-[#a0a5b8] focus:bg-white focus:border-[#7934f5] focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Name (Shown or required for Corporate) */}
                  {accountType === 'corporate' && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Company Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a0a5b8]">
                          <Building className="h-3.5 w-3.5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Organization or Registered Business Name"
                          className="w-full pl-9 pr-3.5 py-3 rounded-2xl bg-[#f4f5fa] border border-[#e4e7f2] text-xs text-slate-800 placeholder:text-[#a0a5b8] focus:bg-white focus:border-[#7934f5] focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a0a5b8]">
                          <Mail className="h-3.5 w-3.5" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-9 pr-3.5 py-3 rounded-2xl bg-[#f4f5fa] border border-[#e4e7f2] text-xs text-slate-800 placeholder:text-[#a0a5b8] focus:bg-white focus:border-[#7934f5] focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Phone Number *
                      </label>
                      <div className="flex gap-1.5">
                        <select
                          value={phoneDial}
                          onChange={(e) => setPhoneDial(e.target.value)}
                          className="px-2 py-3 rounded-2xl bg-[#f4f5fa] border border-[#e4e7f2] text-xs font-bold text-slate-700 focus:bg-white focus:border-[#7934f5] focus:outline-none shrink-0"
                        >
                          {COUNTRY_OPTIONS.map((c) => (
                            <option key={c.code} value={c.dial}>
                              {c.dial} ({c.code})
                            </option>
                          ))}
                        </select>
                        <div className="relative flex-1">
                          <input
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="77 123 4567"
                            className="w-full px-3.5 py-3 rounded-2xl bg-[#f4f5fa] border border-[#e4e7f2] text-xs text-slate-800 placeholder:text-[#a0a5b8] focus:bg-white focus:border-[#7934f5] focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Password (Min. 8 chars) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a0a5b8]">
                          <Lock className="h-3.5 w-3.5" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-9 py-3 rounded-2xl bg-[#f4f5fa] border border-[#e4e7f2] text-xs text-slate-800 placeholder:text-[#a0a5b8] focus:bg-white focus:border-[#7934f5] focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#a0a5b8] hover:text-slate-700 transition"
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a0a5b8]">
                          <Lock className="h-3.5 w-3.5" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3.5 py-3 rounded-2xl bg-[#f4f5fa] border border-[#e4e7f2] text-xs text-slate-800 placeholder:text-[#a0a5b8] focus:bg-white focus:border-[#7934f5] focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="rounded-xl bg-[#f8fafc] border border-slate-200/80 p-2.5 space-y-1 animate-in fade-in">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-500">Password Security:</span>
                        <span className={pwStrength.text}>{pwStrength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${pwStrength.color} transition-all duration-300`}
                          style={{ width: `${Math.max(pwStrength.score, 15)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Country Selection */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Country / Territory *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a0a5b8]">
                        <Globe className="h-3.5 w-3.5" />
                      </div>
                      <select
                        value={country}
                        onChange={(e) => {
                          setCountry(e.target.value);
                          const matched = COUNTRY_OPTIONS.find((c) => c.name === e.target.value);
                          if (matched) setPhoneDial(matched.dial);
                        }}
                        className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[#f4f5fa] border border-[#e4e7f2] text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#7934f5] focus:outline-none cursor-pointer"
                      >
                        {COUNTRY_OPTIONS.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Address Line */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Street Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a0a5b8]">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street Address, Building, Suite / Floor"
                        className="w-full pl-9 pr-3.5 py-3 rounded-2xl bg-[#f4f5fa] border border-[#e4e7f2] text-xs text-slate-800 placeholder:text-[#a0a5b8] focus:bg-white focus:border-[#7934f5] focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* City, State, Postal Code (3 columns) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Colombo / City"
                        className="w-full px-3.5 py-3 rounded-2xl bg-[#f4f5fa] border border-[#e4e7f2] text-xs text-slate-800 placeholder:text-[#a0a5b8] focus:bg-white focus:border-[#7934f5] focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Western / State"
                        className="w-full px-3.5 py-3 rounded-2xl bg-[#f4f5fa] border border-[#e4e7f2] text-xs text-slate-800 placeholder:text-[#a0a5b8] focus:bg-white focus:border-[#7934f5] focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="00100"
                        className="w-full px-3.5 py-3 rounded-2xl bg-[#f4f5fa] border border-[#e4e7f2] text-xs text-slate-800 placeholder:text-[#a0a5b8] focus:bg-white focus:border-[#7934f5] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Terms checkbox */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2 text-[11px] text-slate-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span>
                        I agree to the <span className="text-purple-600 font-semibold">Terms of Service</span>, Acceptable Use Policy, and privacy standards.
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                /* STEP 2B: Standard Login Mode (Strict Dribbble Design Match) */
                <>
                  {/* Designer / Email Input - strictly matching picture pill */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#a0a5b8]">
                      {authModalTab === 'admin' ? (
                        <Shield className="h-4 w-4 text-purple-600" />
                      ) : (
                        <UserIcon className="h-4 w-4" />
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={authModalTab === 'admin' ? 'admin@helzerx.cloud' : 'Designer / email'}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#f4f5fa] border border-[#e4e7f2] text-sm text-slate-800 placeholder:text-[#a0a5b8] focus:bg-white focus:border-[#7934f5] focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition"
                    />
                  </div>

                  {/* Password Input with Lock icon & Eye Toggle */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#a0a5b8]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-[#f4f5fa] border border-[#e4e7f2] text-sm text-slate-800 placeholder:text-[#a0a5b8] focus:bg-white focus:border-[#7934f5] focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#a0a5b8] hover:text-slate-700 transition"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Remember me & Forgot Password row strictly matching picture */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 text-[#8e92a4] cursor-pointer select-none font-medium">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded-md border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === 'forgot' ? 'auth' : 'forgot');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-[#8e92a4] hover:text-[#7934f5] font-medium transition cursor-pointer"
                    >
                      {mode === 'forgot' ? 'Back to sign in' : 'Forgot Password?'}
                    </button>
                  </div>
                </>
              )}

              {/* ACTION BUTTON ROW strictly matching picture:
                  Purple pill button "Login" / "Sign up" + secondary toggle button beside it! */}
              <div className="flex items-center gap-5 pt-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-2xl bg-gradient-to-r from-[#7934f5] to-[#601fd1] hover:from-[#6c28ea] hover:to-[#5317be] px-8 py-3.5 text-sm font-bold text-white shadow-[0_12px_24px_-6px_rgba(112,48,232,0.45)] transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {busy ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <span>
                      {challengeId
                        ? 'Verify Token'
                        : mode === 'forgot'
                        ? 'Send Recovery'
                        : isRegisterTab
                        ? 'Sign up'
                        : 'Login'}
                    </span>
                  )}
                </button>

                {/* Secondary Toggle right next to button matching picture */}
                {!challengeId && mode !== 'forgot' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isDedicatedAuthPage) {
                        leaveAuthPage(authModalTab === 'login' ? '/signup' : '/login');
                        return;
                      }
                      handleTabChange(authModalTab === 'login' ? 'register' : 'login');
                    }}
                    className="text-sm font-semibold text-[#8e92a4] hover:text-[#7934f5] transition cursor-pointer"
                  >
                    {authModalTab === 'login' ? 'Sign up' : 'Login'}
                  </button>
                )}
              </div>
            </form>

            {/* SOCIAL AUTH SECTION (Google, Apple ID, Facebook) */}
            {!challengeId && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="relative flex items-center justify-center mb-5">
                  <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-[#a0a5b8]">
                    Or continue with
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Google Button */}
                  <button
                    type="button"
                    onClick={() => handleSocialClick('google')}
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-[#f4f5fa] hover:bg-[#eaeefc] border border-[#e4e7f2] text-xs font-bold text-slate-700 transition active:scale-95 cursor-pointer shadow-sm"
                    title="Sign in with Google"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Google</span>
                  </button>

                  {/* Apple ID Button */}
                  <button
                    type="button"
                    onClick={() => handleSocialClick('apple')}
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-[#f4f5fa] hover:bg-[#eaeefc] border border-[#e4e7f2] text-xs font-bold text-slate-700 transition active:scale-95 cursor-pointer shadow-sm"
                    title="Sign in with Apple ID"
                  >
                    <svg className="h-4 w-4 fill-current text-slate-900" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.32-5.77-8.91-10.37-19.14-13.8-30.7-3.44-11.55-5.15-22.37-5.15-32.45 0-14.54 3.75-26.68 11.24-36.42 7.49-9.74 17.06-14.74 28.71-15.01 4.7 0 10.02 1.34 15.96 4.02 5.94 2.68 9.77 4.07 11.48 4.17 1.48-.1 5.37-1.54 11.66-4.32 6.29-2.78 11.89-4.04 16.82-3.78 12.87.64 23.36 5.56 31.47 14.75-11.27 6.84-16.74 16.31-16.42 28.41.32 9.53 4.03 17.51 11.13 23.94 7.1 6.43 15.42 10.04 24.96 10.83-2.12 6.43-4.58 12.44-7.38 18.03zM119.22 33.64c0-7.38 2.63-14.41 7.9-21.09 5.27-6.68 11.75-11.13 19.45-13.35-.42 1.27-.63 2.54-.63 3.81 0 7.28-2.69 14.31-8.07 21.09-5.38 6.78-11.93 11.23-19.65 13.35.42-1.27.63-2.54.63-3.81z" />
                    </svg>
                    <span className="hidden sm:inline">Apple ID</span>
                  </button>

                  {/* Facebook Button */}
                  <button
                    type="button"
                    onClick={() => handleSocialClick('facebook')}
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-[#f4f5fa] hover:bg-[#eaeefc] border border-[#e4e7f2] text-xs font-bold text-slate-700 transition active:scale-95 cursor-pointer shadow-sm"
                    title="Sign in with Facebook"
                  >
                    <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="hidden sm:inline">Facebook</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Security Assurance Footnote */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#8e92a4]">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>256-bit TLS Encrypted Session</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">Zero-Trust Verified</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Signature Purple Curved Canvas with 3D Isometric Floating Laptop (Strict Picture Match) */}
        <div className={`w-full ${isRegisterTab ? 'lg:w-[42%]' : 'lg:w-[46%]'} min-h-[380px] lg:min-h-full relative overflow-hidden bg-gradient-to-br from-[#7934f5] via-[#651de9] to-[#4510b3] p-8 lg:p-12 flex flex-col justify-between text-white select-none`}>
          
          {/* Sweeping Bezier Organic Curve overlay creating the left boundary from the picture */}
          <div className="pointer-events-none absolute -left-12 -top-12 bottom-0 w-32 hidden lg:block overflow-hidden">
            <svg
              className="h-[120%] w-full text-white"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <path d="M0,0 C65,15 15,60 70,100 L0,100 Z" />
            </svg>
          </div>

          {/* Ambient glowing radial light behind the 3D laptop */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl" />
          <div className="pointer-events-none absolute left-10 bottom-10 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />

          {/* Top subtle cloud badge */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold tracking-wider uppercase backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Cloud Infrastructure
            </span>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest text-purple-200/80 font-bold block">
                NVMe Gen4
              </span>
            </div>
          </div>

          {/* CENTER 3D ISOMETRIC FLOATING LAPTOP ARTWORK (Exact replica of Dribbble design) */}
          <div className="relative z-10 my-auto py-8 flex items-center justify-center">
            <div className="relative w-[340px] sm:w-[380px] h-[260px] flex items-center justify-center">
              
              {/* Layer 1 (Bottom Floating Glass Slabs with Isometric Perspective) */}
              <div className="absolute inset-0 flex items-center justify-center transform -rotate-12 translate-y-12 opacity-40">
                <div className="w-64 h-36 rounded-3xl bg-gradient-to-tr from-cyan-400/30 to-purple-400/20 border border-white/30 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] transform skew-x-[25deg] rotate-[15deg]" />
              </div>

              {/* Layer 2 (Middle Floating Semi-Transparent Acrylic Sheet) */}
              <div className="absolute inset-0 flex items-center justify-center transform -rotate-6 translate-y-6 opacity-60">
                <div className="w-72 h-40 rounded-3xl bg-gradient-to-tr from-indigo-500/30 to-pink-500/20 border border-white/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(112,48,232,0.4)] transform skew-x-[22deg] rotate-[10deg]" />
              </div>

              {/* Layer 3: High-Fidelity 3D Isometric Open Laptop Illustration */}
              <div className="relative z-20 w-full flex flex-col items-center transform transition-transform hover:scale-105 duration-500">
                <svg
                  className="w-full h-auto drop-shadow-[0_30px_35px_rgba(30,10,80,0.65)]"
                  viewBox="0 0 500 340"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="lidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f3f4f8" />
                      <stop offset="60%" stopColor="#e2e6f0" />
                      <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>
                    <linearGradient id="screenGloss" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                      <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="baseDeck" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#eef1f8" />
                      <stop offset="50%" stopColor="#d5dbe9" />
                      <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>
                    <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>

                  {/* BOTTOM DECK CHASSIS (Isometric angle) */}
                  <g transform="translate(40, 110)">
                    {/* Shadow underneath base */}
                    <polygon
                      points="120,130 380,40 430,95 170,185"
                      fill="rgba(20,5,60,0.4)"
                      filter="blur(10px)"
                    />

                    {/* Chassis base edge (thickness) */}
                    <polygon
                      points="100,110 360,20 410,75 150,165"
                      fill="#64748b"
                    />
                    <polygon
                      points="100,110 100,122 150,177 150,165"
                      fill="#475569"
                    />
                    <polygon
                      points="150,165 150,177 410,87 410,75"
                      fill="#334155"
                    />

                    {/* Chassis top surface */}
                    <polygon
                      points="100,110 360,20 410,75 150,165"
                      fill="url(#baseDeck)"
                    />

                    {/* Keyboard well cutout */}
                    <polygon
                      points="140,95 330,30 365,65 175,130"
                      fill="#1e1b4b"
                      stroke="#4338ca"
                      strokeWidth="1"
                    />

                    {/* Backlit Keys grid pattern */}
                    <g fill="#4338ca" opacity="0.8">
                      <polygon points="155,90 190,78 200,88 165,100" />
                      <polygon points="195,76 230,64 240,74 205,86" />
                      <polygon points="235,62 270,50 280,60 245,72" />
                      <polygon points="275,48 310,36 320,46 285,58" />

                      <polygon points="170,103 215,88 225,98 180,113" />
                      <polygon points="220,86 265,71 275,81 230,96" />
                      <polygon points="270,69 315,54 325,64 280,79" />

                      {/* Spacebar */}
                      <polygon points="190,117 260,93 268,101 198,125" fill="#6366f1" />
                    </g>

                    {/* Glass Trackpad */}
                    <polygon
                      points="210,135 280,110 295,125 225,150"
                      fill="#cbd5e1"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />

                    {/* Side Ports / USB-C Slots */}
                    <ellipse cx="112" cy="120" rx="3.5" ry="1.5" fill="#1e1b4b" />
                    <ellipse cx="122" cy="125" rx="3.5" ry="1.5" fill="#1e1b4b" />
                    <ellipse cx="132" cy="130" rx="3.5" ry="1.5" fill="#1e1b4b" />
                  </g>

                  {/* LAPTOP TOP DISPLAY LID (Angled up at ~38° in isometric space) */}
                  <g transform="translate(10, 20)">
                    {/* Glowing neon aura between lid and base */}
                    <polygon
                      points="140,110 395,25 410,38 155,123"
                      fill="url(#neonGlow)"
                      opacity="0.75"
                    />

                    {/* Screen lid back/outer frame */}
                    <polygon
                      points="120,80 375,-5 425,45 170,130"
                      fill="url(#lidGrad)"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />

                    {/* Screen Bezel & Display Gloss Reflection */}
                    <polygon
                      points="128,78 370,-2 418,44 176,124"
                      fill="url(#screenGloss)"
                    />

                    {/* Central Glowing HelzerX / System Logo on the laptop lid */}
                    <g transform="translate(270, 58) rotate(-15) scale(0.9)">
                      <circle cx="0" cy="0" r="14" fill="#ffffff" opacity="0.95" />
                      <path
                        d="M-7,-3 C-2,-7 2,1 7,-3 M-7,3 C-2,-1 2,7 7,3"
                        stroke="#7934f5"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </g>
                  </g>

                  {/* STACKED FLOATING TRANSLUCENT TRAYS BENEATH LAPTOP (Strict match to image) */}
                  <g transform="translate(45, 175)" opacity="0.65">
                    {/* First glass sheet */}
                    <polygon
                      points="90,70 340,-15 390,35 140,120"
                      fill="rgba(255, 255, 255, 0.18)"
                      stroke="rgba(255, 255, 255, 0.45)"
                      strokeWidth="1.2"
                    />
                    {/* Second glass sheet */}
                    <polygon
                      points="70,100 320,15 370,65 120,150"
                      fill="rgba(255, 255, 255, 0.08)"
                      stroke="rgba(255, 255, 255, 0.25)"
                      strokeWidth="1"
                    />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom Highlights & Metrics */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-purple-100">
            <div>
              <p className="font-extrabold text-sm text-white font-display">HelzerX Cloud</p>
              <p className="text-[11px] text-purple-200/80">Automated Provisioning & Invoicing</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/25 px-2.5 py-1 text-[10px] font-bold text-white">
                <Layers className="h-3 w-3" />
                Anti-DDoS
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* SOCIAL AUTH PROFILE CONFIRMATION MODAL */}
      {socialPrompt && socialPrompt.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-600 font-bold uppercase text-xs">
                  {socialPrompt.provider[0]}
                </span>
                <h4 className="font-display font-extrabold text-base">
                  Sign in with {socialPrompt.provider.toUpperCase()}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSocialPrompt(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Connect your {socialPrompt.provider} identity to synchronize your servers, database records, and invoices.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={socialPrompt.name}
                  onChange={(e) => setSocialPrompt({ ...socialPrompt, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={socialPrompt.email}
                  onChange={(e) => setSocialPrompt({ ...socialPrompt, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSocialPrompt(null)}
                className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={confirmSocialAuth}
                className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 py-2.5 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/25 cursor-pointer"
              >
                {busy ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <span>Authorize</span>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


class AuthModalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state: { hasError: boolean; errorMessage: string } = { hasError: false, errorMessage: '' };
  private readonly childContent: React.ReactNode;

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.childContent = props.children;
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[HelzerX AuthModal] Render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Authentication panel could not load</h2>
            <p className="mt-2 text-sm text-slate-500">The main website is still running. Please reload the page and try again.</p>
            {this.state.errorMessage && (
              <pre className="mt-4 max-h-28 overflow-auto rounded-xl bg-slate-100 p-3 text-left text-[10px] leading-4 text-rose-700 whitespace-pre-wrap">
                {this.state.errorMessage}
              </pre>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-purple-700"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.childContent;
  }
}

export const AuthModal: React.FC = () => (
  <AuthModalErrorBoundary>
    <AuthModalContent />
  </AuthModalErrorBoundary>
);
