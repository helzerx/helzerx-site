import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuthModal } from './AuthModal';
import { HelzerX3DLogo } from './HelzerX3DLogo';

type AuthMode = 'login' | 'register';
type Phase = 'boot' | 'logo' | 'settle' | 'reveal' | 'ready';

export const AuthExperience: React.FC<{ mode: AuthMode }> = ({ mode }) => {
  const { isAuthModalOpen, setAuthModalTab, setIsAuthModalOpen } = useApp();
  const [phase, setPhase] = useState<Phase>('boot');

  useEffect(() => {
    setAuthModalTab(mode);
    setIsAuthModalOpen(false);
    setPhase('boot');

    const timers = [
      window.setTimeout(() => setPhase('logo'), 120),
      window.setTimeout(() => setPhase('settle'), 3150),
      window.setTimeout(() => setPhase('reveal'), 3600),
      window.setTimeout(() => {
        setPhase('ready');
        setIsAuthModalOpen(true);
      }, 4700),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [mode, setAuthModalTab, setIsAuthModalOpen]);

  useEffect(() => {
    if (phase !== 'ready' || isAuthModalOpen) return;
    window.location.assign('/');
  }, [phase, isAuthModalOpen]);

  const goHome = () => window.location.assign('/');

  return (
    <main className="helzerx-auth-stage helzerx-auth-stage-logo">
      <div className="helzerx-auth-atmosphere" />
      <div className="helzerx-auth-noise" />
      <div className="helzerx-auth-grid" />

      <button type="button" onClick={goHome} className="helzerx-auth-back">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to HelzerX</span>
      </button>

      <div className={`helzerx-auth-content helzerx-logo-auth-content phase-${phase}`}>
        <HelzerX3DLogo phase={phase} />
      </div>

      <div className={`helzerx-logo-auth-caption phase-${phase}`}>
        <span className="helzerx-logo-auth-line" />
        <span>{mode === 'login' ? 'WELCOME BACK' : 'JOIN HELZERX'}</span>
        <span className="helzerx-logo-auth-line" />
      </div>

      <div className={`helzerx-modal-reveal helzerx-logo-modal phase-${phase}`}>
        <AuthModal />
      </div>
    </main>
  );
};
