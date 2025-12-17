import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../components/ui/index';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PaymentService, Payment } from '../../../shared/services/payment.service';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { HeaderComponent, NavLink } from '../../../shared/components/header.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-historial-cobros',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    MatIconModule,
    MatButtonModule,
    HeaderComponent,
  ],
  template: `
    <div class="min-h-screen bg-background">
      <app-header
        [navLinks]="navLinks"
        (changeInfo)="onChangeInfo()"
        (logout)="logout()"
      ></app-header>

      <main class="container mx-auto px-4 py-8">
        <!-- Page Header -->
        <div class="mb-8">
          <h2 class="text-4xl font-bold mb-2 flex items-center gap-2">
            <mat-icon class="text-primary ">monetization_on</mat-icon>
            Historial de Cobros
          </h2>
          <p class="text-muted-foreground">Consulta todos los cobros realizados</p>
        </div>

        <!-- Estadísticas -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <app-card>
            <app-card-content class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-muted-foreground mb-1">Total Cobros</p>
                  <p class="text-3xl font-bold">{{ payments.length }}</p>
                </div>
                <mat-icon class="text-primary">receipt_long</mat-icon>
              </div>
            </app-card-content>
          </app-card>

          <app-card>
            <app-card-content class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-muted-foreground mb-1">Total Recaudado</p>
                  <p class="text-3xl font-bold">\${{ totalRecaudado.toFixed(2) }}</p>
                </div>
                <mat-icon class="text-green-600">attach_money</mat-icon>
              </div>
            </app-card-content>
          </app-card>

          <app-card>
            <app-card-content class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-muted-foreground mb-1">Pagados / Pendientes</p>
                  <p class="text-xl font-bold">
                    <span class="text-green-600">{{ pagadosCount }}</span> / 
                    <span class="text-orange-600">{{ pendientesCount }}</span>
                  </p>
                </div>
                <mat-icon class="text-blue-600">pending_actions</mat-icon>
              </div>
            </app-card-content>
          </app-card>

          <app-card>
            <app-card-content class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-muted-foreground mb-1">Efectivo / Tarjeta</p>
                  <p class="text-xl font-bold">{{ efectivoCount }} / {{ tarjetaCount }}</p>
                </div>
                <mat-icon class="text-blue-600">payment</mat-icon>
              </div>
            </app-card-content>
          </app-card>
        </div>

        <!-- Lista de Pagos -->
        <app-card>
          <app-card-header>
            <app-card-title>Lista de Cobros</app-card-title>
          </app-card-header>
          <app-card-content>
            <div *ngIf="cargando" class="flex items-center justify-center py-12">
              <div class="text-center">
                <mat-icon class="animate-spin text-4xl text-primary mb-2">refresh</mat-icon>
                <p class="text-muted-foreground">Cargando cobros...</p>
              </div>
            </div>

            <div *ngIf="!cargando && payments.length === 0" class="text-center py-12">
              <mat-icon class="text-6xl text-muted-foreground mb-4">receipt_long</mat-icon>
              <h3 class="text-xl font-semibold mb-2">No hay cobros registrados</h3>
              <p class="text-muted-foreground">Los cobros que realices aparecerán aquí</p>
            </div>

            <div *ngIf="!cargando && payments.length > 0" class="space-y-3">
              <div
                *ngFor="let payment of payments"
                class="p-4 rounded-lg border transition-colors"
                [ngClass]="payment.isPendingPayment ? 'border-orange-300 bg-orange-50' : 'border-border hover:border-primary'"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <mat-icon class="text-primary">person</mat-icon>
                      <h4 class="font-semibold text-lg">{{ payment.nombrePaciente }}</h4>
                      <span
                        class="px-2 py-1 rounded-full text-xs font-medium"
                        [ngClass]="payment.isPendingPayment ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'"
                      >
                        <mat-icon class="text-xs" style="font-size: 14px; width: 14px; height: 14px;">
                          {{ payment.isPendingPayment ? 'schedule' : 'check_circle' }}
                        </mat-icon>
                        {{ payment.isPendingPayment ? 'Pago Pendiente' : 'Pagado' }}
                      </span>
                      <span
                        class="px-2 py-1 rounded-full text-xs font-medium"
                        [ngClass]="payment.metodoPago === 'Efectivo' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'"
                      >
                        {{ payment.metodoPago }}
                      </span>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div>
                        <span class="text-muted-foreground">Fecha Cita:</span>
                        <p class="font-medium">{{ payment.fechaCita }} {{ payment.horaCita }}</p>
                      </div>
                      <div>
                        <span class="text-muted-foreground">Fecha Cobro:</span>
                        <p class="font-medium">{{ payment.fechaPago | date: 'dd/MM/yyyy HH:mm' }}</p>
                      </div>
                      <div *ngIf="!payment.isPendingPayment">
                        <span class="text-muted-foreground">Fecha Pago:</span>
                        <p class="font-medium text-green-600">{{ payment.fechaPago | date: 'dd/MM/yyyy HH:mm' }}</p>
                      </div>
                      <div *ngIf="payment.isPendingPayment">
                        <span class="text-muted-foreground">Estado:</span>
                        <p class="font-medium text-orange-600">Esperando pago del paciente</p>
                      </div>
                      <div>
                        <span class="text-muted-foreground">Monto:</span>
                        <p class="font-bold text-lg text-green-600">\${{ payment.monto.toFixed(2) }}</p>
                      </div>
                    </div>

                    <!-- Detalles adicionales según método de pago -->
                    <div *ngIf="payment.metodoPago === 'Efectivo' && !payment.isPendingPayment" class="text-xs text-muted-foreground bg-muted p-2 rounded">
                      <span class="font-medium">Pagado:</span> \${{ payment.montoPagado?.toFixed(2) }} | 
                      <span class="font-medium">Cambio:</span> \${{ payment.cambio?.toFixed(2) }}
                    </div>

                    <div *ngIf="payment.metodoPago === 'Tarjeta' && !payment.isPendingPayment" class="text-xs text-muted-foreground bg-muted p-2 rounded">
                      <span class="font-medium">Tarjeta:</span> ****{{ payment.numeroTarjeta }} | 
                      <span class="font-medium">Titular:</span> {{ payment.titularTarjeta }}
                    </div>

                    <div *ngIf="payment.isPendingPayment" class="text-xs bg-orange-100 text-orange-800 p-2 rounded border border-orange-300">
                      <mat-icon class="text-xs align-middle mr-1" style="font-size: 14px; width: 14px; height: 14px;">info</mat-icon>
                      <span class="font-medium">El paciente aún no ha completado el pago con tarjeta</span>
                    </div>

                    <div *ngIf="payment.notas" class="mt-2 text-sm">
                      <span class="text-muted-foreground">Notas:</span>
                      <p class="italic">{{ payment.notas }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </app-card-content>
        </app-card>
      </main>
    </div>
  `,
})
export class HistorialCobrosComponent implements OnInit, OnDestroy {
  pagadosCount = 0;
  pendientesCount = 0;
  payments: Payment[] = [];
  cargando = false;
  totalRecaudado = 0;
  efectivoCount = 0;
  tarjetaCount = 0;

