import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule, MatButtonModule, MatDividerModule],
  template: `
    <button
      mat-button
      [matMenuTriggerFor]="userMenu"
      class="user-menu-button"
      title="Menú de usuario"
    >
      <mat-icon>person</mat-icon>
    </button>

    <mat-menu #userMenu="matMenu" class="user-menu">
      <button mat-menu-item (click)="onChangeInfo()">
        <mat-icon>edit</mat-icon>
        <span>Cambiar información</span>
      </button>
      <button mat-menu-item (click)="onLogout()">
        <mat-icon class="text-red-500">logout</mat-icon>
        <span class="text-red-500">Cerrar sesión</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    :host {
      display: contents;
    }

    :host ::ng-deep {
      /* Estilos para el botón */
      .user-menu-button {
        width: 40px !important;
        height: 40px !important;
        min-width: 40px !important;
        min-height: 40px !important;
        border-radius: 50% !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .user-menu-button:hover {
        background-color: var(--muted-bg) !important;
      }

      /* Estilos para el overlay y el panel del menú */
      .cdk-overlay-pane .mat-mdc-menu-panel {
        background-color: white !important;
        border-radius: 4px !important;
      }

      .mat-mdc-menu-panel {
        background-color: white !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      }

      .mat-mdc-menu-container {
        background-color: white !important;
      }

      .mat-mdc-menu-content {
        padding: 0 !important;
        background-color: white !important;
      }

      .mat-mdc-menu-item {
        height: 48px !important;
        line-height: 48px !important;
        background-color: white !important;
      }

      .mat-mdc-menu-item:hover {
        background-color: #f5f5f5 !important;
      }

      .mat-divider {
        margin: 4px 0 !important;
        opacity: 1 !important;
        border-color: rgba(0, 0, 0, 0.12) !important;
      }
    }
  `]
})
export class UserMenuComponent {
  @Output() changeInfo = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  onChangeInfo() {
    this.changeInfo.emit();
  }

  onLogout() {
    this.logout.emit();
  }
}
