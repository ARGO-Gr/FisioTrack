import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-cancel-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="w-full max-w-2xl flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8 pb-6 border-b border-border px-6 pt-6 flex-shrink-0">
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-foreground">Cancelar Cita</h2>
          <p class="text-sm text-muted-foreground mt-2">Esta acción no se puede deshacer</p>
        </div>
        <button
          type="button"
          (click)="onCancel()"
          class="ml-4 p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
          title="Cerrar"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="overflow-y-auto flex-1 px-6">
        <!-- Warning Icon -->
        <div class="flex justify-center mb-8">
          <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <mat-icon class="text-orange-600 !size-8">block</mat-icon>
          </div>
        </div>

        <!-- Confirmation Message -->
        <div class="text-center mb-8">
          <p class="text-foreground mb-4">
            ¿Estás seguro de que deseas cancelar esta cita?
          </p>
          <p class="text-sm text-muted-foreground">
            La cita será marcada como cancelada por el fisioterapeuta.
          </p>
        </div>

        <!-- Appointment Details -->
        <div class="bg-muted/30 border border-border rounded-lg p-6 space-y-4 mb-8">
          <div class="flex items-start gap-3">
            <mat-icon class="text-muted-foreground !size-5 mt-0.5 flex-shrink-0">person</mat-icon>
            <div class="flex-1">
              <p class="text-xs font-semibold text-muted-foreground">Paciente</p>
              <p class="text-foreground font-medium">{{ data.paciente }}</p>
            </div>
          </div>
          
          <div class="border-t border-border pt-4 flex items-start gap-3">
            <mat-icon class="text-muted-foreground !size-5 mt-0.5 flex-shrink-0">calendar_today</mat-icon>
            <div class="flex-1">
              <p class="text-xs font-semibold text-muted-foreground">Fecha</p>
              <p class="text-foreground font-medium">{{ data.fecha | date: 'dd/MM/yyyy' }}</p>
            </div>
          </div>

          <div class="border-t border-border pt-4 flex items-start gap-3">
            <mat-icon class="text-muted-foreground !size-5 mt-0.5 flex-shrink-0">access_time</mat-icon>
            <div class="flex-1">
              <p class="text-xs font-semibold text-muted-foreground">Hora</p>
              <p class="text-foreground font-medium">{{ data.hora }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with Buttons (Fixed) -->
      <div class="flex gap-3 px-6 pb-6 border-t border-border flex-shrink-0 pt-6">
        <button
          type="button"
          (click)="onCancel()"
          class="flex-1 px-4 py-3 rounded-lg border border-border text-foreground bg-background hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          No, mantener cita
        </button>
        <button
          type="button"
          (click)="onConfirm()"
          class="flex-1 px-4 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          <mat-icon class="!size-4">block</mat-icon>
          <span>Cancelar Cita</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .mat-mdc-dialog-container {
        padding: 0 !important;
      }
    }
  `]
})
export class ConfirmCancelModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmCancelModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel() {
    this.dialogRef.close(false);
  }

  onConfirm() {
    this.dialogRef.close(true);
  }
}
