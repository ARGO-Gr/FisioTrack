import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CrearProgramaDto {
  pacienteId: string;
  nombrePrograma: string;
  descripcion: string;
  diagnostico: string;
  semanas: number;
  fechaInicio: string;
  semanasRutina: SemanaDtoCrear[];
}

export interface SemanaDtoCrear {
  numeroSemana: number;
  dias: DiaDtoCrear[];
}

export interface DiaDtoCrear {
  nombreDia: string;
  ordenDia: number;
  tipo: string; // "rutina" o "descanso"
  nombreRutina?: string;
  ejercicios?: EjercicioDtoCrear[];
}

export interface EjercicioDtoCrear {
  orden: number;
  nombre: string;
  descripcion: string;
  repeticiones: number;
  tiempoDescanso: number;
  instrucciones: string[];
}

export interface ProgramaDetalleDto {
  id: number;
  pacienteId: string;
  pacienteNombre: string;
  fisioterapeutaId: string;
  fisioterapeutaNombre: string;
  nombre: string;
  descripcion: string;
  diagnostico: string;
  fechaInicio: string;
  fechaFin: string;
  totalSemanas: number;
  semanaActual: number;
  activo: boolean;
  diasCompletados: number;
  diasTotales: number;
  semanas: SemanaDetalleDto[];
}

export interface SemanaDetalleDto {
  id: number;
  numeroSemana: number;
  estado: string;
  dias: DiaDetalleDto[];
}

export interface DiaDetalleDto {
  id: number;
  nombreDia: string;
  ordenDia: number;
  tipo: string;
  nombreRutina?: string;
  completado: boolean;
  fechaCompletado: string | null;
  // Nuevo: Campos para incumplimiento y bloqueo
  incumplimiento: boolean;
  fechaIncumplimiento?: string | null;
  bloqueado: boolean;
  motivoBloqueo?: string;
  cantidadEjercicios: number;
  ejercicios: EjercicioDetalleDto[];
}

export interface EjercicioDetalleDto {
  id: number;
  orden: number;
  nombre: string;
  descripcion: string;
  repeticiones: number;
  tiempoDescanso: number;
  instrucciones: string[];
  completado: boolean;
}

export interface ProgresoDto {
  programaId: string;
  nombrePrograma: string;
  semanaActual: number;
  totalSemanas: number;
  diasCompletados: number;
  diasTotales: number;
  ejerciciosCompletados: number;
  ejerciciosTotales: number;
  porcentajeCompletado: number;
  fechaInicio: string;
  fechaFin: string;
  ultimaActualizacion: string;
}

// Nueva interfaz para progreso general con incumplimientos
export interface ProgresoGeneralDto {
  programaId: number;
  pacienteId: string;
  pacienteNombre: string;
  fechaInicio: string;
  fechaFin: string;
  diasCompletados: number;
  diasDescanso: number;
  diasRestantes: number;
  diasTotales: number;
  diasIncumplidos: number;
  porcentajeCompletado: number;
  porcentajeIncumplimiento: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProgramaService {
  private apiUrl = `${environment.apiUrl}/api/programas`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Crear nuevo programa de rehabilitación
  crearPrograma(dto: CrearProgramaDto): Observable<ProgramaDetalleDto> {
    return this.http.post<ProgramaDetalleDto>(
      `${this.apiUrl}/crear`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  // Obtener programa activo del paciente
  obtenerProgramaActivoPaciente(): Observable<ProgramaDetalleDto> {
    return this.http.get<ProgramaDetalleDto>(
      `${this.apiUrl}/paciente/activo`,
      { headers: this.getHeaders() }
    );
  }

  // Obtener todos los programas del paciente
  obtenerProgramasPaciente(): Observable<ProgramaDetalleDto[]> {
    return this.http.get<ProgramaDetalleDto[]>(
      `${this.apiUrl}/paciente`,
      { headers: this.getHeaders() }
    );
  }

  // Obtener programa por ID (fisioterapeuta)
  obtenerProgramaPorId(programaId: string): Observable<ProgramaDetalleDto> {
    return this.http.get<ProgramaDetalleDto>(
      `${this.apiUrl}/${programaId}`,
      { headers: this.getHeaders() }
    );
  }

  // Obtener programas de un paciente específico (fisioterapeuta)
  obtenerProgramasPorPaciente(pacienteId: string): Observable<ProgramaDetalleDto[]> {
    return this.http.get<ProgramaDetalleDto[]>(
      `${this.apiUrl}/paciente/${pacienteId}/programas`,
      { headers: this.getHeaders() }
    );
  }

  // Obtener programa activo de un paciente específico (fisioterapeuta)
  obtenerProgramaActivoPorPaciente(pacienteId: string): Observable<ProgramaDetalleDto> {
    return this.http.get<ProgramaDetalleDto>(
      `${this.apiUrl}/paciente/${pacienteId}/activo`,
      { headers: this.getHeaders() }
    );
  }

  // Actualizar programa existente
  actualizarPrograma(programaId: number, dto: CrearProgramaDto): Observable<ProgramaDetalleDto> {
    return this.http.put<ProgramaDetalleDto>(
      `${this.apiUrl}/${programaId}`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  // Marcar día como completado
  completarDia(diaId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/dia/completar`,
      { 
        diaRutinaId: diaId,
        completado: true 
      },
      { headers: this.getHeaders() }
    );
  }

  // Marcar día como incumplido
  marcarDiaIncumplido(diaId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/dia/incumplimiento`,
      { 
        diaRutinaId: diaId,
        completado: false 
      },
      { headers: this.getHeaders() }
    );
  }

  // Marcar ejercicio como completado
  completarEjercicio(ejercicioId: number, diaRutinaId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/ejercicio/completar`,
      { 
        ejercicioId, 
        diaRutinaId,
        completado: true 
      },
      { headers: this.getHeaders() }
    );
  }

  // Obtener progreso del programa
  obtenerProgreso(programaId: string): Observable<ProgresoDto> {
    return this.http.get<ProgresoDto>(
      `${this.apiUrl}/${programaId}/progreso`,
      { headers: this.getHeaders() }
    );
  }

  // Obtener progreso general con incumplimientos
  obtenerProgresoGeneral(programaId: number): Observable<ProgresoGeneralDto> {
    return this.http.get<ProgresoGeneralDto>(
      `${this.apiUrl}/${programaId}/progreso`,
      { headers: this.getHeaders() }
    );
  }

  // Avanzar a la siguiente semana
  avanzarSemana(programaId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${programaId}/avanzar-semana`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // Finalizar programa
  finalizarPrograma(programaId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${programaId}/finalizar`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
