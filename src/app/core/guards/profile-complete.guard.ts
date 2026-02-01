import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

export const profileCompleteGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const snack = inject(MatSnackBar);

  await auth.init();

  // Not logged in → login
  if (!auth.session) {
    router.navigateByUrl('/login');
    return false;
  }

  // Check profile completion
  const { data, error } = await auth.getMyProfileStatus();

  // If error or missing → treat as incomplete for safety
  const isComplete = !error && !!data?.is_complete;

  if (!isComplete) {
    snack.open('No has terminado de llenar tus datos de perfil.', 'Cerrar', {
      duration: 6000,
    });
    router.navigateByUrl('/basic-info'); // or /perfil, whatever you prefer
    return false;
  }

  return true;
};
