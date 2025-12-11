import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ButtonComponent } from '../../components/ui/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../components/ui/card.component';
import { ToastService } from '../../shared/services/toast.service';
import { VerifyEmailModalComponent } from '../../shared/components/verify-email-modal.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type UserType = 'patient' | 'physiotherapist';

interface PatientRegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  telefono: string;
  fechaNacimiento?: string;
}

interface PhysioRegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  telefono: string;
  fechaNacimiento?: string;
  licenseNumber: string;
  licenseAuthority: string;
  graduationYear: number;
  specialties: string[];
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <app-card class="w-full max-w-md shadow-xl relative">
        <!-- Back Arrow Button - Inside Card -->
        <button
          type="button"
          (click)="goToHome()"
          class="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50 z-10"
          title="Volver a inicio"
        >
          <mat-icon class="h-6 w-6">arrow_back</mat-icon>
        </button>

        <app-card-header class="space-y-2 pb-6">
          <div class="flex items-center justify-center gap-2 mb-4">
            <mat-icon class="h-8 w-8 text-primary">{{ userType === 'physiotherapist' ? 'medical_services' : 'favorite' }}</mat-icon>
            <app-card-title class="text-2xl">
              {{ userType === 'physiotherapist' ? 'Registro Fisioterapeuta' : 'Registro Paciente' }}
            </app-card-title>
          </div>
            <app-card-description class="text-center text-base">
              Crea tu cuenta
            </app-card-description>
          </app-card-header>

          <app-card-content>
            <div class="space-y-6">
              <!-- Full Name Input -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Nombre Completo</label>
                <input
                  type="text"
                  [(ngModel)]="patientForm.fullName"
                  placeholder="Tu nombre"
                  [disabled]="isLoading"
                  class="w-full px-3 py-2 rounded-md border border-input bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>

              <!-- Email Input -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Correo Electrónico</label>
                <input
                  type="email"
                  [(ngModel)]="patientForm.email"
                  placeholder="tu@correo.com"
                  [disabled]="isLoading"
                  class="w-full px-3 py-2 rounded-md border border-input bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>

              <!-- Phone Number Input -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Número de Teléfono</label>
                <input
                  type="tel"
                  [(ngModel)]="patientForm.telefono"
                  placeholder="+1 (555) 123-4567 o 555-123-4567"
                  [disabled]="isLoading"
                  class="w-full px-3 py-2 rounded-md border border-input bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
                <p class="text-xs text-muted-foreground">Mínimo 10 dígitos, puede incluir +, -, () o espacios</p>
              </div>

              <!-- Birth Date Input -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Fecha de Nacimiento</label>
                <input
                  type="date"
                  [(ngModel)]="patientForm.fechaNacimiento"
                  [disabled]="isLoading"
                  class="w-full px-3 py-2 rounded-md border border-input bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>

              <!-- Physiotherapist License Number (only for physiotherapist) -->
              <ng-container *ngIf="userType === 'physiotherapist'">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground">Número de Licencia</label>
                  <input
                    type="text"
                    [(ngModel)]="physioForm.licenseNumber"
                    placeholder="Tu número de licencia"
                    [disabled]="isLoading"
                    class="w-full px-3 py-2 rounded-md border border-input bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground">Autoridad de Emisión</label>
                  <input
                    type="text"
                    [(ngModel)]="physioForm.licenseAuthority"
                    placeholder="Ej: Colegio Profesional"
                    [disabled]="isLoading"
                    class="w-full px-3 py-2 rounded-md border border-input bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground">Año de Graduación</label>
                  <input
                    type="number"
                    [(ngModel)]="physioForm.graduationYear"
                    [min]="1950"
                    [max]="currentYear"
                    placeholder="Ej: 2020"
                    [disabled]="isLoading"
                    class="w-full px-3 py-2 rounded-md border border-input bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                  <p class="text-xs text-muted-foreground">Debe estar entre 1950 y {{ currentYear }}</p>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground">Especialidades (separadas por comas)</label>
                  <textarea
                    [(ngModel)]="specialtiesText"
                    placeholder="Ej: Fisioterapia deportiva, Rehabilitación"
                    [disabled]="isLoading"
                    rows="3"
                    class="w-full px-3 py-2 rounded-md border border-input bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none"
                  ></textarea>
                  <p class="text-xs text-muted-foreground">Se requiere al menos una especialidad</p>
                </div>
              </ng-container>

              <!-- Password Input -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Contraseña</label>
                <div class="relative">
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    [(ngModel)]="patientForm.password"
                    placeholder="••••••••"
                    [disabled]="isLoading"
                    class="w-full px-3 py-2 pr-10 rounded-md border border-input bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                  <button
                    type="button"
                    (click)="togglePasswordVisibility()"
                    [disabled]="isLoading"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    <mat-icon class="!size-5">{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
              </div>

              <!-- Confirm Password Input -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Confirmar Contraseña</label>
                <div class="relative">
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    [(ngModel)]="patientForm.confirmPassword"
                    placeholder="••••••••"
                    [disabled]="isLoading"
                    class="w-full px-3 py-2 pr-10 rounded-md border border-input bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                  <button
                    type="button"
                    (click)="togglePasswordVisibility()"
                    [disabled]="isLoading"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    <mat-icon class="!size-5">{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
              </div>

              <!-- Register Button -->
              <div class="flex justify-center pt-2">
                <app-button 
                  (click)="register()"
                  [disabled]="isLoading || !isFormValid()"
                  class="px-12"
                  size="lg"
                >
                  <span *ngIf="!isLoading">Crear Cuenta</span>
                  <span *ngIf="isLoading" class="flex items-center gap-2">
                    <mat-icon class="animate-spin !size-4">refresh</mat-icon>
                    Cargando...
                  </span>
                </app-button>
              </div>

              <!-- Links Section -->
              <div class="space-y-3 pt-4 border-t border-border">
                <!-- Sign In Link -->
                <button
                  type="button"
                  (click)="goToLogin()"
                  class="w-full text-sm text-primary hover:underline transition-colors text-center"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </div>
            </div>
          </app-card-content>
      </app-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class RegisterComponent implements OnInit, OnDestroy {
  userType: UserType = 'patient';
  currentYear = new Date().getFullYear();

  patientForm: PatientRegisterForm = {
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    telefono: '',
    fechaNacimiento: ''
  };

  physioForm: PhysioRegisterForm = {
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    telefono: '',
    fechaNacimiento: '',
    licenseNumber: '',
    licenseAuthority: '',
    graduationYear: new Date().getFullYear(),
    specialties: []
  };

  specialtiesText = '';
  isLoading = false;
  showPassword = false;
  private destroy$ = new Subject<void>();

  constructor(
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.userType = data['userType'] || 'patient';
    });
  }

  register(): void {
    if (!this.isFormValid()) {
      this.toastService.warning('Por favor completa todos los campos correctamente');
      return;
    }

    // Validar formato de email
    if (!this.isValidEmail(this.patientForm.email)) {
      this.toastService.error('El correo electrónico no es válido');
      return;
    }

    if (this.patientForm.password !== this.patientForm.confirmPassword) {
      this.toastService.error('Las contraseñas no coinciden');
      return;
    }

    // Validaciones adicionales para fisioterapeuta
    if (this.userType === 'physiotherapist') {
      const currentYear = new Date().getFullYear();
      
      if (this.physioForm.graduationYear < 1950 || this.physioForm.graduationYear > currentYear) {
        this.toastService.error(`El año de graduación debe estar entre 1950 y ${currentYear}`);
        return;
      }

      const specialties = this.specialtiesText
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (specialties.length === 0) {
        this.toastService.error('Se requiere al menos una especialidad');
        return;
      }
    }

    this.isLoading = true;

    if (this.userType === 'physiotherapist') {
      this.physioForm.email = this.patientForm.email;
      this.physioForm.password = this.patientForm.password;
      this.physioForm.fullName = this.patientForm.fullName;
      this.physioForm.telefono = this.patientForm.telefono;
      this.physioForm.fechaNacimiento = this.patientForm.fechaNacimiento ? new Date(this.patientForm.fechaNacimiento).toISOString() : undefined;
      this.physioForm.specialties = this.specialtiesText
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      this.http.post(`${environment.apiUrl}/api/physiotherapists/register`, this.physioForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.isLoading = false;
            this.openVerifyEmailModal();
          },
          error: (err) => {
            this.isLoading = false;
            const errorMessage = err.error?.error || 'Error al crear la cuenta';
            this.toastService.error(errorMessage);
          }
        });
    } else {
      this.http.post(`${environment.apiUrl}/api/auth/register`, {
        ...this.patientForm,
        fechaNacimiento: this.patientForm.fechaNacimiento ? new Date(this.patientForm.fechaNacimiento).toISOString() : null
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.isLoading = false;
            this.openVerifyEmailModal();
          },
          error: (err) => {
            this.isLoading = false;
            const errorMessage = err.error?.error || 'Error al crear la cuenta';
            this.toastService.error(errorMessage);
          }
        });
    }
  }

  isFormValid(): boolean {
    // Validación de teléfono
    const isPhoneValid = /^\+?[0-9\s\-()]{10,}$/.test(this.patientForm.telefono?.trim() || '');

    if (this.userType === 'physiotherapist') {
      const currentYear = new Date().getFullYear();
      const isGraduationYearValid = this.physioForm.graduationYear >= 1950 && this.physioForm.graduationYear <= currentYear;
      const specialtiesArray = this.specialtiesText
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      return !!(
        this.patientForm.fullName &&
        this.patientForm.email &&
        this.isValidEmail(this.patientForm.email) &&
        this.patientForm.password &&
        this.patientForm.confirmPassword &&
        isPhoneValid &&
        this.physioForm.licenseNumber &&
        this.physioForm.licenseAuthority &&
        isGraduationYearValid &&
        specialtiesArray.length > 0
      );
    } else {
      return !!(
        this.patientForm.fullName &&
        this.patientForm.email &&
        this.isValidEmail(this.patientForm.email) &&
        this.patientForm.password &&
        this.patientForm.confirmPassword &&
        isPhoneValid
      );
    }
  }

  /**
   * Valida que el email tenga un formato válido
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goToLogin(): void {
    const loginPath = this.userType === 'physiotherapist'
      ? '/login/physiotherapist'
      : '/login/patient';
    this.router.navigate([loginPath]);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  openVerifyEmailModal(): void {
    const dialogRef = this.dialog.open(VerifyEmailModalComponent, {
      width: '500px',
      disableClose: true,
      data: {
        email: this.patientForm.email,
        userType: this.userType
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'navigate-to-login') {
        const loginPath = this.userType === 'physiotherapist'
          ? '/login/physiotherapist'
          : '/login/patient';
        this.router.navigate([loginPath]);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
