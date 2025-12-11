import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../../components/ui/card.component';
import { ButtonComponent } from '../../../components/ui/button.component';
import { InMemoryDatabaseService } from '../../../shared/in-memory-db/in-memory.service';
import { Rutina } from '../../../shared/models';
import { MatIconModule } from '@angular/material/icon';
import { UserMenuComponent } from '../../../shared/components/user-menu.component';
import { AuthService } from '../../../shared/services/auth.service';

interface DiaPrograma {
  dia: string;
  tipo: 'rutina' | 'descanso';
  nombre?: string;
  completado: boolean;
  ejercicios?: number;
}

interface SemanaPrograma {
  numero: number;
  estado: 'completada' | 'en-progreso' | 'pendiente';
  dias: DiaPrograma[];
}

@Component({
  selector: 'app-rutinas',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent, ButtonComponent, MatIconModule, UserMenuComponent],
  templateUrl: './rutinas.component.html',
  styleUrl: './rutinas.component.scss',
})
export class RutinasComponent implements OnInit {
  rutinas: Rutina[] = [];
  semanaSeleccionada = 1;

  programa = {
    id: 1,
    nombre: "Programa de Rehabilitación",
    descripcion: "Plan personalizado para fortalecer y recuperar movilidad",
    totalSemanas: 4,
    semanaActual: 2,
    fechaInicio: "15 Ene 2025",
    fechaFin: "12 Feb 2025",
    fisioterapeuta: "Dr. Sánchez",
    diasCompletados: 8,
    diasTotales: 28,
  };

  semanas: SemanaPrograma[] = [
    {
      numero: 1,
      estado: "completada",
      dias: [
        { dia: "Lunes", tipo: "rutina", nombre: "Introducción - Movilidad Básica", completado: true, ejercicios: 5 },
        { dia: "Martes", tipo: "descanso", completado: true },
        { dia: "Miércoles", tipo: "rutina", nombre: "Fortalecimiento Suave", completado: true, ejercicios: 6 },
        { dia: "Jueves", tipo: "descanso", completado: true },
        { dia: "Viernes", tipo: "rutina", nombre: "Movilidad y Estiramiento", completado: true, ejercicios: 5 },
        { dia: "Sábado", tipo: "rutina", nombre: "Cardio Suave", completado: true, ejercicios: 4 },
        { dia: "Domingo", tipo: "descanso", completado: true },
      ],
    },
    {
      numero: 2,
      estado: "en-progreso",
      dias: [
        { dia: "Lunes", tipo: "rutina", nombre: "Fortalecimiento Moderado", completado: true, ejercicios: 6 },
        { dia: "Martes", tipo: "descanso", completado: true },
        { dia: "Miércoles", tipo: "rutina", nombre: "Movilidad Avanzada", completado: true, ejercicios: 8 },
        { dia: "Jueves", tipo: "descanso", completado: false },
        { dia: "Viernes", tipo: "rutina", nombre: "Fortalecimiento", completado: false, ejercicios: 6 },
        { dia: "Sábado", tipo: "rutina", nombre: "Cardio Moderado", completado: false, ejercicios: 5 },
        { dia: "Domingo", tipo: "descanso", completado: false },
      ],
    },
    {
      numero: 3,
      estado: "pendiente",
      dias: [
        { dia: "Lunes", tipo: "rutina", nombre: "Fortalecimiento Intenso", completado: false, ejercicios: 7 },
        { dia: "Martes", tipo: "descanso", completado: false },
        { dia: "Miércoles", tipo: "rutina", nombre: "Resistencia y Movilidad", completado: false, ejercicios: 8 },
        { dia: "Jueves", tipo: "descanso", completado: false },
        { dia: "Viernes", tipo: "rutina", nombre: "Fortalecimiento Completo", completado: false, ejercicios: 7 },
        { dia: "Sábado", tipo: "rutina", nombre: "Cardio Intenso", completado: false, ejercicios: 6 },
        { dia: "Domingo", tipo: "descanso", completado: false },
      ],
    },
    {
      numero: 4,
      estado: "pendiente",
      dias: [
        { dia: "Lunes", tipo: "rutina", nombre: "Consolidación - Fuerza", completado: false, ejercicios: 8 },
        { dia: "Martes", tipo: "descanso", completado: false },
        { dia: "Miércoles", tipo: "rutina", nombre: "Resistencia Total", completado: false, ejercicios: 9 },
        { dia: "Jueves", tipo: "descanso", completado: false },
        { dia: "Viernes", tipo: "rutina", nombre: "Evaluación Final", completado: false, ejercicios: 8 },
        { dia: "Sábado", tipo: "rutina", nombre: "Cardio Avanzado", completado: false, ejercicios: 7 },
        { dia: "Domingo", tipo: "descanso", completado: false },
      ],
    },
  ];

  constructor(
    private db: InMemoryDatabaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.db.getRutinasByPaciente('1').subscribe((r: Rutina[]) => (this.rutinas = r));
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
    if (dia.completado) return 'bg-green-500 text-white';
    if (dia.tipo === 'descanso') return 'bg-blue-500 text-white';
    return 'bg-primary text-primary-foreground';
  }

  getDiaIcono(dia: DiaPrograma): string {
    if (dia.tipo === 'descanso') return 'local_cafe';
    if (dia.completado) return 'check_circle';
    return 'fitness_center';
  }

  getTiempoEstimado(ejercicios: number): number {
    return ejercicios * 3;
  }

  esdiaPosterior(index: number): boolean {
    // Índice 4 es viernes (0=lunes, 1=martes, 2=miércoles, 3=jueves, 4=viernes)
    const indiceViernesEnSemana = 4;
    return index > indiceViernesEnSemana;
  }

  onChangeInfo(): void {
    console.log('Cambiar información - pendiente de implementar');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
