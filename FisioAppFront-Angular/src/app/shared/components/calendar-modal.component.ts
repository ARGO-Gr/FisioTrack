import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-calendar-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="w-full max-w-sm p-6">
      <h2 mat-dialog-title class="text-2xl font-bold mb-6">Selecciona una fecha</h2>
      
      <div class="space-y-4">
        <!-- Navigation -->
        <div class="flex items-center justify-between mb-6">
          <button
            mat-icon-button
            (click)="previousMonth()"
            class="hover:bg-muted"
          >
            <mat-icon>chevron_left</mat-icon>
          </button>
          <h3 class="text-lg font-semibold">{{ currentMonth | date: 'MMMM yyyy' }}</h3>
          <button
            mat-icon-button
            (click)="nextMonth()"
            class="hover:bg-muted"
          >
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>

        <!-- Day headers -->
        <div class="grid grid-cols-7 gap-2 mb-2">
          <div *ngFor="let day of ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']" class="text-center text-xs font-semibold text-muted-foreground">
            {{ day }}
          </div>
        </div>

        <!-- Calendar days -->
        <div class="grid grid-cols-7 gap-2">
          <button
            *ngFor="let day of calendarDays"
            (click)="selectDate(day)"
            [disabled]="!day.enabled"
            [class.bg-primary]="day.isSelected"
            [class.text-primary-foreground]="day.isSelected"
            [class.text-muted-foreground]="!day.belongsToMonth"
            [class.hover:bg-muted]="day.enabled && !day.isSelected"
            [class.cursor-not-allowed]="!day.enabled"
            [class.opacity-50]="!day.enabled"
            class="p-2 rounded-md text-sm font-medium transition-colors text-center"
          >
            {{ day.date }}
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
export class CalendarModalComponent {
  currentMonth: Date = new Date();
  selectedDate: Date;
  calendarDays: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<CalendarModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedDate = data?.selectedDate || new Date();
    this.currentMonth = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth());
    this.generateCalendarDays();
  }

  generateCalendarDays() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    
    // Día de la semana del primer día (0 = domingo)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.calendarDays = [];
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const belongsToMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === this.selectedDate.toDateString();
      
      this.calendarDays.push({
        date: date.getDate(),
        fullDate: new Date(date),
        belongsToMonth,
        isToday,
        isSelected,
        enabled: true,
      });
    }
  }

  previousMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.currentMonth = new Date(this.currentMonth);
    this.generateCalendarDays();
  }

  nextMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.currentMonth = new Date(this.currentMonth);
    this.generateCalendarDays();
  }

  selectDate(day: any) {
    if (day.enabled) {
      this.selectedDate = day.fullDate;
      this.generateCalendarDays();
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  confirm() {
    this.dialogRef.close(this.selectedDate);
  }
}
