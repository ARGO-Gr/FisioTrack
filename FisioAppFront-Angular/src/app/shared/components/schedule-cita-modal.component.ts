import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime, switchMap, startWith, catchError } from 'rxjs/operators';
import { AppointmentService, PatientListItem } from '../services/appointment.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-schedule-cita-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
  ],
  template: `
    <div class="w-full max-w-2xl flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8 pb-6 border-b border-border px-6 pt-6 flex-shrink-0">
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-foreground">{{ isEditMode ? 'Editar Cita' : 'Programar Cita' }}</h2>
          <p class="text-sm text-muted-foreground mt-2">Completa los datos para programar una nueva cita</p>
        </div>
        <button
          type="button"
          (click)="onCancel()"
          class="ml-4 p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
          title="Cerrar"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="overflow-y-auto flex-1 px-6">
        <form [formGroup]="citaForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Buscar Paciente -->
        <div class="space-y-3">
          <label class="text-sm font-semibold text-foreground flex items-center gap-2">
            <mat-icon class="text-primary !size-5">person</mat-icon>
            Paciente *
          </label>
          
          <!-- Input de Búsqueda -->
          <div class="relative">
            <input
              type="text"
              [value]="searchText"
              (input)="onSearchInput($event)"
              placeholder="Busca por nombre o email..."
              class="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <mat-icon class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none !size-5">search</mat-icon>
            
            <!-- Listado de Resultados -->
            <div 
              *ngIf="showDropdown && (filteredPacientes$ | async) as pacientes"
              class="absolute top-full left-0 right-0 mt-2 border border-input rounded-lg bg-card shadow-lg z-50 max-h-64 overflow-y-auto"
            >
              <div *ngIf="pacientes.length > 0; else noPacientes">
                <button
                  *ngFor="let paciente of pacientes"
                  type="button"
                  (click)="selectPaciente(paciente)"
                  class="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0 flex items-center gap-3 group"
                >
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <mat-icon class="text-primary !size-5">person_outline</mat-icon>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-foreground truncate">{{ paciente.nombre }}</p>
                    <p class="text-sm text-muted-foreground truncate">{{ paciente.email }}</p>
                  </div>
                </button>
              </div>
              
              <ng-template #noPacientes>
                <div class="px-4 py-6 text-center">
                  <mat-icon class="text-muted-foreground !size-8 mb-2 block">person_off</mat-icon>
                  <p class="text-muted-foreground text-sm">No se encontraron pacientes</p>
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Paciente Seleccionado -->
          <div *ngIf="selectedPaciente" class="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <mat-icon class="text-primary !size-4">check_circle</mat-icon>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-foreground text-sm truncate">{{ selectedPaciente.nombre }}</p>
              <p class="text-xs text-muted-foreground truncate">{{ selectedPaciente.email }}</p>
            </div>
            <button
              type="button"
              (click)="clearSelection()"
              class="p-1 hover:bg-primary/10 rounded transition-colors"
              title="Limpiar selección"
            >
              <mat-icon class="text-muted-foreground !size-5 hover:text-foreground transition-colors">close</mat-icon>
            </button>
          </div>

          <input
            type="hidden"
            formControlName="pacienteId"
            [value]="selectedPaciente?.id || ''"
          />
          
          <div *ngIf="isFieldInvalid('pacienteId')" class="text-sm text-destructive flex items-center gap-1 mt-2">
            <mat-icon class="!size-4">error</mat-icon>
            Debe seleccionar un paciente
          </div>
        </div>

        <!-- Fecha y Hora -->
        <div class="space-y-3">
          <label class="text-sm font-semibold text-foreground flex items-center gap-2">
            <mat-icon class="text-primary !size-5">schedule</mat-icon>
            Fecha y Hora *
          </label>
          <div class="grid grid-cols-2 gap-4">
            <!-- Fecha -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-muted-foreground">Fecha</label>
              <input
                type="date"
                formControlName="fecha"
                [min]="minDate"
                class="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <!-- Hora -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-muted-foreground">Hora</label>
              <select
                formControlName="hora"
                class="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Selecciona hora</option>
                <option *ngFor="let hour of availableHours" [value]="hour">
                  {{ hour }}
                </option>
              </select>
            </div>
          </div>
          <div *ngIf="isFieldInvalid('fecha') || isFieldInvalid('hora')" class="text-sm text-destructive flex items-center gap-1 mt-2">
            <mat-icon class="!size-4">error</mat-icon>
            <span *ngIf="isFieldInvalid('fecha')">La fecha es requerida</span>
            <span *ngIf="isFieldInvalid('hora')">La hora es requerida</span>
          </div>
        </div>

        <!-- Tipo de Cita -->
        <div class="space-y-3">
          <label class="text-sm font-semibold text-foreground flex items-center gap-2">
            <mat-icon class="text-primary !size-5">category</mat-icon>
            Tipo de Cita *
          </label>
          <select
            formControlName="tipo"
            class="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled>Selecciona un tipo de cita</option>
            <option *ngFor="let type of appointmentTypes" [value]="type.value">
              {{ type.label }}
            </option>
          </select>
          <div *ngIf="isFieldInvalid('tipo')" class="text-sm text-destructive flex items-center gap-1 mt-2">
            <mat-icon class="!size-4">error</mat-icon>
            Debe seleccionar un tipo de cita
          </div>
        </div>

        <!-- Descripción -->
        <div class="space-y-3">
          <label class="text-sm font-semibold text-foreground flex items-center gap-2">
            <mat-icon class="text-primary !size-5">description</mat-icon>
            Descripción (opcional)
          </label>
          <textarea
            formControlName="descripcion"
            placeholder="Notas adicionales sobre la cita..."
            class="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-24 resize-none"
          ></textarea>
        </div>
      </form>
      </div>

      <!-- Footer with Buttons (Fixed) -->
      <div class="flex gap-3 px-6 pb-6 border-t border-border flex-shrink-0 pt-6">
        <button
          type="button"
          (click)="onCancel()"
          [disabled]="isSubmitting"
          class="flex-1 px-4 py-3 rounded-lg border border-border text-foreground bg-background hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          [disabled]="!citaForm.valid || isSubmitting"
          (click)="onSubmit()"
          class="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          <mat-icon class="!size-4" *ngIf="isSubmitting">refresh</mat-icon>
          <span *ngIf="!isSubmitting">{{ isEditMode ? 'Guardar Cambios' : 'Programar Cita' }}</span>
          <span *ngIf="isSubmitting">{{ isEditMode ? 'Guardando...' : 'Programando...' }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .mat-mdc-form-field {
        width: 100%;
      }

      .mat-mdc-form-field-appearance-outline .mat-mdc-form-field-focus-overlay {
        background-color: transparent;
      }

      .mat-mdc-option {
        font-size: 0.875rem;
      }

      .mat-mdc-dialog-container {
        padding: 0 !important;
      }
    }

    select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      padding-right: 2.5rem;
    }

    select:focus {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236366F1' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
    }
  `]
})
export class ScheduleCitaModalComponent implements OnInit, OnDestroy {
  citaForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  filteredPacientes$: Observable<PatientListItem[]>;
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();
  
