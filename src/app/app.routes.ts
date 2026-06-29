import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(
        (component) => component.Login,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/main-layout/main-layout').then(
        (component) => component.MainLayout,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'loans',
        pathMatch: 'full',
      },
      {
        path: 'loans',
        loadComponent: () =>
          import('./components/loans/loans').then(
            (component) => component.Loans,
          ),
      },
      {
        path: 'books',
        loadComponent: () =>
          import('./components/books/books').then(
            (component) => component.Books,
          ),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./components/clients/clients').then(
            (component) => component.Clients,
          ),
      },
      {
        path: '**',
        redirectTo: 'loans',
      },
    ],
  },
];
