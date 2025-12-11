import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../../components/ui/button.component';

export interface VerifyEmailData {
  email: string;
  userType: 'patient' | 'physiotherapist';
}

@Component({
  selector: 'app-verify-email-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, ButtonComponent],
  template: `
    <div class="p-6 text-center">
      <!-- Success Icon -->
      <div class="flex justify-center mb-4">
        <mat-icon class="text-green-500 !size-16">check_circle</mat-icon>
      </div>

      <!-- Title -->
      <h2 class="text-2xl font-bold text-foreground mb-2">
        ¡Cuenta Creada Exitosamente!
      </h2>

      <!-- Description -->
      <p class="text-muted-foreground mb-4">
        Se ha enviado un enlace de confirmación a:
      </p>

      <!-- Email Display -->
      <div class="bg-muted p-3 rounded-md mb-6">
        <p class="text-foreground font-semibold">{{ data.email }}</p>
      </div>

      <!-- Instructions -->
      <div class="text-left bg-blue-50 dark:bg-blue-50 border border-blue-300 dark:border-blue-800 rounded-md p-4 mb-6">
        <p class="text-sm text-foreground font-medium mb-2">Por favor:</p>
        <ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Revisa tu bandeja de entrada</li>
          <li>Si no ves el email, verifica la carpeta de spam</li>
          <li>Haz clic en el enlace para confirmar tu cuenta</li>
          <li>Una vez confirmado, podrás iniciar sesión</li>
        </ul>
      </div>

      <!-- User Type Info -->
      <p class="text-xs text-muted-foreground mb-6">
        Tipo de cuenta: <span class="font-semibold">{{ data.userType === 'physiotherapist' ? 'Fisioterapeuta' : 'Paciente' }}</span>
      </p>

      <!-- Action Buttons -->
      <div class="flex justify-center">
        <app-button
          (click)="goToLogin()"
          variant="default"
        >
          Iniciar Sesión
        </app-button>
      </div>
    </div>
  `,
  styles: []
})
export class VerifyEmailModalComponent {
  constructor(
    public dialogRef: MatDialogRef<VerifyEmailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VerifyEmailData
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  goToLogin(): void {
    this.dialogRef.close('navigate-to-login');
  }
}
