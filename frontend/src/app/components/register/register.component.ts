import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
   templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  email = '';
  password = '';
  success = '';
  error = '';

  constructor(private auth: AuthService) {}

  register() {
  this.success = '';
  this.error = '';

  // bcrypt-safe limit (leave buffer)
  if (this.password.length > 64) {
    this.error = 'Password must be 64 characters or less';
    return;
  }

  if (this.password.length < 8) {
    this.error = 'Password must be at least 8 characters';
    return;
  }

  this.auth.register({
    email: this.email,
    password: this.password
  }).subscribe({
    next: () => {
      this.success = 'Account created successfully';
      this.email = '';
      this.password = '';
    },
    error: (err) => {
      this.error = err.error?.detail || 'Registration failed';
    }
  });
  }
}
