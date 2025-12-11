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
        path: 'pacientes/:id/progreso',
        loadComponent: () => import('./pages/fisioterapeuta/pacientes/patient-progress/patient-progress.component').then(m => m.PatientProgressComponent),
      },
      {
        path: 'crear-rutina',
        loadComponent: () => import('./pages/fisioterapeuta/crear-rutina/crear-rutina.component').then(m => m.CrearRutinaComponent),
      },
      {
        path: 'planificar-rutina',
        loadComponent: () => import('./pages/fisioterapeuta/planificar-rutina/planificar-rutina.component').then(m => m.PlanificarRutinaComponent),
      },
      {
        path: 'agenda',
        loadComponent: () => import('./pages/fisioterapeuta/agenda/agenda.component').then(m => m.AgendaComponent),
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
    ],
  },
];
