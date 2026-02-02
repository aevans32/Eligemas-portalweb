import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'solicitud/:codigo',
    loadComponent: () =>
        import('../pages/admin-solicitud-detail/admin-solicitud-detail')
            .then(m => m.AdminSolicitudDetail),
  },
  {
    path: '',
    loadComponent: () =>
      import('../pages/admin-dashboard/admin-dashboard')
        .then(m => m.AdminDashboard),
  }
];
