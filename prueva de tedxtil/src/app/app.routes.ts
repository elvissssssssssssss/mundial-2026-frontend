import { Routes } from '@angular/router';
import { LiveMatchComponent } from '../app/features/live-match/live-match.component';

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
  // ... el resto de tus rutas
];
