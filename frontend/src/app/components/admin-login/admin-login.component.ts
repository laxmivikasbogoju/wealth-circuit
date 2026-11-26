import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeToggleComponent } from '../shared/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ThemeToggleComponent],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.authService.getCurrentUser().subscribe({
          next: (user) => {
            this.isLoading = false;
            if (user.is_admin) {
              this.router.navigate(['/dashboard/admin/recommendations']);
            } else {
              this.authService.clearSession();
              this.errorMessage = 'This account does not have admin access.';
            }
          },
          error: () => {
            this.isLoading = false;
            this.authService.clearSession();
            this.errorMessage = 'Could not verify admin access. Please try again.';
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.detail || 'Login failed. Please try again.';
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
