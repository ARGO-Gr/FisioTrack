import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../../components/ui/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../components/ui/card.component';
import { AuthService, LoginDto } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { UnlockAccountModalComponent } from '../../shared/components/unlock-account-modal.component';
import { ForgotPasswordModalComponent } from '../../shared/components/forgot-password-modal.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

type UserType = 'patient' | 'physiotherapist';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatDialogModule,
    MatIconModule,
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
              {{ userType === 'physiotherapist' ? 'Fisioterapeuta' : 'Paciente' }}
            </app-card-title>
          </div>
          <app-card-description class="text-center text-base">
            Inicia sesión en tu cuenta
          </app-card-description>
        </app-card-header>

        <app-card-content>
          <div class="space-y-6">
            <!-- Email Input -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Correo Electrónico</label>
              <input
                type="email"
                [(ngModel)]="loginForm.email"
                placeholder="tu@correo.com"
                [disabled]="isLoading"
                class="w-full px-3 py-2 rounded-md border border-input bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>

            <!-- Password Input -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Contraseña</label>
              <div class="relative">
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="loginForm.password"
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

            <!-- Login Button -->
            <div class="flex justify-center pt-2">
              <app-button 
                (click)="login()"
                [disabled]="isLoading || !loginForm.email || !loginForm.password"
                class="px-12"
                size="lg"
              >
                <span *ngIf="!isLoading">Iniciar Sesión</span>
                <span *ngIf="isLoading" class="flex items-center gap-2">
                  <mat-icon class="animate-spin">refresh</mat-icon>
                  Cargando...
                </span>
              </app-button>
            </div>

            <!-- Links Section -->
            <div class="space-y-3 pt-4 border-t border-border">
              <!-- Sign Up Link -->
              <button
                type="button"
                (click)="goToSignUp()"
                class="w-full text-sm text-primary hover:underline transition-colors text-center"
              >
                ¿No tienes cuenta? Regístrate
              </button>

              <!-- Unlock Account Link (shown only if account is locked) -->
              <button
                type="button"
                *ngIf="showUnlockLink"
                (click)="openUnlockModal()"
                class="w-full text-sm text-destructive hover:underline transition-colors text-center"
              >
                ¿Problemas para entrar? Desbloquear cuenta
              </button>

              <!-- Forgot Password Link -->
              <button
                type="button"
                (click)="openForgotPasswordModal()"
                class="w-full text-sm text-primary hover:underline transition-colors text-center"
              >
                ¿Olvidaste tu contraseña? Haz clic aquí.
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
export class LoginComponent implements OnInit, OnDestroy {
  userType: UserType = 'patient';

  loginForm: LoginDto = {
    email: '',
    password: ''
  };

  isLoading = false;
  showPassword = false;
  showUnlockLink = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Get userType from route data
    this.route.data.subscribe(data => {
      this.userType = data['userType'] || 'patient';
    });
  }

  login(): void {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.toastService.warning('Por favor completa todos los campos');
      return;
    }

    this.isLoading = true;
    this.authService.login(this.loginForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.authService.setToken(response.token);
          
          // Obtener el rol del token
          const userRole = this.authService.getUserRole();
          
          // Validar que el rol coincida con el tipo de login
          if (this.userType === 'physiotherapist' && userRole !== 'physiotherapist') {
            this.isLoading = false;
            this.toastService.error('Esta cuenta no es de fisioterapeuta. Por favor, usa el login de paciente.');
            this.authService.logout();
            return;
          }
          
          if (this.userType === 'patient' && userRole !== 'patient') {
            this.isLoading = false;
            this.toastService.error('Esta cuenta no es de paciente. Por favor, usa el login de fisioterapeuta.');
            this.authService.logout();
            return;
          }

          this.toastService.success('¡Sesión iniciada exitosamente!');
          
          // Redirigir según el rol del token (más seguro que userType)
          const redirectPath = userRole === 'physiotherapist' 
            ? '/fisioterapeuta/dashboard' 
            : '/paciente/dashboard';
          
          setTimeout(() => {
            this.router.navigate([redirectPath]);
          }, 500);
        },
        error: (err) => {
          this.isLoading = false;
          const errorMessage = err.error?.error || 'Error al iniciar sesión';
          
          // Detectar si la cuenta está bloqueada
          if (errorMessage.toLowerCase().includes('locked')) {
            this.showUnlockLink = true;
            this.toastService.error('Tu cuenta ha sido bloqueada por seguridad');
          } else {
            this.toastService.error(errorMessage);
          }
        }
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goToSignUp(): void {
    const signUpPath = this.userType === 'physiotherapist' 
      ? '/registro/fisioterapeuta' 
      : '/registro/paciente';
    this.router.navigate([signUpPath]);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  openUnlockModal(): void {
    this.dialog.open(UnlockAccountModalComponent, {
      width: '400px',
      disableClose: false,
      data: { email: this.loginForm.email }
    });
  }

  openForgotPasswordModal(): void {
    this.dialog.open(ForgotPasswordModalComponent, {
      width: '400px',
      disableClose: false
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
