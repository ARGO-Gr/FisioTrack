import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ProfileService, UserProfileDto, PhysiotherapistProfileDto } from '../../shared/services/profile.service';
import { AuthService } from '../../shared/services/auth.service';
import { PaymentMethodsComponent } from './payment-methods/payment-methods.component';
import { HeaderComponent, NavLink } from '../../shared/components/header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    PaymentMethodsComponent,
    HeaderComponent
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
        <div class="mb-8">
          <div class="flex items-center gap-4 mb-2">
            <mat-icon class="text-primary">person</mat-icon>
            <div>
              <h1 class="text-4xl font-bold text-foreground">Mi Perfil</h1>
              <p class="text-muted-foreground mt-1">Gestiona tu información personal{{ showPaymentMethods ? ' y métodos de pago' : '' }}</p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="!user" class="flex items-center justify-center py-12">
          <div class="text-center">
            <mat-icon class="text-primary animate-spin text-4xl">refresh</mat-icon>
            <p class="text-muted-foreground mt-4">Cargando perfil...</p>
          </div>
        </div>

        <!-- Main Content -->
        <div *ngIf="user" class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start max-w-4xl mx-auto">
          <!-- Left Column: User Profile Info -->
          <div class="flex justify-center">
            <!-- Sidebar - Centered -->
            <div class="w-full max-w-sm space-y-6 rounded-xl border border-border bg-white p-6">
            <div class="flex justify-center mb-3">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                {{ getInitials(user.fullName) }}
              </div>
            </div>

            <!-- User Name and Email -->
            <div class="text-center">
              <h2 class="text-2xl font-bold text-foreground">{{ user.fullName || 'Usuario' }}</h2>
              <p class="text-sm text-muted-foreground mt-1">{{ user.email }}</p>
            </div>

            <!-- Information Cards Section -->
            <div class="space-y-1 mt-0">
              <!-- User Info Card -->
              <mat-card>
              <mat-card-content class="p-6">
                <h3 class="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <mat-icon class="text-primary">info</mat-icon>
                  Información General
                </h3>

                <!-- Quick Info -->
                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <mat-icon class="text-primary">email</mat-icon>
                    <div class="min-w-0">
                      <p class="text-xs text-muted-foreground">Correo</p>
                      <p class="text-sm text-foreground truncate">{{ user.email }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3" *ngIf="user.telefono">
                    <mat-icon class="text-primary">phone</mat-icon>
                    <div class="min-w-0">
                      <p class="text-xs text-muted-foreground">Teléfono</p>
                      <p class="text-sm text-foreground">{{ user.telefono }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3" *ngIf="user.fechaNacimiento">
                    <mat-icon class="text-primary">cake</mat-icon>
                    <div class="min-w-0">
                      <p class="text-xs text-muted-foreground">Nacimiento</p>
                      <p class="text-sm text-foreground">{{ formatDate(user.fechaNacimiento) }}</p>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>



            <!-- Physiotherapist Profile Card (only for physiotherapists) -->
            <mat-card *ngIf="userRole === 'physiotherapist' && physioProfile">
            <mat-divider></mat-divider>
              <mat-card-content class="p-6 mt-5">
                <h3 class="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <mat-icon class="text-primary">school</mat-icon>
                  Información Profesional
                </h3>
                <div class="space-y-4">
                  <!-- License -->
                  <div class="flex items-start gap-3">
                    <mat-icon class="text-primary mt-1">badge</mat-icon>
                    <div class="min-w-0">
                      <p class="text-xs text-muted-foreground">Número de Licencia</p>
                      <p class="text-sm text-foreground font-medium">{{ physioProfile.licenseNumber }}</p>
                    </div>
                  </div>

                  <!-- License Authority -->
                  <div class="flex items-start gap-3">
                    <mat-icon class="text-primary mt-1">gavel</mat-icon>
                    <div class="min-w-0">
                      <p class="text-xs text-muted-foreground">Autoridad Emisora</p>
                      <p class="text-sm text-foreground">{{ physioProfile.licenseAuthority }}</p>
                    </div>
                  </div>

                  <!-- Graduation Year -->
                  <div class="flex items-start gap-3">
                    <mat-icon class="text-primary mt-1">calendar_today</mat-icon>
                    <div class="min-w-0">
                      <p class="text-xs text-muted-foreground">Año de Graduación</p>
                      <p class="text-sm text-foreground">{{ physioProfile.graduationYear }}</p>
                    </div>
                  </div>

                  <!-- Specialties -->
                  <div class="flex items-start gap-3">
                    <mat-icon class="text-primary mt-1">local_hospital</mat-icon>
                    <div class="min-w-0">
                      <p class="text-xs text-muted-foreground">Especialidades</p>
                      <div class="flex flex-wrap gap-2 mt-2">
                        <span *ngFor="let specialty of getSpecialties()" class="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                          {{ specialty }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
            </div>
          </div>
          </div>

          <!-- Right Column: Payment Methods (for patients only) -->
          <div *ngIf="showPaymentMethods">
            <app-payment-methods></app-payment-methods>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    mat-card {
      background: white;
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: UserProfileDto | null = null;
  physioProfile: PhysiotherapistProfileDto | null = null;
  showPaymentMethods = false;
  userRole: string | null = null;
  private destroy$ = new Subject<void>();

  navLinks: NavLink[] = [
    { label: 'Dashboard', route: '/paciente/dashboard' },
    { label: 'Rutinas', route: '/paciente/rutinas' },
    { label: 'Citas', route: '/paciente/citas' },
    { label: 'Pagos', route: '/paciente/pagos-pendientes' },
  ];

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadUserProfile();
    this.updateNavLinks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserProfile(): void {
    this.profileService.getUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.user = profile;
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          if (error.status === 401) {
            this.router.navigate(['/auth/login']);
          }
        }
      });
  }

  private checkUserRole(): void {
    this.authService.userRole$.pipe(takeUntil(this.destroy$))
      .subscribe((role) => {
        this.userRole = role;
        this.showPaymentMethods = role === 'patient';
        if (role === 'physiotherapist') {
          this.loadPhysiotherapistProfile();
        }
        this.updateNavLinks();
      });
  }

  private loadPhysiotherapistProfile(): void {
    this.profileService.getPhysiotherapistProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.physioProfile = profile;
        },
        error: (error) => {
          console.error('Error loading physiotherapist profile:', error);
        }
      });
  }

  private updateNavLinks(): void {
    const role = this.authService.getUserRole();
    if (role === 'physiotherapist') {
      this.navLinks = [
        { label: 'Dashboard', route: '/fisioterapeuta/dashboard' },
        { label: 'Pacientes', route: '/fisioterapeuta/pacientes' },
        { label: 'Agenda', route: '/fisioterapeuta/agenda' },
        { label: 'Cobros', route: '/fisioterapeuta/historial-cobros' },
      ];
    }
  }

  onUserUpdated(updatedUser: UserProfileDto): void {
    this.user = updatedUser;
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onChangeInfo(): void {
    // Ya estamos en la página de perfil
    console.log('Ya estás en tu perfil');
  }

  getSpecialties(): string[] {
    if (!this.physioProfile?.specialties) return [];
    // Split by pipe character: "Traumatología|Deportiva|Neurológica"
    return this.physioProfile.specialties.split('|').filter(s => s.trim());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
