import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-speed-dial',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="relative">
      <button
        mat-icon-button
        [matMenuTriggerFor]="menu"
        class="text-muted-foreground hover:text-foreground transition-colors"
      >
        <mat-icon>more_vert</mat-icon>
      </button>
      
      <mat-menu #menu="matMenu" class="speed-dial-menu">
        <button mat-menu-item (click)="onEdit()" class="flex items-center gap-3">
          <mat-icon class="text-primary">edit</mat-icon>
          <span>Editar</span>
        </button>
        <button mat-menu-item (click)="onDelete()" class="flex items-center gap-3">
          <mat-icon class="text-red-500">delete</mat-icon>
          <span>Eliminar</span>
        </button>
      </mat-menu>
    </div>
  `,
  styles: [`
    .speed-dial-menu {
      background-color: white !important;
    }

    .speed-dial-menu.mat-mdc-menu-panel {
      background-color: white !important;
    }

    .speed-dial-menu .mat-mdc-menu-content {
      background-color: white !important;
    }

    .speed-dial-menu .mat-mdc-menu-item {
      background-color: white !important;
      color: #000000 !important;
    }

    .speed-dial-menu .mat-mdc-menu-item:hover {
      background-color: #f5f5f5 !important;
    }

    .speed-dial-menu .mdc-list-item__primary-text {
      color: #000000 !important;
    }
  `]
})
export class SpeedDialComponent {
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onEdit() {
    this.edit.emit();
  }

  onDelete() {
    this.delete.emit();
  }
}
