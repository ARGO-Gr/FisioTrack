import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../../components/ui/card.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProgramaService, ProgramaDetalleDto } from '../../../../shared/services/programa.service';

interface PatientProgressData {
  pacienteId: string;
  nombre: string;
  programStartDate: string;
  programEndDate: string;
  completedDays: string[];
  restDays: string[];
  incumplimientoDays: string[];
  pendingDays: string[];
  appointments: string[];
}

export interface PatientProgressModalData {
  pacienteId: string;
  nombrePaciente: string;
}

@Component({
  selector: 'app-patient-progress-modal',
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
  template: `
    <div class="max-h-[calc(100vh-3rem)] overflow-y-auto p-6 m-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">Progreso del Paciente</h2>
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
            <mat-icon class="text-primary text-">refresh</mat-icon>
          </div>
          <p class="text-muted-foreground">Cargando progreso del paciente...</p>
        </div>
      </div>

      <!-- No Program State -->
      <div *ngIf="!loading && !programaActivo" class="flex items-center justify-center py-12">
        <app-card class="max-w-md w-full">
          <app-card-content class="p-12 text-center">
            <mat-icon class="text-muted-foreground mx-auto mb-4 opacity-50 ">inbox</mat-icon>
            <h3 class="text-xl font-semibold mb-2">Sin programa activo</h3>
            <p class="text-muted-foreground">Este paciente no tiene un programa de rehabilitación activo.</p>
          </app-card-content>
        </app-card>
      </div>

      <!-- Patient Progress Card -->
      <div *ngIf="!loading && programaActivo">
        <app-card *ngIf="patientData">
          <app-card-header>
            <div class="flex items-center justify-between">
              <div>
                <app-card-title class="text-3xl mb-2">Progreso de {{ patientData.nombre }}</app-card-title>
                <p class="text-muted-foreground">
                  Período: {{ patientData.programStartDate | date: 'dd/MM/yyyy' }} -
                  {{ patientData.programEndDate | date: 'dd/MM/yyyy' }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-4xl font-bold text-primary">{{ getCompletionPercentage() }}%</p>
                <p class="text-sm text-muted-foreground">Completado</p>
              </div>
            </div>
          </app-card-header>

          <app-card-content class="">
            <!-- Stats -->
            <div class="grid grid-cols-4 gap-4">
              <div class="p-4 rounded-lg bg-green-50 border-2 border-green-500">
                <div class="flex items-center gap-3">
                  <mat-icon class="text-green-600 ">check_circle</mat-icon>
                  <div>
                    <p class="text-sm text-green-700">Días Completados</p>
                    <p class="text-2xl font-bold text-green-800">{{ programaActivo.diasCompletados || 0 }}</p>
                  </div>
                </div>
              </div>

              <div class="p-4 rounded-lg bg-blue-50 border-2 border-blue-500">
                <div class="flex items-center gap-3">
                  <mat-icon class="text-blue-600">hotel</mat-icon>
                  <div>
                    <p class="text-sm text-blue-700">Días de Descanso</p>
                    <p class="text-2xl font-bold text-blue-800">{{ patientData.restDays.length }}</p>
                  </div>
                </div>
              </div>

              <div class="p-4 rounded-lg bg-red-50 border-2 border-red-500">
                <div class="flex items-center gap-3">
                  <mat-icon class="text-red-600">cancel</mat-icon>
                  <div>
                    <p class="text-sm text-red-700">Días Incumplidos</p>
                    <p class="text-2xl font-bold text-red-800">{{ patientData.incumplimientoDays.length }}</p>
                  </div>
                </div>
              </div>

              <div class="p-4 rounded-lg bg-orange-50 border-2 border-orange-500">
                <div class="flex items-center gap-3">
                  <mat-icon class="text-orange-600">pending_actions</mat-icon>
                  <div>
                    <p class="text-sm text-orange-700">Días Pendientes</p>
                    <p class="text-2xl font-bold text-orange-800">{{ getDiasPendientes() }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Calendar -->
            <div>
              <div class="flex items-center justify-between  mt-6">
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
                    [ngClass]="getDayStatus(day)"
                    class="day-cell"
                  >
                    <div
                      [class]="'w-full h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all cursor-pointer ' +
                        (getDayStatus(day) === 'completed' ? 'bg-green-100 border-green-500' : '') +
                        (getDayStatus(day) === 'rest' ? 'bg-blue-100 border-blue-500' : '') +
                        (getDayStatus(day) === 'incumplido' ? 'bg-red-100 border-red-500' : '') +
                        (getDayStatus(day) === 'pending' ? 'bg-orange-50 border-orange-400 hover:border-orange-600' : '') +
                        (getDayStatus(day) === 'empty' ? 'bg-gray-50 border-gray-300' : '')"
                    >
                      <span class="text-sm font-semibold text-foreground">{{ day.getDate() }}</span>
                      <mat-icon *ngIf="getDayStatus(day) === 'completed'" class="text-green-600 text-xs">check_circle</mat-icon>
                      <mat-icon *ngIf="getDayStatus(day) === 'incumplido'" class="text-red-600 text-xs">cancel</mat-icon>
                    </div>
                  </div>
                </ng-container>
              </div>

              <!-- Legend -->
              <div class="p-4 rounded-lg bg-muted/20 border border-border mt-5">
                <p class="text-sm font-semibold text-foreground mb-3">Leyenda</p>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-green-100 border-2 border-green-500"></div>
                    <span class="text-sm text-muted-foreground">Completado</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-blue-100 border-2 border-blue-500"></div>
                    <span class="text-sm text-muted-foreground">Descanso</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-red-100 border-2 border-red-500"></div>
                    <span class="text-sm text-muted-foreground">Incumplido</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-orange-50 border-2 border-orange-400"></div>
                    <span class="text-sm text-muted-foreground">Pendiente</span>
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
export class PatientProgressModalComponent implements OnInit, OnDestroy {
  patientData: PatientProgressData | null = null;
  calendarDays: (Date | null)[] = [];
  currentMonth: Date = new Date();
  loading = true;
  programaActivo: ProgramaDetalleDto | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PatientProgressModalData,
    public dialogRef: MatDialogRef<PatientProgressModalComponent>,
    private programaService: ProgramaService
  ) {}

  ngOnInit() {
    this.loadPatientProgress(this.data.pacienteId);
  }

  loadPatientProgress(pacienteId: string) {
    this.loading = true;
    this.programaService.obtenerProgramasPorPaciente(pacienteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (programas: ProgramaDetalleDto[]) => {
          const programaActivo = programas.find((p: ProgramaDetalleDto) => p.activo);
          if (programaActivo) {
            this.programaActivo = programaActivo;
            this.mapearProgramaACalendario(programaActivo);
          } else {
            this.loading = false;
          }
        },
        error: (error: any) => {
          console.error('Error al cargar progreso:', error);
          this.loading = false;
        }
      });
  }

  mapearProgramaACalendario(programa: ProgramaDetalleDto) {
    const completedDays: string[] = [];
    const restDays: string[] = [];
    const incumplimientoDays: string[] = [];
    const pendingDays: string[] = [];
    const fechaInicio = new Date(programa.fechaInicio);

    programa.semanas.forEach((semana: any, semanaIndex: number) => {
      semana.dias.forEach((dia: any, diaIndex: number) => {
        const diasDesdeInicio = (semanaIndex * 7) + diaIndex;
        const fechaDia = new Date(fechaInicio);
        fechaDia.setDate(fechaDia.getDate() + diasDesdeInicio);
        const fechaStr = fechaDia.toISOString().split('T')[0];

        if (dia.tipo === 'descanso') {
          restDays.push(fechaStr);
        } else if (dia.incumplimiento) {
          incumplimientoDays.push(fechaStr);
        } else if (dia.completado) {
          completedDays.push(fechaStr);
        } else if (dia.tipo === 'rutina') {
          pendingDays.push(fechaStr);
        }
      });
    });

    this.patientData = {
      pacienteId: programa.pacienteId,
      nombre: this.data.nombrePaciente,
      programStartDate: programa.fechaInicio.split('T')[0],
      programEndDate: programa.fechaFin.split('T')[0],
      completedDays: completedDays,
      restDays: restDays,
      incumplimientoDays: incumplimientoDays,
      pendingDays: pendingDays,
      appointments: []
    };

    this.generateCalendar();
    this.loading = false;
  }

  generateCalendar() {
    this.calendarDays = [];
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
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

  getDayStatus(date: Date | null): string {
    if (!date || !this.patientData) return '';
    const dateStr = date.toISOString().split('T')[0];

    if (this.patientData.completedDays.includes(dateStr)) return 'completed';
    if (this.patientData.restDays.includes(dateStr)) return 'rest';
    if (this.patientData.incumplimientoDays.includes(dateStr)) return 'incumplido';
    if (this.patientData.pendingDays.includes(dateStr)) return 'pending';
    
    return 'empty';
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

  getCompletionPercentage(): number {
    if (!this.programaActivo) return 0;
    const totalDias = this.programaActivo.diasTotales;
    const diasCompletados = this.programaActivo.diasCompletados;
    return totalDias > 0 ? Math.round((diasCompletados / totalDias) * 100) : 0;
  }

  getDiasPendientes(): number {
    if (!this.programaActivo) return 0;
    return this.programaActivo.diasTotales - this.programaActivo.diasCompletados;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
