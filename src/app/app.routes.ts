import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './core/guards/auth.guard';

// export const routes: Routes = [
//   {
//     path: '',
//     component: Home,
//   },
//   {
//     path: 'login',
//     component: Login
//   },
//   {
//     path: 'dashboard',
//     component: Dashboard
//   }
// ];


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
    path: 'dashboard',
    canMatch: [authGuard],
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
  },
  {
    // wildcard route for a 404 page
    path: '**',
    redirectTo: '',
  }
];