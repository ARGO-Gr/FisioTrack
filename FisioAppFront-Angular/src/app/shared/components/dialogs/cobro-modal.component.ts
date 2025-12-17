import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PaymentService, CreatePaymentDto } from '../../services/payment.service';
import { ToastService } from '../../services/toast.service';
import { Appointment } from '../../services/appointment.service';

@Component({
  selector: 'app-cobro-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="max-h-[80vh] overflow-y-auto p-6">
      <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
        <mat-icon class="text-primary">monetization_on</mat-icon>
        Cobrar Cita
      </h2>

      <!-- Información de la cita -->
      <div class="bg-muted p-4 rounded-lg mb-6">
        <h3 class="font-semibold mb-2">Información de la Cita</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div><span class="text-muted-foreground">Paciente:</span> <span class="font-medium">{{ cita.nombrePaciente }}</span></div>
          <div><span class="text-muted-foreground">Fecha:</span> <span class="font-medium">{{ cita.fecha }}</span></div>
          <div><span class="text-muted-foreground">Hora:</span> <span class="font-medium">{{ cita.hora }}</span></div>
          <div><span class="text-muted-foreground">Descripción:</span> <span class="font-medium">{{ cita.descripcion || 'Sin descripción' }}</span></div>
        </div>
      </div>

      <!-- Monto a cobrar -->
      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">Monto a Cobrar *</label>
        <div class="relative">
          <span class="absolute left-3 top-3 text-muted-foreground">$</span>
          <input
            type="number"
            [(ngModel)]="monto"
            (input)="calcularCambio()"
            min="0"
            step="0.01"
            class="w-full pl-8 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="0.00"
          />
        </div>
      </div>

      <!-- Pestañas de método de pago -->
      <mat-tab-group [(selectedIndex)]="selectedTab" class="mb-6">
        <!-- Pestaña Efectivo -->
        <mat-tab label="Efectivo">
          <div class="py-4 space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Monto Pagado *</label>
              <div class="relative">
                <span class="absolute left-3 top-3 text-muted-foreground">$</span>
                <input
                  type="number"
                  [(ngModel)]="montoPagado"
                  (input)="calcularCambio()"
                  min="0"
                  step="0.01"
                  class="w-full pl-8 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-green-700">Cambio a devolver:</span>
                <span class="text-2xl font-bold text-green-700">\${{ cambio.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Pestaña Tarjeta -->
        <mat-tab label="Tarjeta">
          <div class="py-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <mat-icon class="text-blue-500 text-5xl mb-3">credit_card</mat-icon>
              <h3 class="text-lg font-semibold mb-2 text-blue-900">Pago con Tarjeta</h3>
              <p class="text-blue-700 mb-4">
                Se enviará una solicitud de pago al paciente en su aplicación móvil.
                El paciente ingresará los datos de su tarjeta de forma segura.
              </p>
              <div class="bg-white rounded-lg p-4 border border-blue-200">
                <p class="text-sm text-gray-600">
                  <strong class="text-blue-600">📱 Proceso:</strong><br>
                  1. El paciente recibirá una notificación<br>
                  2. Ingresará sus datos de tarjeta<br>
                  3. Recibirás confirmación del pago
                </p>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- Notas adicionales -->
      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">Notas Adicionales (opcional)</label>
        <textarea
          [(ngModel)]="notas"
          rows="3"
          class="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          placeholder="Agregar notas sobre el pago..."
        ></textarea>
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-3">
        <button
          (click)="cerrar()"
          mat-button
          class="px-6"
        >
          Cancelar
        </button>
        <button
          (click)="confirmarCobro()"
          [disabled]="!esValido() || procesando"
          mat-raised-button
          color="primary"
          class="px-6"
        >
          <span *ngIf="!procesando">{{ selectedTab === 0 ? 'Confirmar pago' : 'Mandar pago' }}</span>
          <span *ngIf="procesando">Procesando...</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .mat-mdc-tab-labels {
      justify-content: center;
    }
  `]
})
export class CobroModalComponent implements OnInit {
  cita: Appointment;
  monto: number = 0;
  montoPagado: number = 0;
  cambio: number = 0;
  numeroTarjeta: string = '';
  titularTarjeta: string = '';
  numeroAutorizacion: string = '';
  notas: string = '';
  selectedTab: number = 0; // 0 = Efectivo, 1 = Tarjeta
  procesando: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { cita: Appointment },
    private dialogRef: MatDialogRef<CobroModalComponent>,
    private paymentService: PaymentService,
    private toastService: ToastService
  ) {
    this.cita = data.cita;
  }

  ngOnInit(): void {
    // Puedes establecer un monto por defecto si lo deseas
  }

  calcularCambio(): void {
    if (this.selectedTab === 0) { // Solo para efectivo
      this.cambio = Math.max(0, this.montoPagado - this.monto);
    }
  }

  esValido(): boolean {
    if (this.monto <= 0) {
      return false;
    }

    if (this.selectedTab === 0) { // Efectivo
      return this.montoPagado >= this.monto;
    } else { // Tarjeta - siempre válido si hay monto
      return true;
    }
  }

  confirmarCobro(): void {
    if (!this.esValido() || this.procesando) {
      return;
    }

    this.procesando = true;

    const paymentDto: CreatePaymentDto = {
      appointmentId: this.cita.id,
      monto: this.monto,
      metodoPago: this.selectedTab === 0 ? 'Efectivo' : 'Tarjeta',
      notas: this.notas || undefined
    };

    if (this.selectedTab === 0) {
      // Efectivo
      paymentDto.montoPagado = this.montoPagado;
      paymentDto.cambio = this.cambio;
    }
    // Para tarjeta, NO enviamos datos de tarjeta, el paciente los ingresará

    const mensajeExito = this.selectedTab === 0 
      ? 'Cobro realizado exitosamente. Se ha enviado un email al paciente.'
      : 'Solicitud de pago enviada al paciente. Recibirá una notificación para completar el pago.';

    this.paymentService.createPayment(paymentDto).subscribe({
      next: (payment) => {
        this.toastService.success(mensajeExito);
        this.dialogRef.close(payment);
      },
      error: (error) => {
        console.error('Error al procesar el cobro:', error);
        this.toastService.error(error.error?.message || 'Error al procesar el cobro');
        this.procesando = false;
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