  navLinks: NavLink[] = [
    { label: 'Dashboard', route: '/fisioterapeuta/dashboard' },
    { label: 'Agenda', route: '/fisioterapeuta/agenda' },
    { label: 'Pacientes', route: '/fisioterapeuta/pacientes' },
    { label: 'Historial de Cobros', route: '/fisioterapeuta/historial-cobros' },
  ];
  private destroy$ = new Subject<void>();

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarCobros();
  }

  cargarCobros(): void {
    this.cargando = true;
    this.paymentService.getPayments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (payments) => {
          this.payments = payments;
          this.calcularEstadisticas();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar cobros:', error);
          this.toastService.error('Error al cargar el historial de cobros');
          this.cargando = false;
        }
      });
  }

  calcularEstadisticas(): void {
    // Solo contar el total recaudado de pagos completados
    this.totalRecaudado = this.payments
      .filter(p => !p.isPendingPayment)
      .reduce((sum, p) => sum + p.monto, 0);
    
    this.efectivoCount = this.payments.filter(p => p.metodoPago === 'Efectivo').length;
    this.tarjetaCount = this.payments.filter(p => p.metodoPago === 'Tarjeta').length;
    this.pagadosCount = this.payments.filter(p => !p.isPendingPayment).length;
    this.pendientesCount = this.payments.filter(p => p.isPendingPayment).length;
  }

  onChangeInfo(): void {
    console.log('Cambiar información - pendiente de implementar');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
