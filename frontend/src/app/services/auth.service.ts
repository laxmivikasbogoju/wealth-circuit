import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  API = 'http://localhost:8000/auth';

  constructor(private http: HttpClient) {}

  login(data:any) {
    return this.http.post(`${this.API}/login`, data);
  }
  register(data: any) {
  return this.http.post(`${this.API}/register`, data);
  }
}
