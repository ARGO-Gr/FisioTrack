import { Component, OnInit, OnDestroy, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppointmentService, Appointment } from '@services/services/appointment.service';
import { PaymentService, Payment } from '@services/services/payment.service';
import { ToastService } from '@services/services/toast.service';
import { FollowupNotesModalComponent } from './followup-notes-modal.component';

export interface FollowupAppointment {
  [key: string]: any;
  statusPago: 'cobrado' | 'pendiente';
}

@Component({
  selector: 'app-patient-followup-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="w-full max-w-4xl flex flex-col max-h-[95vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-border px-6 pt-6 flex-shrink-0">
        <div class="flex-1">
          <h2 class="text-3xl font-bold text-foreground">Seguimiento de {{ pacienteName }}</h2>
          <p class="text-sm text-muted-foreground mt-2">Historial de citas cobradas o con cobro pendiente</p>
        </div>
        <button
          type="button"
          (click)="onClose()"
          class="ml-4 p-0 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
          title="Cerrar"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content (Scrollable) -->
      <div class="overflow-y-auto flex-1 px-6 pb-6">
        <div *ngIf="loading" class="flex items-center justify-center h-64">
          <div class="text-center">
            <mat-spinner diameter="40" class="mx-auto mb-4"></mat-spinner>
            <p class="text-muted-foreground">Cargando citas...</p>
          </div>
        </div>

        <div *ngIf="!loading && appointments.length === 0" class="text-center py-12">
          <mat-icon class="text-muted-foreground mx-auto mb-4 opacity-50 text-5xl">event_note</mat-icon>
          <p class="text-muted-foreground">No hay citas cobradas o con cobro pendiente</p>
        </div>

        <div *ngIf="!loading && appointments.length > 0" class="space-y-3">
          <div
            *ngFor="let appointment of appointments"
            class="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <!-- Date and Type -->
                <div class="flex items-center gap-3 mb-2">
                  <mat-icon class="text-muted-foreground">calendar_today</mat-icon>
                  <div>
                    <h4 class="font-semibold text-foreground">{{ formatDate(getAppointmentDate(appointment)) }}</h4>
                    <p class="text-sm text-muted-foreground">{{ getAppointmentTime(appointment) }}</p>
                  </div>
                </div>

                <!-- Type and Payment Status -->
                <div class="flex items-center gap-2 mt-3 flex-wrap">
                  <span class="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-600 text-xs font-medium">
                    {{ getAppointmentType(appointment) }}
                  </span>
                  <span
                    [ngClass]="appointment.statusPago === 'cobrado'
                      ? 'bg-green-500/20 text-green-600'
                      : 'bg-yellow-500/20 text-yellow-600'"
                    class="inline-block px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {{ appointment.statusPago === 'cobrado' ? 'Cobrado' : 'Cobro Pendiente' }}
                  </span>
                </div>
              </div>

              <!-- Notes Button -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  (click)="openNotesModal(appointment)"
                  title="Agregar o editar notas de seguimiento"
                  class="p-3 rounded-lg border border-border text-foreground bg-background hover:bg-muted transition-colors flex items-center justify-center"
                >
                  <mat-icon>note_add</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with Close Button -->
      <div class="flex gap-3 px-6 pb-6 border-t border-border flex-shrink-0 pt-6">
        <button
          type="button"
          (click)="onClose()"
          class="flex-1 px-4 py-3 rounded-lg border border-border text-foreground bg-background hover:bg-muted transition-colors font-medium"
        >
          Cerrar
        </button>
      </div>
    </div>
  `,
})
export class PatientFollowupModalComponent implements OnInit, OnDestroy {
  pacienteName: string;
  pacienteId: string;
  appointments: FollowupAppointment[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  private appointmentService: AppointmentService = inject(AppointmentService);
  private paymentService: PaymentService = inject(PaymentService);
  private toastService: ToastService = inject(ToastService);
  private dialog: MatDialog = inject(MatDialog);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { pacienteId: string; nombrePaciente: string },
    private dialogRef: MatDialogRef<PatientFollowupModalComponent>
  ) {
    this.pacienteId = data.pacienteId;
    this.pacienteName = data.nombrePaciente;
  }

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.appointmentService
      .getAppointmentsByPatient(this.pacienteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointments: Appointment[]) => {
          console.log('📋 Total appointments loaded:', appointments.length);
          console.log('📋 Appointments:', appointments);

          // Cargar información de pago para TODAS las citas (sin filtrar por estado)
          const appointmentPromises = appointments.map((apt: Appointment) =>
            this.paymentService
              .getPaymentByAppointmentId(apt.id)
              .pipe(takeUntil(this.destroy$))
              .toPromise()
              .then((payment: any) => {
                console.log(`💳 Payment info for ${apt.id}:`, payment);
                return {
                  ...apt,
                  paymentInfo: payment,
                  statusPago: (payment?.isPendingPayment ? 'pendiente' : 'cobrado') as 'cobrado' | 'pendiente'
                };
              })
              .catch((error: any) => {
                console.warn(`⚠️ No payment info for ${apt.id}:`, error.message);
                return {
                  ...apt,
                  paymentInfo: undefined,
                  statusPago: 'pendiente' as const
                };
              })
          );

          Promise.all(appointmentPromises).then((result: FollowupAppointment[]) => {
            console.log('✅ All appointments with payment info:', result);
            // Filtrar solo citas que tienen información de pago
            this.appointments = result.filter(apt => apt['paymentInfo'] !== undefined);
            console.log('📊 Filtered appointments with payment info:', this.appointments.length);
            this.loading = false;
          });
        },
        error: (error: any) => {
          console.error('❌ Error loading appointments:', error);
          this.toastService.error('Error al cargar las citas');
          this.loading = false;
        },
      });
  }

  formatDate(fecha: string): string {
    const [year, month, day] = fecha.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  getAppointmentDate(apt: any): string {
    return apt?.fecha || '';
  }

  getAppointmentTime(apt: any): string {
    return apt?.hora || '';
  }

  getAppointmentType(apt: any): string {
    return apt?.tipo || '';
  }

  openNotesModal(appointment: FollowupAppointment) {
    const dialogRef = this.dialog.open(FollowupNotesModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        appointmentId: (appointment as any).id,
        appointmentDate: (appointment as any).fecha,
        appointmentTime: (appointment as any).hora,
        appointmentType: (appointment as any).tipo,
        pacienteName: this.pacienteName,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.toastService.success(result.message || 'Nota actualizada correctamente');
      }
    });
  }

  onClose() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
