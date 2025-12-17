import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../components/ui/card.component';
import { AuthService } from '../../services/auth.service';
import { AppointmentService, Appointment } from '../../services/appointment.service';
import { CalendarModalComponent } from '../calendar-modal.component';
import { MonthPickerModalComponent } from '../month-picker-modal.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-resumen-citas-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <div [class]="pestanaActiva === 'mes' ? 'p-6 pb-2' : 'p-6'">
      <!-- Tabs -->
      <div class="flex gap-4 mb-1 border-b border-border">
        <button
          (click)="cambiarPestana('dia')"
          [class.border-b-2]="pestanaActiva === 'dia'"
          [class.border-primary]="pestanaActiva === 'dia'"
          class="pb-2 px-4 font-semibold transition-all"
          [ngClass]="pestanaActiva === 'dia' ? 'text-primary' : 'text-muted-foreground'"
        >
          Día
        </button>
        <button
          (click)="cambiarPestana('mes')"
          [class.border-b-2]="pestanaActiva === 'mes'"
          [class.border-primary]="pestanaActiva === 'mes'"
          class="pb-2 px-4 font-semibold transition-all"
          [ngClass]="pestanaActiva === 'mes' ? 'text-primary' : 'text-muted-foreground'"
        >
          Mes
        </button>
      </div>

      <h2 class="text-2xl font-bold mb-2 text-foreground">Resumen del {{ pestanaActiva === 'dia' ? 'Día' : 'Mes' }}</h2>
      
      <!-- Date/Month Selector -->
      <div class="flex justify-center mb-2">
        <button
          (click)="abrirSelectorFecha()"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
        >
          <mat-icon>calendar_today</mat-icon>
          <span *ngIf="pestanaActiva === 'dia'" class="text-sm font-medium">
            {{ fechaSeleccionada | date: 'dd MMMM yyyy' }}
          </span>
          <span *ngIf="pestanaActiva === 'mes'" class="text-sm font-medium">
            {{ fechaSeleccionada | date: 'MMMM yyyy' }}
          </span>
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-2 mb-4">
        <div class="flex items-center justify-between p-2 rounded-lg bg-muted/50">
          <span class="text-xs text-muted-foreground">Total</span>
          <span class="text-lg font-bold text-foreground">{{ totalCitasFiltradas }}</span>
        </div>
        
        <div class="flex items-center justify-between p-2 rounded-lg bg-yellow-100 border border-yellow-300">
          <span class="text-xs text-muted-foreground">Pendientes</span>
          <span class="text-lg font-bold text-yellow-700">{{ amarillasFiltradas }}</span>
        </div>
        
        <div class="flex items-center justify-between p-2 rounded-lg bg-blue-100 border border-blue-300">
          <span class="text-xs text-muted-foreground">Confirmadas</span>
          <span class="text-lg font-bold text-blue-700">{{ azulesFiltradas }}</span>
        </div>
        
        <div class="flex items-center justify-between p-2 rounded-lg bg-green-100 border border-green-300">
          <span class="text-xs text-muted-foreground">Cobradas</span>
          <span class="text-lg font-bold text-green-700">{{ verdesFiltradas }}</span>
        </div>
        
        <div class="flex items-center justify-between p-2 rounded-lg bg-orange-100 border border-orange-300">
          <span class="text-xs text-muted-foreground">Cobro Pendiente</span>
          <span class="text-lg font-bold text-orange-700">{{ naranjasFiltradas }}</span>
        </div>
        
        <div class="flex items-center justify-between p-2 rounded-lg bg-red-100 border border-red-300">
          <span class="text-xs text-muted-foreground">Canceladas</span>
          <span class="text-lg font-bold text-red-700">{{ rojasFiltradas }}</span>
        </div>
      </div>

      <!-- Calendario del Mes (solo visible en pestaña mes) -->
      <div *ngIf="pestanaActiva === 'mes'">
        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div class="text-center font-semibold text-xs text-muted-foreground p-1">Lun</div>
          <div class="text-center font-semibold text-xs text-muted-foreground p-1">Mar</div>
          <div class="text-center font-semibold text-xs text-muted-foreground p-1">Mié</div>
          <div class="text-center font-semibold text-xs text-muted-foreground p-1">Jue</div>
          <div class="text-center font-semibold text-xs text-muted-foreground p-1">Vie</div>
          <div class="text-center font-semibold text-xs text-muted-foreground p-1">Sab</div>
          <div class="text-center font-semibold text-xs text-muted-foreground p-1">Dom</div>
        </div>

        <!-- Calendar Days -->
        <div class="grid grid-cols-7 gap-1">
          <div *ngFor="let day of calendarDays" class="day-cell">
            <div
              *ngIf="day"
              class="w-full h-12 rounded border bg-white border-gray-300 flex flex-col items-center justify-center transition-all text-xs"
            >
              <span class="font-semibold text-foreground text-xs">{{ day.getDate() }}</span>
              <!-- Dots for appointments -->
              <div *ngIf="getAppointmentsForDate(day).length > 0" class="flex gap-0.5 mt-0.5 flex-wrap justify-center px-0.5">
                <div
                  *ngFor="let appointment of getAppointmentsForDate(day)"
                  [class]="'w-1.5 h-1.5 rounded-full ' +
                    (getAppointmentStatus(appointment) === 'completed' ? 'bg-green-500' : '') +
                    (getAppointmentStatus(appointment) === 'confirmed' ? 'bg-blue-500' : '') +
                    (getAppointmentStatus(appointment) === 'pending-payment' ? 'bg-orange-500' : '') +
                    (getAppointmentStatus(appointment) === 'pending' ? 'bg-yellow-500' : '') +
                    (getAppointmentStatus(appointment) === 'canceled' ? 'bg-red-500' : '')"
                ></div>
              </div>
            </div>
            <div *ngIf="!day" class="w-full h-12 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ResumenCitasModalComponent implements OnInit, OnDestroy {
  pestanaActiva: 'dia' | 'mes' = 'dia';
  fechaSeleccionada: Date = new Date();
  
  totalCitasFiltradas = 0;
  amarillasFiltradas = 0;
  azulesFiltradas = 0;
  verdesFiltradas = 0;
  naranjasFiltradas = 0;
  rojasFiltradas = 0;

  todasLasCitas: Appointment[] = [];
  cargando = false;
  fisioterapeutaId: string = '';
  calendarDays: (Date | null)[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ResumenCitasModalComponent>
  ) {
    this.fisioterapeutaId = this.authService.getUserId() || '';
    // No precargamos datos, se cargan cuando se selecciona una fecha
  }

  ngOnInit(): void {
    // Cargar citas del día actual al abrir el modal
    this.cargarCitasDelDia();
  }

  cambiarPestana(pestana: 'dia' | 'mes'): void {
    this.pestanaActiva = pestana;
    // Cargar datos del día o mes actual cuando se cambia de pestaña
    if (pestana === 'dia') {
      this.cargarCitasDelDia();
    } else {
      this.cargarCitasDelMes();
    }
  }

  abrirSelectorFecha(): void {
    if (this.pestanaActiva === 'dia') {
      const dialogRef = this.dialog.open(CalendarModalComponent, {
        width: '400px',
        data: { selectedDate: this.fechaSeleccionada },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.fechaSeleccionada = new Date(result);
          this.cargarCitasDelDia();
        }
      });
    } else {
      const dialogRef = this.dialog.open(MonthPickerModalComponent, {
        width: '400px',
        data: { selectedDate: this.fechaSeleccionada },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.fechaSeleccionada = new Date(result);
          this.cargarCitasDelMes();
        }
      });
    }
  }

  cargarCitasDelDia(): void {
    if (!this.fisioterapeutaId) {
      console.error('No fisioterapeuta ID available');
      return;
    }

    this.cargando = true;
    const fechaStr = this.getFormattedDate(this.fechaSeleccionada);
    console.log('📅 Cargando citas del día:', fechaStr);

    this.appointmentService.getAppointmentsByDay(this.fisioterapeutaId, fechaStr)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (citas: Appointment[]) => {
          this.todasLasCitas = citas;
          console.log('✓ Citas cargadas:', citas.length);
          this.calcularEstadisticas();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error cargando citas:', error);
          this.todasLasCitas = [];
          this.calcularEstadisticas();
          this.cargando = false;
        }
      });
  }

  cargarCitasDelMes(): void {
    if (!this.fisioterapeutaId) {
      console.error('No fisioterapeuta ID available');
      return;
    }

    this.cargando = true;
    const ano = this.fechaSeleccionada.getFullYear();
    const mes = this.fechaSeleccionada.getMonth();
    const primerDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    
    const fechaInicio = this.getFormattedDate(primerDia);
    const fechaFin = this.getFormattedDate(ultimoDia);
    console.log('📅 Cargando citas del mes:', { fechaInicio, fechaFin });

    this.appointmentService.getAppointmentsByDateRange(this.fisioterapeutaId, fechaInicio, fechaFin)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (citas: Appointment[]) => {
          this.todasLasCitas = citas;
          console.log('✓ Citas del mes cargadas:', citas.length);
          this.calcularEstadisticas();
          this.generarCalendario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error cargando citas del mes:', error);
          this.todasLasCitas = [];
          this.calcularEstadisticas();
          this.generarCalendario();
          this.cargando = false;
        }
      });
  }

  calcularEstadisticas(): void {
    let citasFiltradas: Appointment[] = this.todasLasCitas;

    // Calcular conteos
    this.totalCitasFiltradas = citasFiltradas.length;
    this.amarillasFiltradas = citasFiltradas.filter(c => this.isEstadoPendiente(c)).length;
    this.azulesFiltradas = citasFiltradas.filter(c => this.isEstadoConfirmada(c)).length;
    this.verdesFiltradas = citasFiltradas.filter(c => this.isEstadoCobrada(c)).length;
    this.naranjasFiltradas = citasFiltradas.filter(c => this.isEstadoCobroPendiente(c)).length;
    this.rojasFiltradas = citasFiltradas.filter(c => this.isEstadoCancelada(c)).length;

    console.log('📊 Estadísticas calculadas:', {
      total: this.totalCitasFiltradas,
      pendientes: this.amarillasFiltradas,
      confirmadas: this.azulesFiltradas,
      cobradas: this.verdesFiltradas,
      cobroPendiente: this.naranjasFiltradas,
      canceladas: this.rojasFiltradas
    });
  }

  getFormattedDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isEstadoCobrada(cita: Appointment): boolean {
    return cita.estadoFisio?.toLowerCase() === 'cobrado';
  }

  isEstadoCobroPendiente(cita: Appointment): boolean {
    return cita.estadoFisio?.toLowerCase() === 'cobropendiente';
  }

  isEstadoCancelada(cita: Appointment): boolean {
    const estadoFisio = cita.estadoFisio?.toLowerCase();
    const estadoPaciente = cita.estadoPaciente?.toLowerCase();
    return estadoFisio === 'canceladafisio' || estadoPaciente === 'canceladapaciente';
  }

  isEstadoConfirmada(cita: Appointment): boolean {
    const estadoFisio = cita.estadoFisio?.toLowerCase();
    const estadoPaciente = cita.estadoPaciente?.toLowerCase();
    return estadoFisio === 'confirmadofisio' && estadoPaciente === 'confirmadopaciente';
  }

  isEstadoPendiente(cita: Appointment): boolean {
    return !this.isEstadoCobrada(cita) && 
           !this.isEstadoCobroPendiente(cita) &&
           !this.isEstadoCancelada(cita) && 
           !this.isEstadoConfirmada(cita);
  }

  getCitaColor(cita: Appointment): string {
    if (this.isEstadoCobrada(cita)) {
      return 'bg-green-100 border-green-300';
    }

    if (this.isEstadoCobroPendiente(cita)) {
      return 'bg-orange-100 border-orange-300';
    }

    if (this.isEstadoCancelada(cita)) {
      return 'bg-red-100 border-red-300';
    }

    if (this.isEstadoConfirmada(cita)) {
      return 'bg-blue-100 border-blue-300';
    }

    return 'bg-yellow-100 border-yellow-300';
  }

  generarCalendario(): void {
    this.calendarDays = [];
    const year = this.fechaSeleccionada.getFullYear();
    const month = this.fechaSeleccionada.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    // Ajustar al lunes (0 = domingo, 1 = lunes)
    const dayOfWeek = startDate.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(startDate.getDate() + diff);

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
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return this.todasLasCitas.filter(apt => {
      const aptDate = new Date(apt.fecha).toISOString().split('T')[0];
      return aptDate === dateStr;
    });
  }

  getAppointmentStatus(appointment: Appointment): string {
    if (appointment.estadoFisio === 'Cobrado') {
      return 'completed';
    }
    if (appointment.estadoFisio === 'CobroPendiente') {
      return 'pending-payment';
    }
    if (appointment.estadoFisio === 'CanceladaFisio' || appointment.estadoPaciente === 'CanceladaPaciente') {
      return 'canceled';
    }
    if (appointment.estadoFisio === 'ConfirmadoFisio' && appointment.estadoPaciente === 'ConfirmadoPaciente') {
      return 'confirmed';
    }
    return 'pending';
  }

  cerrarDialog(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
