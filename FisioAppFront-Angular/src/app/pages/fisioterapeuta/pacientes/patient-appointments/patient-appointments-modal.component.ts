import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../../components/ui/card.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppointmentService, Appointment } from '../../../../shared/services/appointment.service';

interface AppointmentCalendarData {
  pacienteId: string;
  nombre: string;
  appointments: Appointment[];
}

export interface PatientAppointmentsModalData {
  pacienteId: string;
  nombrePaciente: string;
}

@Component({
  selector: 'app-patient-appointments-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
  ],
  providers: [AppointmentService],
  template: `
    <div class="max-h-[calc(100vh-3rem)] overflow-y-auto p-6 m-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">Citas del Paciente</h2>
        <button
          mat-icon-button
          (click)="dialogRef.close()"
          class="text-muted-foreground hover:text-foreground"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin mb-4 mx-auto">
            <mat-icon class="text-primary">refresh</mat-icon>
          </div>
          <p class="text-muted-foreground">Cargando citas del paciente...</p>
        </div>
      </div>

      <!-- No Appointments State -->
      <div *ngIf="!loading && !patientData || (patientData && patientData.appointments.length === 0)" class="flex items-center justify-center py-12">
        <app-card class="max-w-md w-full">
          <app-card-content class="p-12 text-center">
            <mat-icon class="text-muted-foreground mx-auto mb-4 opacity-50">event</mat-icon>
            <h3 class="text-xl font-semibold mb-2">Sin citas</h3>
            <p class="text-muted-foreground">Este paciente no tiene citas registradas.</p>
          </app-card-content>
        </app-card>
      </div>

      <!-- Appointments Calendar Card -->
      <div *ngIf="!loading && patientData && patientData.appointments.length > 0">
        <app-card>
          <app-card-header>
            <div class="flex items-center justify-between">
              <div>
                <app-card-title class="text-3xl mb-2">{{ patientData.nombre }}</app-card-title>
                <p class="text-muted-foreground">Calendario de citas</p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-primary">{{ getTotalAppointments() }}</p>
                <p class="text-sm text-muted-foreground">Total de citas</p>
              </div>
            </div>
          </app-card-header>

          <app-card-content class="">
            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div class="p-4 rounded-lg bg-green-50 border-2 border-green-500">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-green-600 text-sm">check_circle</mat-icon>
                  <div>
                    <p class="text-xs text-green-700">Completadas</p>
                    <p class="text-xl font-bold text-green-800">{{ getCompletedAppointments() }}</p>
                  </div>
                </div>
              </div>

              <div class="p-4 rounded-lg bg-orange-50 border-2 border-orange-500">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-orange-600 text-sm">payment</mat-icon>
                  <div>
                    <p class="text-xs text-orange-700">Cobro Pend.</p>
                    <p class="text-xl font-bold text-orange-800">{{ getPendingPaymentAppointments() }}</p>
                  </div>
                </div>
              </div>

              <div class="p-4 rounded-lg bg-blue-50 border-2 border-blue-500">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-blue-600 text-sm">event_available</mat-icon>
                  <div>
                    <p class="text-xs text-blue-700">Confirmadas</p>
                    <p class="text-xl font-bold text-blue-800">{{ getTotalAppointments() - getCompletedAppointments() - getPendingPaymentAppointments() - getCanceledAppointments() }}</p>
                  </div>
                </div>
              </div>

              <div class="p-4 rounded-lg bg-yellow-50 border-2 border-yellow-500">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-yellow-600 text-sm">schedule</mat-icon>
                  <div>
                    <p class="text-xs text-yellow-700">Pendientes</p>
                    <p class="text-xl font-bold text-yellow-800">{{ getPendingAppointments() }}</p>
                  </div>
                </div>
              </div>

              <div class="p-4 rounded-lg bg-red-50 border-2 border-red-500">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-red-600 text-sm">cancel</mat-icon>
                  <div>
                    <p class="text-xs text-red-700">Canceladas</p>
                    <p class="text-xl font-bold text-red-800">{{ getCanceledAppointments() }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Calendar -->
            <div>
              <div class="flex items-center justify-between mt-6 mb-4">
                <button
                  (click)="previousMonth()"
                  class="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <mat-icon>chevron_left</mat-icon>
                </button>
                <h3 class="text-xl font-semibold text-foreground">{{ getMonthYear() }}</h3>
                <button
                  (click)="nextMonth()"
                  class="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <mat-icon>chevron_right</mat-icon>
                </button>
              </div>

              <!-- Weekday Headers -->
              <div class="grid grid-cols-7 gap-2 mb-2">
                <div class="text-center font-semibold text-sm text-muted-foreground p-2">Dom</div>
                <div class="text-center font-semibold text-sm text-muted-foreground p-2">Lun</div>
                <div class="text-center font-semibold text-sm text-muted-foreground p-2">Mar</div>
                <div class="text-center font-semibold text-sm text-muted-foreground p-2">Mié</div>
                <div class="text-center font-semibold text-sm text-muted-foreground p-2">Jue</div>
                <div class="text-center font-semibold text-sm text-muted-foreground p-2">Vie</div>
                <div class="text-center font-semibold text-sm text-muted-foreground p-2">Sab</div>
              </div>

              <!-- Calendar Days -->
              <div class="grid grid-cols-7 gap-2">
                <ng-container *ngFor="let day of calendarDays">
                  <div
                    *ngIf="day"
                    class="day-cell"
                  >
                    <div
                      class="w-full h-16 rounded-lg border-2 border-gray-300 bg-gray-50 flex flex-col items-center justify-center transition-all cursor-pointer hover:border-primary"
                    >
                      <span class="text-sm font-semibold text-foreground mb-2">{{ day.getDate() }}</span>
                      <div class="flex gap-1 flex-wrap justify-center items-center">
                        <ng-container *ngFor="let appointment of getAppointmentsForDate(day)">
                          <div
                            [class]="'w-2 h-2 rounded-full transition-transform hover:scale-150 cursor-pointer ' +
                              (getAppointmentStatus(appointment) === 'completed' ? 'bg-green-500' : '') +
                              (getAppointmentStatus(appointment) === 'pending-payment' ? 'bg-orange-500' : '') +
                              (getAppointmentStatus(appointment) === 'confirmed' ? 'bg-blue-500' : '') +
                              (getAppointmentStatus(appointment) === 'pending' ? 'bg-yellow-500' : '') +
                              (getAppointmentStatus(appointment) === 'canceled' ? 'bg-red-500' : '')"
                            [title]="getAppointmentTooltip(appointment)"
                          ></div>
                        </ng-container>
                      </div>
                    </div>
                  </div>
                </ng-container>
              </div>

              <!-- Legend -->
              <div class="p-4 rounded-lg bg-muted/20 border border-border mt-5">
                <p class="text-sm font-semibold text-foreground mb-3">Leyenda</p>
                <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-green-100 border-2 border-green-500"></div>
                    <span class="text-sm text-muted-foreground">Completadas</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-orange-100 border-2 border-orange-500"></div>
                    <span class="text-sm text-muted-foreground">Cobro Pendiente</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-blue-100 border-2 border-blue-500"></div>
                    <span class="text-sm text-muted-foreground">Confirmadas</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-yellow-50 border-2 border-yellow-400"></div>
                    <span class="text-sm text-muted-foreground">Pendientes</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-red-100 border-2 border-red-500"></div>
                    <span class="text-sm text-muted-foreground">Canceladas</span>
                  </div>
                </div>
              </div>
            </div>
          </app-card-content>
        </app-card>
      </div>
    </div>
  `,
  styles: [`
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    .day-cell {
      min-height: 64px;
    }

    :host ::ng-deep .mat-mdc-dialog-container {
      overflow: visible !important;
    }

    :host ::ng-deep .mdc-dialog__content {
      padding: 0 !important;
      overflow: visible !important;
    }
  `],
})
export class PatientAppointmentsModalComponent implements OnInit, OnDestroy {
  patientData: AppointmentCalendarData | null = null;
  calendarDays: (Date | null)[] = [];
  currentMonth: Date = new Date();
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PatientAppointmentsModalData,
    public dialogRef: MatDialogRef<PatientAppointmentsModalComponent>,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit() {
    this.loadPatientAppointments(this.data.pacienteId);
  }

