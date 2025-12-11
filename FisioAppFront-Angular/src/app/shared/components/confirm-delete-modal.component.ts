import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDeleteData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  // Para compatibilidad con citas (appointments)
  paciente?: string;
  fecha?: Date;
  hora?: string;
  // Para desvincular pacientes
  pacienteNombre?: string;
  pacienteEmail?: string;
  pacienteTelefono?: string;
  diagnostico?: string;
}

@Component({
  selector: 'app-confirm-delete-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  template: `
    <!-- Caso específico: Eliminar cita O Desvincular paciente (ambos con detalles) -->
    <div *ngIf="(data.paciente && data.fecha) || (data.pacienteNombre && (data.pacienteEmail || data.pacienteTelefono)); else genericDelete" class="w-full max-w-2xl flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8 pb-6 border-b border-border px-6 pt-6 flex-shrink-0">
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-foreground">{{ data.paciente ? 'Eliminar Cita' : 'Desvincular Paciente' }}</h2>
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
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <mat-icon class="text-red-600 !size-8">warning</mat-icon>
          </div>
        </div>

        <!-- Confirmation Message -->
        <div class="text-center mb-8">
          <p class="text-foreground mb-4">
            {{ data.message || (data.paciente ? '¿Estás seguro de que deseas eliminar esta cita?' : '¿Estás seguro de que deseas desvincular este paciente?') }}
          </p>
          <p class="text-sm text-muted-foreground">
            Una vez realizada, no podrás recuperar esta información.
          </p>
        </div>

        <!-- Details -->
        <div class="bg-muted/30 border border-border rounded-lg p-6 space-y-4 mb-8">
          <!-- Para citas: mostrar paciente, fecha, hora -->
          <div *ngIf="data.paciente && data.fecha" class="flex items-start gap-3">
            <mat-icon class="text-muted-foreground !size-5 mt-0.5 flex-shrink-0">person</mat-icon>
            <div class="flex-1">
              <p class="text-xs font-semibold text-muted-foreground">Paciente</p>
              <p class="text-foreground font-medium">{{ data.paciente }}</p>
            </div>
          </div>
          
          <div *ngIf="data.paciente && data.fecha" class="border-t border-border pt-4 flex items-start gap-3">
            <mat-icon class="text-muted-foreground !size-5 mt-0.5 flex-shrink-0">calendar_today</mat-icon>
            <div class="flex-1">
              <p class="text-xs font-semibold text-muted-foreground">Fecha</p>
              <p class="text-foreground font-medium">{{ data.fecha | date: 'dd/MM/yyyy' }}</p>
            </div>
          </div>

          <div *ngIf="data.paciente && data.hora" class="border-t border-border pt-4 flex items-start gap-3">
            <mat-icon class="text-muted-foreground !size-5 mt-0.5 flex-shrink-0">access_time</mat-icon>
            <div class="flex-1">
              <p class="text-xs font-semibold text-muted-foreground">Hora</p>
              <p class="text-foreground font-medium">{{ data.hora }}</p>
            </div>
          </div>

          <!-- Para desvincular paciente: mostrar nombre, email, teléfono, diagnóstico -->
          <div *ngIf="data.pacienteNombre && !data.paciente" class="flex items-start gap-3">
            <mat-icon class="text-muted-foreground !size-5 mt-0.5 flex-shrink-0">person</mat-icon>
            <div class="flex-1">
              <p class="text-xs font-semibold text-muted-foreground">Paciente</p>
              <p class="text-foreground font-medium">{{ data.pacienteNombre }}</p>
            </div>
          </div>

          <div *ngIf="data.pacienteEmail && !data.paciente" class="border-t border-border pt-4 flex items-start gap-3">
            <mat-icon class="text-muted-foreground !size-5 mt-0.5 flex-shrink-0">email</mat-icon>
            <div class="flex-1">
              <p class="text-xs font-semibold text-muted-foreground">Email</p>
              <p class="text-foreground font-medium text-sm truncate">{{ data.pacienteEmail }}</p>
            </div>
          </div>

          <div *ngIf="data.pacienteTelefono && !data.paciente" class="border-t border-border pt-4 flex items-start gap-3">
            <mat-icon class="text-muted-foreground !size-5 mt-0.5 flex-shrink-0">phone</mat-icon>
            <div class="flex-1">
              <p class="text-xs font-semibold text-muted-foreground">Teléfono</p>
              <p class="text-foreground font-medium">{{ data.pacienteTelefono }}</p>
            </div>
          </div>

          <div *ngIf="data.diagnostico && !data.paciente" class="border-t border-border pt-4 flex items-start gap-3">
            <mat-icon class="text-muted-foreground !size-5 mt-0.5 flex-shrink-0">description</mat-icon>
            <div class="flex-1">
              <p class="text-xs font-semibold text-muted-foreground">Diagnóstico</p>
              <p class="text-foreground font-medium text-sm">{{ data.diagnostico }}</p>
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
          Cancelar
        </button>
        <button
          type="button"
          (click)="onConfirm()"
          class="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          <mat-icon class="!size-4">{{ data.paciente ? 'delete' : 'link_off' }}</mat-icon>
          <span>{{ data.paciente ? 'Eliminar Cita' : 'Desvincular' }}</span>
        </button>
      </div>
    </div>

    <!-- Caso genérico: Confirmación personalizable -->
    <ng-template #genericDelete>
      <div class="p-6 max-w-md">
        <!-- Header with Icon -->
        <div class="flex items-center gap-3 mb-4">
          <div 
            [ngClass]="{
              'flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10': isDangerous,
              'flex items-center justify-center w-12 h-12 rounded-full bg-warning/10': !isDangerous
            }"
          >
            <mat-icon 
              [ngClass]="{
                'text-destructive': isDangerous,
                'text-warning': !isDangerous
              }"
            >
              {{ isDangerous ? 'delete_outline' : 'warning' }}
            </mat-icon>
          </div>
          <h2 class="text-xl font-bold text-foreground">{{ title }}</h2>
        </div>

        <!-- Message -->
        <p class="text-muted-foreground mb-6 text-sm">{{ message }}</p>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button
            (click)="onCancel()"
            class="flex-1 px-4 py-2 rounded-lg border border-input text-foreground bg-background hover:bg-muted transition-colors font-medium"
          >
            {{ cancelText }}
          </button>
          <button
            (click)="onConfirm()"
            [ngClass]="{
              'flex-1 px-4 py-2 rounded-lg text-white transition-colors font-medium bg-destructive hover:bg-destructive/90': isDangerous,
              'flex-1 px-4 py-2 rounded-lg text-white transition-colors font-medium bg-warning hover:bg-warning/90': !isDangerous
            }"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    :host ::ng-deep {
      .mat-mdc-dialog-container {
        padding: 0 !important;
      }
    }
  `]
})
export class ConfirmDeleteModalComponent {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isDangerous: boolean;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteData
  ) {
    this.title = data.title || 'Confirmar acción';
    this.message = data.message || '¿Estás seguro de que deseas continuar?';
    this.confirmText = data.confirmText || 'Confirmar';
    this.cancelText = data.cancelText || 'Cancelar';
    this.isDangerous = data.isDangerous !== false;
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onConfirm() {
    this.dialogRef.close(true);
  }
}
