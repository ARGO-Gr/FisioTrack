import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../../components/ui/card.component';
import { ButtonComponent } from '../../../components/ui/button.component';
import { InMemoryDatabaseService } from '../../../shared/in-memory-db/in-memory.service';
import { Rutina } from '../../../shared/models';
import { MatIconModule } from '@angular/material/icon';
import { UserMenuComponent } from '../../../shared/components/user-menu.component';
import { AuthService } from '../../../shared/services/auth.service';
import { AppointmentService, Appointment } from '../../../shared/services/appointment.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-paciente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent, ButtonComponent, MatIconModule, UserMenuComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class PacienteDashboardComponent implements OnInit, OnDestroy {
  rutinas: Rutina[] = [];
  citasProximas: Appointment[] = [];
  loading = true;
  pacienteId: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private db: InMemoryDatabaseService,
    private authService: AuthService,
    private router: Router,
    private appointmentService: AppointmentService,
    private toastService: ToastService
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
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  onChangeInfo(): void {
    // TODO: Implementar modal para cambiar información del usuario
    console.log('Cambiar información - pendiente de implementar');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
