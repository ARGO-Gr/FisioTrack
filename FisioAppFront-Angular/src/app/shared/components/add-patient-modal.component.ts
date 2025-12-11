import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime, switchMap, catchError } from 'rxjs/operators';
import { AppointmentService, PatientListItem } from '../services/appointment.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-add-patient-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
  ],
  template: `
    <div class="w-full max-w-4xl flex flex-col max-h-fit">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 pb-2 border-b border-border px-6 pt-6 flex-shrink-0">
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-foreground">Vincular Paciente</h2>
          <p class="text-sm text-muted-foreground mt-2">Selecciona un usuario registrado para vincularlo como paciente</p>
        </div>
        <button
          type="button"
          (click)="onCancel()"
          class="ml-4 p-0 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
          title="Cerrar"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content (No scrollbar) -->
      <div class="px-6 pt-0 pb-40">
        <form [formGroup]="patientForm" (ngSubmit)="onSubmit()" class="space-y-8">
          
          <!-- Buscar Usuario -->
          <div class="space-y-4">
            <label class="text-sm font-semibold text-foreground flex items-center gap-2">
              <mat-icon class="text-primary !size-5">person</mat-icon>
              Usuario *
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
                <div *ngIf="pacientes.length > 0; else noUsuarios">
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
                
                <ng-template #noUsuarios>
                  <div class="px-4 py-6 text-center">
                    <mat-icon class="text-muted-foreground !size-8 mb-2 block">person_off</mat-icon>
                    <p class="text-muted-foreground text-sm">No se encontraron usuarios</p>
                  </div>
                </ng-template>
              </div>
            </div>

            <!-- Usuario Seleccionado -->
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
              Debe seleccionar un usuario
            </div>
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
          [disabled]="!patientForm.valid || isSubmitting"
          (click)="onSubmit()"
          class="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          <mat-icon class="!size-4" *ngIf="isSubmitting">refresh</mat-icon>
          <span *ngIf="!isSubmitting">Vincular Paciente</span>
          <span *ngIf="isSubmitting">Vinculando...</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .mat-mdc-dialog-container {
        padding: 0 !important;
      }
    }
  `]
})
export class AddPatientModalComponent implements OnInit, OnDestroy {
  patientForm: FormGroup;
  isSubmitting = false;
  filteredPacientes$: Observable<PatientListItem[]>;
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();
  
  searchText = '';
  showDropdown = false;
  selectedPaciente: PatientListItem | null = null;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    public dialogRef: MatDialogRef<AddPatientModalComponent>
  ) {
    this.patientForm = this.fb.group({
      pacienteId: ['', Validators.required],
    });

    // Configurar búsqueda con debounce
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

  ngOnInit() {}

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchText = input.value;
    this.showDropdown = this.searchText.length > 0;
    this.searchSubject$.next(this.searchText);
  }

  selectPaciente(paciente: PatientListItem): void {
    this.selectedPaciente = paciente;
    this.searchText = paciente.nombre;
    this.showDropdown = false;
    this.patientForm.patchValue({ pacienteId: paciente.id });
    this.patientForm.get('pacienteId')?.markAsTouched();
  }

  clearSelection(): void {
    this.selectedPaciente = null;
    this.searchText = '';
    this.showDropdown = false;
    this.patientForm.patchValue({ pacienteId: '' });
    this.searchSubject$.next('');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.patientForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.patientForm.valid && this.selectedPaciente) {
      this.isSubmitting = true;
      this.dialogRef.disableClose = true;
      
      setTimeout(() => {
        this.dialogRef.close({
          pacienteId: this.selectedPaciente!.id,
          paciente: this.selectedPaciente
        });
      }, 500);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
