import { Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ButtonComponent } from '../../components/ui/button.component';
import { InputComponent } from '../../components/ui/input.component';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Subject, interval } from 'rxjs';
import { takeUntil, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="p-6 max-w-md">
      <h2 class="text-2xl font-bold text-foreground mb-4">Recuperar Contraseña</h2>
      
      <p class="text-muted-foreground mb-6">
        Ingresa tu correo electrónico y te enviaremos una contraseña temporal para que puedas acceder a tu cuenta.
      </p>

      <div class="mb-6">
        <label class="block text-sm font-medium text-foreground mb-2">Correo Electrónico</label>
        <input 
          type="email" 
          [(ngModel)]="email"
          placeholder="tu@correo.com"
          class="w-full px-3 py-2 rounded-md border border-input bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          [disabled]="isSending"
        />
      </div>

      <div class="flex gap-3">
        <button 
          (click)="onCancel()"
          [disabled]="isSending"
          class="flex-1 px-4 py-2 rounded-md border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button 
          (click)="sendPassword()"
          [disabled]="isSending || !email"
          [class.opacity-50]="isSending || !email"
          [class.cursor-not-allowed]="isSending || !email"
          [title]="isSending ? 'Espera ' + remainingSeconds + ' segundos' : ''"
          class="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span *ngIf="!isSending">Enviar</span>
          <span *ngIf="isSending">Enviar ({{ remainingSeconds }}s)</span>
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class ForgotPasswordModalComponent implements OnDestroy {
  email = '';
  isSending = false;
  remainingSeconds = 0;
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<ForgotPasswordModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    // Prevenir cierre al hacer clic fuera cuando está enviando
    this.dialogRef.disableClose = false;
  }

  sendPassword(): void {
    if (this.isSending || !this.email) return;

    this.authService.sendPassword({ email: this.email }).subscribe({
      next: () => {
        this.toastService.success('Contraseña temporal enviada a tu correo');
        this.startCooldown();
      },
      error: (err) => {
        this.toastService.error(err.error?.error || 'Error al enviar la contraseña');
      }
    });
  }

  private startCooldown(): void {
    this.isSending = true;
    // Deshabilitar cierre del modal durante el cooldown
    this.dialogRef.disableClose = true;
    this.remainingSeconds = 30;

    interval(1000)
      .pipe(
        takeUntil(this.destroy$),
        takeWhile(() => this.remainingSeconds > 0)
      )
      .subscribe(() => {
        this.remainingSeconds--;
        if (this.remainingSeconds === 0) {
          this.isSending = false;
          // Permitir cierre nuevamente después del cooldown
          this.dialogRef.disableClose = false;
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
