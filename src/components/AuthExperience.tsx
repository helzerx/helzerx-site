import React, { useEffect, useState } from 'react';
import { ArrowLeft, Gamepad2, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuthModal } from './AuthModal';

type AuthMode = 'login' | 'register';

export const AuthExperience: React.FC<{ mode: AuthMode }> = ({ mode }) => {
  const { isAuthModalOpen, setAuthModalTab, setIsAuthModalOpen } = useApp();
  const [phase, setPhase] = useState<'boot' | 'jump' | 'ready'>('boot');

  useEffect(() => {
    setAuthModalTab(mode);
    setIsAuthModalOpen(false);

    const jumpTimer = window.setTimeout(() => setPhase('jump'), 420);
    const readyTimer = window.setTimeout(() => {
      setPhase('ready');
      setIsAuthModalOpen(true);
    }, 1050);

    return () => {
      window.clearTimeout(jumpTimer);
      window.clearTimeout(readyTimer);
    };
  }, [mode, setAuthModalTab, setIsAuthModalOpen]);

  useEffect(() => {
    if (phase !== 'ready' || isAuthModalOpen) return;
    window.location.assign('/');
  }, [phase, isAuthModalOpen]);

  const goHome = () => {
    window.location.assign('/');
  };

  const title = mode === 'login' ? 'WELCOME BACK' : 'CREATE YOUR ID';
  const subtitle = mode === 'login'
    ? 'Booting your secure HelzerX environment'
    : 'Preparing your secure HelzerX account';

  return (
    <main className="helzerx-auth-stage">
      <div className="helzerx-auth-noise" />
      <div className="helzerx-auth-grid" />
      <div className="helzerx-auth-orbit helzerx-auth-orbit-a" />
      <div className="helzerx-auth-orbit helzerx-auth-orbit-b" />

      <button type="button" onClick={goHome} className="helzerx-auth-back">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to HelzerX</span>
      </button>

      <div className={`helzerx-auth-content phase-${phase}`}>
        <div className="helzerx-auth-brand">
          <div className="helzerx-auth-brand-mark">H</div>
          <div>
            <div className="helzerx-auth-brand-name">HELZERX</div>
            <div className="helzerx-auth-brand-sub">CLOUD SYSTEM</div>
          </div>
        </div>

        <div className="helzerx-console-wrap">
          <div className="helzerx-console-glow" />

          <div className="helzerx-console-shadow" />

          <div className="helzerx-console">
            <div className="helzerx-console-top">
              <div className="helzerx-console-leds">
                <i /><i /><i />
              </div>
              <span>HX-01</span>
              <Gamepad2 className="h-4 w-4" />
            </div>

            <div className="helzerx-console-screen">
              <div className="helzerx-screen-scan" />
              <div className="helzerx-screen-logo">H</div>
              <div className="helzerx-screen-title">{title}</div>
              <div className="helzerx-screen-sub">{subtitle}</div>

              <div className="helzerx-screen-status">
                <span className="helzerx-status-dot" />
                <span>{phase === 'ready' ? 'AUTH TERMINAL READY' : 'INITIALIZING...'}</span>
              </div>
            </div>

            <div className="helzerx-console-front">
              <div className="helzerx-console-slot" />
              <div className="helzerx-console-controls">
                <span /><span /><span />
              </div>
            </div>
          </div>
        </div>

        <div className="helzerx-auth-copy">
          <div className="helzerx-auth-kicker">
            <ShieldCheck className="h-3.5 w-3.5" />
            SECURE AUTHENTICATION
          </div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <div className="helzerx-auth-pills">
            <span><Zap /> Low-latency access</span>
            <span><Sparkles /> Cloud protected</span>
          </div>
        </div>
      </div>

      <div className="helzerx-auth-footer">
        <span>HELZERX CLOUD</span>
        <span className="helzerx-footer-line" />
        <span>SECURE // FAST // YOURS</span>
      </div>

      <AuthModal />
    </main>
  );
};
