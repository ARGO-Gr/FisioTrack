import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ExercisesModalComponent, Ejercicio } from './exercises-modal.component';
import { ConfirmDiscardChangesModalComponent } from './confirm-discard-changes-modal.component';

interface DiaRutina {
  dia: string;
  tipo: 'descanso' | 'rutina' | null;
  ejercicios?: Ejercicio[];
}

interface SemanaRutina {
  semana: number;
  dias: DiaRutina[];
}

export interface RoutineData {
  pacienteName: string;
  pacienteId: string;
}

@Component({
  selector: 'app-assign-routine-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './assign-routine-modal.component.html',
  styleUrls: ['./assign-routine-modal.component.css']
})
export class AssignRoutineModalComponent implements OnInit, OnDestroy {
  routineForm: FormGroup;
  isSubmitting = false;
  pacienteName = '';
  pacienteId = '';
  copiedFromIndex: number | null = null;
  copiedWeekIndex: number | null = null;
  selectedWeekIndex: number = 0;
  semanasRutina: SemanaRutina[] = [];
  diasSemana: DiaRutina[] = [
    { dia: 'Lunes', tipo: null },
    { dia: 'Martes', tipo: null },
    { dia: 'Miércoles', tipo: null },
    { dia: 'Jueves', tipo: null },
    { dia: 'Viernes', tipo: null },
    { dia: 'Sábado', tipo: null },
    { dia: 'Domingo', tipo: null },
  ];

