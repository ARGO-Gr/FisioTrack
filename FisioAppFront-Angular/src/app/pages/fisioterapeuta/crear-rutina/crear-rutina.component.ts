import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../components/ui/index';
    import { InputComponent } from '../../../components/ui/input.component';
import { LabelComponent } from '../../../components/ui/label.component';
import { MatIconModule } from '@angular/material/icon';
import { InMemoryDatabaseService } from '../../../shared/in-memory-db/in-memory.service';

@Component({
  selector: 'app-crear-rutina',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    InputComponent,
    LabelComponent,
    MatIconModule,
  ],
  template: `
    <div class="min-h-screen bg-background">
      <header class="border-b border-border bg-card sticky top-0 z-50">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold">FisioTrack - Crear Rutina</h1>
            <a routerLink="/fisioterapeuta/dashboard" class="text-muted-foreground hover:text-foreground">
              <mat-icon>close</mat-icon>
            </a>
          </div>
        </div>
      </header>
      <main class="container mx-auto px-4 py-8 max-w-2xl">
        <h2 class="text-4xl font-bold mb-8">Crear Nueva Rutina</h2>
        <app-card>
          <app-card-header>
            <app-card-title>Detalles de la Rutina</app-card-title>
          </app-card-header>
          <app-card-content>
            <form [formGroup]="rutinaForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- Seleccionar Paciente -->
              <div class="space-y-2">
                <app-label for="paciente">Paciente *</app-label>
                <select
                  id="paciente"
                  formControlName="pacienteId"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccionar paciente...</option>
                  <option *ngFor="let paciente of (pacientes$ | async)" [value]="paciente.id">
                    {{ paciente.nombre }}
                  </option>
                </select>
                <div *ngIf="isFieldInvalid('pacienteId')" class="text-sm text-destructive">
                  Debe seleccionar un paciente
                </div>
              </div>

              <!-- Nombre de Rutina -->
              <div class="space-y-2">
                <app-label for="nombre">Nombre de la Rutina *</app-label>
                <app-input
                  id="nombre"
                  type="text"
                  placeholder="Ej: Rehabilitación de rodilla"
                  formControlName="nombre"
                />
                <div *ngIf="isFieldInvalid('nombre')" class="text-sm text-destructive">
                  <span *ngIf="rutinaForm.get('nombre')?.errors?.['required']">El nombre es requerido</span>
                  <span *ngIf="rutinaForm.get('nombre')?.errors?.['minlength']">Mínimo 3 caracteres</span>
                </div>
              </div>

              <!-- Descripción -->
              <div class="space-y-2">
                <app-label for="descripcion">Descripción *</app-label>
                <textarea
                  id="descripcion"
                  formControlName="descripcion"
                  placeholder="Describe los objetivos y detalles de la rutina"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-24"
                ></textarea>
                <div *ngIf="isFieldInvalid('descripcion')" class="text-sm text-destructive">
                  <span *ngIf="rutinaForm.get('descripcion')?.errors?.['required']">La descripción es requerida</span>
                  <span *ngIf="rutinaForm.get('descripcion')?.errors?.['minlength']">Mínimo 10 caracteres</span>
                </div>
              </div>

              <!-- Estado -->
              <div class="space-y-2">
                <app-label for="estado">Estado *</app-label>
                <select
                  id="estado"
                  formControlName="estado"
                  class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="activa">Activa</option>
                  <option value="pausada">Pausada</option>
                  <option value="completada">Completada</option>
                </select>
              </div>

              <!-- Botones -->
              <div class="flex gap-4 pt-4">
                <button
                  type="submit"
                  [disabled]="!rutinaForm.valid || isSubmitting"
                  class="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <span *ngIf="!isSubmitting">Crear Rutina</span>
                  <span *ngIf="isSubmitting">Guardando...</span>
                </button>
                <a
                  routerLink="/fisioterapeuta/dashboard"
                  class="flex-1 px-4 py-2 border border-input rounded-md text-center hover:bg-muted transition"
                >
                  Cancelar
                </a>
              </div>

              <!-- Mensaje de éxito -->
              <div
                *ngIf="successMessage"
                class="p-4 bg-green-50 border border-green-200 rounded-md text-green-700"
              >
                {{ successMessage }}
              </div>

              <!-- Mensaje de error -->
              <div
                *ngIf="errorMessage"
                class="p-4 bg-red-50 border border-red-200 rounded-md text-red-700"
              >
                {{ errorMessage }}
              </div>
            </form>
          </app-card-content>
        </app-card>
      </main>
    </div>
  `,
})
export class CrearRutinaComponent implements OnInit {
  rutinaForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private db: InMemoryDatabaseService,
  ) {
    this.rutinaForm = this.fb.group({
      pacienteId: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      estado: ['activa', Validators.required],
    });
  }

  ngOnInit(): void {}

  get pacientes$() {
    return this.db.getPacientes();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.rutinaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.rutinaForm.valid) {
      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';

      // Simulamos una operación de guardado con delay
      setTimeout(() => {
        try {
          const formValue = this.rutinaForm.value;
          console.log('Nueva rutina creada:', formValue);

          this.successMessage = `Rutina "${formValue.nombre}" creada exitosamente para el paciente seleccionado`;
          this.rutinaForm.reset({ estado: 'activa' });
          this.isSubmitting = false;

          // Limpiar mensaje después de 3 segundos
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } catch (error) {
          this.errorMessage = 'Error al crear la rutina. Intenta nuevamente.';
          this.isSubmitting = false;
        }
      }, 500);
    }
  }
}
