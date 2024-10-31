import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (c) => c.LoginComponent
      ),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (c) => c.RegisterComponent
      ),
  },
  {
    path: 'verificacion',
    loadComponent: () =>
      import('./components/verification/verification.component').then(
        (c) => c.VerificationComponent
      ),
  },
  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./components/admin-dashboard/admin-dashboard.component').then(
        (c) => c.AdminDashboardComponent
      ),
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./components/admin-users/admin-users.component').then(
        (c) => c.AdminUsersComponent
      ),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
