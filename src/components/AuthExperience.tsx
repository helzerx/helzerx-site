import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AuthModal } from './AuthModal';

type AuthMode = 'login' | 'register';

/**
 * Dedicated authentication route.
 *
 * This is intentionally NOT rendered as a modal over MainWebsite.
 * App.tsx routes /login and /signup directly here, and this component
 * mounts only the authentication surface.
 */
export const AuthExperience: React.FC<{ mode: AuthMode }> = ({ mode }) => {
  const { setAuthModalTab, setIsAuthModalOpen } = useApp();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousBackground = document.body.style.background;
    const previousColor = document.body.style.color;

    document.documentElement.style.background = '#05070b';
    document.body.style.overflow = 'hidden';
    document.body.style.background = '#05070b';
    document.body.style.color = '#fff';

    setAuthModalTab(mode);
    // Open immediately. There is no cinematic layer or public-site layer
    // underneath the auth surface.
    setIsAuthModalOpen(true);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.background = previousBackground;
      document.body.style.color = previousColor;
      document.documentElement.style.background = '';
    };
  }, [mode, setAuthModalTab, setIsAuthModalOpen]);

  return (
    <main
      aria-label={mode === 'login' ? 'HelzerX Login' : 'HelzerX Sign Up'}
      className="fixed inset-0 z-[2147483647] min-h-screen w-screen overflow-hidden bg-[#05070b]"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100dvh',
        background: '#05070b',
        isolation: 'isolate',
      }}
    >
      <AuthModal />
    </main>
  );
};
