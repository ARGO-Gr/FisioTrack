import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ExercisesModalComponent, Ejercicio } from './asignar ejercicio/exercises-modal.component';
import { ConfirmDiscardChangesModalComponent } from '../../../../shared/components/confirm-discard-changes-modal.component';
import { ProgramaService, CrearProgramaDto, ProgramaDetalleDto } from '../../../../shared/services/programa.service';
import { ToastService } from '../../../../shared/services/toast.service';

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
  programaActivo?: ProgramaDetalleDto | null;
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
  programaActivo: ProgramaDetalleDto | null = null;
  modoEdicion: 'editar' | 'nueva' = 'nueva';
  activeTab: 'editar' | 'nueva' = 'nueva';
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
    private programaService: ProgramaService,
    private toastService: ToastService,
    public dialogRef: MatDialogRef<AssignRoutineModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RoutineData
  ) {
    this.pacienteName = data.pacienteName;
    this.pacienteId = data.pacienteId;
    this.programaActivo = data.programaActivo || null;

    // Si hay programa activo, iniciar en modo editar, sino en modo nueva
    if (this.programaActivo) {
      this.activeTab = 'editar';
      this.modoEdicion = 'editar';
    }

    this.routineForm = this.fb.group({
      nombrePrograma: ['', Validators.required],
      diagnostico: ['', Validators.required],
      semanas: [2, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    // Si hay programa activo, cargar sus datos
    if (this.programaActivo) {
      this.cargarProgramaActivo();
    } else {
      // Inicializar semanas
      this.actualizarSemanas();
    }
    
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

  incrementarSemanas() {
    const semanasControl = this.routineForm.get('semanas');
    const valActual = semanasControl?.value || 1;
    semanasControl?.setValue(valActual + 1);
  }

  decrementarSemanas() {
    const semanasControl = this.routineForm.get('semanas');
    const valActual = semanasControl?.value || 1;
    if (valActual > 1) {
      semanasControl?.setValue(valActual - 1);
    }
  }

  cargarProgramaActivo() {
    if (!this.programaActivo) return;

    // Cargar datos básicos del programa en el formulario
    this.routineForm.patchValue({
      nombrePrograma: this.programaActivo.nombre,
      diagnostico: this.programaActivo.diagnostico,
      semanas: this.programaActivo.totalSemanas
    });

    // Cargar semanas y días
    this.semanasRutina = this.programaActivo.semanas.map(semana => ({
      semana: semana.numeroSemana,
      dias: semana.dias.map(dia => {
        const diaRutina: DiaRutina = {
          dia: dia.nombreDia,
          tipo: dia.tipo === 'Rutina' || dia.tipo === 'rutina' ? 'rutina' : 'descanso',
          ejercicios: dia.tipo === 'Rutina' || dia.tipo === 'rutina' 
            ? dia.ejercicios.map(ej => ({
                id: `ejercicio_${ej.id}_${Date.now()}`,
                nombre: ej.nombre,
                descripcion: ej.descripcion,
                repeticiones: ej.repeticiones,
                descanso: ej.tiempoDescanso,
                instrucciones: ej.instrucciones
              }))
            : []
        };
        return diaRutina;
      })
    }));

    // Actualizar el estado original
    this.formValueOrigin = JSON.stringify({
      form: this.routineForm.value,
      semanas: this.semanasRutina
    });
  }

  cambiarTab(tab: 'editar' | 'nueva') {
    if (this.activeTab === tab) return;

    // Si cambia a "nueva", resetear el formulario
    if (tab === 'nueva') {
      this.activeTab = 'nueva';
      this.modoEdicion = 'nueva';
      this.routineForm.reset({
        nombrePrograma: '',
        diagnostico: '',
        semanas: 2
      });
      this.semanasRutina = [];
      this.selectedWeekIndex = 0;
      this.actualizarSemanas();
    } else {
      // Si cambia a "editar", recargar datos del programa activo
      this.activeTab = 'editar';
      this.modoEdicion = 'editar';
      if (this.programaActivo) {
        this.cargarProgramaActivo();
      }
    }

    // Actualizar estado original
    this.formValueOrigin = JSON.stringify({
      form: this.routineForm.value,
      semanas: this.semanasRutina
    });
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
      // Obtener el día de origen (el que se copió)
      const diasActuales = this.semanasRutina.length > 0 
        ? this.semanasRutina[this.selectedWeekIndex].dias 
        : this.diasSemana;
      
      const diaOrigen = diasActuales[this.copiedFromIndex];
      
      // Copiar el tipo y los ejercicios al día de destino
      if (this.semanasRutina.length > 0) {
        this.semanasRutina[this.selectedWeekIndex].dias[index].tipo = diaOrigen.tipo;
        // Hacer una copia profunda de los ejercicios
        this.semanasRutina[this.selectedWeekIndex].dias[index].ejercicios = 
          diaOrigen.ejercicios ? JSON.parse(JSON.stringify(diaOrigen.ejercicios)) : undefined;
      } else {
        this.diasSemana[index].tipo = diaOrigen.tipo;
        // Hacer una copia profunda de los ejercicios
        this.diasSemana[index].ejercicios = 
          diaOrigen.ejercicios ? JSON.parse(JSON.stringify(diaOrigen.ejercicios)) : undefined;
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
      
      // Encontrar el primer día asignado en la primera semana
      const primerasemana = this.semanasRutina[0];
      let primerDiaIndex = 0;
      for (let i = 0; i < primerasemana.dias.length; i++) {
        if (primerasemana.dias[i].tipo !== null) {
          primerDiaIndex = i;
          break;
        }
      }
      
      // Calcular la fecha de inicio basada en el primer día asignado
      const hoy = new Date();
      const diaActual = hoy.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
      
      // El índice 0 es lunes, índice 6 es domingo
      // Si hoy es lunes (1), necesito restar 0 días para obtener el lunes
      // Si hoy es martes (2), necesito restar 1 día para obtener el lunes
      // Si hoy es domingo (0), necesito restar 6 días para obtener el lunes anterior
      const diasAlLunes = diaActual === 0 ? -6 : 1 - diaActual;
      
      const fechaLunes = new Date(hoy);
      fechaLunes.setDate(fechaLunes.getDate() + diasAlLunes);
      fechaLunes.setHours(0, 0, 0, 0);
      
      // Sumar los días hasta el primer día asignado
      fechaLunes.setDate(fechaLunes.getDate() + primerDiaIndex);
      
      const fechaInicio = fechaLunes.toISOString();

      // Construir el DTO para la API
      const crearProgramaDto: CrearProgramaDto = {
        pacienteId: this.pacienteId,
        nombrePrograma: formValue.nombrePrograma,
        descripcion: '',
        diagnostico: formValue.diagnostico,
        semanas: formValue.semanas,
        fechaInicio: fechaInicio,
        semanasRutina: this.semanasRutina.map(semana => ({
          numeroSemana: semana.semana,
          dias: semana.dias.map((dia, index) => ({
            nombreDia: dia.dia,
            ordenDia: index + 1,
            tipo: dia.tipo === 'rutina' ? 'rutina' : 'descanso',
            nombreRutina: dia.tipo === 'rutina' ? dia.dia : undefined,
            ejercicios: dia.tipo === 'rutina' && dia.ejercicios ? dia.ejercicios.map((ej, ejIndex) => ({
              orden: ejIndex + 1,
              nombre: ej.nombre,
              descripcion: ej.descripcion,
              repeticiones: ej.repeticiones,
              tiempoDescanso: ej.descanso,
              instrucciones: ej.instrucciones
            })) : undefined
          }))
        }))
      };

      // Si estamos en modo editar y hay programa activo, actualizar
      if (this.modoEdicion === 'editar' && this.programaActivo) {
        this.programaService.actualizarPrograma(this.programaActivo.id, crearProgramaDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (programa) => {
              this.dialogRef.close({
                success: true,
                programa: programa,
                mensaje: 'Programa actualizado exitosamente'
              });
            },
            error: (error) => {
              console.error('Error al actualizar programa:', error);
              this.toastService.error('Error al actualizar el programa');
              this.isSubmitting = false;
              this.dialogRef.disableClose = false;
            }
          });
      } else {
        // Modo nueva rutina - crear programa (reemplazará el activo automáticamente en el backend)
        this.programaService.crearPrograma(crearProgramaDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (programa) => {
              this.dialogRef.close({
                success: true,
                programa: programa,
                mensaje: 'Programa de rehabilitación asignado exitosamente'
              });
            },
            error: (error) => {
              console.error('Error al crear programa:', error);
              this.isSubmitting = false;
              this.dialogRef.disableClose = false;
              this.toastService.error('Error al crear el programa de rehabilitación. Por favor, intenta nuevamente.');
            }
          });
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
