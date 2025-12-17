import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../components/ui/index';
import { AuthService } from '../../../shared/services/auth.service';
import { AppointmentService, Appointment, CreateAppointmentDto, UpdateAppointmentDto } from '../../../shared/services/appointment.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ScheduleCitaModalComponent, ConfirmDeleteModalComponent, ConfirmCancelModalComponent, SpeedDialComponent, SpeedDialStatesComponent, CalendarModalComponent, UserMenuComponent, CobroModalComponent } from '../../../shared/components';
import { HeaderComponent, NavLink } from '../../../shared/components/header.component';
import { ToastService } from '../../../shared/services/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface HorarioSlot {
  hora: string;
  cita?: Appointment;
  disponible: boolean;
}

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    MatIconModule,
    MatButtonModule,
    SpeedDialComponent,
    SpeedDialStatesComponent,
    HeaderComponent,
  ],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <app-header
        [navLinks]="navLinks"
        (changeInfo)="onChangeInfo()"
        (logout)="logout()"
      ></app-header>

      <main class="container mx-auto px-4 py-8">
        <!-- Page Header -->
        <div class="mb-8">
          <h2 class="text-4xl font-bold mb-2">Mi Agenda</h2>
          <p class="text-muted-foreground">Gestiona tus citas y horarios</p>
        </div>

        <!-- Date Navigation -->
        <app-card class="mb-6">
          <app-card-content class="p-6">
            <div class="flex items-center justify-between">
              <button
                (click)="previousDay()"
                class="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <mat-icon>chevron_left</mat-icon>
              </button>
              
              <div class="flex-1 text-center">
                <div class="flex items-center justify-center gap-2 mb-2 cursor-pointer group" (click)="openCalendar()">
                  <mat-icon class="text-primary group-hover:scale-110 transition-transform">calendar_today</mat-icon>
                  <h3 class="text-xl font-semibold capitalize group-hover:text-primary transition-colors">{{ selectedDate | date: 'EEEE, d MMMM yyyy' }}</h3>
                </div>
                <p class="text-sm text-muted-foreground">
                  {{ isToday() ? 'Hoy' : isPast() ? 'Fecha pasada' : 'Fecha futura' }}
                </p>
              </div>

              <button
                (click)="nextDay()"
                class="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>
          </app-card-content>
        </app-card>

          
        <app-card>
          <app-card-header>
            <app-card-title>Horario del Día</app-card-title>
          </app-card-header>
          <app-card-content>
            <div
              class="space-y-2 p-4 rounded-lg"
              [ngClass]="isPast() ? 'bg-muted/50' : 'bg-background'"
            >
              <div *ngFor="let slot of horarios" class="flex items-center gap-4">
                <!-- Hora -->
                <div class="w-20 pt-3">
                  <p class="text-sm font-medium text-muted-foreground">{{ slot.hora }}</p>
                </div>

                <!-- Slot Content -->
                <div class="flex-1">
                  <!-- Disponible (Funcionalidad A) -->
                  <div
                    *ngIf="!slot.cita && !isPast()"
                    (click)="openScheduleModal(slot.hora)"
                    class="p-4 rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <p class="text-sm text-muted-foreground text-center">
                      <mat-icon class="text-lg">add_circle</mat-icon>
                      Horario disponible
                    </p>
                  </div>

                  <!-- No Disponible - Pasado (sin Funcionalidad A) -->
                  <div
                    *ngIf="!slot.cita && isPast()"
                    class="p-4 rounded-lg border-2 border-dashed border-border bg-muted/50"
                  >
                    <p class="text-sm text-muted-foreground text-center">Horario disponible</p>
                  </div>

                  <!-- Cita Programada (Funcionalidad B) -->
                  <div
                    *ngIf="slot.cita"
                    class="p-4 rounded-lg border-2 flex items-start justify-between"
                    [ngClass]="getCitaColor(slot.cita)"
                  >
                    <div class="flex-1">
                      <div class="flex items-start gap-2 mb-2">
                        <mat-icon class="text-foreground text-lg">person</mat-icon>
                        <div class="flex-1">
                          <h4 class="font-semibold text-foreground">{{ slot.cita.nombrePaciente }}</h4>
                          <p class="text-xs text-muted-foreground">{{ slot.cita.descripcion || 'Sin descripción' }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-2 ml-6 mb-2">
                        <mat-icon class="text-muted-foreground text-sm">phone</mat-icon>
                        <p class="text-xs text-foreground">{{ slot.cita.telefonoPaciente || 'Sin teléfono' }}</p>
                      </div>
                      <!-- Doble Semáforo de Estados -->
                      <div class="flex items-center gap-4 ml-6">
                        <!-- Semáforo Fisio -->
                        <div class="flex items-center gap-2">
                          <p class="text-xs font-semibold text-muted-foreground">Fisio:</p>
                          <div class="flex items-center gap-1">
                            <div class="w-4 h-4 rounded-full" [ngClass]="getColorFisio(slot.cita.estadoFisio)"></div>
                            <p class="text-xs text-foreground">{{ slot.cita.estadoFisio }}</p>
                          </div>
                        </div>
                        
                        <!-- Semáforo Paciente -->
                        <div class="flex items-center gap-2">
                          <p class="text-xs font-semibold text-muted-foreground">Paciente:</p>
                          <div class="flex items-center gap-1">
                            <div class="w-4 h-4 rounded-full" [ngClass]="getColorPaciente(slot.cita.estadoPaciente)"></div>
                            <p class="text-xs text-foreground">{{ slot.cita.estadoPaciente }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Acciones (Speed Dials + Cobrar) -->
                    <div class="flex items-center gap-2">

                      <!-- Botón Cobrar -->
                      <button
                        *ngIf="slot.cita!.estadoFisio !== 'Cobrado' && slot.cita!.estadoFisio !== 'CobroPendiente'"
                        (click)="onCharge(slot.cita!)"
                        class="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-green-100 transition-colors text-green-600 hover:text-green-700"
                        title="Cobrar cita"
                      >
                        <mat-icon>monetization_on</mat-icon>
                      </button>
                      
                      <!-- Speed Dial de Estados -->
                      <app-speed-dial-states
                        (confirm)="openConfirmModal(slot.cita!)"
                        (cancel)="openCancelConfirm(slot.cita!)"
                      />
                      
                      <!-- Speed Dial de Edición/Eliminación -->
                      <app-speed-dial
                        (edit)="openEditModal(slot.cita!)"
                        (delete)="openDeleteConfirm(slot.cita!)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </app-card-content>
        </app-card>
      </main>
    </div>
  `,
})
export class AgendaComponent implements OnInit, OnDestroy {
  selectedDate: Date = new Date();
  todayString: string = this.getTodayString();
  horarios: HorarioSlot[] = [];
  private destroy$ = new Subject<void>();
  isLoading = false;

  navLinks: NavLink[] = [
    { label: 'Dashboard', route: '/fisioterapeuta/dashboard' },
    { label: 'Agenda', route: '/fisioterapeuta/agenda' },
    { label: 'Pacientes', route: '/fisioterapeuta/pacientes' },
    { label: 'Historial de Cobros', route: '/fisioterapeuta/historial-cobros' },
  ];

  horasDisponibles = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // Primero testear la conexión sin autenticación
    this.appointmentService.test()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          console.log('✅ API connection test successful:', result);
          console.log('📋 Current token in localStorage:', this.authService.getTokenFromLocalStorage());
          
          // Ahora testear el debug JWT
          this.appointmentService.debugJwt()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (debugResult) => {
                console.log('🔍 Debug JWT result:', debugResult);
                
                // Luego testear con autenticación
                this.appointmentService.testAuth()
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: (authResult) => {
                      console.log('✅ Auth test successful:', authResult);
                      this.loadHorarios();
                    },
                    error: (error) => {
                      console.error('❌ Auth test failed:', error);
                      console.error('Status:', error.status);
                      console.error('Error:', error.error);
                      console.error('Token being sent:', this.authService.getTokenFromLocalStorage());
                      this.toastService.error('Error de autenticación');
                      this.isLoading = false;
                    }
                  });
              },
              error: (error) => {
                console.error('❌ Debug JWT failed:', error);
                console.error('Status:', error.status);
              }
            });
        },
        error: (error) => {
          console.error('❌ API connection test failed:', error);
          this.toastService.error('No se pudo conectar con la API');
          this.isLoading = false;
        }
      });
  }

  getTodayString(): string {
    return this.getFormattedDate(new Date());
  }

  getFormattedDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadHorarios() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    const fechaStr = this.getFormattedDate(this.selectedDate);
    const fisioterapeutaId = this.authService.getUserId();
    
    console.log('Loading horarios for:', { fisioterapeutaId, fechaStr });
    
    // Validar que tenemos el ID del usuario
    if (!fisioterapeutaId) {
      console.error('No fisioterapeuta ID available');
      this.toastService.error('No se pudo obtener tu ID de usuario');
      this.isLoading = false;
      
      // Mostrar horarios vacíos de todas formas
      this.horarios = this.horasDisponibles.map(hora => ({
        hora,
        disponible: true,
      }));
      return;
    }

    this.appointmentService.getAppointmentsByDay(fisioterapeutaId, fechaStr)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (citas: Appointment[]) => {
          console.log('Appointments loaded:', citas);
          this.horarios = this.horasDisponibles.map(hora => {
            const cita = citas.find(c => c.fecha === fechaStr && c.hora === hora);
            return {
              hora,
              cita,
              disponible: !cita,
            };
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading appointments:', error);
          this.toastService.error('Error al cargar los horarios');
          this.isLoading = false;
          
          // Mostrar horarios vacíos de todas formas cuando hay error
          this.horarios = this.horasDisponibles.map(hora => ({
            hora,
            disponible: true,
          }));
        }
      });
  }

  isToday(): boolean {
    const today = new Date();
    return this.selectedDate.toDateString() === today.toDateString();
  }

  isPast(): boolean {
    const today = new Date();
    const todayStr = this.getFormattedDate(today);
    const selectedStr = this.getFormattedDate(this.selectedDate);
    return selectedStr < todayStr;
  }

  getEstadoColor(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 border-yellow-300';
      case 'confirmada':
        return 'bg-blue-100 border-blue-300';
      case 'cobrada':
        return 'bg-green-100 border-green-300';
      case 'canceladafisio':
        return 'bg-red-100 border-red-300';
      case 'canceladapaciente':
        return 'bg-orange-100 border-orange-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-200 text-yellow-700';
      case 'confirmada':
        return 'bg-blue-200 text-blue-700';
      case 'cobrada':
        return 'bg-green-200 text-green-700';
      case 'canceladafisio':
        return 'bg-red-200 text-red-700';
      case 'canceladapaciente':
        return 'bg-orange-200 text-orange-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
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

  getCitaColor(cita: Appointment): string {
    const estadoFisio = cita.estadoFisio?.toLowerCase();
    const estadoPaciente = cita.estadoPaciente?.toLowerCase();

    // Verde si está cobrado
    if (estadoFisio === 'cobrado') {
      return 'bg-green-100 border-green-300';
    }

    // Naranja si está pendiente de cobro (pago con tarjeta pendiente)
    if (estadoFisio === 'cobropendiente') {
      return 'bg-orange-100 border-orange-300';
    }

    // Rojo si al menos uno está cancelado
    if (estadoFisio === 'canceladafisio' || estadoPaciente === 'canceladapaciente') {
      return 'bg-red-100 border-red-300';
    }

    // Azul solo si AMBOS están confirmados
    if (estadoFisio === 'confirmadofisio' && estadoPaciente === 'confirmadopaciente') {
      return 'bg-blue-100 border-blue-300';
    }

    // Amarillo si al menos uno está pendiente
    return 'bg-yellow-100 border-yellow-300';
  }

  previousDay() {
    this.selectedDate.setDate(this.selectedDate.getDate() - 1);
    this.selectedDate = new Date(this.selectedDate);
    this.loadHorarios();
  }

  nextDay() {
    this.selectedDate.setDate(this.selectedDate.getDate() + 1);
    this.selectedDate = new Date(this.selectedDate);
    this.loadHorarios();
  }

  openCalendar() {
    const dialogRef = this.dialog.open(CalendarModalComponent, {
      width: '400px',
      data: { selectedDate: this.selectedDate },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedDate = new Date(result);
        this.todayString = this.getFormattedDate(this.selectedDate);
        this.loadHorarios();
      }
    });
  }

  openScheduleModal(hora: string) {
    const fechaStr = this.getFormattedDate(this.selectedDate);
    
    const dialogRef = this.dialog.open(ScheduleCitaModalComponent, {
      width: '600px',
      data: { fecha: fechaStr, hora },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveCita(result);
      }
    });
  }

  openEditModal(cita: Appointment) {
    const dialogRef = this.dialog.open(ScheduleCitaModalComponent, {
      width: '600px',
      data: { 
        cita: {
          id: cita.id,
          pacienteId: cita.pacienteId,
          fecha: cita.fecha,
          hora: cita.hora,
          descripcion: cita.descripcion,
          estado: cita.estado,
          tipo: cita.tipo,
        }
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateCita(cita.id, result);
      }
    });
  }

  openDeleteConfirm(cita: Appointment) {
    const dialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
      width: '400px',
      data: {
        paciente: cita.nombrePaciente,
        fecha: new Date(cita.fecha),
        hora: cita.hora,
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteCita(cita.id);
      }
    });
  }

  openCancelConfirm(cita: Appointment) {
    const dialogRef = this.dialog.open(ConfirmCancelModalComponent, {
      width: '400px',
      data: {
        paciente: cita.nombrePaciente,
        fecha: new Date(cita.fecha),
        hora: cita.hora,
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.changeAppointmentStatusFisio(cita.id, 'CanceladaFisio');
      }
    });
  }

  openConfirmModal(cita: Appointment) {
    // Cambiar estado del fisio a ConfirmadoFisio
    this.changeAppointmentStatusFisio(cita.id, 'ConfirmadoFisio');
  }

  onCharge(cita: Appointment) {
    // Abrir el modal de cobro
    const dialogRef = this.dialog.open(CobroModalComponent, {
      width: '600px',
      data: { cita },
    });

    dialogRef.afterClosed().subscribe(payment => {
      if (payment) {
        // El pago fue exitoso, recargar los horarios
        this.loadHorarios();
      }
    });
  }

  saveCita(data: any) {
    const fisioterapeutaId = this.authService.getUserId();
    
    // Validar que tenemos el ID del usuario
    if (!fisioterapeutaId) {
      this.toastService.error('No se pudo obtener tu ID de usuario');
      return;
    }
    
    const nuevaCita: CreateAppointmentDto = {
      fisioterapeutaId,
      pacienteId: data.pacienteId,
      fecha: data.fecha,
      hora: data.hora,
      descripcion: data.descripcion,
      tipo: data.tipo || 'general',
    };

    console.log('📤 Enviando cita al backend:', nuevaCita);

    this.appointmentService.createAppointment(nuevaCita)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Cita creada exitosamente');
          this.loadHorarios();
        },
        error: (error) => {
          console.error('❌ Error details:', {
            status: error.status,
            message: error.error?.message,
            errors: error.error?.errors,
            body: error.error
          });
          this.toastService.error(error.error?.message || 'Error al crear la cita');
          console.error('Error creating appointment:', error);
        }
      });
  }

  updateCita(id: string, data: any) {
    const updateData: UpdateAppointmentDto = {
      pacienteId: data.pacienteId,
      fecha: data.fecha,
      hora: data.hora,
      descripcion: data.descripcion,
      tipo: data.tipo || 'general',
      estado: data.estado || 'pendiente',
    };

    this.appointmentService.updateAppointment(id, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Cita actualizada exitosamente');
          this.loadHorarios();
        },
        error: (error) => {
          this.toastService.error(error.error?.message || 'Error al actualizar la cita');
          console.error('Error updating appointment:', error);
        }
      });
  }

  deleteCita(id: string) {
    this.appointmentService.deleteAppointment(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Cita eliminada exitosamente');
          this.loadHorarios();
        },
        error: (error) => {
          this.toastService.error(error.error?.message || 'Error al eliminar la cita');
          console.error('Error deleting appointment:', error);
        }
      });
  }

  changeAppointmentStatus(id: string, newStatus: string) {
    this.appointmentService.changeAppointmentStatus(id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Estado de cita actualizado exitosamente');
          this.loadHorarios();
        },
        error: (error) => {
          this.toastService.error(error.error?.message || 'Error al actualizar estado de cita');
          console.error('Error changing appointment status:', error);
        }
      });
  }

  changeAppointmentStatusFisio(id: string, newStatusFisio: string) {
    this.appointmentService.changeAppointmentStatusFisio(id, newStatusFisio)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Estado de fisio actualizado exitosamente');
          this.loadHorarios();
        },
        error: (error) => {
          this.toastService.error(error.error?.message || 'Error al actualizar estado de fisio');
          console.error('Error changing fisio status:', error);
        }
      });
  }

  changeAppointmentStatusPaciente(id: string, newStatusPaciente: string) {
    this.appointmentService.changeAppointmentStatusPaciente(id, newStatusPaciente)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Estado de paciente actualizado exitosamente');
          this.loadHorarios();
        },
        error: (error) => {
          this.toastService.error(error.error?.message || 'Error al actualizar estado de paciente');
          console.error('Error changing paciente status:', error);
        }
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

