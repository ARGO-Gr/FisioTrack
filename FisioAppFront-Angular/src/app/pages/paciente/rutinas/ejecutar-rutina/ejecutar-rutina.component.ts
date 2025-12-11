import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../../../components/ui/card.component';
import { ButtonComponent } from '../../../../components/ui/button.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Ejercicio {
  id: number;
  nombre: string;
  descripcion: string;
  repeticiones: string;
  series: number;
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

  rutina = {
    id: '1',
    nombre: 'Fortalecimiento de Rodilla',
    descripcion: 'Ejercicios para fortalecer los músculos alrededor de la rodilla',
  };

  ejercicios: Ejercicio[] = [
    {
      id: 1,
      nombre: 'Sentadillas Asistidas',
      descripcion: 'Fortalecimiento de cuádriceps y glúteos',
      repeticiones: '10-12 repeticiones',
      series: 3,
      descanso: 60,
      instrucciones: [
        'Párate con los pies separados al ancho de los hombros',
        'Baja lentamente doblando las rodillas hasta 90 grados',
        'Mantén la espalda recta y el peso en los talones',
        'Sube lentamente a la posición inicial',
      ],
      completado: false,
    },
    {
      id: 2,
      nombre: 'Elevación de Pierna Recta',
      descripcion: 'Fortalecimiento del cuádriceps sin carga en la rodilla',
      repeticiones: '15 repeticiones',
      series: 3,
      descanso: 45,
      instrucciones: [
        'Acuéstate boca arriba con una pierna doblada',
        'Mantén la otra pierna recta',
        'Eleva la pierna recta hasta la altura de la rodilla doblada',
        'Baja lentamente sin tocar el suelo',
      ],
      completado: false,
    },
    {
      id: 3,
      nombre: 'Puente de Glúteos',
      descripcion: 'Fortalecimiento de glúteos y estabilización de cadera',
      repeticiones: '12-15 repeticiones',
      series: 3,
      descanso: 60,
      instrucciones: [
        'Acuéstate boca arriba con las rodillas dobladas',
        'Pies apoyados en el suelo, separados al ancho de caderas',
        'Eleva la cadera hasta formar una línea recta',
        'Mantén 2 segundos arriba y baja controladamente',
      ],
      completado: false,
    },
    {
      id: 4,
      nombre: 'Extensión de Rodilla Sentado',
      descripcion: 'Fortalecimiento específico del cuádriceps',
      repeticiones: '12 repeticiones',
      series: 3,
      descanso: 45,
      instrucciones: [
        'Siéntate en una silla con la espalda recta',
        'Extiende una pierna hasta que quede horizontal',
        'Mantén la posición 3 segundos',
        'Baja lentamente y repite con la otra pierna',
      ],
      completado: false,
    },
    {
      id: 5,
      nombre: 'Flexión de Rodilla de Pie',
      descripcion: 'Fortalecimiento de isquiotibiales',
      repeticiones: '10-12 repeticiones',
      series: 3,
      descanso: 45,
      instrucciones: [
        'Párate derecho, apoyándote en una silla si es necesario',
        'Dobla una rodilla llevando el talón hacia el glúteo',
        'Mantén la posición 2 segundos',
        'Baja lentamente y repite',
      ],
      completado: false,
    },
    {
      id: 6,
      nombre: 'Estiramiento de Cuádriceps',
      descripcion: 'Estiramiento final para relajar los músculos trabajados',
      repeticiones: '30 segundos cada lado',
      series: 2,
      descanso: 30,
      instrucciones: [
        'De pie, dobla una rodilla llevando el pie hacia atrás',
        'Sujeta el pie con la mano del mismo lado',
        'Mantén las rodillas juntas',
        'Mantén el estiramiento sin rebotes durante 30 segundos',
      ],
      completado: false,
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      // Aquí se pueden cargar los datos de la rutina según el ID
      console.log('Rutina ID:', params['id']);
    });
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
    this.ejercicios[this.ejercicioActual].completado = true;

    if (this.ejercicioActual < this.ejercicios.length - 1) {
      this.enDescanso = true;
      this.tiempoRestante = this.ejercicioActivo.descanso;
      this.isPaused = false;
      this.iniciarTimer();
    }
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
    this.router.navigate(['/paciente/rutinas']);
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

  getSeriesTotal(): number {
    return this.ejercicios.reduce((acc, e) => acc + e.series, 0);
  }
}
