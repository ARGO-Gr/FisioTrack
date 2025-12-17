import { Component, OnInit, OnDestroy, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '@services/services/toast.service';

export interface FollowupNote {
  id: string;
  appointmentId: string;
  contenido: string;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-followup-notes-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="w-full max-w-2xl flex flex-col max-h-[95vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-border px-6 pt-6 flex-shrink-0">
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-foreground">Notas de Seguimiento</h2>
          <p class="text-sm text-muted-foreground mt-1">{{ pacienteName }}</p>
          <p class="text-sm text-muted-foreground">{{ formatDate(appointmentDate) }} - {{ appointmentTime }} ({{ appointmentType }})</p>
        </div>
        <button
          type="button"
          (click)="onCancel()"
          class="ml-4 p-0 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
          title="Cerrar"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="overflow-y-auto flex-1 px-6 pb-6">
        <form [formGroup]="notesForm" class="space-y-4">
          <!-- Notes Text Area -->
          <div class="space-y-2">
            <label class="text-sm font-semibold text-foreground flex items-center gap-2">
              <mat-icon class="text-primary">edit_note</mat-icon>
              Notas de Seguimiento
            </label>
            <textarea
              formControlName="contenido"
              placeholder="Escribe aquí las notas sobre el seguimiento de esta cita..."
              rows="8"
              class="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            ></textarea>
            <div *ngIf="isFieldInvalid('contenido')" class="text-sm text-destructive flex items-center gap-1 mt-1">
              <mat-icon class="text-sm">error</mat-icon>
              Las notas no pueden estar vacías
            </div>
            <p class="text-xs text-muted-foreground">
              <span *ngIf="existingNote">Última actualización: {{ formatDateTime(existingNote.updatedAt) }}</span>
              <span *ngIf="!existingNote">Sin notas previas</span>
            </p>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="flex gap-3 px-6 pb-6 border-t border-border flex-shrink-0 pt-6">
        <button
          type="button"
          (click)="onCancel()"
          class="flex-1 px-4 py-3 rounded-lg border border-border text-foreground bg-background hover:bg-muted transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          [disabled]="!notesForm.valid || isSubmitting"
          (click)="onSubmit()"
          class="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          <mat-icon *ngIf="isSubmitting" class="animate-spin">refresh</mat-icon>
          <span *ngIf="!isSubmitting">Guardar Notas</span>
          <span *ngIf="isSubmitting">Guardando...</span>
        </button>
      </div>
    </div>
  `,
})
export class FollowupNotesModalComponent implements OnInit, OnDestroy {
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  pacienteName: string;

  notesForm: FormGroup;
  existingNote: FollowupNote | null = null;
  isSubmitting = false;
  loading = true;

  private destroy$ = new Subject<void>();
  private apiUrl = `${environment.apiUrl}/api/followup-notes`;
  
  private fb: FormBuilder = inject(FormBuilder);
  private http: HttpClient = inject(HttpClient);
  private toastService: ToastService = inject(ToastService);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      appointmentId: string;
      appointmentDate: string;
      appointmentTime: string;
      appointmentType: string;
      pacienteName: string;
    },
    private dialogRef: MatDialogRef<FollowupNotesModalComponent>
  ) {
    this.appointmentId = data.appointmentId;
    this.appointmentDate = data.appointmentDate;
    this.appointmentTime = data.appointmentTime;
    this.appointmentType = data.appointmentType;
    this.pacienteName = data.pacienteName;

    this.notesForm = this.fb.group({
      contenido: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit() {
    this.loadExistingNote();
  }

  loadExistingNote() {
    this.loading = true;
    this.http
      .get<FollowupNote>(`${this.apiUrl}/${this.appointmentId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (note) => {
          this.existingNote = note;
          this.notesForm.patchValue({
            contenido: note.contenido,
          });
          this.loading = false;
        },
        error: () => {
          // No existe nota previa
          this.loading = false;
        },
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.notesForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (!this.notesForm.valid) {
      this.toastService.error('Por favor completa todos los campos requeridos');
      return;
    }

    this.isSubmitting = true;
    const { contenido } = this.notesForm.value;

    const payload = {
      appointmentId: this.appointmentId,
      contenido: contenido,
    };

    if (this.existingNote) {
      // Actualizar nota existente
      this.http
        .put<FollowupNote>(`${this.apiUrl}/${this.existingNote.id}`, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedNote) => {
            this.existingNote = updatedNote;
            this.isSubmitting = false;
            this.dialogRef.close({ success: true, message: 'Nota actualizada correctamente' });
          },
          error: (error) => {
            console.error('Error updating note:', error);
            this.toastService.error('Error al actualizar la nota');
            this.isSubmitting = false;
          },
        });
    } else {
      // Crear nueva nota
      this.http
        .post<FollowupNote>(this.apiUrl, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newNote) => {
            this.existingNote = newNote;
            this.isSubmitting = false;
            this.dialogRef.close({ success: true, message: 'Nota guardada correctamente' });
          },
          error: (error) => {
            console.error('Error creating note:', error);
            this.toastService.error('Error al guardar la nota');
            this.isSubmitting = false;
          },
        });
    }
  }

  formatDate(fecha: string): string {
    const [year, month, day] = fecha.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  formatDateTime(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES') + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  onCancel() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
