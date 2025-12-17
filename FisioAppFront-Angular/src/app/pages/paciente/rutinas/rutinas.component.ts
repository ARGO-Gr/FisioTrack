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
        // Nuevo: mapear incumplimiento y bloqueo
        incumplimiento: dia.incumplimiento || false,
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

  getDiaColor(dia: DiaPrograma): string {
    // Nuevo: Días con incumplimiento mostrar en rojo
    if (dia.incumplimiento) return 'bg-red-500 text-white';
    // Nuevo: Días bloqueados en gris
    if (dia.bloqueado) return 'bg-gray-400 text-white cursor-not-allowed';
    if (dia.completado) return 'bg-green-500 text-white';
    if (dia.tipo === 'descanso') return 'bg-blue-500 text-white';
    return 'bg-primary text-primary-foreground';
  }

  getDiaIcono(dia: DiaPrograma): string {
    // Nuevo: Días incumplidos mostrar X
    if (dia.incumplimiento) return 'cancel';
    // Nuevo: Días bloqueados mostrar candado
    if (dia.bloqueado) return 'lock';
    if (dia.tipo === 'descanso') return 'local_cafe';
    if (dia.completado) return 'check_circle';
    return 'fitness_center';
  }

  getTiempoEstimado(ejercicios: number): number {
    return ejercicios * 3;
  }

  esdiaPosterior(index: number): boolean {
    // Si la semana seleccionada no es la semana actual del programa, bloquear días no completados
    if (this.semanaSeleccionada !== this.programa.semanaActual) {
      return true;
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

    // Nuevo: Si está marcado como incumplido, bloquear los siguientes días
    if (dia.incumplimiento) {
      return true; // El día incumplido está bloqueado
    }

    // Verificar si hay días anteriores incumplidos (requisito no cumplido)
    const hayDiasAnterioresIncumplidos = this.semanaActual.dias
      .slice(0, index)
      .some(d => d.incumplimiento && d.tipo === 'rutina');

    if (hayDiasAnterioresIncumplidos) {
      return true; // Bloquear si hay días anteriores incumplidos
    }
    
    // Obtener el día actual de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
    const hoy = new Date();
    const diaActualSemana = hoy.getDay(); // 0-6
    
    // Mapear el índice del array (0-6) al día de la semana considerando que:
    // El array empieza en Lunes (index 0 = Lunes, 1 = Martes, ..., 6 = Domingo)
    // getDay() devuelve: 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    
    // Convertir diaActualSemana a índice del array (Lunes = 0)
    let diaActualIndex = diaActualSemana === 0 ? 6 : diaActualSemana - 1;
    
    // Si el día en el array es posterior al día actual de la semana, bloquearlo
    if (index > diaActualIndex) {
      return true;
    }
    
    // Si es el día actual o anterior, permitir solo si no hay días anteriores pendientes
    const hayDiasAnterioresPendientes = this.semanaActual.dias
      .slice(0, index)
      .some(d => !d.completado && d.tipo === 'rutina');
    
    return hayDiasAnterioresPendientes;
  }

  onChangeInfo(): void {
    console.log('Cambiar información - pendiente de implementar');
  }

  logout(): void {
    this.authService.logout();
  }
}
