import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { PaymentService, Payment } from '../../../shared/services/payment.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../shared/services/auth.service';
import { UserMenuComponent } from '../../../shared/components/user-menu.component';
import { HeaderComponent, NavLink } from '../../../shared/components/header.component';
import { PagarModalComponent } from '../../../shared/components/dialogs/pagar-modal.component';

@Component({
  selector: 'app-pagos-pendientes',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    UserMenuComponent,
    HeaderComponent
  ],
  template: `
<app-header [navLinks]="navLinks" (changeInfo)="onChangeInfo()" (logout)="logout()"></app-header>
  
  <div class="min-h-screen bg-white">
    <div class="container mx-auto p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-4xl font-bold text-foreground mb-2">Pagos Pendientes</h1>
        <mat-icon class="text-primary">payment</mat-icon>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-12">
        <mat-icon class="animate-spin text-6xl text-primary">refresh</mat-icon>
        <p class="mt-4 text-muted-foreground">Cargando pagos...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && pagosPendientes.length === 0" class="text-center py-12">
        <mat-icon class="text-8xl text-muted-foreground">check_circle</mat-icon>
        <h2 class="text-2xl font-semibold mt-4 mb-2">¡No tienes pagos pendientes!</h2>
        <p class="text-muted-foreground">Todos tus pagos están al día</p>
      </div>

      <!-- Pagos Pendientes List -->
      <div *ngIf="!loading && pagosPendientes.length > 0" class="grid gap-4">
        <mat-card *ngFor="let pago of pagosPendientes" class="bg-white hover:bg-gray-50 hover:shadow-xl transition-all cursor-pointer border border-gray-200">
          <mat-card-content class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <mat-icon class="text-orange-500 ">pending</mat-icon>
                  <div>
                    <h3 class="text-xl font-semibold">Pago Pendiente</h3>
                    <p class="text-sm text-muted-foreground">{{ pago.fechaCita }} - {{ pago.horaCita }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div class="flex items-start gap-2">
                    <mat-icon class="text-muted-foreground">description</mat-icon>
                    <div>
                      <p class="text-sm text-muted-foreground">Descripción</p>
                      <p class="font-medium">{{ pago.descripcionCita || 'Sin descripción' }}</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-2">
                    <mat-icon class="text-muted-foreground">calendar_today</mat-icon>
                    <div>
                      <p class="text-sm text-muted-foreground">Fecha de solicitud</p>
                      <p class="font-medium">{{ formatDate(pago.fechaPago) }}</p>
                    </div>
                  </div>
                </div>

                <div *ngIf="pago.notas" class="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-4">
                  <p class="text-sm"><strong>Nota:</strong> {{ pago.notas }}</p>
                </div>

                <div class="flex items-center justify-between">
                  <div class="bg-orange-50 px-4 py-2 rounded-lg">
                    <p class="text-sm text-orange-600 font-medium">Monto a pagar</p>
                    <p class="text-3xl font-bold text-orange-600">\${{ pago.monto.toFixed(2) }}</p>
                  </div>

                  <button
                    (click)="abrirModalPago(pago)"
                    mat-raised-button
                    color="primary"
                    class="px-8 py-3 text-lg"
                  >
                    <mat-icon class="mr-2">credit_card</mat-icon>
                    Pagar Ahora
                  </button>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: calc(100vh - 64px);
      background-color: #ffffff;
    }

    mat-card {
      border-radius: 12px;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `]
})
export class PagosPendientesComponent implements OnInit, OnDestroy {
  navLinks: NavLink[] = [
    { label: 'Dashboard', route: '/paciente/dashboard' },
    { label: 'Mi Rutina', route: '/paciente/rutinas' },
    { label: 'Mis Citas', route: '/paciente/citas' },
    { label: 'Pagos', route: '/paciente/pagos-pendientes' },
  ];
  private destroy$ = new Subject<void>();
  pagosPendientes: Payment[] = [];
  loading = true;

  constructor(
    private paymentService: PaymentService,
    private toastService: ToastService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarPagosPendientes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarPagosPendientes(): void {
    this.loading = true;
    this.paymentService.getPendingPayments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pagos) => {
          this.pagosPendientes = pagos;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar pagos pendientes:', error);
          this.toastService.error('Error al cargar los pagos pendientes');
          this.loading = false;
        }
      });
  }

  abrirModalPago(pago: Payment): void {
    const dialogRef = this.dialog.open(PagarModalComponent, {
      width: '500px',
      data: { pago },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Pago confirmado, recargar lista
        this.cargarPagosPendientes();
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onChangeInfo(): void {
    // TODO: Implementar modal para cambiar información del usuario
    console.log('Cambiar información - pendiente de implementar');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
