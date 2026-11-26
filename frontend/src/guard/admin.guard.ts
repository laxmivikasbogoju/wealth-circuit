import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return of(false);
    }

    return this.authService.getCurrentUser().pipe(
      map(user => {
        if (user.is_admin) {
          return true;
        }
        this.router.navigate(['/dashboard']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}
