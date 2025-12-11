import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDiscardData {
  title?: string;
  message?: string;
}

@Component({
  selector: 'app-confirm-discard-changes-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="w-full flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-border px-6 pt-6 flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/10">
            <mat-icon class="text-warning !size-6">warning</mat-icon>
          </div>
          <div>
            <h2 class="text-xl font-bold text-foreground">{{ title }}</h2>
          </div>
        </div>
        <button
          type="button"
          (click)="onCancel()"
          class="p-0 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Cerrar"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="px-6 pb-6 flex-1">
        <p class="text-base text-muted-foreground mb-6">{{ message }}</p>
      </div>

      <!-- Footer -->
      <div class="flex gap-3 px-6 pb-6 border-t border-border pt-6 flex-shrink-0">
        <button
          type="button"
          (click)="onKeepEditing()"
          class="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
        >
          Continuar Editando
        </button>
        <button
          type="button"
          (click)="onDiscard()"
          class="flex-1 px-4 py-3 rounded-lg border border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10 transition-colors font-medium"
        >
          Descartar Cambios
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .mat-mdc-dialog-container {
        padding: 0 !important;
        max-width: 500px !important;
      }
      
      .cdk-overlay-pane {
        max-width: 500px !important;
      }
    }
  `]
})
export class ConfirmDiscardChangesModalComponent {
  title: string = '¿Descartar Cambios?';
  message: string = 'Tienes cambios sin guardar. Si continúas, se perderán todos los datos ingresados.';

  constructor(
    public dialogRef: MatDialogRef<ConfirmDiscardChangesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDiscardData
  ) {
    if (data?.title) {
      this.title = data.title;
    }
    if (data?.message) {
      this.message = data.message;
    }
  }

  onKeepEditing() {
    this.dialogRef.close(false);
  }

  onDiscard() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
