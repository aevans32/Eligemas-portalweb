import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// main.ts (antes de bootstrapApplication)
window.addEventListener('unhandledrejection', (event) => {
  const msg = String((event.reason as any)?.message ?? event.reason ?? '');
  if (
    msg.includes('NavigatorLockAcquireTimeoutError') ||
    msg.includes('LockManager lock') ||
    msg.includes('not immediately available')
  ) {
    event.preventDefault();
  }
});


bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

  