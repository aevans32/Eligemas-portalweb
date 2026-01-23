import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    const msg = String(error?.rejection?.message ?? error?.message ?? error ?? '');

    // Ignora el "race" conocido de navigator.locks de Supabase
    if (
      msg.includes('NavigatorLockAcquireTimeoutError') &&
      msg.includes('LockManager lock')
    ) {
      return;
    }

    // Deja que el resto se reporte normal
    console.error(error);
  }
}
