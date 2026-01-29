import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
    imports: [CommonModule, FormsModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']})
export class LoginComponent {

  email: string = '';
  password: string = '';
  error: string = '';
showRegister: any;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.error = '';

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        // Save JWT token
        localStorage.setItem('access_token', res.access_token);
        this.router.navigate(['/dashboard']); // ✅ redirect

        // You can redirect to dashboard here
        console.log('Login successful');
      },
      error: () => {
        this.error = 'Invalid email or password';
      }
    });
  }
}