  searchText = '';
  showDropdown = false;
  selectedPaciente: PatientListItem | null = null;
  minDate: string;
  
  // Horas disponibles de 8:00 a 17:00
  availableHours = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];
  
  // Tipos de cita disponibles
  appointmentTypes = [
    { value: 'EvaluacionInicial', label: 'Evaluación Inicial' },
    { value: 'Seguimiento', label: 'Seguimiento' },
    { value: 'ControlMensual', label: 'Control Mensual' },
    { value: 'Rehabilitacion', label: 'Rehabilitación' },
    { value: 'TerapiaManual', label: 'Terapia Manual' },
    { value: 'Electroterapia', label: 'Electroterapia' }
  ];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    public dialogRef: MatDialogRef<ScheduleCitaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.minDate = this.getMinDate();
    
    this.citaForm = this.fb.group({
      pacienteId: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      descripcion: [''],
      tipo: ['EvaluacionInicial', Validators.required],
    });

    // Configurar búsqueda con debounce y switchMap a la API
    this.filteredPacientes$ = this.searchSubject$.pipe(
      debounceTime(300),
      switchMap(search => {
        if (!search || search.length < 1) {
          return of([]);
        }
        return this.appointmentService.searchPatients(search).pipe(
          catchError(error => {
            console.error('Error searching patients:', error);
            return of([]);
          })
        );
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnInit() {
    if (this.data?.fecha && this.data?.hora) {
      this.citaForm.patchValue({ 
        fecha: this.data.fecha,
        hora: this.data.hora
      });
    }

    if (this.data?.cita) {
      this.isEditMode = true;
      this.citaForm.patchValue({
        pacienteId: this.data.cita.pacienteId,
        fecha: this.data.cita.fecha,
        hora: this.data.cita.hora,
        descripcion: this.data.cita.descripcion,
        tipo: this.data.cita.tipo || 'EvaluacionInicial',
      });
      
      // Precargar el paciente seleccionado en modo edición
      if (this.data.cita.pacienteId) {
        this.selectedPaciente = {
          id: this.data.cita.pacienteId,
          nombre: this.data.cita.nombrePaciente || 'Paciente',
          email: this.data.cita.emailPaciente || '',
        };
        this.searchText = this.selectedPaciente.nombre;
      }
    }

    // Prevenir cierre al hacer clic fuera mientras se está guardando
    this.citaForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.dialogRef.disableClose = this.isSubmitting;
      });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchText = input.value;
    this.showDropdown = this.searchText.length > 0;
    
    // Emitir el término de búsqueda al subject para que se procese con debounce
    this.searchSubject$.next(this.searchText);
  }

  selectPaciente(paciente: PatientListItem): void {
    this.selectedPaciente = paciente;
    this.searchText = paciente.nombre;
    this.showDropdown = false;
    this.citaForm.patchValue({ pacienteId: paciente.id });
    this.citaForm.get('pacienteId')?.markAsTouched();
  }

  clearSelection(): void {
    this.selectedPaciente = null;
    this.searchText = '';
    this.showDropdown = false;
    this.citaForm.patchValue({ pacienteId: '' });
    this.searchSubject$.next('');
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.citaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.citaForm.valid) {
      this.isSubmitting = true;
      this.dialogRef.disableClose = true;
      
      const formValue = this.citaForm.value;
      
      // Simular delay de envío
      setTimeout(() => {
        this.dialogRef.close({
          pacienteId: formValue.pacienteId,
          fecha: formValue.fecha,
          hora: formValue.hora,
          descripcion: formValue.descripcion,
          tipo: formValue.tipo,
        });
      }, 500);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

