import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../../components/ui/card.component';
import { ButtonComponent } from '../../../../components/ui/button.component';
import { UserMenuComponent } from '../../../../shared/components/user-menu.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface PatientProgressData {
  pacienteId: string;
  nombre: string;
  programStartDate: string;
  programEndDate: string;
  completedDays: string[];
  restDays: string[];
  appointments: string[];
}

@Component({
  selector: 'app-patient-progress',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent,
    UserMenuComponent,
  ],
  templateUrl: './patient-progress.component.html',
  styleUrl: './patient-progress.component.scss',
})
export class PatientProgressComponent implements OnInit, OnDestroy {
  patientData: PatientProgressData | null = null;
  calendarDays: (Date | null)[] = [];
  currentMonth: Date = new Date();
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const pacienteId = params['id'];
      this.loadPatientProgress(pacienteId);
    });
  }

  loadPatientProgress(pacienteId: string) {
    // TODO: Reemplazar con llamada real a la API
    this.patientData = {
      pacienteId,
      nombre: 'María González',
      programStartDate: '2025-01-15',
      programEndDate: '2025-03-15',
      completedDays: [
        '2025-01-15',
        '2025-01-16',
        '2025-01-17',
        '2025-01-19',
        '2025-01-20',
        '2025-01-22',
        '2025-01-23',
        '2025-01-24',
        '2025-01-26',
        '2025-01-27',
        '2025-01-29',
        '2025-01-30',
        '2025-01-31',
        '2025-02-02',
        '2025-02-03',
        '2025-02-05',
        '2025-02-06',
        '2025-02-07',
        '2025-02-09',
        '2025-02-10',
      ],
      restDays: [
        '2025-01-18',
        '2025-01-21',
        '2025-01-25',
        '2025-01-28',
        '2025-02-01',
        '2025-02-04',
        '2025-02-08',
        '2025-02-11',
      ],
      appointments: ['2025-02-14', '2025-02-28'],
    };
    this.generateCalendar();
  }

  generateCalendar() {
    this.calendarDays = [];
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Generar 42 días (6 semanas)
    for (let i = 0; i < 42; i++) {
      if (i > 0) startDate.setDate(startDate.getDate() + 1);
      const date = new Date(startDate);
      if (date.getMonth() === month) {
        this.calendarDays.push(new Date(date));
      } else {
        this.calendarDays.push(null);
      }
    }
  }

  getDayStatus(date: Date | null): string {
    if (!date || !this.patientData) return '';
    const dateStr = date.toISOString().split('T')[0];

    if (this.patientData.completedDays.includes(dateStr)) return 'completed';
    if (this.patientData.restDays.includes(dateStr)) return 'rest';
    if (this.patientData.appointments.includes(dateStr)) return 'appointment';
    return 'pending';
  }

  getDayIcon(status: string): string {
    switch (status) {
      case 'completed':
        return 'check_circle';
      case 'rest':
        return 'hotel';
      case 'appointment':
        return 'calendar_today';
      default:
        return '';
    }
  }

  previousMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }

  getMonthYear(): string {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
  }

  getCompletionPercentage(): number {
    if (!this.patientData) return 0;
    const totalDays = this.patientData.completedDays.length + this.patientData.restDays.length;
    return totalDays > 0 ? Math.round((this.patientData.completedDays.length / totalDays) * 100) : 0;
  }

  goBack() {
    this.router.navigate(['/fisioterapeuta/pacientes']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
