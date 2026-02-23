import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { profileCompleteGuard } from './core/guards/profile-complete.guard';
import { adminGuard } from './admin/guards/adminGuard';


export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./home/home').then(m => m.Home), 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./login/login').then(m => m.Login) 
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup').then(m => m.Signup),
  },
  {
    path: 'politica-privacidad',
    loadComponent: () => import('./privacy-policy/privacy-policy').then(m => m.PrivacyPolicy),
  },
  {
    path: 'preguntas-frecuentes',
    loadComponent: () => import('./preguntas-frecuentes/preguntas-frecuentes').then(m => m.PreguntasFrecuentes),
  },
  {
    path: 'quienes-somos',
    loadComponent: () => import('./quienes-somos/quienes-somos').then(m => m.QuienesSomos),
  },
  {
    path: 'proposito',
    loadComponent: () => import('./proposito/proposito').then(m => m.Proposito),
  },
  // {
  //   path: 'contacto',
  //   loadComponent: () => import('./contacto/contacto').then(m => m.Contacto),
  // },
  
 
  {
    path: 'contacto',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'basic-info',
    canMatch: [authGuard],
    loadComponent: () => import('./basic-info/basic-info').then(m => m.BasicInfo),
  },
  {
    path: 'dashboard',
    canMatch: [authGuard],
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
  },
  {
    path: 'nueva-solicitud',
    canActivate: [profileCompleteGuard],
    loadComponent: () => import('./nueva-solicitud/nueva-solicitud').then(m => m.NuevaSolicitud),
  },
  {
    path: 'solicitud/:codigo',
    canMatch: [authGuard],
    loadComponent: () => import('./solicitud-info/solicitud-info').then(m => m.SolicitudInfoComponent),
  },
  {
    path: 'propuesta/:id',
    canMatch: [authGuard],
    loadComponent: () => import('./propuesta/propuesta').then(m => m.Propuesta),
  },
  {
    path: 'admin-dashboard',
    canMatch: [authGuard, adminGuard],
    loadChildren: () => import('./admin/routes/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
    import('./reset-password/reset-password').then(m => m.ResetPassword),
  },
  {
    // wildcard route for a 404 page
    path: '**',
    redirectTo: '',
  }
];