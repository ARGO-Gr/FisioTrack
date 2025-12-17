import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PaymentService, Payment, ConfirmPaymentDto } from '../../services/payment.service';
import { ProfileService, PaymentCardDto } from '../../services/profile.service';
import { ToastService } from '../../services/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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

      <!-- Tarjeta predeterminada -->
      <div *ngIf="tarjetaPredeterminada; else noTarjeta" class="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <h3 class="font-semibold mb-3 flex items-center gap-2">
          <mat-icon class="text-primary">credit_card</mat-icon>
          Tarjeta de Pago
        </h3>
        <div class="space-y-2">
          <div class="flex items-center gap-2 p-3 rounded bg-white border border-border">
            <div class="p-2 rounded" [ngClass]="getCardIconColor(tarjetaPredeterminada.cardType)">
              <mat-icon class="text-white !size-5">credit_card</mat-icon>
            </div>
            <div class="flex-1">
              <p class="font-medium">{{ getCardTypeName(tarjetaPredeterminada.cardType) }}</p>
              <p class="text-sm text-muted-foreground">•••• {{ tarjetaPredeterminada.last4 }}</p>
            </div>
            <span class="text-sm text-muted-foreground">Vence {{ tarjetaPredeterminada.expiryMonth }}/{{ tarjetaPredeterminada.expiryYear }}</span>
          </div>
        </div>
      </div>

      <ng-template #noTarjeta>
        <div class="mb-6 p-4 rounded-lg bg-orange-50 border border-orange-200">
          <div class="flex items-start gap-2">
            <mat-icon class="text-orange-600">warning</mat-icon>
            <div class="flex-1">
              <p class="text-sm text-orange-900 font-medium">Sin tarjeta predeterminada</p>
              <p class="text-xs text-orange-700">Por favor, agrega una tarjeta como predeterminada antes de realizar el pago</p>
            </div>
          </div>
        </div>
      </ng-template>

      <!-- Formulario - Solo CVV -->
      <div class="space-y-4" *ngIf="tarjetaPredeterminada">
        <div>
          <label class="block text-sm font-semibold text-foreground mb-3">
            <mat-icon class="text-primary align-middle">password</mat-icon>
            Código de Seguridad (CVV) *
          </label>
          <input
            type="password"
            [(ngModel)]="cvv"
            maxlength="4"
            (input)="validateNumericInput($event)"
            class="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="***"
          />
          <p class="text-xs text-muted-foreground mt-2">Código de seguridad de 3 o 4 dígitos que aparece en el reverso de tu tarjeta</p>
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
          class="flex-1 px-4 py-3 rounded-lg border border-border text-foreground bg-background hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          [disabled]="procesando"
        >
          Cancelar
        </button>
        <button
          (click)="confirmarPago()"
          [disabled]="!esValido() || procesando || !tarjetaPredeterminada"
          class="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          <mat-icon  *ngIf="!procesando">check_circle</mat-icon>
          <mat-icon class="animate-spin" *ngIf="procesando">refresh</mat-icon>
          <span *ngIf="!procesando">Confirmar Pago</span>
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

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class PagarModalComponent implements OnInit, OnDestroy {
  pago: Payment;
  tarjetaPredeterminada: PaymentCardDto | null = null;
  cvv: string = '';
  procesando: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { pago: Payment },
    private dialogRef: MatDialogRef<PagarModalComponent>,
    private paymentService: PaymentService,
    private profileService: ProfileService,
    private toastService: ToastService
  ) {
    this.pago = data.pago;
  }

  ngOnInit(): void {
    this.cargarTarjetaPredeterminada();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarTarjetaPredeterminada(): void {
    this.profileService.getPaymentCards()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tarjetas) => {
          this.tarjetaPredeterminada = tarjetas.find(t => t.isDefault) || null;
        },
        error: (error) => {
          console.error('Error al cargar tarjetas:', error);
          this.toastService.error('Error al cargar tu tarjeta predeterminada');
        }
      });
  }

  validateNumericInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }

  esValido(): boolean {
    return this.cvv.length >= 3 && this.cvv.length <= 4;
  }

  confirmarPago(): void {
    if (!this.esValido() || this.procesando || !this.tarjetaPredeterminada) {
      return;
    }

    this.procesando = true;

    const confirmDto: ConfirmPaymentDto = {
      numeroTarjeta: this.tarjetaPredeterminada.last4,
      titularTarjeta: this.tarjetaPredeterminada.cardHolderName,
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

  getCardTypeName(type: string): string {
    const typeMap: { [key: string]: string } = {
      'Visa': 'Visa',
      'Mastercard': 'Mastercard',
      'Amex': 'American Express',
      'Discover': 'Discover'
    };
    return typeMap[type] || type;
  }

  getCardIconColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      'Visa': 'bg-blue-600',
      'Mastercard': 'bg-orange-600',
      'Amex': 'bg-green-700',
      'Discover': 'bg-indigo-600'
    };
    return colorMap[type] || 'bg-gray-600';
  }

  cerrar(): void {
    if (!this.procesando) {
      this.dialogRef.close();
    }
  }
}
