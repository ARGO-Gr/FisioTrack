import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private theme$ = new BehaviorSubject<Theme>('light');

  constructor() {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      this.theme$.next(stored);
      this.applyTheme(stored);
    }
  }

  getTheme(): Observable<Theme> {
    return this.theme$.asObservable();
  }

  setTheme(theme: Theme) {
    this.theme$.next(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme) {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else if (theme === 'light') {
      html.classList.remove('dark');
    } else {
      // system
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }
}
