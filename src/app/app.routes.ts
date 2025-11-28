import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'SpendSnap - Home' // Accessibility: Sets the browser/tab title
  },
  {
    path: 'scan',
    loadComponent: () => import('./features/scanning/scanning.component').then(m => m.ScanningComponent),
    title: 'Scan Receipt'
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent),
    title: 'Receipt History'
  },
  // Fallback for 404s (Good practice)
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];