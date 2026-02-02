import { inject } from "@angular/core";
import { CanMatchFn, Router, UrlTree } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

export const adminGuard: CanMatchFn = async (): Promise<boolean | UrlTree> => {
    
    const router = inject(Router);
    const auth = inject(AuthService);

    // Asegurar sesion cargada
    const uid = auth.session?.user?.id;
    if (!uid) return router.parseUrl('/login');

    // Chequear admin (desde profiles o RPC)
    const isAdmin = await auth.isAdmin();
    return isAdmin ? true : router.parseUrl('/dashboard');
};