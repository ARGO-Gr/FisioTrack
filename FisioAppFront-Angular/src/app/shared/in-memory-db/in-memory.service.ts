import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
import { Paciente, Rutina, Ejercicio, Progreso, Cita } from '../models';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDatabaseService {
  // Pacientes
  private pacientes$ = new BehaviorSubject<Paciente[]>([
    {
      id: '1',
      nombre: 'Juan García',
      email: 'juan@example.com',
      telefono: '123456789',
      diagnostico: 'Lesión de rodilla',
      fechaRegistro: new Date('2024-01-15'),
    },
    {
      id: '2',
      nombre: 'María López',
      email: 'maria@example.com',
      telefono: '987654321',
      diagnostico: 'Cervicalgia',
      fechaRegistro: new Date('2024-02-20'),
    },
  ]);

  // Rutinas
  private rutinas$ = new BehaviorSubject<Rutina[]>([
    {
      id: '1',
      nombre: 'Rehabilitación Rodilla - Semana 1',
      descripcion: 'Ejercicios de fortalecimiento y movilidad para rodilla',
      pacienteId: '1',
      ejercicios: [
        {
          id: 'ej1',
          nombre: 'Cuádriceps isométrico',
          descripcion: 'Contracción estática del cuádriceps',
          series: 3,
          repeticiones: 10,
          duracion: 5,
        },
        {
          id: 'ej2',
          nombre: 'Elevación de pierna extendida',
          descripcion: 'Levanta la pierna manteniendo la rodilla extendida',
          series: 3,
          repeticiones: 12,
        },
      ],
      fechaCreacion: new Date('2024-01-20'),
      estado: 'activa',
    },
    {
      id: '2',
      nombre: 'Terapia Cervical - Fase 1',
      descripcion: 'Ejercicios de movilidad cervical y relajación',
      pacienteId: '2',
      ejercicios: [
        {
          id: 'ej3',
          nombre: 'Rotaciones cervicales',
          descripcion: 'Rotación lenta de cuello lado a lado',
          series: 2,
          repeticiones: 10,
        },
      ],
      fechaCreacion: new Date('2024-02-25'),
      estado: 'activa',
    },
  ]);

  // Progreso
  private progreso$ = new BehaviorSubject<Progreso[]>([
    {
      id: '1',
      pacienteId: '1',
      rutinaId: '1',
      ejercicioId: 'ej1',
      fecha: new Date('2024-11-20'),
      completado: true,
      notas: 'Completado sin dolor',
    },
    {
      id: '2',
      pacienteId: '1',
      rutinaId: '1',
      ejercicioId: 'ej2',
      fecha: new Date('2024-11-20'),
      completado: true,
    },
    {
      id: '3',
      pacienteId: '2',
      rutinaId: '2',
      ejercicioId: 'ej3',
      fecha: new Date('2024-11-21'),
      completado: false,
      notas: 'Dolor al rotar',
    },
  ]);

  // Citas
  private citas$ = new BehaviorSubject<Cita[]>([
    {
      id: '1',
      fisioterapeutaId: '1',
      pacienteId: '1',
      fecha: '2024-11-25',
      hora: '10:00',
      descripcion: 'Control de progreso',
      estado: 'confirmada',
    },
    {
      id: '2',
      fisioterapeutaId: '1',
      pacienteId: '2',
      fecha: '2024-11-26',
      hora: '14:00',
      estado: 'pendiente',
    },
  ]);

  // Getters para observables
  getPacientes(): Observable<Paciente[]> {
    return this.pacientes$.pipe(delay(300));
  }

  getRutinas(): Observable<Rutina[]> {
    return this.rutinas$.pipe(delay(300));
  }

  getRutinaById(id: string): Observable<Rutina | undefined> {
    return of(this.rutinas$.value.find(r => r.id === id)).pipe(delay(300));
  }

  getRutinasByPaciente(pacienteId: string): Observable<Rutina[]> {
    return of(this.rutinas$.value.filter(r => r.pacienteId === pacienteId)).pipe(delay(300));
  }

  getProgreso(): Observable<Progreso[]> {
    return this.progreso$.pipe(delay(300));
  }

  getProgresoByPaciente(pacienteId: string): Observable<Progreso[]> {
    return of(this.progreso$.value.filter(p => p.pacienteId === pacienteId)).pipe(delay(300));
  }

  getCitas(): Observable<Cita[]> {
    return this.citas$.pipe(delay(300));
  }

  getCitasByFisioterapeuta(fisioterapeutaId: string): Observable<Cita[]> {
    return of(this.citas$.value.filter(c => c.fisioterapeutaId === fisioterapeutaId)).pipe(delay(300));
  }

  getPacienteById(id: string): Observable<Paciente | undefined> {
    return of(this.pacientes$.value.find(p => p.id === id)).pipe(delay(300));
  }

  // Métodos para agregar/editar datos
  addPaciente(paciente: Paciente): Observable<Paciente> {
    const current = this.pacientes$.value;
    this.pacientes$.next([...current, paciente]);
    return of(paciente).pipe(delay(300));
  }

  addRutina(rutina: Rutina): Observable<Rutina> {
    const current = this.rutinas$.value;
    this.rutinas$.next([...current, rutina]);
    return of(rutina).pipe(delay(300));
  }

  addProgreso(progreso: Progreso): Observable<Progreso> {
    const current = this.progreso$.value;
    this.progreso$.next([...current, progreso]);
    return of(progreso).pipe(delay(300));
  }

  addCita(cita: Cita): Observable<Cita> {
    const current = this.citas$.value;
    this.citas$.next([...current, cita]);
    return of(cita).pipe(delay(300));
  }

  updateRutina(id: string, rutina: Rutina): Observable<Rutina> {
    const current = this.rutinas$.value;
    const index = current.findIndex(r => r.id === id);
    if (index !== -1) {
      current[index] = rutina;
      this.rutinas$.next([...current]);
    }
    return of(rutina).pipe(delay(300));
  }
}
