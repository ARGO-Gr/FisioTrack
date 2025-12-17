import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../components/ui/card.component';
import { ButtonComponent } from '../../../components/ui/button.component';
import { AuthService } from '../../../shared/services/auth.service';
import { AppointmentService, LinkedPatientDto, LinkPatientDto } from '../../../shared/services/appointment.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ProgramaService, ProgramaDetalleDto } from '../../../shared/services/programa.service';
import { AddPatientModalComponent } from '../../../shared/components/add-patient-modal.component';
import { AssignRoutineModalComponent } from './asignar rutina/assign-routine-modal.component';
import { ConfirmDeleteModalComponent, ConfirmDeleteData } from '../../../shared/components/confirm-delete-modal.component';
import { PatientProgressModalComponent } from './patient-progress/patient-progress-modal.component';
import { PatientAppointmentsModalComponent } from './patient-appointments/patient-appointments-modal.component';
import { HeaderComponent, NavLink } from '../../../shared/components/header.component';
import { Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface PacienteVinculado extends LinkedPatientDto {
  // Extendemos el DTO con propiedades adicionales si las necesitamos
}

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent,
    HeaderComponent,
  ],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <app-header
        [navLinks]="navLinks"
        (changeInfo)="onChangeInfo()"
        (logout)="logout()"
      ></app-header>

      <main class="container mx-auto px-4 py-8">
        <!-- Page Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-4xl font-bold mb-2">Gestión de Pacientes</h2>
            <p class="text-muted-foreground">Administra la información de tus pacientes</p>
          </div>
          <button
            (click)="openAddPatientModal()"
            class="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            <mat-icon>add</mat-icon>
            <span>Vincular Paciente</span>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="mb-6">
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="Buscar pacientes por nombre..."
              class="w-full px-4 py-3 pl-10 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">search</mat-icon>
          </div>
        </div>

        <!-- Patients Grid -->
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Patients List -->
          <div class="lg:col-span-2 space-y-4">
            <div *ngIf="!loading && filteredPacientes.length > 0; else noPacientesOrLoading">
              <div *ngFor="let paciente of filteredPacientes" class="space-y-4">
                <app-card
                  class="cursor-pointer hover:shadow-lg transition-all"
                  [ngClass]="{
                    'border-2 border-destructive bg-destructive/5': selectedPaciente?.id === paciente.id
                  }"
                  (click)="selectPaciente(paciente)"
                >
                  <app-card-content class="p-6">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <!-- Initials Avatar -->
                        <div class="flex items-center gap-3 mb-3">
                          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span class="text-lg font-semibold text-primary">
                              {{ getInitials(paciente.nombre) }}
                            </span>
                          </div>
                          <div>
                            <h3 class="text-lg font-semibold text-foreground">{{ paciente.nombre }}</h3>
                            <p class="text-sm text-muted-foreground">{{ calculateAge(paciente.fechaNacimiento) }} años</p>
                          </div>
                        </div>

                        <!-- Patient Info -->
                        <div class="grid grid-cols-2 gap-4 mb-3">
                          <div class="flex items-center gap-2 text-sm text-muted-foreground">
                            <mat-icon>phone</mat-icon>
                            <span>{{ paciente.telefono || 'Sin teléfono' }}</span>
                          </div>
                          <div class="flex items-center gap-2 text-sm text-muted-foreground">
                            <mat-icon>email</mat-icon>
                            <span class="truncate">{{ paciente.email }}</span>
                          </div>
                          <div class="flex items-center gap-2 text-sm text-muted-foreground">
                            <mat-icon>calendar_today</mat-icon>
                            <span>Ingreso: {{ formatDate(paciente.fechaIngreso) }}</span>
                          </div>
                        </div>

                        <!-- Barra de Progreso -->
                        <div *ngIf="paciente.tieneProgramaActivo" class="mt-4 space-y-2">
                          <div class="flex items-center justify-between text-sm">
                            <span class="text-muted-foreground">Progreso del Programa</span>
                            <span class="font-medium text-foreground">
                              {{ paciente.diasCompletados }}/{{ paciente.diasTotales }} días ({{ paciente.porcentajeProgreso }}%)
                            </span>
                          </div>
                          <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              class="bg-primary h-full transition-all duration-300"
                              [style.width.%]="paciente.porcentajeProgreso"
                            ></div>
                          </div>
                        </div>
                        <div *ngIf="!paciente.tieneProgramaActivo" class="mt-4">
                          <div class="flex items-center gap-2 text-sm text-muted-foreground">
                            <mat-icon class="text-base">info</mat-icon>
                            <span>Sin programa activo</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </app-card-content>
                </app-card>
              </div>
            </div>

            <ng-template #noPacientesOrLoading>
              <app-card class="text-center p-12">
                <div class="flex flex-col items-center justify-center">
                  <mat-icon class="text-muted-foreground mb-4 opacity-50" *ngIf="!loading">person_off</mat-icon>
                  <div class="animate-spin" *ngIf="loading">
                    <mat-icon class="text-primary mb-4">refresh</mat-icon>
                  </div>
                  <p class="text-muted-foreground">{{ loading ? 'Cargando pacientes...' : 'No hay pacientes para mostrar' }}</p>
                </div>
              </app-card>
            </ng-template>
          </div>

          <!-- Patient Details Sidebar -->
          <div class="lg:col-span-1">
            <div *ngIf="selectedPaciente; else noSelection" class="sticky top-24">
              <app-card>
                <app-card-content class="space-y-6">
                  <!-- Action Buttons -->
                  <div class="space-y-2 border-border">
                    <button
                      (click)="navigateToProgress()"
                      class="w-full px-4 py-3 rounded-lg border border-border text-foreground bg-background hover:bg-muted transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <mat-icon>bar_chart</mat-icon>
                      Ver Progreso Detallado
                    </button>

                    <button
                      (click)="navigateToAppointments()"
                      class="w-full px-4 py-3 rounded-lg border border-border text-foreground bg-background hover:bg-muted transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <mat-icon>event</mat-icon>
                      Ver Calendario de Citas
                    </button>

                    <button
                      (click)="openAssignRoutineModal()"
                      class="w-full px-4 py-3 rounded-lg border border-border text-foreground bg-background hover:bg-muted transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <mat-icon>fitness_center</mat-icon>
                      {{ programaActivo ? 'Rutina' : 'Asignar Rutina' }}
                    </button>

                    <button
                      (click)="openDeleteConfirmModal()"
                      class="w-full px-4 py-3 rounded-lg border border-destructive text-destructive bg-background hover:bg-destructive/10 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <mat-icon>delete</mat-icon>
                      Desvincular Paciente
                    </button>
                  </div>
                </app-card-content>
              </app-card>
            </div>

            <ng-template #noSelection>
              <app-card class="sticky top-24">
                <app-card-content class="p-12 text-center">
                  <mat-icon class="text-muted-foreground mx-auto mb-4 opacity-50">person</mat-icon>
                  <p class="text-muted-foreground">Selecciona un paciente para ver sus opciones</p>
                </app-card-content>
              </app-card>
            </ng-template>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class PacientesComponent implements OnInit, OnDestroy {
  pacientes: PacienteVinculado[] = [];
  selectedPaciente: PacienteVinculado | null = null;
  programaActivo: ProgramaDetalleDto | null = null;
  searchTerm = '';
  loading = true;
  fisioterapeutaId: string = '';
  private destroy$ = new Subject<void>();

  navLinks: NavLink[] = [
    { label: 'Dashboard', route: '/fisioterapeuta/dashboard' },
    { label: 'Agenda', route: '/fisioterapeuta/agenda' },
    { label: 'Pacientes', route: '/fisioterapeuta/pacientes' },
    { label: 'Historial de Cobros', route: '/fisioterapeuta/historial-cobros' },
  ];

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private programaService: ProgramaService,
    private router: Router,
    private dialog: MatDialog,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    // Obtener el ID del fisioterapeuta del token
    const userId = this.authService.getUserId();
    if (userId) {
      this.fisioterapeutaId = userId;
      this.loadPacientes();
    } else {
      this.toastService.error('No se pudo obtener el ID del usuario');
      this.router.navigate(['/']);
    }
  }

  loadPacientes() {
    this.loading = true;
    this.appointmentService
      .getLinkedPatients(this.fisioterapeutaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pacientes) => {
          this.pacientes = pacientes;
          this.loading = false;
          
          // Verificar si hay un pacienteId en los queryParams
          this.activatedRoute.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
              if (params['pacienteId']) {
                const pacienteId = params['pacienteId'];
                const pacienteEncontrado = this.pacientes.find(p => p.id === pacienteId);
                if (pacienteEncontrado) {
                  this.selectPaciente(pacienteEncontrado);
                }
              }
            });
        },
        error: (error) => {
          console.error('Error loading patients:', error);
          this.toastService.error('Error al cargar los pacientes');
          this.loading = false;
        },
      });
  }

  get filteredPacientes(): PacienteVinculado[] {
    if (!this.searchTerm) {
      return this.pacientes;
    }
    return this.pacientes.filter(p =>
      p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectPaciente(paciente: PacienteVinculado) {
    this.selectedPaciente = paciente;
    this.programaActivo = null;
    
    // Verificar si el paciente tiene una rutina activa
    this.programaService
      .obtenerProgramaActivoPorPaciente(paciente.id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of(null))
      )
      .subscribe({
        next: (programa) => {
          this.programaActivo = programa;
        },
        error: () => {
          this.programaActivo = null;
        }
      });
  }

  openAddPatientModal() {
    const dialogRef = this.dialog.open(AddPatientModalComponent, {
      width: '600px',
      maxWidth: '90vw',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Vincular el paciente mediante la API
        const linkDto: LinkPatientDto = {
          pacienteId: result.pacienteId,
        };

        this.appointmentService
          .linkPatient(this.fisioterapeutaId, linkDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (newPatient) => {
              this.pacientes.push(newPatient);
              this.selectedPaciente = newPatient;
              this.toastService.success('Paciente vinculado exitosamente');
            },
            error: (error) => {
              console.error('Error linking patient:', error);
              // Capturar el mensaje específico del servidor
              const errorMessage = error.error?.error || 'Error al vincular el paciente';
              this.toastService.error(errorMessage);
            },
          });
      }
    });
  }

  openAssignRoutineModal() {
    if (!this.selectedPaciente) {
      this.toastService.error('Selecciona un paciente primero');
      return;
    }

    const dialogRef = this.dialog.open(AssignRoutineModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: {
        pacienteName: this.selectedPaciente.nombre,
        pacienteId: this.selectedPaciente.id,
        programaActivo: this.programaActivo,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        console.log('Programa creado/actualizado:', result.programa);
        this.toastService.success(result.mensaje || 'Programa de rehabilitación guardado exitosamente');
        // Recargar programa activo
        if (this.selectedPaciente) {
          this.selectPaciente(this.selectedPaciente);
        }
      }
    });
  }

  openDeleteConfirmModal() {
    if (!this.selectedPaciente) return;

    const dialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        title: 'Desvincular Paciente',
        message: `¿Estás seguro de que deseas desvincular este paciente? Esta acción no se puede deshacer.`,
        pacienteNombre: this.selectedPaciente.nombre,
        pacienteEmail: this.selectedPaciente.email,
        pacienteTelefono: this.selectedPaciente.telefono,
        diagnostico: this.selectedPaciente.diagnostico,
        confirmText: 'Desvincular',
        cancelText: 'Cancelar',
        isDangerous: true,
      } as ConfirmDeleteData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deletePaciente();
      }
    });
  }

  deletePaciente() {
    if (!this.selectedPaciente) return;

    this.appointmentService
      .unlinkPatient(this.fisioterapeutaId, this.selectedPaciente.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.pacientes = this.pacientes.filter(
            p => p.id !== this.selectedPaciente?.id
          );
          this.selectedPaciente = null;
          this.toastService.success('Paciente desvinculado exitosamente');
        },
        error: (error) => {
          console.error('Error unlinking patient:', error);
          this.toastService.error('Error al desvincular el paciente');
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES');
  }

  onChangeInfo(): void {
    // TODO: Implementar modal para cambiar información del usuario
    console.log('Cambiar información - pendiente de implementar');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  navigateToProgress() {
    if (!this.selectedPaciente) {
      this.toastService.error('Selecciona un paciente primero');
      return;
    }
    
    const dialogRef = this.dialog.open(PatientProgressModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: {
        pacienteId: this.selectedPaciente.id,
        nombrePaciente: this.selectedPaciente.nombre
      }
    });
  }

  navigateToAppointments() {
    if (!this.selectedPaciente) {
      this.toastService.error('Selecciona un paciente primero');
      return;
    }
    
    const dialogRef = this.dialog.open(PatientAppointmentsModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: {
        pacienteId: this.selectedPaciente.id,
        nombrePaciente: this.selectedPaciente.nombre
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
