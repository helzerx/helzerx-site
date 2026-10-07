import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuthModal } from './AuthModal';

type AuthMode = 'login' | 'register';
type Phase = 'boot' | 'walk' | 'place' | 'open' | 'ready';

export const AuthExperience: React.FC<{ mode: AuthMode }> = ({ mode }) => {
  const { isAuthModalOpen, setAuthModalTab, setIsAuthModalOpen } = useApp();
  const [phase, setPhase] = useState<Phase>('boot');

  useEffect(() => {
    setAuthModalTab(mode);
    setIsAuthModalOpen(false);

    const timers = [
      window.setTimeout(() => setPhase('walk'), 260),
      window.setTimeout(() => setPhase('place'), 1700),
      window.setTimeout(() => setPhase('open'), 2350),
      window.setTimeout(() => {
        setPhase('ready');
        setIsAuthModalOpen(true);
      }, 3050),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [mode, setAuthModalTab, setIsAuthModalOpen]);

  useEffect(() => {
    if (phase !== 'ready' || isAuthModalOpen) return;
    window.location.assign('/');
  }, [phase, isAuthModalOpen]);

  const goHome = () => window.location.assign('/');

  const title = mode === 'login' ? 'WELCOME BACK' : 'CREATE YOUR ID';
  const subtitle = mode === 'login'
    ? 'Securely entering your HelzerX environment'
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

        <div className="helzerx-delivery-scene" aria-hidden="true">
          <div className="helzerx-floor-shadow" />
          <div className="helzerx-floor-light" />

          <div className="helzerx-box-stage">
            <div className="helzerx-box-glow" />
            <div className="helzerx-box">
              <div className="helzerx-box-inside" />
              <div className="helzerx-box-front" />
              <div className="helzerx-box-side" />
              <div className="helzerx-box-lid">
                <div className="helzerx-box-lid-mark">H</div>
              </div>
            </div>
          </div>

          <div className="helzerx-boy">
            <div className="helzerx-boy-shadow" />
            <div className="helzerx-boy-head">
              <div className="helzerx-boy-hair" />
              <div className="helzerx-boy-ear" />
              <div className="helzerx-boy-face-light" />
            </div>
            <div className="helzerx-boy-neck" />
            <div className="helzerx-boy-torso">
              <div className="helzerx-boy-jacket-highlight" />
            </div>
            <div className="helzerx-boy-arm helzerx-boy-arm-back" />
            <div className="helzerx-boy-arm helzerx-boy-arm-front">
              <div className="helzerx-boy-hand" />
            </div>
            <div className="helzerx-boy-leg helzerx-boy-leg-back">
              <div className="helzerx-boy-shoe" />
            </div>
            <div className="helzerx-boy-leg helzerx-boy-leg-front">
              <div className="helzerx-boy-shoe" />
            </div>
          </div>

          <div className="helzerx-scene-caption">
            <span className="helzerx-caption-dot" />
            {phase === 'walk' && 'DELIVERY IN PROGRESS'}
            {phase === 'place' && 'SECURE PACKAGE PLACED'}
            {phase === 'open' && 'AUTH TERMINAL DEPLOYING'}
            {phase === 'ready' && 'AUTH TERMINAL READY'}
            {phase === 'boot' && 'INITIALIZING'}
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

      <div className={`helzerx-modal-reveal phase-${phase}`}>
        <AuthModal />
      </div>
    </main>
  );
};
