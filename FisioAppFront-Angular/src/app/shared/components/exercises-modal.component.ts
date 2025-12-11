import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfirmDiscardChangesModalComponent } from './confirm-discard-changes-modal.component';

export interface Ejercicio {
  id: string;
  nombre: string;
  descripcion: string;
  series: number;
  repeticiones: number;
  descanso: number;
  instrucciones: string[];
}

export interface ExercisesModalData {
  dayIndex: number;
  dayName: string;
  exercises?: Ejercicio[];
}

@Component({
  selector: 'app-exercises-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './exercises-modal.component.html',
  styleUrls: ['./exercises-modal.component.css']
})
export class ExercisesModalComponent implements OnInit, OnDestroy {
  ejercicios: Ejercicio[] = [];
  isSubmitting = false;
  dayIndex: number = 0;
  dayName: string = '';
  private ejerciciosOriginales: Ejercicio[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ExercisesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExercisesModalData
  ) {
    this.dayIndex = data.dayIndex;
    this.dayName = data.dayName;
    this.ejercicios = data.exercises ? JSON.parse(JSON.stringify(data.exercises)) : [];
    this.ejerciciosOriginales = JSON.parse(JSON.stringify(this.ejercicios));
  }

  ngOnInit() {
    if (this.ejercicios.length === 0) {
      this.agregarEjercicio();
    }
  }

  agregarEjercicio() {
    const nuevoEjercicio: Ejercicio = {
      id: `ejercicio_${Date.now()}_${Math.random()}`,
      nombre: '',
      descripcion: '',
      series: 3,
      repeticiones: 10,
      descanso: 30,
      instrucciones: ['']
    };
    this.ejercicios.push(nuevoEjercicio);
  }

  eliminarEjercicio(id: string) {
    this.ejercicios = this.ejercicios.filter(e => e.id !== id);
  }

  actualizarEjercicio(id: string, campo: keyof Omit<Ejercicio, 'id' | 'instrucciones'>, valor: any) {
    const ejercicio = this.ejercicios.find(e => e.id === id);
    if (ejercicio) {
      (ejercicio[campo] as any) = valor;
    }
  }

  actualizarEjercicioNombre(id: string, event: any) {
    this.actualizarEjercicio(id, 'nombre', event.target.value);
  }

  actualizarEjercicioDescripcion(id: string, event: any) {
    this.actualizarEjercicio(id, 'descripcion', event.target.value);
  }

  actualizarEjercicioSeries(id: string, event: any) {
    const valor = Number.parseInt(event.target.value) || 0;
    this.actualizarEjercicio(id, 'series', valor);
  }

  actualizarEjercicioRepeticiones(id: string, event: any) {
    const valor = Number.parseInt(event.target.value) || 0;
    this.actualizarEjercicio(id, 'repeticiones', valor);
  }

  actualizarEjercicioDescanso(id: string, event: any) {
    const valor = Number.parseInt(event.target.value) || 0;
    this.actualizarEjercicio(id, 'descanso', valor);
  }

  moverEjercicio(index: number, direccion: 'arriba' | 'abajo') {
    if (direccion === 'arriba' && index > 0) {
      [this.ejercicios[index], this.ejercicios[index - 1]] = [this.ejercicios[index - 1], this.ejercicios[index]];
    } else if (direccion === 'abajo' && index < this.ejercicios.length - 1) {
      [this.ejercicios[index], this.ejercicios[index + 1]] = [this.ejercicios[index + 1], this.ejercicios[index]];
    }
  }

  agregarInstruccion(id: string) {
    const ejercicio = this.ejercicios.find(e => e.id === id);
    if (ejercicio) {
      ejercicio.instrucciones.push('');
    }
  }

  eliminarInstruccion(id: string, index: number) {
    const ejercicio = this.ejercicios.find(e => e.id === id);
    if (ejercicio) {
      ejercicio.instrucciones.splice(index, 1);
    }
  }

  actualizarInstruccion(id: string, index: number, valor: string) {
    const ejercicio = this.ejercicios.find(e => e.id === id);
    if (ejercicio) {
      ejercicio.instrucciones[index] = valor;
    }
  }

  actualizarInstruccionTexto(id: string, index: number, event: any) {
    this.actualizarInstruccion(id, index, event.target.value);
  }

  moverInstruccion(id: string, indexActual: number, indexNuevo: number) {
    const ejercicio = this.ejercicios.find(e => e.id === id);
    if (ejercicio) {
      const [instruccion] = ejercicio.instrucciones.splice(indexActual, 1);
      ejercicio.instrucciones.splice(indexNuevo, 0, instruccion);
    }
  }

  allExercisesValid(): boolean {
    return this.ejercicios.every(ejercicio => 
      ejercicio.nombre.trim() !== '' &&
      ejercicio.descripcion.trim() !== '' &&
      ejercicio.series > 0 &&
      ejercicio.repeticiones > 0 &&
      ejercicio.instrucciones.every(i => i.trim() !== '')
    );
  }

  hasChanges(): boolean {
    return JSON.stringify(this.ejercicios) !== JSON.stringify(this.ejerciciosOriginales);
  }

  async onCancel() {
    if (this.hasChanges()) {
      const result = await this.dialog.open(ConfirmDiscardChangesModalComponent, {
        width: '90%',
        maxWidth: '500px',
        data: {
          title: '¿Descartar cambios?',
          message: 'Tienes cambios sin guardar en los ejercicios. Si continúas, se perderán todos los datos ingresados.'
        },
        disableClose: false
      }).afterClosed().toPromise();

      if (result) {
        this.dialogRef.close();
      }
    } else {
      this.dialogRef.close();
    }
  }

  onSubmit() {
    if (this.allExercisesValid()) {
      this.isSubmitting = true;
      this.dialogRef.disableClose = true;

      setTimeout(() => {
        this.dialogRef.close({
          dayIndex: this.dayIndex,
          exercises: this.ejercicios
        });
      }, 500);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
