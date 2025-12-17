import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../components/ui/card.component';
import { InMemoryDatabaseService } from '../../../shared/in-memory-db/in-memory.service';
import { AuthService } from '../../../shared/services/auth.service';
import { AppointmentService, Appointment, LinkedPatientDto } from '../../../shared/services/appointment.service';
import { Paciente, Rutina, Cita } from '../../../shared/models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ResumenCitasModalComponent } from '../../../shared/components/dialogs/resumen-citas-modal.component';
import { HeaderComponent, NavLink } from '../../../shared/components/header.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-fisioterapeuta-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    MatIconModule,
    MatButtonModule,
    HeaderComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class FisioterapeutaDashboardComponent implements OnInit, OnDestroy {
  pacientes: Paciente[] = [];
  rutinas: Rutina[] = [];
  citas: Cita[] = [];
  proximasCitas: Appointment[] = [];
  todasLasCitas: Appointment[] = [];
  pacientesVinculados: LinkedPatientDto[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  navLinks: NavLink[] = [
    { label: 'Dashboard', route: '/fisioterapeuta/dashboard' },
    { label: 'Agenda', route: '/fisioterapeuta/agenda' },
    { label: 'Pacientes', route: '/fisioterapeuta/pacientes' },
    { label: 'Historial de Cobros', route: '/fisioterapeuta/historial-cobros' },
  ];

  constructor(
    private db: InMemoryDatabaseService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.db.getPacientes().subscribe(p => (this.pacientes = p));
    this.db.getRutinas().subscribe(r => (this.rutinas = r));
    this.db.getCitasByFisioterapeuta('1').subscribe(c => {
      this.citas = c;
      this.loading = false;
    });
    
    // Cargar las próximas 5 citas del día actual
    this.loadProximasCitas();
    
    // Cargar pacientes vinculados
    this.loadPacientesVinculados();
  }

  loadPacientesVinculados() {
    const fisioterapeutaId = this.authService.getUserId();
    
    if (!fisioterapeutaId) {
      console.error('No fisioterapeuta ID available');
      return;
    }

    this.appointmentService.getLinkedPatients(fisioterapeutaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pacientes) => {
          this.pacientesVinculados = pacientes;
        },
        error: (error) => {
          console.error('Error loading pacientes vinculados:', error);
        }
      });
  }

  loadProximasCitas() {
    const fisioterapeutaId = this.authService.getUserId();
    
    console.log('🔍 loadProximasCitas - fisioterapeutaId:', fisioterapeutaId);
    
    if (!fisioterapeutaId) {
      console.error('❌ No fisioterapeuta ID available');
      return;
    }

    // Usar fecha local en lugar de UTC
    const ahora = new Date();
    const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
    console.log('📅 Fecha actual (hoy):', hoy);
    
    this.appointmentService.getAppointmentsByDay(fisioterapeutaId, hoy)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (citas: Appointment[]) => {
          console.log('✅ Citas recibidas del backend:', citas);
          console.log('📊 Número de citas:', citas.length);
          
          // Guardar todas las citas del día
          this.todasLasCitas = citas;
          
          // Obtener la hora actual
          const ahora = new Date();
          const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' + 
                            ahora.getMinutes().toString().padStart(2, '0');
          
          console.log('⏰ Hora actual:', horaActual);
          
          // Filtrar citas desde la hora actual en adelante
          const citasValidas = citas.filter(c => c.hora >= horaActual);
          console.log('✔️ Citas válidas (desde hora actual):', citasValidas.length, citasValidas);
          
          // Filtrar solo citas amarillas (pendientes), azules (ambas confirmadas) y naranjas (cobro pendiente)
          this.proximasCitas = citasValidas
            .filter(c => {
              const citaColor = this.getCitaColor(c);
              return citaColor.includes('yellow') || citaColor.includes('blue') || citaColor.includes('orange');
            })
            .slice(0, 5);
          
          console.log('🎯 Próximas citas filtradas:', this.proximasCitas.length, this.proximasCitas);
        },
        error: (error) => {
          console.error('❌ Error loading próximas citas:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
        }
      });
  }

  getCountPendingAppointments(): number {
    // Contar solo citas amarillas y azules
    return this.proximasCitas.length;
  }

  getColorFisio(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-400';
      case 'confirmadofisio':
        return 'bg-blue-400';
      case 'cobrado':
        return 'bg-green-400';
      case 'cobropendiente':
        return 'bg-orange-400';
      case 'canceladafisio':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  }

  getColorPaciente(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-400';
      case 'confirmadopaciente':
        return 'bg-blue-400';
      case 'canceladapaciente':
        return 'bg-orange-400';
      default:
        return 'bg-gray-400';
    }
  }

  getCitaColor(cita: Appointment): string {
    const estadoFisio = cita.estadoFisio?.toLowerCase();
    const estadoPaciente = cita.estadoPaciente?.toLowerCase();

    // Verde si está cobrado
    if (estadoFisio === 'cobrado') {
      return 'bg-green-100 border-green-300';
    }

    // Naranja si está con cobro pendiente
    if (estadoFisio === 'cobropendiente') {
      return 'bg-orange-100 border-orange-300';
    }

    // Rojo si al menos uno está cancelado
    if (estadoFisio === 'canceladafisio' || estadoPaciente === 'canceladapaciente') {
      return 'bg-red-100 border-red-300';
    }

    // Azul si ambos están confirmados
    if (estadoFisio === 'confirmadofisio' && estadoPaciente === 'confirmadopaciente') {
      return 'bg-blue-100 border-blue-300';
    }

    // Amarillo si al menos uno está pendiente
    return 'bg-yellow-100 border-yellow-300';
  }

  getCountAmarillasCitas(): number {
    return this.todasLasCitas.filter(c => this.getCitaColor(c).includes('yellow')).length;
  }

  getCountAzulesCitas(): number {
    return this.todasLasCitas.filter(c => this.getCitaColor(c).includes('blue')).length;
  }

  getCountVerdesCitas(): number {
    return this.todasLasCitas.filter(c => this.getCitaColor(c).includes('green')).length;
  }

  getCountRojasCitas(): number {
    return this.todasLasCitas.filter(c => this.getCitaColor(c).includes('red')).length;
  }

  openResumenModal(): void {
    this.dialog.open(ResumenCitasModalComponent, {
      width: '500px',
      data: {
        // El modal cargará las citas desde la API cuando seleccione una fecha
      },
    });
  }

  getInitials(nombre: string): string {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  calculateAge(fechaNacimiento?: Date): number {
    if (!fechaNacimiento) return 0;
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  onChangeInfo(): void {
    // TODO: Implementar modal para cambiar información del usuario
    console.log('Cambiar información - pendiente de implementar');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
