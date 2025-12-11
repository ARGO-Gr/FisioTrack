import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-month-picker-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="w-full max-w-sm p-6">
      <h2 mat-dialog-title class="text-2xl font-bold mb-6">Selecciona un mes</h2>
      
      <div class="space-y-4">
        <!-- Year Navigation -->
        <div class="flex items-center justify-between mb-6">
          <button
            mat-icon-button
            (click)="previousYear()"
            class="hover:bg-muted"
          >
            <mat-icon>chevron_left</mat-icon>
          </button>
          <h3 class="text-lg font-semibold">{{ selectedYear }}</h3>
          <button
            mat-icon-button
            (click)="nextYear()"
            class="hover:bg-muted"
          >
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>

        <!-- Months Grid -->
        <div class="grid grid-cols-3 gap-2 mb-4">
          <button
            *ngFor="let month of months; let i = index"
            (click)="selectMonth(i)"
            [class.bg-primary]="i === selectedMonth"
            [class.text-primary-foreground]="i === selectedMonth"
            [class.hover:bg-muted]="i !== selectedMonth"
            class="p-3 rounded-md text-sm font-medium transition-colors text-center border-2"
            [class.border-primary]="i === selectedMonth"
            [class.border-border]="i !== selectedMonth"
          >
            {{ month }}
          </button>
        </div>

        <!-- Action buttons -->
        <div class="flex gap-3 pt-6 border-t border-border">
          <button
            mat-stroked-button
            (click)="cancel()"
            class="flex-1"
          >
            Cancelar
          </button>
          <button
            mat-raised-button
            color="primary"
            (click)="confirm()"
            class="flex-1"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  `,
})
export class MonthPickerModalComponent {
  months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  selectedYear: number;
  selectedMonth: number;

  constructor(
    public dialogRef: MatDialogRef<MonthPickerModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const date = data?.selectedDate || new Date();
    this.selectedYear = date.getFullYear();
    this.selectedMonth = date.getMonth();
  }

  previousYear(): void {
    this.selectedYear--;
  }

  nextYear(): void {
    this.selectedYear++;
  }

  selectMonth(monthIndex: number): void {
    this.selectedMonth = monthIndex;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    const selectedDate = new Date(this.selectedYear, this.selectedMonth, 1);
    this.dialogRef.close(selectedDate);
  }
}
