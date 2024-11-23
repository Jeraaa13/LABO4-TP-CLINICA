// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (c) => c.LoginComponent
      ),
    data: { animation: 'login' },
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then((c) => c.HomeComponent),
    data: { animation: 'home' },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (c) => c.RegisterComponent
      ),
    data: { animation: 'register' },
  },
  {
    path: 'verificacion',
    loadComponent: () =>
      import('./components/verification/verification.component').then(
        (c) => c.VerificationComponent
      ),
    data: { animation: 'verificacion' },
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./components/admin-users/admin-users.component').then(
        (c) => c.AdminUsersComponent
      ),
    data: { animation: 'adminUsers' },
  },
  {
    path: 'turnos-admin',
    loadComponent: () =>
      import('./components/admin-turnos/admin-turnos.component').then(
        (c) => c.AdminTurnosComponent
      ),
    data: { animation: 'turnosAdmin' },
  },
  {
    path: 'turnos-pacientes',
    loadComponent: () =>
      import('./components/mis-turnos/mis-turnos.component').then(
        (c) => c.MisTurnosComponent
      ),
    data: { animation: 'turnosPacientes' },
  },
  {
    path: 'solicitar-turno',
    loadComponent: () =>
      import('./components/solicitar-turno/solicitar-turno.component').then(
        (c) => c.SolicitarTurnoComponent
      ),
    data: { animation: 'solicitarTurno' },
  },
  {
    path: 'turnos-especialista',
    loadComponent: () =>
      import(
        './components/turnos-especialista/turnos-especialista.component'
      ).then((c) => c.TurnosEspecialistaComponent),
    data: { animation: 'turnosEspecialista' },
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./components/perfil/perfil.component').then(
        (c) => c.PerfilComponent
      ),
    data: { animation: 'perfil' },
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./components/usuarios/usuarios.component').then(
        (c) => c.UsuariosComponent
      ),
    data: { animation: 'usuarios' },
  },
  {
    path: 'pacientes',
    loadComponent: () =>
      import('./components/pacientes/pacientes.component').then(
        (c) => c.PacientesComponent
      ),
    data: { animation: 'pacientes' },
  },
  {
    path: 'estadisticas',
    loadComponent: () =>
      import('./components/admin-statistics/admin-statistics.component').then(
        (c) => c.AdminStatisticsComponent
      ),
    data: { animation: 'estadisticas' },
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
    data: { animation: 'home' },
  },
];
