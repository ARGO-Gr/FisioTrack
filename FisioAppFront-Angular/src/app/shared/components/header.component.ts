import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UserMenuComponent } from './user-menu.component';

export interface NavLink {
  label: string;
  route: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    UserMenuComponent,
  ],
  template: `
    <header class="border-b border-border bg-card sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <mat-icon class="text-primary">favorite_border</mat-icon>
            <h1 class="text-2xl font-bold">{{ appTitle }}</h1>
          </div>
          <nav class="flex items-center gap-4">
            <a 
              *ngFor="let link of navLinks"
              [routerLink]="link.route" 
              class="text-sm font-medium hover:text-primary transition-colors">
              {{ link.label }}
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
export class HeaderComponent {
  @Input() appTitle: string = 'FisioTrack';
  @Input() navLinks: NavLink[] = [];
  @Output() changeInfo = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  onChangeInfo(): void {
    this.changeInfo.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }
}
