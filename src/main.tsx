import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './app.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* reducedMotion="user" → todas las animaciones de Motion respetan
        prefers-reduced-motion sin tener que gatearlas una por una. */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
    <Analytics />
    <SpeedInsights />
  </StrictMode>
);
