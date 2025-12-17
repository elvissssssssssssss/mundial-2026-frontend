import { Routes } from '@angular/router';
import { LiveMatchComponent } from './features/live-match/live-match.component';
import { AdminDashboardComponent } from '../app/features/admin/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/live-match',
    pathMatch: 'full'
  },
  {
    path: 'live-match',
    component: LiveMatchComponent
  },
  {
    path: 'admin',
    component: AdminDashboardComponent
  }
];
