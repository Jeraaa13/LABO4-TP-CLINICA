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
    path: 'turnos-admin',
    loadComponent: () =>
      import('./components/admin-turnos/admin-turnos.component').then(
        (c) => c.AdminTurnosComponent
      ),
  },
  {
    path: 'turnos-pacientes',
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
  {
    path: 'perfil',
    loadComponent: () =>
      import('./components/perfil/perfil.component').then(
        (c) => c.PerfilComponent
      ),
    //canActivate: [AuthGuard],
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./components/usuarios/usuarios.component').then(
        (c) => c.UsuariosComponent
      ),
  },
  {
    path: 'pacientes',
    loadComponent: () =>
      import('./components/pacientes/pacientes.component').then(
        (c) => c.PacientesComponent
      ),
  },
  {
    path: 'estadisticas',
    loadComponent: () =>
      import('./components/admin-statistics/admin-statistics.component').then(
        (c) => c.AdminStatisticsComponent
      ),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
