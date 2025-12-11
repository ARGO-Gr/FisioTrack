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
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    CalendarModalComponent,
    MonthPickerModalComponent,
  ],
  template: `
    <div class="p-6">
      <!-- Tabs -->
      <div class="flex gap-4 mb-6 border-b border-border">
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

      <h2 class="text-2xl font-bold mb-4 text-foreground">Resumen del {{ pestanaActiva === 'dia' ? 'Día' : 'Mes' }}</h2>
      
      <!-- Date/Month Selector -->
      <div class="flex justify-center mb-6">
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
      <div class="space-y-3 mb-6">
        <div class="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <span class="text-sm text-muted-foreground">Total de Citas</span>
          <span class="text-2xl font-bold text-foreground">{{ totalCitasFiltradas }}</span>
        </div>
        
        <div class="flex items-center justify-between p-4 rounded-lg bg-yellow-100 border-2 border-yellow-300">
          <span class="text-sm text-muted-foreground">Pendientes</span>
          <span class="text-2xl font-bold text-yellow-700">{{ amarillasFiltradas }}</span>
        </div>
        
        <div class="flex items-center justify-between p-4 rounded-lg bg-blue-100 border-2 border-blue-300">
          <span class="text-sm text-muted-foreground">Confirmadas</span>
          <span class="text-2xl font-bold text-blue-700">{{ azulesFiltradas }}</span>
        </div>
        
        <div class="flex items-center justify-between p-4 rounded-lg bg-green-100 border-2 border-green-300">
          <span class="text-sm text-muted-foreground">Cobradas</span>
          <span class="text-2xl font-bold text-green-700">{{ verdesFiltradas }}</span>
        </div>
        
        <div class="flex items-center justify-between p-4 rounded-lg bg-red-100 border-2 border-red-300">
          <span class="text-sm text-muted-foreground">Canceladas</span>
          <span class="text-2xl font-bold text-red-700">{{ rojasFiltradas }}</span>
        </div>
      </div>

      <!-- Close Button -->
      <button 
        (click)="cerrarDialog()"
        class="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg py-2 font-semibold transition-colors"
      >
        Cerrar
      </button>
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
  rojasFiltradas = 0;

  todasLasCitas: Appointment[] = [];
  cargando = false;
  fisioterapeutaId: string = '';
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
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error cargando citas del mes:', error);
          this.todasLasCitas = [];
          this.calcularEstadisticas();
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
    this.rojasFiltradas = citasFiltradas.filter(c => this.isEstadoCancelada(c)).length;

    console.log('📊 Estadísticas calculadas:', {
      total: this.totalCitasFiltradas,
      pendientes: this.amarillasFiltradas,
      confirmadas: this.azulesFiltradas,
      cobradas: this.verdesFiltradas,
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
           !this.isEstadoCancelada(cita) && 
           !this.isEstadoConfirmada(cita);
  }

  getCitaColor(cita: Appointment): string {
    if (this.isEstadoCobrada(cita)) {
      return 'bg-green-100 border-green-300';
    }

    if (this.isEstadoCancelada(cita)) {
      return 'bg-red-100 border-red-300';
    }

    if (this.isEstadoConfirmada(cita)) {
      return 'bg-blue-100 border-blue-300';
    }

    return 'bg-yellow-100 border-yellow-300';
  }

  cerrarDialog(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
