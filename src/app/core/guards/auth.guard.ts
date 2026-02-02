import { inject } from "@angular/core";
import { CanMatchFn, Router, UrlTree } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { filter, map, switchMap, take } from "rxjs";

/**
 * Route guard: allows access only when user is authenticated.
 * Uses AuthService.loaded$ so we don't redirect before Supabase session is restored.
 */
export const authGuard: CanMatchFn = (_route, segments) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  auth.init(); 

  const attemptedUrl = '/' + segments.map(s => s.path).join('/');

  return auth.loaded$.pipe(
    filter(loaded => loaded), // wait until init() finishes at least once
    take(1),
    switchMap(() => auth.session$.pipe(take(1))),
    map((): boolean | UrlTree => {
      if (auth.session) return true;

      console.log('AuthGuard session:', auth.session);

      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: attemptedUrl }
      });
    })
  );
};