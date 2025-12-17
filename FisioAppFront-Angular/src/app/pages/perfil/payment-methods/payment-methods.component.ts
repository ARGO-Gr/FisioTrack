import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProfileService, PaymentCardDto, CreatePaymentCardDto } from '../../../shared/services/profile.service';
import { AddPaymentCardDialogComponent } from './add-payment-card-dialog/add-payment-card-dialog.component';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  template: `
    <mat-card class="payment-methods-card">
      <mat-card-content class="p-6 space-y-6">
        <!-- Card Header -->
        <div class="flex items-center justify-between pb-6 border-b border-border">
          <div class="flex items-center gap-3">
            <div class="p-3 rounded-lg bg-primary/10">
              <mat-icon class="text-primary ">credit_card</mat-icon>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-foreground">Métodos de Pago</h2>
              <p class="text-sm text-muted-foreground">Administra tus tarjetas</p>
            </div>
          </div>
          <button 
            mat-raised-button 
            color="primary"
            (click)="openAddCardDialog()"
            class="gap-2">
            <mat-icon>add</mat-icon>
            Agregar
          </button>
        </div>

        <!-- Empty state -->
        <div *ngIf="paymentCards.length === 0 && !isLoading" class="text-center py-12">
          <mat-icon class="text-muted-foreground  mb-4 opacity-40">credit_card</mat-icon>
          <p class="text-sm text-muted-foreground">No tienes métodos de pago guardados</p>
          <button 
            mat-button 
            color="primary"
            (click)="openAddCardDialog()"
            class="mt-4">
            Agregar tu primera tarjeta
          </button>
        </div>

        <!-- Payment cards list -->
        <div *ngIf="paymentCards.length > 0" class="space-y-3">
          <div 
            *ngFor="let card of paymentCards"
            class="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:shadow-md hover:border-primary/50 transition-all"
            [class.ring-2]="card.isDefault"
            [class.ring-primary]="card.isDefault">
            
            <div class="flex items-center gap-4 flex-1">
              <!-- Card icon -->
              <div class="p-3 rounded-lg" [ngClass]="getCardIconColor(card.cardType)">
                <mat-icon class="text-white">credit_card</mat-icon>
              </div>

              <!-- Card info -->
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <p class="font-semibold text-sm text-foreground">
                    {{ getCardTypeName(card.cardType) }}
                  </p>
                  <span 
                    *ngIf="card.isDefault"
                    class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary font-semibold">
                    <mat-icon style="font-size: 12px; width: 12px; height: 12px;">star</mat-icon>
                    Predeterminada
                  </span>
                </div>
                <p class="text-xs text-muted-foreground">
                  •••• {{ card.last4 }} • Vence {{ card.expiryMonth }}/{{ card.expiryYear }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 ml-4">
              <button 
                *ngIf="!card.isDefault"
                mat-button
                (click)="setAsDefault(card.id)"
                [disabled]="isLoading"
                class="text-xs">
                Hacer predeterminada
              </button>
              <button 
                mat-icon-button
                (click)="deleteCard(card.id)"
                [disabled]="isLoading"
                matTooltip="Eliminar tarjeta"
                matTooltipClass="solid-white-tooltip"
                class="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div *ngIf="isLoading" class="flex items-center justify-center gap-2 py-4 bg-muted rounded-lg">
          <mat-icon class="animate-spin text-primary">refresh</mat-icon>
          <p class="text-sm text-muted-foreground">Procesando...</p>
        </div>

        <!-- Error message -->
        <div *ngIf="errorMessage" class="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div class="flex items-start gap-3">
            <mat-icon class="text-destructive mt-0.5">error</mat-icon>
            <p class="text-sm text-destructive">{{ errorMessage }}</p>
          </div>
        </div>

        <!-- Success message -->
        <div *ngIf="successMessage" class="p-4 rounded-lg bg-green-50 border border-green-200">
          <div class="flex items-start gap-3">
            <mat-icon class="text-green-600 mt-0.5">check_circle</mat-icon>
            <p class="text-sm text-green-700">{{ successMessage }}</p>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    .payment-methods-card {
      border: 2px solid #ebedf3ff !important;
      border-radius: 12px;
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class PaymentMethodsComponent implements OnInit, OnDestroy {
  paymentCards: PaymentCardDto[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private profileService: ProfileService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPaymentCards();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPaymentCards(): void {
    this.isLoading = true;
    this.profileService.getPaymentCards()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cards) => {
          this.paymentCards = cards;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error al cargar métodos de pago';
          console.error('Error loading payment cards:', error);
        }
      });
  }

  openAddCardDialog(): void {
    const dialogRef = this.dialog.open(AddPaymentCardDialogComponent, {
      width: '500px',
      disableClose: false
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.addCard(result);
        }
      });
  }

  private addCard(cardData: CreatePaymentCardDto): void {
    this.isLoading = true;
    this.profileService.addPaymentCard(cardData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newCard) => {
          this.paymentCards.push(newCard);
          this.isLoading = false;
          this.successMessage = '✅ Tarjeta agregada exitosamente';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error al agregar la tarjeta';
          console.error('Error adding card:', error);
        }
      });
  }

  setAsDefault(cardId: string): void {
    this.isLoading = true;
    this.profileService.setDefaultPaymentCard(cardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedCard) => {
          // Update all cards
          this.paymentCards = this.paymentCards.map(card => ({
            ...card,
            isDefault: card.id === cardId
          }));
          this.isLoading = false;
          this.successMessage = '✅ Tarjeta predeterminada actualizada';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error al actualizar tarjeta predeterminada';
          console.error('Error setting default:', error);
        }
      });
  }

  deleteCard(cardId: string): void {
    if (!confirm('¿Estás seguro que deseas eliminar esta tarjeta?')) {
      return;
    }

    this.isLoading = true;
    this.profileService.deletePaymentCard(cardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.paymentCards = this.paymentCards.filter(card => card.id !== cardId);
          this.isLoading = false;
          this.successMessage = '✅ Tarjeta eliminada';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error al eliminar la tarjeta';
          console.error('Error deleting card:', error);
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
}
