import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StockChartComponent } from './components/stock-chart/stock-chart.component';
import { RecommendationsComponent } from './components/recommendations/recommendations.component';
import { BlogComponent } from './components/blog/blog.component';
import { AdminRecommendationsComponent } from './components/admin-recommendations/admin-recommendations.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';

import { AuthGuard } from '../guard/auth.guard';
import { AdminGuard } from '../guard/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/chart/:symbol', component: StockChartComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/recommendations', component: RecommendationsComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/blog', component: BlogComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/admin/recommendations', component: AdminRecommendationsComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '/auth/login' }
];