  loadPatientAppointments(pacienteId: string) {
    this.loading = true;
    this.appointmentService.getAppointmentsByPatient(pacienteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointments: Appointment[]) => {
          this.patientData = {
            pacienteId: pacienteId,
            nombre: this.data.nombrePaciente,
            appointments: appointments
          };

          this.generateCalendar();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error al cargar citas:', error);
          this.loading = false;
        }
      });
  }

  generateCalendar() {
    this.calendarDays = [];
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    for (let i = 0; i < 42; i++) {
      if (i > 0) startDate.setDate(startDate.getDate() + 1);
      const date = new Date(startDate);
      if (date.getMonth() === month) {
        this.calendarDays.push(new Date(date));
      } else {
        this.calendarDays.push(null);
      }
    }
  }

  getAppointmentsForDate(date: Date | null): Appointment[] {
    if (!date || !this.patientData) return [];
    const dateStr = date.toISOString().split('T')[0];
    return this.patientData.appointments.filter((apt: Appointment) => {
      const aptDate = new Date(apt.fecha).toISOString().split('T')[0];
      return aptDate === dateStr;
    });
  }

  getAppointmentStatus(appointment: Appointment): string {
    // Determinar el estado individual de una cita
    if (appointment.estadoFisio === 'CanceladaFisio' || appointment.estadoPaciente === 'CanceladaPaciente') {
      return 'canceled';
    }
    if (appointment.estadoFisio === 'Cobrado') {
      return 'completed';
    }
    if (appointment.estadoFisio === 'CobroPendiente') {
      return 'pending-payment';
    }
    if (appointment.estadoFisio === 'ConfirmadoFisio' && appointment.estadoPaciente === 'ConfirmadoPaciente') {
      return 'confirmed';
    }
    return 'pending';
  }

  getAppointmentTooltip(appointment: Appointment): string {
    const fecha = new Date(appointment.fecha).toLocaleDateString('es-ES');
    const hora = new Date(appointment.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const status = this.getAppointmentStatus(appointment);
    const statusText = this.getStatusText(status);
    return `${fecha} ${hora} - ${statusText}`;
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'pending-payment':
        return 'Cobro Pendiente';
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'canceled':
        return 'Cancelada';
      default:
        return '';
    }
  }

  previousMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }

  getMonthYear(): string {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
  }

  getTotalAppointments(): number {
    return this.patientData?.appointments.length || 0;
  }

  getCompletedAppointments(): number {
    return this.patientData?.appointments.filter((apt: Appointment) => apt.estadoFisio === 'Cobrado').length || 0;
  }

  getPendingPaymentAppointments(): number {
    return this.patientData?.appointments.filter((apt: Appointment) => apt.estadoFisio === 'CobroPendiente').length || 0;
  }

  getPendingAppointments(): number {
    return this.patientData?.appointments.filter((apt: Appointment) => 
      apt.estadoFisio !== 'Cobrado' && 
      apt.estadoFisio !== 'CobroPendiente' &&
      apt.estadoFisio !== 'CanceladaFisio' && 
      apt.estadoPaciente !== 'CanceladaPaciente'
    ).length || 0;
  }

  getCanceledAppointments(): number {
    return this.patientData?.appointments.filter((apt: Appointment) => 
      apt.estadoFisio === 'CanceladaFisio' || apt.estadoPaciente === 'CanceladaPaciente'
    ).length || 0;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
