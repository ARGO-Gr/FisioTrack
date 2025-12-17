import { Routes } from '@angular/router';
import { RoleGuard } from './shared/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'login/patient',
    loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent),
    data: { userType: 'patient' }
  },
  {
    path: 'login/physiotherapist',
    loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent),
    data: { userType: 'physiotherapist' }
  },
  {
    path: 'registro/paciente',
    loadComponent: () => import('./pages/auth/register.component').then(m => m.RegisterComponent),
    data: { userType: 'patient' }
  },
  {
    path: 'registro/fisioterapeuta',
    loadComponent: () => import('./pages/auth/register.component').then(m => m.RegisterComponent),
    data: { userType: 'physiotherapist' }
  },
  {
    path: 'perfil',
    canActivate: [RoleGuard],
    data: { requiredRole: null }, // Accessible for all authenticated users
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.ProfileComponent),
  },
  {
    path: 'fisioterapeuta',
    canActivate: [RoleGuard],
    data: { requiredRole: 'physiotherapist' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/fisioterapeuta/dashboard/dashboard.component').then(m => m.FisioterapeutaDashboardComponent),
      },
      {
        path: 'pacientes',
        loadComponent: () => import('./pages/fisioterapeuta/pacientes/pacientes.component').then(m => m.PacientesComponent),
      },
      {
        path: 'agenda',
        loadComponent: () => import('./pages/fisioterapeuta/agenda/agenda.component').then(m => m.AgendaComponent),
      },
      {
        path: 'historial-cobros',
        loadComponent: () => import('./pages/fisioterapeuta/historial-cobros/historial-cobros.component').then(m => m.HistorialCobrosComponent),
      },
    ],
  },
  {
    path: 'paciente',
    canActivate: [RoleGuard],
    data: { requiredRole: 'patient' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/paciente/dashboard/dashboard.component').then(m => m.PacienteDashboardComponent),
      },
      {
        path: 'rutinas',
        loadComponent: () => import('./pages/paciente/rutinas/rutinas.component').then(m => m.RutinasComponent),
      },
      {
        path: 'rutinas/:id',
        loadComponent: () => import('./pages/paciente/rutinas/ejecutar-rutina/ejecutar-rutina.component').then(m => m.EjecutarRutinaComponent),
      },
      {
        path: 'citas',
        loadComponent: () => import('./pages/paciente/citas/mis-citas.component').then(m => m.MisCitasComponent),
      },
      {
        path: 'pagos-pendientes',
        loadComponent: () => import('./pages/paciente/pagos/pagos-pendientes.component').then(m => m.PagosPendientesComponent),
      },
    ],
  },
];
