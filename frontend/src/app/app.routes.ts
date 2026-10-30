import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/auth/login/login';
import { Signup } from './pages/auth/signup/signup';
import { ForgotPassword } from './pages/auth/forgot-password/forgot-password';
import { ResetPassword } from './pages/auth/reset-password/reset-password';
import { authGuard, guestGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    title: 'Dashboard',
  },

  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard],
    title: 'Login',
  },

  {
    path: 'signup',
    component: Signup,
    canActivate: [guestGuard],
    title: 'Sign up',
  },

  {
    path: 'forgot-password',
    component: ForgotPassword,
    canActivate: [guestGuard],
    title: 'Forgot password',
  },

  {
    path: 'reset-password/:token',
    component: ResetPassword,
    title: 'Reset password',
  },

  { path: '**', redirectTo: 'dashboard' },
];
