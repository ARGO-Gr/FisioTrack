import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Appointment {
  id: string;
  fisioterapeutaId: string;
  pacienteId: string;
  nombrePaciente?: string;
  emailPaciente?: string;
  telefonoPaciente?: string;
  fecha: string;
  hora: string;
  descripcion?: string;
  tipo: string;
  estadoFisio: string;
  estadoPaciente: string;
  estado: string; // backward compatibility
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAppointmentDto {
  pacienteId: string;
  fisioterapeutaId: string;
  fecha: string;
  hora: string;
  descripcion?: string;
  tipo: string;
}

export interface UpdateAppointmentDto {
  pacienteId: string;
  fecha: string;
  hora: string;
  descripcion?: string;
  tipo: string;
  estado: string;
}

export interface PatientListItem {
  id: string;
  nombre: string;
  email: string;
}

export interface LinkedPatientDto {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  diagnostico: string;
  edad?: number;
  fechaNacimiento?: Date;
  fechaIngreso: Date;
  rutinasHistorial: number;
  diasCompletados: number;
  diasTotales: number;
  porcentajeProgreso: number;
  tieneProgramaActivo: boolean;
}

export interface LinkPatientDto {
  pacienteId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/api/appointments`;

  constructor(private http: HttpClient) {}

  /**
   * Endpoint de prueba sin autenticación
   */
  test(): Observable<{ message: string; timestamp: string }> {
    return this.http.get<{ message: string; timestamp: string }>(`${environment.apiUrl}/api/contact/test`);
  }

  /**
   * Endpoint para verificar autenticación
   */
  testAuth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/test-auth`);
  }

  /**
   * Endpoint para debug detallado de JWT
   */
  debugJwt(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/debug-jwt`);
  }

  /**
   * Obtiene todas las citas de un día específico para un fisioterapeuta
   */
  getAppointmentsByDay(fisioterapeutaId: string, fecha: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/dia/${fisioterapeutaId}`, {
      params: { fecha }
    });
  }

  /**
   * Obtiene todas las citas en un rango de fechas para un fisioterapeuta
   */
  getAppointmentsByDateRange(fisioterapeutaId: string, fechaInicio: string, fechaFin: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/rango/${fisioterapeutaId}`, {
      params: { fechaInicio, fechaFin }
    });
  }

  /**
   * Obtiene todas las citas de un paciente específico
   */
  getAppointmentsByPatient(pacienteId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/paciente/${pacienteId}`);
  }

  /**
   * Búsqueda en vivo de pacientes por nombre o email
   */
  searchPatients(search: string): Observable<PatientListItem[]> {
    return this.http.get<PatientListItem[]>(`${this.apiUrl}/buscar-pacientes`, {
      params: { search }
    });
  }

  /**
   * Crea una nueva cita
   */
  createAppointment(appointment: CreateAppointmentDto): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, appointment);
  }

  /**
   * Obtiene una cita específica por su ID
   */
  getAppointmentById(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualiza una cita existente
   */
  updateAppointment(id: string, appointment: UpdateAppointmentDto): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}`, appointment);
  }

  /**
   * Elimina una cita
   */
  deleteAppointment(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cambia el estado de una cita
   */
  changeAppointmentStatus(id: string, newStatus: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/status`, { estado: newStatus });
  }

  /**
   * Cambia el estado del fisio en una cita
   */
  changeAppointmentStatusFisio(id: string, newStatusFisio: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/status-fisio`, { estadoFisio: newStatusFisio });
  }

  /**
   * Cambia el estado del paciente en una cita
   */
  changeAppointmentStatusPaciente(id: string, newStatusPaciente: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/status-paciente`, { estadoPaciente: newStatusPaciente });
  }

  // ==================== Patient Linking Methods ====================

  /**
   * Vincula un usuario como paciente a un fisioterapeuta
   */
  linkPatient(fisioterapeutaId: string, dto: LinkPatientDto): Observable<LinkedPatientDto> {
    return this.http.post<LinkedPatientDto>(
      `${environment.apiUrl}/api/physiotherapists/${fisioterapeutaId}/pacientes`,
      dto
    );
  }

  /**
   * Obtiene los pacientes vinculados a un fisioterapeuta
   */
  getLinkedPatients(fisioterapeutaId: string): Observable<LinkedPatientDto[]> {
    return this.http.get<LinkedPatientDto[]>(
      `${environment.apiUrl}/api/physiotherapists/${fisioterapeutaId}/pacientes`
    );
  }

  /**
   * Desvincula un paciente de un fisioterapeuta
   */
  unlinkPatient(fisioterapeutaId: string, pacienteId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${environment.apiUrl}/api/physiotherapists/${fisioterapeutaId}/pacientes/${pacienteId}`
    );
  }
}
