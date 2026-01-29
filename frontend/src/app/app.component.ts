import { Component } from '@angular/core';
import { LoginComponent } from "./components/login/login.component";
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './components/register/register.component';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginComponent,CommonModule,RegisterComponent,RouterOutlet]  ,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
  
})
export class AppComponent {
  mode: 'login' | 'register' = 'login';
}