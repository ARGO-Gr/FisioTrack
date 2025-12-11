import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../components/ui/index';
    import { InputComponent } from '../../../components/ui/input.component';
import { LabelComponent } from '../../../components/ui/label.component';
import { MatIconModule } from '@angular/material/icon';
import { InMemoryDatabaseService } from '../../../shared/in-memory-db/in-memory.service';

@Component({
  selector: 'app-planificar-rutina',
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
            <h1 class="text-2xl font-bold">FisioTrack - Planificar Rutina</h1>
            <a routerLink="/fisioterapeuta/dashboard" class="text-muted-foreground hover:text-foreground">
              <mat-icon>close</mat-icon>
            </a>
          </div>
        </div>
      </header>
      <main class="container mx-auto px-4 py-8 max-w-4xl">
        <h2 class="text-4xl font-bold mb-8">Planificar Rutina con Ejercicios</h2>
        <app-card>
          <app-card-header>
            <app-card-title>Planificador de Rutinas</app-card-title>
          </app-card-header>
          <app-card-content>
            <form [formGroup]="planificacionForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- Información de la Rutina -->
              <div class="bg-muted/30 p-4 rounded-lg space-y-4">
                <h3 class="font-semibold">Información de la Rutina</h3>
                
                <div class="space-y-2">
                  <app-label for="rutinaId">Seleccionar Rutina *</app-label>
                  <select
                    id="rutinaId"
                    formControlName="rutinaId"
                    class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Seleccionar rutina...</option>
                    <option *ngFor="let rutina of (rutinas$ | async)" [value]="rutina.id">
                      {{ rutina.nombre }}
                    </option>
                  </select>
                  <div *ngIf="isFieldInvalid('rutinaId')" class="text-sm text-destructive">
                    Debe seleccionar una rutina
                  </div>
                </div>

                <div class="space-y-2">
                  <app-label for="duracionTotal">Duración Total (minutos) *</app-label>
                  <app-input
                    id="duracionTotal"
                    type="number"
                    placeholder="45"
                    formControlName="duracionTotal"
                    min="15"
                    step="5"
                  />
                  <div *ngIf="isFieldInvalid('duracionTotal')" class="text-sm text-destructive">
                    La duración es requerida (mínimo 15 minutos)
                  </div>
                </div>

                <div class="space-y-2">
                  <app-label for="frecuencia">Frecuencia Semanal *</app-label>
                  <select
                    id="frecuencia"
                    formControlName="frecuencia"
                    class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="1">1 vez por semana</option>
                    <option value="2">2 veces por semana</option>
                    <option value="3">3 veces por semana</option>
                    <option value="4">4 veces por semana</option>
                    <option value="5">5 veces por semana</option>
                    <option value="6">6 veces por semana</option>
                    <option value="7">Diariamente</option>
                  </select>
                </div>
              </div>

              <!-- Ejercicios -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold">Ejercicios a Incluir</h3>
                  <button
                    type="button"
                    (click)="agregarEjercicio()"
                    class="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
                  >
                    <mat-icon class="inline mr-1">add</mat-icon>
                    Agregar Ejercicio
                  </button>
                </div>

                <div formArrayName="ejercicios" class="space-y-4">
                  <div
                    *ngFor="let ejercicioGroup of ejercicios.controls; let i = index"
                    [formGroupName]="i"
                    class="bg-muted/20 p-4 rounded-lg space-y-4 border border-border"
                  >
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="font-medium">Ejercicio {{ i + 1 }}</h4>
                      <button
                        type="button"
                        (click)="removerEjercicio(i)"
                        class="text-destructive hover:text-destructive/80 transition"
                      >
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div class="space-y-2">
                        <app-label [htmlFor]="'nombre-' + i">Nombre del Ejercicio *</app-label>
                        <app-input
                          [id]="'nombre-' + i"
                          type="text"
                          placeholder="Ej: Flexiones de rodilla"
                          [formControlName]="'nombre'"
                        />
                      </div>

                      <div class="space-y-2">
                        <app-label [htmlFor]="'series-' + i">Series *</app-label>
                        <app-input
                          [id]="'series-' + i"
                          type="number"
                          placeholder="3"
                          [formControlName]="'series'"
                          min="1"
                          max="10"
                        />
                      </div>

                      <div class="space-y-2">
                        <app-label [htmlFor]="'repeticiones-' + i">Repeticiones *</app-label>
                        <app-input
                          [id]="'repeticiones-' + i"
                          type="number"
                          placeholder="15"
                          [formControlName]="'repeticiones'"
                          min="1"
                          max="50"
                        />
                      </div>

                      <div class="space-y-2">
                        <app-label [htmlFor]="'duracion-' + i">Duración (segundos)</app-label>
                        <app-input
                          [id]="'duracion-' + i"
                          type="number"
                          placeholder="30"
                          [formControlName]="'duracion'"
                          min="10"
                        />
                      </div>
                    </div>

                    <div class="space-y-2">
                      <app-label [htmlFor]="'descripcion-' + i">Descripción</app-label>
                      <textarea
                        [id]="'descripcion-' + i"
                        [formControlName]="'descripcion'"
                        placeholder="Descripción y notas del ejercicio"
                        class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-20"
                      ></textarea>
                    </div>
                  </div>

                  <div *ngIf="ejercicios.length === 0" class="text-center py-8 text-muted-foreground">
                    No hay ejercicios agregados. Haz clic en "Agregar Ejercicio" para comenzar.
                  </div>
                </div>
              </div>

              <!-- Botones -->
              <div class="flex gap-4 pt-4">
                <button
                  type="submit"
                  [disabled]="!planificacionForm.valid || isSubmitting"
                  class="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <span *ngIf="!isSubmitting">Guardar Planificación</span>
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
export class PlanificarRutinaComponent implements OnInit {
  planificacionForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private db: InMemoryDatabaseService,
  ) {
    this.planificacionForm = this.fb.group({
      rutinaId: ['', Validators.required],
      duracionTotal: [45, [Validators.required, Validators.min(15)]],
      frecuencia: [3, Validators.required],
      ejercicios: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    // Agregar un ejercicio por defecto
    this.agregarEjercicio();
  }

  get rutinas$() {
    return this.db.getRutinas();
  }

  get ejercicios(): FormArray {
    return this.planificacionForm.get('ejercicios') as FormArray;
  }

  agregarEjercicio(): void {
    this.ejercicios.push(
      this.fb.group({
        nombre: ['', Validators.required],
        series: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
        repeticiones: [15, [Validators.required, Validators.min(1), Validators.max(50)]],
        duracion: [30, Validators.min(10)],
        descripcion: [''],
      })
    );
  }

  removerEjercicio(index: number): void {
    this.ejercicios.removeAt(index);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.planificacionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.planificacionForm.valid) {
      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';

      setTimeout(() => {
        try {
          const formValue = this.planificacionForm.value;
          console.log('Planificación de rutina guardada:', formValue);

          this.successMessage = `Planificación guardada exitosamente con ${formValue.ejercicios.length} ejercicios`;
          this.planificacionForm.reset({ duracionTotal: 45, frecuencia: 3 });
          this.ejercicios.clear();
          this.agregarEjercicio();
          this.isSubmitting = false;

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } catch (error) {
          this.errorMessage = 'Error al guardar la planificación. Intenta nuevamente.';
          this.isSubmitting = false;
        }
      }, 500);
    }
  }
}
