import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../../components/ui/card.component';
import { ButtonComponent } from '../../../components/ui/button.component';
import { InMemoryDatabaseService } from '../../../shared/in-memory-db/in-memory.service';
import { Rutina } from '../../../shared/models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserMenuComponent } from '../../../shared/components/user-menu.component';
import { HeaderComponent, NavLink } from '../../../shared/components/header.component';
import { AuthService } from '../../../shared/services/auth.service';
import { AppointmentService, Appointment } from '../../../shared/services/appointment.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ProgramaService, ProgramaDetalleDto } from '../../../shared/services/programa.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmCancelModalComponent } from '../../../shared/components/confirm-cancel-modal.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-paciente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent, ButtonComponent, MatIconModule, MatButtonModule, UserMenuComponent, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class PacienteDashboardComponent implements OnInit, OnDestroy {
  navLinks: NavLink[] = [
    { label: 'Dashboard', route: '/paciente/dashboard' },
    { label: 'Mi Rutina', route: '/paciente/rutinas' },
    { label: 'Mis Citas', route: '/paciente/citas' },
    { label: 'Pagos', route: '/paciente/pagos-pendientes' },
  ];
  rutinas: Rutina[] = [];
  citasProximas: Appointment[] = [];
  loading = true;
  pacienteId: string = '';
  programaActivo: ProgramaDetalleDto | null = null;
  resumenPrograma = {
    nombre: '',
    diasCompletados: 0,
    diasTotales: 0,
    progreso: 0,
    semanaActual: 1,
    totalSemanas: 1
  };
  private destroy$ = new Subject<void>();

  constructor(
    private db: InMemoryDatabaseService,
    private authService: AuthService,
    private router: Router,
    private appointmentService: AppointmentService,
    private toastService: ToastService,
    private dialog: MatDialog,
    private programaService: ProgramaService
  ) {}

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.pacienteId = userId;
      // Paciente ID hardcoded as '1' for demo
      this.db.getRutinasByPaciente('1').subscribe(r => {
        this.rutinas = r;
        this.loading = false;
      });
      
      // Cargar citas próximas
      this.cargarCitasProximas();
      
      // Cargar programa activo
      this.cargarProgramaActivo();
    }
  }

  cargarCitasProximas() {
    this.appointmentService.getAppointmentsByPatient(this.pacienteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (citas: Appointment[]) => {
          // Filtrar solo citas próximas (pendientes y confirmadas, sin canceladas)
          this.citasProximas = citas
            .filter(cita => {
              const estadoFisio = cita.estadoFisio?.toLowerCase();
              const estadoPaciente = cita.estadoPaciente?.toLowerCase();
              return (estadoFisio === 'pendiente' || 
                      estadoFisio === 'confirmadofisio' || 
                      estadoPaciente === 'confirmadopaciente') &&
                     estadoFisio !== 'canceladafisio' &&
                     estadoPaciente !== 'canceladapaciente';
            })
            .sort((a, b) => {
              // Ordenar por fecha y hora
              const fechaA = new Date(`${a.fecha}T${a.hora}`);
              const fechaB = new Date(`${b.fecha}T${b.hora}`);
              return fechaA.getTime() - fechaB.getTime();
            })
            .slice(0, 3); // Mostrar solo las próximas 3 citas
        },
        error: (error) => {
          console.error('Error cargando citas:', error);
        }
      });
  }

  cargarProgramaActivo() {
    this.programaService.obtenerProgramaActivoPaciente()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (programa) => {
          this.programaActivo = programa;
          this.resumenPrograma = {
            nombre: programa.nombre,
            diasCompletados: programa.diasCompletados,
            diasTotales: programa.diasTotales,
            progreso: programa.diasTotales > 0 ? Math.round((programa.diasCompletados / programa.diasTotales) * 100) : 0,
            semanaActual: programa.semanaActual,
            totalSemanas: programa.totalSemanas
          };
        },
        error: (error) => {
          console.error('Error cargando programa:', error);
          // No mostrar error si no hay programa activo
        }
      });
  }

  getCitaColor(cita: Appointment): string {
    const estadoFisio = cita.estadoFisio?.toLowerCase();
    const estadoPaciente = cita.estadoPaciente?.toLowerCase();

    // Azul si ambos confirmados
    if (estadoFisio === 'confirmadofisio' && estadoPaciente === 'confirmadopaciente') {
      return 'border-l-4 border-l-blue-500 bg-blue-50';
    }

    // Amarillo si pendiente
    return 'border-l-4 border-l-yellow-500 bg-yellow-50';
  }

  getEstadoText(cita: Appointment): string {
    const estadoFisio = cita.estadoFisio?.toLowerCase();
    const estadoPaciente = cita.estadoPaciente?.toLowerCase();

    if (estadoFisio === 'confirmadofisio' && estadoPaciente === 'confirmadopaciente') {
      return 'Confirmada';
    }

    return 'Pendiente';
  }

  formatDate(fecha: string): string {
    // Parse fecha como local time (formato: YYYY-MM-DD)
    const [year, month, day] = fecha.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getColorFisio(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-400';
      case 'confirmadofisio':
        return 'bg-blue-400';
      case 'cobrado':
        return 'bg-green-400';
      case 'cobropendiente':
        return 'bg-orange-400';
      case 'canceladafisio':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  }

  getColorPaciente(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-400';
      case 'confirmadopaciente':
        return 'bg-blue-400';
      case 'canceladapaciente':
        return 'bg-orange-400';
      default:
        return 'bg-gray-400';
    }
  }

  puedeConfirmar(cita: Appointment): boolean {
    const estadoFisio = cita.estadoFisio?.toLowerCase();
    const estadoPaciente = cita.estadoPaciente?.toLowerCase();
    // Puede confirmar si no está cobrada y el paciente no ha confirmado
    // Permite confirmar incluso si el paciente canceló (para reactivar la cita)
    return estadoFisio !== 'canceladafisio' && 
           estadoFisio !== 'cobrado' && 
           estadoFisio !== 'cobropendiente' &&
           estadoPaciente !== 'confirmadopaciente';
  }

  puedeCancelar(cita: Appointment): boolean {
    const estadoFisio = cita.estadoFisio?.toLowerCase();
    const estadoPaciente = cita.estadoPaciente?.toLowerCase();
    return estadoFisio !== 'canceladafisio' && 
           estadoFisio !== 'cobrado' &&
           estadoFisio !== 'cobropendiente' &&
           estadoPaciente !== 'canceladapaciente';
  }

  openConfirmModal(cita: Appointment) {
    this.appointmentService.changeAppointmentStatusPaciente(cita.id, 'ConfirmadoPaciente')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Cita confirmada exitosamente');
          this.cargarCitasProximas();
        },
        error: (error) => {
          this.toastService.error('Error al confirmar la cita');
          console.error('Error:', error);
        }
      });
  }

  openCancelConfirm(cita: Appointment) {
    const dialogRef = this.dialog.open(ConfirmCancelModalComponent, {
      width: '400px',
      data: {
        paciente: 'tu',
        fecha: new Date(cita.fecha),
        hora: cita.hora,
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.appointmentService.changeAppointmentStatusPaciente(cita.id, 'CanceladaPaciente')
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.toastService.success('Cita cancelada exitosamente');
              this.cargarCitasProximas();
            },
            error: (error) => {
              this.toastService.error('Error al cancelar la cita');
              console.error('Error:', error);
            }
          });
      }
    });
  }

  onChangeInfo(): void {
    // TODO: Implementar modal para cambiar información del usuario
    console.log('Cambiar información - pendiente de implementar');
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
