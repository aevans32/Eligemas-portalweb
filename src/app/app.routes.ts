import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';


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
    path: 'privacy-policy',
    loadComponent: () => import('./privacy-policy/privacy-policy').then(m => m.PrivacyPolicy),
  },
  {
    path: 'basic-info',
    //TODO: uncoment next line
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
    canMatch: [authGuard],
    loadComponent: () => import('./nueva-solicitud/nueva-solicitud').then(m => m.NuevaSolicitud),
  },
  {
    path: 'solicitud/:codigo',
    canMatch: [authGuard],
    loadComponent: () => import('./solicitud-info/solicitud-info').then(m => m.SolicitudInfoComponent),
  },
  {
    // wildcard route for a 404 page
    path: '**',
    redirectTo: '',
  }
];