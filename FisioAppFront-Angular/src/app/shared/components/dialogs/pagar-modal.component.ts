import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PaymentService, Payment, ConfirmPaymentDto } from '../../services/payment.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-pagar-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="max-h-[80vh] overflow-y-auto p-6">
      <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
        <mat-icon class="text-primary">credit_card</mat-icon>
        Confirmar Pago con Tarjeta
      </h2>

      <!-- Información del pago -->
      <div class="bg-muted p-4 rounded-lg mb-6">
        <h3 class="font-semibold mb-2">Detalles del Pago</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div><span class="text-muted-foreground">Fecha de Cita:</span> <span class="font-medium">{{ pago.fechaCita }}</span></div>
          <div><span class="text-muted-foreground">Hora:</span> <span class="font-medium">{{ pago.horaCita }}</span></div>
          <div class="col-span-2"><span class="text-muted-foreground">Descripción:</span> <span class="font-medium">{{ pago.descripcionCita || 'Sin descripción' }}</span></div>
        </div>
        <div class="mt-3 bg-primary/10 p-3 rounded">
          <div class="flex items-center justify-between">
            <span class="font-semibold">Monto a Pagar:</span>
            <span class="text-2xl font-bold text-primary">\${{ pago.monto.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Información de seguridad -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-start gap-2">
          <mat-icon class="text-blue-600">lock</mat-icon>
          <div class="flex-1">
            <p class="text-sm text-blue-900 font-medium">Pago seguro</p>
            <p class="text-xs text-blue-700">Tu información está protegida con encriptación de nivel bancario</p>
          </div>
        </div>
      </div>

      <!-- Formulario de tarjeta -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Número de Tarjeta (Últimos 4 dígitos) *</label>
          <div class="relative">
            <mat-icon class="absolute left-3 top-3 text-muted-foreground">credit_card</mat-icon>
            <input
              type="text"
              [(ngModel)]="numeroTarjeta"
              maxlength="4"
              (input)="validateNumericInput($event)"
              class="w-full pl-12 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="1234"
            />
          </div>
          <p class="text-xs text-muted-foreground mt-1">Solo ingresa los últimos 4 dígitos de tu tarjeta</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Nombre del Titular *</label>
          <div class="relative">
            <mat-icon class="absolute left-3 top-3 text-muted-foreground">person</mat-icon>
            <input
              type="text"
              [(ngModel)]="titularTarjeta"
              class="w-full pl-12 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Juan Pérez"
            />
          </div>
          <p class="text-xs text-muted-foreground mt-1">Como aparece en la tarjeta</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">CVV *</label>
          <div class="relative">
            <mat-icon class="absolute left-3 top-3 text-muted-foreground">password</mat-icon>
            <input
              type="password"
              [(ngModel)]="cvv"
              maxlength="4"
              (input)="validateNumericInput($event)"
              class="w-full pl-12 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="***"
            />
          </div>
          <p class="text-xs text-muted-foreground mt-1">Código de seguridad de 3 o 4 dígitos</p>
        </div>
      </div>

      <!-- Términos y condiciones -->
      <div class="mt-6 bg-gray-50 p-4 rounded-lg">
        <p class="text-xs text-gray-600">
          Al confirmar el pago, aceptas que se realizará el cargo por el monto indicado.
          Recibirás un comprobante por correo electrónico una vez completada la transacción.
        </p>
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-3 mt-6">
        <button
          (click)="cerrar()"
          mat-button
          class="px-6"
          [disabled]="procesando"
        >
          Cancelar
        </button>
        <button
          (click)="confirmarPago()"
          [disabled]="!esValido() || procesando"
          mat-raised-button
          color="primary"
          class="px-8"
        >
          <span *ngIf="!procesando" class="flex items-center gap-2">
            <mat-icon>check_circle</mat-icon>
            Confirmar Pago
          </span>
          <span *ngIf="procesando">Procesando...</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input[type=number] {
      -moz-appearance: textfield;
    }
  `]
})
export class PagarModalComponent implements OnInit {
  pago: Payment;
  numeroTarjeta: string = '';
  titularTarjeta: string = '';
  cvv: string = '';
  procesando: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { pago: Payment },
    private dialogRef: MatDialogRef<PagarModalComponent>,
    private paymentService: PaymentService,
    private toastService: ToastService
  ) {
    this.pago = data.pago;
  }

  ngOnInit(): void {
    // Inicialización si es necesaria
  }

  validateNumericInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }

  esValido(): boolean {
    return this.numeroTarjeta.length === 4 &&
           this.titularTarjeta.trim() !== '' &&
           this.cvv.length >= 3 && this.cvv.length <= 4;
  }

  confirmarPago(): void {
    if (!this.esValido() || this.procesando) {
      return;
    }

    this.procesando = true;

    const confirmDto: ConfirmPaymentDto = {
      numeroTarjeta: this.numeroTarjeta,
      titularTarjeta: this.titularTarjeta,
      numeroAutorizacion: this.cvv
    };

    this.paymentService.confirmPayment(this.pago.id, confirmDto).subscribe({
      next: (payment) => {
        this.toastService.success('¡Pago procesado exitosamente! Recibirás un comprobante por correo.');
        this.dialogRef.close(payment);
      },
      error: (error) => {
        console.error('Error al procesar el pago:', error);
        this.toastService.error(error.error?.message || 'Error al procesar el pago');
        this.procesando = false;
      }
    });
  }

  cerrar(): void {
    if (!this.procesando) {
      this.dialogRef.close();
    }
  }
}
