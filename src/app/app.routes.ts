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
    path: 'admin/users',
    loadComponent: () =>
      import('./components/admin-users/admin-users.component').then(
        (c) => c.AdminUsersComponent
      ),
  },
  {
    path: 'mis-turnos',
    loadComponent: () =>
      import('./components/mis-turnos/mis-turnos.component').then(
        (c) => c.MisTurnosComponent
      ),
  },
  {
    path: 'solicitar-turno',
    loadComponent: () =>
      import('./components/solicitar-turno/solicitar-turno.component').then(
        (c) => c.SolicitarTurnoComponent
      ),
  },
  {
    path: 'turnos-especialista',
    loadComponent: () =>
      import(
        './components/turnos-especialista/turnos-especialista.component'
      ).then((c) => c.TurnosEspecialistaComponent),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
