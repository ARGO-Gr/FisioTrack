import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ButtonComponent } from '../../components/ui/button.component';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Subject, interval } from 'rxjs';
import { takeUntil, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-unlock-account-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="p-6 max-w-md">
      <h2 class="text-2xl font-bold text-foreground mb-4">Desbloquear Cuenta</h2>
      
      <p class="text-muted-foreground mb-6">
        Tu cuenta ha sido bloqueada por seguridad. Se ha enviado un enlace de desbloqueo a tu correo electrónico.
      </p>

      <div class="bg-muted/50 border border-border rounded-md p-4 mb-6">
        <p class="text-sm text-muted-foreground">
          Si no recibes el correo en los próximos minutos, verifica tu carpeta de spam o usa el botón de abajo para reenviar el código.
        </p>
      </div>

      <div class="flex gap-3">
        <button 
          (click)="onCancel()"
          [disabled]="isResendDisabled"
          [class.opacity-50]="isResendDisabled"
          [class.cursor-not-allowed]="isResendDisabled"
          class="flex-1 px-4 py-2 rounded-md border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cerrar
        </button>
        <button 
          (click)="resendCode()"
          [disabled]="isResendDisabled"
          [class.opacity-50]="isResendDisabled"
          [class.cursor-not-allowed]="isResendDisabled"
          [title]="isResendDisabled ? 'Espera ' + remainingSeconds + ' segundos' : ''"
          class="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative timer-button"
          [style.--remaining-percent]="(remainingSeconds / 30) * 100 + '%'"
        >
          <span class="relative z-10" *ngIf="!isResendDisabled">Reenviar Código</span>
          <span class="relative z-10" *ngIf="isResendDisabled">Reenviar ({{ remainingSeconds }}s)</span>
          <div 
            class="timer-fill"
            *ngIf="isResendDisabled"
            [style.width]="(remainingSeconds / 30) * 100 + '%'"
          ></div>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .timer-button {
      position: relative;
      overflow: hidden;
    }

    .timer-fill {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.1);
      transition: width 0.3s linear;
      z-index: 1;
    }
  `]
})
export class UnlockAccountModalComponent implements OnInit, OnDestroy {
  isResendDisabled = false;
  remainingSeconds = 0;
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<UnlockAccountModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string },
    private authService: AuthService,
    private toastService: ToastService
  ) {
    // Prevenir cierre al hacer clic fuera cuando está reenviando
    this.dialogRef.disableClose = false;
  }

  ngOnInit(): void {}

  resendCode(): void {
    if (this.isResendDisabled) return;

    this.authService.resendUnlockCode({ email: this.data.email }).subscribe({
      next: () => {
        this.toastService.success('Código de desbloqueo reenviado a tu correo');
        this.startCooldown();
      },
      error: (err: any) => {
        this.toastService.error(err.error?.error || 'Error al reenviar el código');
      }
    });
  }

  private startCooldown(): void {
    this.isResendDisabled = true;
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
          this.isResendDisabled = false;
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
