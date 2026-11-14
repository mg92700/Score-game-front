import { Routes } from '@angular/router';
import { Matches } from './pages/matches';
import { MatchCenterPage } from './pages/match-center';
import { Standings } from './pages/standings';

export const routes: Routes = [
  { path: '', component: Matches, title: 'Matchs' },
  { path: 'match/:id', component: MatchCenterPage, title: 'Match' },
  { path: 'classements', component: Standings, title: 'Classements' },
  { path: '**', redirectTo: '' },
];
