import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../services/toast.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed top-4 right-4 z-[9999] space-y-2 max-w-md">
      <div 
        *ngFor="let toast of toasts"
        [class]="getToastClass(toast.type)"
        class="rounded-md p-4 shadow-lg flex items-start gap-3 transition-all duration-200"
      >
        <mat-icon [class]="getIconClass(toast.type)" class="flex-shrink-0 mt-0.5">
          {{ getIcon(toast.type) }}
        </mat-icon>
        <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
        <button 
          (click)="removeToast(toast.id)"
          class="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <mat-icon class="!size-5">close</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class ToastContainerComponent implements OnInit {
  toasts: Toast[] = [];
  private removeTimeouts: Map<string, any> = new Map();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toast$.subscribe((toast: Toast) => {
      this.toasts.push(toast);

      if (toast.duration && toast.duration > 0) {
        const timeout = setTimeout(() => {
          this.removeToast(toast.id);
        }, toast.duration);
        this.removeTimeouts.set(toast.id, timeout);
      }
    });
  }

  removeToast(id: string): void {
    const timeout = this.removeTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.removeTimeouts.delete(id);
    }
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  getToastClass(type: string): string {
    const baseClass = 'bg-card border text-foreground';
    switch (type) {
      case 'success':
        return `${baseClass} border-green-500 bg-green-100 dark:bg-gray-50`;
      case 'error':
        return `${baseClass} border-red-500 bg-red-100 dark:bg-gray-50`;
      case 'warning':
        return `${baseClass} border-yellow-500 bg-yellow-100 dark:bg-gray-50`;
      case 'info':
      default:
        return `${baseClass} border-blue-500 bg-blue-100 dark:bg-gray-50`;
    }
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  }
}
