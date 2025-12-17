import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../../components/ui/card.component';
import { ButtonComponent } from '../../../components/ui/button.component';
import { InMemoryDatabaseService } from '../../../shared/in-memory-db/in-memory.service';
import { Rutina } from '../../../shared/models';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent, NavLink } from '../../../shared/components/header.component';
import { AuthService } from '../../../shared/services/auth.service';
import { ProgramaService, ProgramaDetalleDto } from '../../../shared/services/programa.service';
import { ToastService } from '../../../shared/services/toast.service';

interface DiaPrograma {
  id?: string;
  dia: string;
  tipo: 'rutina' | 'descanso';
  nombre?: string;
  completado: boolean;
  ejercicios?: number;
  // Nuevo: campos para incumplimiento y bloqueo
  incumplimiento?: boolean;
  fechaIncumplimiento?: string | null;
  bloqueado?: boolean;
  motivoBloqueo?: string;
}

interface SemanaPrograma {
  numero: number;
  estado: 'completada' | 'en-progreso' | 'pendiente';
  dias: DiaPrograma[];
}

@Component({
  selector: 'app-rutinas',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent, ButtonComponent, MatIconModule, HeaderComponent],
  templateUrl: './rutinas.component.html',
  styleUrl: './rutinas.component.scss',
})
export class RutinasComponent implements OnInit {
  rutinas: Rutina[] = [];
  semanaSeleccionada = 1;
  loading = true;
  programaActivo: ProgramaDetalleDto | null = null;

  navLinks: NavLink[] = [
    { label: 'Dashboard', route: '/paciente/dashboard' },
    { label: 'Mi Rutina', route: '/paciente/rutinas' },
    { label: 'Mis Citas', route: '/paciente/citas' },
    { label: 'Pagos', route: '/paciente/pagos-pendientes' },
  ];

  programa = {
    id: '',
    nombre: "Programa de Rehabilitación",
    descripcion: "Plan personalizado para fortalecer y recuperar movilidad",
    totalSemanas: 0,
    semanaActual: 1,
    fechaInicio: "",
    fechaFin: "",
    fechaInicioDate: new Date(), // Agregar para cálculos
    fisioterapeuta: "",
    diasCompletados: 0,
    diasTotales: 0,
  };

  semanas: SemanaPrograma[] = [];

  constructor(
    private db: InMemoryDatabaseService,
    private authService: AuthService,
    private programaService: ProgramaService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarProgramaActivo();
  }

  cargarProgramaActivo() {
    this.loading = true;
    this.programaService.obtenerProgramaActivoPaciente().subscribe({
      next: (programa) => {
        this.programaActivo = programa;
        this.mapearProgramaAVista(programa);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar programa:', error);
        this.loading = false;
        this.toastService.error('Error al cargar tu programa de rehabilitación');
        // Si no hay programa activo, mostrar mensaje apropiado
      }
    });
  }

