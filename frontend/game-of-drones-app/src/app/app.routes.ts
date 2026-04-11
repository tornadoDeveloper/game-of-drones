import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'setup', loadComponent: () => import('./pages/setup/setup.component').then(m => m.SetupComponent) },
  { path: 'game', loadComponent: () => import('./pages/game/game.component').then(m => m.GameComponent) },
  { path: 'winner', loadComponent: () => import('./pages/winner/winner.component').then(m => m.WinnerComponent) },
  { path: 'config', loadComponent: () => import('./pages/move-config/move-config.component').then(m => m.MoveConfigComponent) },
  { path: '**', redirectTo: '' }
];
