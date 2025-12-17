import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CreatePaymentCardDto } from '../../../../shared/services/profile.service';

@Component({
  selector: 'app-add-payment-card-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule
  ],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-foreground flex items-center gap-3 mb-6">
        <mat-icon class="text-primary">credit_card</mat-icon>
        Agregar tarjeta de débito
      </h2>

      <p class="text-sm text-muted-foreground mb-6">
        Ingresa los detalles de tu tarjeta de forma segura.
      </p>

      <form [formGroup]="form" class="space-y-5">
        <!-- Número de tarjeta -->
        <div>
          <label class="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <mat-icon class="text-primary">credit_card</mat-icon>
            Número de tarjeta *
          </label>
          <input
            type="text"
            formControlName="cardNumber"
            placeholder="1234 5678 9012 3456"
            maxlength="19"
            (input)="onCardNumberChange()"
            class="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <div *ngIf="isFieldInvalid('cardNumber')" class="text-sm text-destructive flex items-center gap-1 mt-2">
            <mat-icon>error</mat-icon>
            <span *ngIf="form.get('cardNumber')?.hasError('required')">Campo requerido</span>
            <span *ngIf="form.get('cardNumber')?.hasError('minlength')">Número de tarjeta inválido</span>
          </div>
        </div>

        <!-- Titular de la tarjeta -->
        <div>
          <label class="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <mat-icon class="text-primary">person</mat-icon>
            Titular de la tarjeta *
          </label>
          <input
            type="text"
            formControlName="cardHolderName"
            placeholder="Nombre completo"
            class="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <div *ngIf="isFieldInvalid('cardHolderName')" class="text-sm text-destructive flex items-center gap-1 mt-2">
            <mat-icon >error</mat-icon>
            Campo requerido
          </div>
        </div>

        <!-- Mes y Año de vencimiento -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <mat-icon class="text-primary">calendar_today</mat-icon>
              Mes *
            </label>
            <select
              formControlName="expiryMonth"
              class="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>Selecciona</option>
              <option *ngFor="let month of months" [value]="month">
                {{ month | number: '2.0-0' }}
              </option>
            </select>
            <div *ngIf="isFieldInvalid('expiryMonth')" class="text-sm text-destructive flex items-center gap-1 mt-2">
              <mat-icon>error</mat-icon>
              Requerido
            </div>
          </div>

          <div>
            <label class="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <mat-icon class="text-primary">calendar_today</mat-icon>
              Año *
            </label>
            <select
              formControlName="expiryYear"
              class="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>Selecciona</option>
              <option *ngFor="let year of years" [value]="year">
                {{ year }}
              </option>
            </select>
            <div *ngIf="isFieldInvalid('expiryYear')" class="text-sm text-destructive flex items-center gap-1 mt-2">
              <mat-icon>error</mat-icon>
              Requerido
            </div>
          </div>
        </div>
      </form>

      <!-- Error message -->
      <div *ngIf="errorMessage" class="bg-red-50/70 border border-red-200/60 text-red-700/80 p-4 rounded-xl text-sm mt-6 flex items-center gap-2">
        <mat-icon class="text-red-600/70">error</mat-icon>
        {{ errorMessage }}
      </div>
    </div>

    <div class="flex gap-3 px-6 py-4 border-t border-border bg-background">
      <button
        type="button"
        (click)="cancel()"
        [disabled]="isSubmitting"
        class="flex-1 px-4 py-3 rounded-lg border border-border text-foreground bg-background hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        Cancelar
      </button>
      <button
        type="button"
        (click)="addCard()"
        [disabled]="!form.valid || isSubmitting"
        class="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
      >
        <mat-icon class="!size-4" *ngIf="isSubmitting">refresh</mat-icon>
        <span *ngIf="!isSubmitting">Agregar tarjeta</span>
        <span *ngIf="isSubmitting">Agregando...</span>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Redondear inputs */
    input[type="text"],
    select {
      border-radius: 12px !important;
      border-color: rgba(0, 0, 0, 0.08) !important;
    }

    input[type="text"]:focus,
    select:focus {
      border-color: var(--primary, #6366F1) !important;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
    }

    /* Custom select arrow */
    select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      padding-right: 2.5rem;
    }

    select:focus {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236366F1' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
    }

    .grid {
      display: grid;
    }

    .grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .gap-4 {
      gap: 1rem;
    }
  `]
})
export class AddPaymentCardDialogComponent implements OnInit {
  form!: FormGroup;
  errorMessage = '';
  isSubmitting = false;
  months: number[] = [];
  years: number[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddPaymentCardDialogComponent>
  ) {
    this.form = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(15)]],
      cardHolderName: ['', Validators.required],
      expiryMonth: ['', Validators.required],
      expiryYear: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Generate months 1-12
    this.months = Array.from({ length: 12 }, (_, i) => i + 1);

    // Generate years from current year to +10 years
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  }

  onCardNumberChange(): void {
    const cardNumber = this.form.get('cardNumber')?.value || '';
    const formatted = this.formatCardNumber(cardNumber);
    this.form.get('cardNumber')?.setValue(formatted, { emitEvent: false });
  }

  private formatCardNumber(value: string): string {
    const numbers = value.replace(/\D/g, '');
    const chunks = numbers.match(/.{1,4}/g) || [];
    return chunks.join(' ').slice(0, 19);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  addCard(): void {
    if (!this.form.valid) {
      this.errorMessage = 'Por favor completa todos los campos correctamente';
      return;
    }

    this.isSubmitting = true;

    const cardData: CreatePaymentCardDto = {
      cardNumber: this.form.get('cardNumber')?.value.replace(/\s/g, ''),
      cardHolderName: this.form.get('cardHolderName')?.value,
      expiryMonth: this.form.get('expiryMonth')?.value,
      expiryYear: this.form.get('expiryYear')?.value
    };

    // Simular delay de envío
    setTimeout(() => {
      this.dialogRef.close(cardData);
    }, 500);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
