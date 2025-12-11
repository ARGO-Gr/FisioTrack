import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../components/ui/card.component';
import { ButtonComponent } from '../../../components/ui/button.component';
import { AuthService } from '../../../shared/services/auth.service';
import { AppointmentService, LinkedPatientDto, LinkPatientDto } from '../../../shared/services/appointment.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AddPatientModalComponent } from '../../../shared/components/add-patient-modal.component';
import { AssignRoutineModalComponent } from '../../../shared/components/assign-routine-modal.component';
import { ConfirmDeleteModalComponent, ConfirmDeleteData } from '../../../shared/components/confirm-delete-modal.component';
import { UserMenuComponent } from '../../../shared/components/user-menu.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    UserMenuComponent,
  ],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <header class="border-b border-border bg-card sticky top-0 z-50">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <mat-icon class="text-primary">favorite_border</mat-icon>
              <h1 class="text-2xl font-bold">FisioTrack</h1>
            </div>
            <nav class="flex items-center gap-4">
              <a routerLink="/fisioterapeuta/dashboard" class="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </a>
              <a routerLink="/fisioterapeuta/agenda" class="text-sm font-medium hover:text-primary transition-colors">
                Agenda
              </a>
              <a routerLink="/fisioterapeuta/pacientes" class="text-sm font-medium hover:text-primary transition-colors">
                Pacientes
              </a>
              <app-user-menu
                (changeInfo)="onChangeInfo()"
                (logout)="logout()"
              ></app-user-menu>
            </nav>
          </div>
        </div>
      </header>

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
              <app-card
                *ngFor="let paciente of filteredPacientes"
                class="cursor-pointer hover:shadow-lg transition-shadow"
                [class.ring-2]="selectedPaciente?.id === paciente.id"
                [class.ring-primary]="selectedPaciente?.id === paciente.id"
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
                          <mat-icon >phone</mat-icon>
                          <span>{{ paciente.telefono || 'Sin teléfono' }}</span>
                        </div>
                        <div class="flex items-center gap-2 text-sm text-muted-foreground">
                          <mat-icon >email</mat-icon>
                          <span class="truncate">{{ paciente.email }}</span>
                        </div>
                        <div class="flex items-center gap-2 text-sm text-muted-foreground">
                          <mat-icon >calendar_today</mat-icon>
                          <span>Ingreso: {{ formatDate(paciente.fechaIngreso) }}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </app-card-content>
              </app-card>
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
                <app-card-header>
                  <app-card-title>Detalles del Paciente</app-card-title>
                </app-card-header>
                <app-card-content class="space-y-6">
                  <!-- Personal Info -->
                  <div>
                    <h4 class="font-semibold text-foreground mb-2">Información Personal</h4>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-muted-foreground">Nombre:</span>
                        <span class="font-medium text-foreground">{{ selectedPaciente.nombre }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-muted-foreground">Edad:</span>
                        <span class="font-medium text-foreground">{{ calculateAge(selectedPaciente.fechaNacimiento) }} años</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-muted-foreground">Teléfono:</span>
                        <span class="font-medium text-foreground">{{ selectedPaciente.telefono || 'N/A' }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-muted-foreground">Email:</span>
                        <span class="font-medium text-foreground text-xs truncate">{{ selectedPaciente.email }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-muted-foreground">Fecha Ingreso:</span>
                        <span class="font-medium text-foreground">{{ formatDate(selectedPaciente.fechaIngreso) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="mt-5 space-y-2 pt-4 border-t border-border">
                    <button
                      (click)="navigateToProgress()"
                      class="w-full px-4 py-3 rounded-lg border border-border text-foreground bg-background hover:bg-muted transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <mat-icon>bar_chart</mat-icon>
                      Ver Progreso Detallado
                    </button>

                    <button
                      (click)="openAssignRoutineModal()"
                      class="w-full px-4 py-3 rounded-lg border border-border text-foreground bg-background hover:bg-muted transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <mat-icon>fitness_center</mat-icon>
                      Asignar Rutina
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
                  <p class="text-muted-foreground">Selecciona un paciente para ver sus detalles</p>
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
  searchTerm = '';
  loading = true;
  fisioterapeutaId: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private toastService: ToastService
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
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Aquí puedes enviar los datos a tu API para guardar la rutina
        console.log('Routine data:', result);
        this.toastService.success('Rutina asignada exitosamente');
        // TODO: Implementar la llamada API para guardar la rutina
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
    this.router.navigate([`/fisioterapeuta/pacientes/${this.selectedPaciente.id}/progreso`]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
