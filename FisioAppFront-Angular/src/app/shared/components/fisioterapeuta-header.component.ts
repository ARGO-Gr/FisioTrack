import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UserMenuComponent } from './user-menu.component';

@Component({
  selector: 'app-fisioterapeuta-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    UserMenuComponent,
  ],
  template: `
    <header class="border-b border-border bg-card sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <mat-icon class="text-primary">favorite_border</mat-icon>
            <h1 class="text-2xl font-bold">FisioTrack</h1>
          </div>
          <nav class="flex items-center gap-4">
            <a 
              routerLink="/fisioterapeuta/dashboard" 
              routerLinkActive="text-primary"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </a>
            <a 
              routerLink="/fisioterapeuta/agenda" 
              routerLinkActive="text-primary"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-sm font-medium hover:text-primary transition-colors">
              Agenda
            </a>
            <a 
              routerLink="/fisioterapeuta/pacientes" 
              routerLinkActive="text-primary"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-sm font-medium hover:text-primary transition-colors">
              Pacientes
            </a>
            <a 
              routerLink="/fisioterapeuta/historial-cobros" 
              routerLinkActive="text-primary"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-sm font-medium hover:text-primary transition-colors">
              Historial de Cobros
            </a>
            <app-user-menu
              (changeInfo)="onChangeInfo()"
              (logout)="onLogout()"
            ></app-user-menu>
          </nav>
        </div>
      </div>
    </header>
  `,
})
export class FisioterapeutaHeaderComponent {
  @Output() changeInfo = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  onChangeInfo(): void {
    this.changeInfo.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }
}
