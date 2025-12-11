import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../../components/ui/card.component';
import { ButtonComponent } from '../../../components/ui/button.component';
import { AuthService } from '../../../shared/services/auth.service';
import { AppointmentService, Appointment } from '../../../shared/services/appointment.service';
import { ToastService } from '../../../shared/services/toast.service';
import { UserMenuComponent } from '../../../shared/components/user-menu.component';
import { SpeedDialStatesComponent, ConfirmCancelModalComponent } from '../../../shared/components';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    ButtonComponent,
    UserMenuComponent,
    SpeedDialStatesComponent,
  ],
  templateUrl: './mis-citas.component.html',
  styleUrl: './mis-citas.component.scss',
})
export class MisCitasComponent implements OnInit, OnDestroy {
  filtroActivo: 'proximas' | 'canceladas' = 'proximas';
  todasLasCitas: Appointment[] = [];
  citasFiltradas: Appointment[] = [];
  cargando = true;
  pacienteId: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private router: Router,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.pacienteId = userId;
      this.cargarCitas();
    } else {
      this.toastService.error('No se pudo obtener tu ID');
      this.router.navigate(['/']);
    }
  }

  cargarCitas() {
    this.cargando = true;
    // Cargar citas del paciente desde la API
    this.appointmentService
      .getAppointmentsByPatient(this.pacienteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (citas: Appointment[]) => {
          this.todasLasCitas = citas;
          this.aplicarFiltro();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error cargando citas:', error);
          this.toastService.error('Error al cargar las citas');
          this.todasLasCitas = [];
          this.citasFiltradas = [];
          this.cargando = false;
        }
      });
  }

  cambiarFiltro(filtro: 'proximas' | 'canceladas'): void {
    this.filtroActivo = filtro;
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    if (this.filtroActivo === 'proximas') {
      // Mostrar pendientes y confirmadas (excluir canceladas)
      this.citasFiltradas = this.todasLasCitas.filter(cita => {
        const estadoFisio = cita.estadoFisio?.toLowerCase();
        const estadoPaciente = cita.estadoPaciente?.toLowerCase();
        return (estadoFisio === 'pendiente' || 
                estadoFisio === 'confirmadofisio' || 
                estadoPaciente === 'confirmadopaciente') &&
               estadoFisio !== 'canceladafisio' &&
               estadoPaciente !== 'canceladapaciente';
      });
    } else {
      // Mostrar canceladas (por fisio o por paciente)
      this.citasFiltradas = this.todasLasCitas.filter(cita => {
        const estadoFisio = cita.estadoFisio?.toLowerCase();
        const estadoPaciente = cita.estadoPaciente?.toLowerCase();
        return estadoFisio === 'canceladafisio' || estadoPaciente === 'canceladapaciente';
      });
    }
  }

  getCitaColor(cita: Appointment): string {
    const estadoFisio = cita.estadoFisio?.toLowerCase();
    const estadoPaciente = cita.estadoPaciente?.toLowerCase();

    // Verde si está confirmada
    if (estadoFisio === 'confirmadofisio' && estadoPaciente === 'confirmadopaciente') {
      return 'border-l-4 border-l-blue-500 bg-blue-50';
    }

    // Rojo si está cancelada
    if (estadoFisio === 'canceladafisio' || estadoPaciente === 'canceladapaciente') {
      return 'border-l-4 border-l-red-500 bg-red-50';
    }

    // Amarillo si está pendiente
    return 'border-l-4 border-l-yellow-500 bg-yellow-50';
  }

  getEstadoBadgeClass(cita: Appointment): string {
    const estadoFisio = cita.estadoFisio?.toLowerCase();
    const estadoPaciente = cita.estadoPaciente?.toLowerCase();

    if (estadoFisio === 'canceladafisio' || estadoPaciente === 'canceladapaciente') {
      return 'bg-red-100 text-red-700';
    }

    if (estadoFisio === 'confirmadofisio' && estadoPaciente === 'confirmadopaciente') {
      return 'bg-blue-100 text-blue-700';
    }

    return 'bg-yellow-100 text-yellow-700';
  }

  getEstadoText(cita: Appointment): string {
    const estadoFisio = cita.estadoFisio?.toLowerCase();
    const estadoPaciente = cita.estadoPaciente?.toLowerCase();

    if (estadoFisio === 'canceladafisio' || estadoPaciente === 'canceladapaciente') {
      return 'Cancelada';
    }

    if (estadoFisio === 'confirmadofisio' && estadoPaciente === 'confirmadopaciente') {
      return 'Confirmada';
    }

    return 'Pendiente';
  }

  formatDate(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  openCancelConfirm(cita: Appointment): void {
    const dialogRef = this.dialog.open(ConfirmCancelModalComponent, {
      width: '400px',
      data: {
        paciente: 'Tu cita',
        fecha: new Date(cita.fecha),
        hora: cita.hora,
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.changeAppointmentStatusPaciente(cita.id, 'CanceladaPaciente');
      }
    });
  }

  openConfirmModal(cita: Appointment): void {
    // Solo permitir confirmar si la cita no está cancelada
    const estadoFisio = cita.estadoFisio?.toLowerCase();
    const estadoPaciente = cita.estadoPaciente?.toLowerCase();
    
    if (estadoFisio === 'canceladafisio' || estadoPaciente === 'canceladapaciente') {
      this.toastService.error('No se puede confirmar una cita cancelada');
      return;
    }
    
    this.changeAppointmentStatusPaciente(cita.id, 'ConfirmadoPaciente');
  }

  changeAppointmentStatusPaciente(id: string, newStatusPaciente: string): void {
    this.appointmentService.changeAppointmentStatusPaciente(id, newStatusPaciente)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Estado de cita actualizado exitosamente');
          this.cargarCitas();
        },
        error: (error) => {
          this.toastService.error(error.error?.message || 'Error al actualizar estado de cita');
          console.error('Error changing paciente status:', error);
        }
      });
  }

  onChangeInfo(): void {
    console.log('Cambiar información - pendiente de implementar');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