  mapearProgramaAVista(programa: ProgramaDetalleDto) {
    this.programa = {
      id: programa.id.toString(),
      nombre: programa.nombre,
      descripcion: programa.diagnostico,
      totalSemanas: programa.totalSemanas,
      semanaActual: programa.semanaActual,
      fechaInicio: this.formatearFecha(programa.fechaInicio),
      fechaFin: this.formatearFecha(programa.fechaFin),
      fechaInicioDate: new Date(programa.fechaInicio),
      fisioterapeuta: programa.fisioterapeutaNombre,
      diasCompletados: programa.diasCompletados,
      diasTotales: programa.diasTotales,
    };

    this.semanas = programa.semanas.map(semana => ({
      numero: semana.numeroSemana,
      estado: semana.estado as 'completada' | 'en-progreso' | 'pendiente',
      dias: semana.dias.map(dia => ({
        id: dia.id.toString(),
        dia: dia.nombreDia,
        tipo: dia.tipo.toLowerCase() as 'rutina' | 'descanso',
        nombre: dia.tipo === 'rutina' && dia.ejercicios.length > 0 ? dia.ejercicios[0]?.nombre || 'Rutina' : undefined,
        completado: dia.completado,
        ejercicios: dia.cantidadEjercicios,
        // Mapear incumplimiento y bloqueo
        incumplimiento: dia.incumplido || false,
        fechaIncumplimiento: dia.fechaIncumplimiento,
        bloqueado: dia.bloqueado || false,
        motivoBloqueo: dia.motivoBloqueo
      }))
    }));

    this.semanaSeleccionada = programa.semanaActual;
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${meses[date.getMonth()]} ${date.getFullYear()}`;
  }

  get semanaActual(): SemanaPrograma {
    return this.semanas[this.semanaSeleccionada - 1];
  }

  get progresoGeneral(): number {
    return Math.round((this.programa.diasCompletados / this.programa.diasTotales) * 100);
  }

  cambiarSemana(numero: number) {
    if (numero >= 1 && numero <= this.programa.totalSemanas) {
      this.semanaSeleccionada = numero;
    }
  }

  irAnterior() {
    this.cambiarSemana(this.semanaSeleccionada - 1);
  }

  irSiguiente() {
    this.cambiarSemana(this.semanaSeleccionada + 1);
  }

  getDiaColor(dia: DiaPrograma, index: number): string {
    // Días con incumplimiento mostrar en rojo
    if (dia.incumplimiento) return 'bg-red-500 text-white';
    
    // Días de descanso siempre en azul
    if (dia.tipo === 'descanso') return 'bg-blue-500 text-white';
    
    // Días completados
    if (dia.completado) return 'bg-green-500 text-white';
    
    // Verificar si es un día futuro (solo para días de rutina)
    if (this.esDiaFuturo(index)) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60';
    }
    
    // Días bloqueados en gris
    if (dia.bloqueado) return 'bg-gray-400 text-white cursor-not-allowed';
    
    return 'bg-primary text-primary-foreground';
  }

  getDiaIcono(dia: DiaPrograma, index: number): string {
    // Días de descanso siempre muestran taza de café
    if (dia.tipo === 'descanso') return 'local_cafe';
    
    // Días incumplidos mostrar X
    if (dia.incumplimiento) return 'cancel';
    
    // Días completados
    if (dia.completado) return 'check_circle';
    
    // Verificar si es un día futuro (solo para días de rutina)
    if (this.esDiaFuturo(index)) {
      return 'schedule';
    }
    
    // Días bloqueados mostrar candado
    if (dia.bloqueado) return 'lock';
    
    return 'fitness_center';
  }

  esDiaFuturo(index: number): boolean {
    const diasDesdeInicio = ((this.semanaSeleccionada - 1) * 7) + index;
    const fechaDia = new Date(this.programa.fechaInicioDate);
    fechaDia.setDate(fechaDia.getDate() + diasDesdeInicio);
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaDia.setHours(0, 0, 0, 0);
    
    return fechaDia > hoy;
  }

  getTiempoEstimado(ejercicios: number): number {
    return ejercicios * 3;
  }

  esdiaPosterior(index: number): boolean {
    // Si la semana seleccionada no es la semana actual del programa, permitir solo visualización
    if (this.semanaSeleccionada !== this.programa.semanaActual) {
      const dia = this.semanaActual.dias[index];
      return !dia.completado;
    }
    
    const dia = this.semanaActual.dias[index];
    
    // Si es día de descanso, no bloquear
    if (dia.tipo === 'descanso') {
      return false;
    }
    
    // Si ya está completado, no bloquear
    if (dia.completado) {
      return false;
    }

    // Calcular la fecha que corresponde a este día
    const diasDesdeInicio = ((this.semanaSeleccionada - 1) * 7) + index;
    const fechaDia = new Date(this.programa.fechaInicioDate);
    fechaDia.setDate(fechaDia.getDate() + diasDesdeInicio);
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaDia.setHours(0, 0, 0, 0);
    
    // Validar que no sea un día futuro (mañana o después)
    if (fechaDia > hoy) {
      return true; // Bloquear días futuros
    }

    // Si está marcado como incumplido, permitir que lo complete (ya pasó su fecha)
    if (dia.incumplimiento) {
      return false;
    }

    // Verificar todos los días de rutina anteriores en todas las semanas
    let hayDiasPendientes = false;
    
    // Revisar semanas anteriores
    for (let s = 0; s < this.semanaSeleccionada - 1; s++) {
      const semanaAnterior = this.semanas[s];
      if (semanaAnterior) {
        const diasRutinaNoCompletados = semanaAnterior.dias.filter(
          d => d.tipo === 'rutina' && !d.completado
        );
        if (diasRutinaNoCompletados.length > 0) {
          hayDiasPendientes = true;
          break;
        }
      }
    }
    
    // Si hay días pendientes en semanas anteriores, bloquear
    if (hayDiasPendientes) {
      return true;
    }
    
    // Verificar días anteriores en la semana actual
    for (let i = 0; i < index; i++) {
      const diaAnterior = this.semanaActual.dias[i];
      if (diaAnterior.tipo === 'rutina' && !diaAnterior.completado) {
        return true; // Hay un día anterior sin completar
      }
    }
    
    return false; // No hay días pendientes y no es futuro, permitir acceso
  }

  onChangeInfo(): void {
    console.log('Cambiar información - pendiente de implementar');
  }

  logout(): void {
    this.authService.logout();
  }
}
