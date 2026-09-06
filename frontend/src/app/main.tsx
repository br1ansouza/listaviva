import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { registerServiceWorker } from '@/lib/register-sw';
import '@/styles/global.css';
import { App } from './App';

const container = document.getElementById('root');

if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

registerServiceWorker();
