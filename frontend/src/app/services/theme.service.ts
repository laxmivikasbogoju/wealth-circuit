import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>(this.readInitialTheme());
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  get current(): Theme {
    return this.themeSubject.value;
  }

  toggle(): void {
    this.setTheme(this.current === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    localStorage.setItem(STORAGE_KEY, theme);
    this.applyTheme(theme);
    this.themeSubject.next(theme);
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }

  private readInitialTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' ? 'light' : 'dark';
  }
}
