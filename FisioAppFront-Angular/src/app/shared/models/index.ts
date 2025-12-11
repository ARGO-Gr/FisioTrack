export interface Paciente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  diagnostico: string;
  fechaRegistro: Date;
}

export interface Rutina {
  id: string;
  nombre: string;
  descripcion: string;
  pacienteId: string;
  ejercicios: Ejercicio[];
  fechaCreacion: Date;
  estado: 'activa' | 'completada' | 'pausada';
}

export interface Ejercicio {
  id: string;
  nombre: string;
  descripcion: string;
  series: number;
  repeticiones: number;
  duracion?: number; // en segundos
  imagen?: string;
}

export interface Progreso {
  id: string;
  pacienteId: string;
  rutinaId: string;
  ejercicioId: string;
  fecha: Date;
  completado: boolean;
  notas?: string;
}

export interface Cita {
  id: string;
  fisioterapeutaId: string;
  pacienteId: string;
  fecha: string; // formato YYYY-MM-DD
  hora: string; // formato HH:mm
  descripcion?: string;
  estado: 'pendiente' | 'confirmada' | 'cobrada' | 'cancelada';
}
