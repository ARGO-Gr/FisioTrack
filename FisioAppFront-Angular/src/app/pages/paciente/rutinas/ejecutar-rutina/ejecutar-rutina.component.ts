import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../../../components/ui/card.component';
import { ButtonComponent } from '../../../../components/ui/button.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProgramaService, ProgramaDetalleDto, DiaDetalleDto } from '../../../../shared/services/programa.service';
import { ToastService } from '../../../../shared/services/toast.service';

interface Ejercicio {
  id: number;
  nombre: string;
  descripcion: string;
  repeticiones: string;
  descanso: number;
  instrucciones: string[];
  completado: boolean;
}

@Component({
  selector: 'app-ejecutar-rutina',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatProgressBarModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    ButtonComponent,
  ],
  templateUrl: './ejecutar-rutina.component.html',
  styleUrl: './ejecutar-rutina.component.scss',
})
export class EjecutarRutinaComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private timer: any;

  ejercicioActual = 0;
  enDescanso = false;
  tiempoRestante = 0;
  isPaused = false;
  loading = true;
  diaId: number = 0;
  diaData: DiaDetalleDto | null = null;
  programaActivo: ProgramaDetalleDto | null = null;
  soloVista = false;

  rutina = {
    id: 0,
    nombre: '',
    descripcion: '',
  };

  ejercicios: Ejercicio[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private programaService: ProgramaService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    
    // Detectar si está en modo solo vista
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.soloVista = params['soloVista'] === 'true';
    });
    
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.diaId = Number(params['id']);
      this.cargarDatosRutina();
    });
  }

  cargarDatosRutina() {
    this.loading = true;
    // Primero obtenemos el programa activo
    this.programaService.obtenerProgramaActivoPaciente()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (programa) => {
          this.programaActivo = programa;
          // Buscar el día específico en el programa
          this.encontrarDiaEnPrograma(programa);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar rutina:', error);
          this.loading = false;
          this.toastService.error('Error al cargar la rutina. Por favor, intenta nuevamente.');
          this.router.navigate(['/paciente/rutinas']);
        }
      });
  }

  encontrarDiaEnPrograma(programa: ProgramaDetalleDto) {
    for (const semana of programa.semanas) {
      const dia = semana.dias.find(d => d.id === this.diaId);
      if (dia) {
        this.diaData = dia;
        this.mapearDiaAVista(dia, programa);
        return;
      }
    }
    // Si no se encuentra el día, redirigir
    this.toastService.error('No se encontró el día de rutina especificado.');
    this.router.navigate(['/paciente/rutinas']);
  }

  mapearDiaAVista(dia: DiaDetalleDto, programa: ProgramaDetalleDto) {
    this.rutina = {
      id: dia.id,
      nombre: `${dia.nombreDia} - ${programa.nombre}`,
      descripcion: programa.diagnostico,
    };

    this.ejercicios = dia.ejercicios.map((ej, index) => ({
      id: ej.id,
      nombre: ej.nombre,
      descripcion: ej.descripcion,
      repeticiones: `${ej.repeticiones} repeticiones`,
      descanso: ej.tiempoDescanso,
      instrucciones: ej.instrucciones,
      completado: ej.completado
    }));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timer) clearTimeout(this.timer);
  }

  get ejercicioActivo(): Ejercicio {
    return this.ejercicios[this.ejercicioActual];
  }

  get progresoTotal(): number {
    return (this.ejercicios.filter((e) => e.completado).length / this.ejercicios.length) * 100;
  }

  get todosCompletados(): boolean {
    return this.ejercicios.every((e) => e.completado);
  }

  ngAfterViewInit() {
    this.iniciarTimer();
  }

  private iniciarTimer() {
    if (this.enDescanso && this.tiempoRestante > 0 && !this.isPaused) {
      this.timer = setTimeout(() => {
        this.tiempoRestante--;
        if (this.tiempoRestante === 0) {
          this.enDescanso = false;
        }
        this.iniciarTimer();
      }, 1000);
    }
  }

  handleCompletarEjercicio() {
    window.scrollTo(0, 0);
    const ejercicio = this.ejercicios[this.ejercicioActual];
    
    // Llamar a la API para marcar el ejercicio como completado
    this.programaService.completarEjercicio(ejercicio.id, this.diaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.ejercicios[this.ejercicioActual].completado = true;

          if (this.ejercicioActual < this.ejercicios.length - 1) {
            this.enDescanso = true;
            this.tiempoRestante = this.ejercicioActivo.descanso;
            this.isPaused = false;
            this.iniciarTimer();
          }
        },
        error: (error) => {
          console.error('❌ [handleCompletarEjercicio] Error:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
            ejercicioId: ejercicio.id,
            diaId: this.diaId,
            timestamp: new Date().toISOString()
          });
          this.toastService.error('Error al guardar el progreso. Por favor, intenta nuevamente');
        }
      });
  }

  handleSiguienteEjercicio() {
    if (this.ejercicioActual < this.ejercicios.length - 1) {
      this.ejercicioActual++;
      this.enDescanso = false;
      this.tiempoRestante = 0;
      if (this.timer) clearTimeout(this.timer);
    }
  }

  handleAnteriorEjercicio() {
    if (this.ejercicioActual > 0) {
      this.ejercicioActual--;
      this.enDescanso = false;
      this.tiempoRestante = 0;
      if (this.timer) clearTimeout(this.timer);
    }
  }

  handleFinalizarRutina() {
    // Verificar que todos los ejercicios estén completados
    if (!this.todosCompletados) {
      this.toastService.warning('Debes completar todos los ejercicios antes de finalizar la rutina.');
      return;
    }

    // Llamar a la API para marcar el día como completado
    this.programaService.completarDia(this.diaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/paciente/rutinas']);
        },
        error: (error) => {
          console.error('❌ [handleFinalizarRutina] Error:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
            diaId: this.diaId,
            todosCompletados: this.todosCompletados,
            timestamp: new Date().toISOString()
          });
          this.toastService.error('Error al finalizar la rutina. Por favor, intenta nuevamente.');
        }
      });
  }

  selectEjercicio(index: number) {
    this.ejercicioActual = index;
    this.enDescanso = false;
    this.tiempoRestante = 0;
    if (this.timer) clearTimeout(this.timer);
  }

  togglePausa() {
    this.isPaused = !this.isPaused;
    if (!this.isPaused) {
      this.iniciarTimer();
    }
  }
}