  private formValueOrigin: any;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<AssignRoutineModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RoutineData
  ) {
    this.pacienteName = data.pacienteName;
    this.pacienteId = data.pacienteId;

    this.routineForm = this.fb.group({
      nombrePrograma: ['', Validators.required],
      diagnostico: ['', Validators.required],
      semanas: [4, [Validators.required, Validators.min(1), Validators.max(4)]],
    });
  }

  ngOnInit() {
    // Inicializar semanas
    this.actualizarSemanas();
    
    // Guardar estado original del formulario
    this.formValueOrigin = JSON.stringify({
      form: this.routineForm.value,
      semanas: this.semanasRutina
    });
    
    // Escuchar cambios en el campo de semanas
    this.routineForm.get('semanas')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.actualizarSemanas();
      });
  }

  actualizarSemanas() {
    const numSemanas = this.routineForm.get('semanas')?.value || 1;
    const semanasActuales = this.semanasRutina.length;

    if (numSemanas > semanasActuales) {
      // Agregar nuevas semanas
      for (let i = semanasActuales + 1; i <= numSemanas; i++) {
        this.semanasRutina.push({
          semana: i,
          dias: JSON.parse(JSON.stringify(this.diasSemana))
        });
      }
    } else if (numSemanas < semanasActuales) {
      // Eliminar semanas
      this.semanasRutina = this.semanasRutina.slice(0, numSemanas);
    }
  }

  seleccionarTipoDia(index: number, tipo: 'descanso' | 'rutina') {
    if (tipo === 'rutina') {
      // Obtener el día actual
      const dias = this.semanasRutina.length > 0 
        ? this.semanasRutina[this.selectedWeekIndex].dias 
        : this.diasSemana;
      
      const diaActual = dias[index];
      const diaName = diaActual.dia;
      const ejerciciosActuales = diaActual.ejercicios || [];

      // Abrir modal de ejercicios
      const dialogRef = this.dialog.open(ExercisesModalComponent, {
        width: '90%',
        maxWidth: '900px',
        data: {
          dayIndex: index,
          dayName: diaName,
          exercises: ejerciciosActuales
        },
        panelClass: 'exercises-modal-panel',
        disableClose: false
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Marcar día como rutina y guardar ejercicios
          if (this.semanasRutina.length > 0) {
            this.semanasRutina[this.selectedWeekIndex].dias[index].tipo = 'rutina';
            this.semanasRutina[this.selectedWeekIndex].dias[index].ejercicios = result.exercises;
          } else {
            this.diasSemana[index].tipo = 'rutina';
            this.diasSemana[index].ejercicios = result.exercises;
          }
        }
      });
    } else {
      // Para descanso, simplemente marcar el tipo
      if (this.semanasRutina.length > 0) {
        this.semanasRutina[this.selectedWeekIndex].dias[index].tipo = tipo;
      } else {
        this.diasSemana[index].tipo = tipo;
      }
    }
  }

  abrirModalEjercicios(index: number) {
    // Obtener el día actual
    const dias = this.semanasRutina.length > 0 
      ? this.semanasRutina[this.selectedWeekIndex].dias 
      : this.diasSemana;
    
    const diaActual = dias[index];
    const diaName = diaActual.dia;
    const ejerciciosActuales = diaActual.ejercicios || [];

    // Abrir modal de ejercicios
    const dialogRef = this.dialog.open(ExercisesModalComponent, {
      width: '90%',
      maxWidth: '900px',
      data: {
        dayIndex: index,
        dayName: diaName,
        exercises: ejerciciosActuales
      },
      panelClass: 'exercises-modal-panel',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Actualizar ejercicios del día
        if (this.semanasRutina.length > 0) {
          this.semanasRutina[this.selectedWeekIndex].dias[index].ejercicios = result.exercises;
        } else {
          this.diasSemana[index].ejercicios = result.exercises;
        }
      }
    });
  }

  cambiarDia(index: number) {
    if (this.semanasRutina.length > 0) {
      this.semanasRutina[this.selectedWeekIndex].dias[index].tipo = null;
    } else {
      this.diasSemana[index].tipo = null;
    }
  }

  iniciarCopia(index: number) {
    this.copiedFromIndex = index;
  }

  cancelarCopia() {
    this.copiedFromIndex = null;
  }

  pegarRutina(index: number) {
    if (this.copiedFromIndex !== null) {
      if (this.semanasRutina.length > 0) {
        this.semanasRutina[this.selectedWeekIndex].dias[index].tipo = 'rutina';
      } else {
        this.diasSemana[index].tipo = 'rutina';
      }
      this.copiedFromIndex = null;
    }
  }

  eliminarRutinaDia(index: number) {
    if (this.semanasRutina.length > 0) {
      this.semanasRutina[this.selectedWeekIndex].dias[index].tipo = null;
    } else {
      this.diasSemana[index].tipo = null;
    }
    if (this.copiedFromIndex === index) {
      this.copiedFromIndex = null;
    }
  }

  seleccionarSemana(index: number) {
    this.selectedWeekIndex = index;
  }

  getSelectedWeekDias(): DiaRutina[] {
    if (this.semanasRutina.length > 0 && this.selectedWeekIndex < this.semanasRutina.length) {
      return this.semanasRutina[this.selectedWeekIndex].dias;
    }
    return this.diasSemana;
  }

  iniciarCopiaSemana(index: number) {
    this.copiedWeekIndex = index;
  }

  cancelarCopiaSemana() {
    this.copiedWeekIndex = null;
  }

  pegarSemana(index: number) {
    if (this.copiedWeekIndex !== null && this.copiedWeekIndex !== index) {
      // Copiar la estructura de días de la semana copiada
      this.semanasRutina[index].dias = JSON.parse(
        JSON.stringify(this.semanasRutina[this.copiedWeekIndex].dias)
      );
      this.copiedWeekIndex = null;
    }
  }

  resetearSemana(index: number) {
    // Resetear todos los días de la semana a null
    this.semanasRutina[index].dias = this.semanasRutina[index].dias.map(dia => ({
      ...dia,
      tipo: null
    }));
  }

  contarRutinas(semana: SemanaRutina): number {
    return semana.dias.filter(d => d.tipo === 'rutina').length;
  }

  allDaysAssigned(): boolean {
    if (this.semanasRutina.length > 0) {
      return this.semanasRutina.every(semana => 
        semana.dias.every(dia => dia.tipo !== null)
      );
    }
    return this.diasSemana.every(dia => dia.tipo !== null);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.routineForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  hasChanges(): boolean {
    const currentState = JSON.stringify({
      form: this.routineForm.value,
      semanas: this.semanasRutina
    });
    return currentState !== this.formValueOrigin;
  }

  async onCancel() {
    if (this.hasChanges()) {
      const result = await this.dialog.open(ConfirmDiscardChangesModalComponent, {
        width: '90%',
        maxWidth: '500px',
        data: {
          title: '¿Descartar cambios?',
          message: 'Tienes cambios sin guardar en la rutina. Si continúas, se perderán todos los datos ingresados.'
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
    if (this.routineForm.valid && this.allDaysAssigned()) {
      this.isSubmitting = true;
      this.dialogRef.disableClose = true;

      const formValue = this.routineForm.value;

      setTimeout(() => {
        this.dialogRef.close({
          nombrePrograma: formValue.nombrePrograma,
          diagnostico: formValue.diagnostico,
          semanas: formValue.semanas,
          diasSemana: this.diasSemana,
        });
      }, 500);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
