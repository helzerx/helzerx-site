import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { authBootstrap } from './auth-bootstrap';

const cmsReady = (window as Window & { ArveXCMSReady?: Promise<unknown> }).ArveXCMSReady;

const renderApp = () => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

const renderAfterBootstrap = () => {
  if (cmsReady && typeof cmsReady.then === 'function') cmsReady.then(renderApp).catch(renderApp);
  else renderApp();
};

authBootstrap.then(renderAfterBootstrap).catch(renderAfterBootstrap);
