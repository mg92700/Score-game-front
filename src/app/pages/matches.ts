import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ScoreApi } from '../core/score-api';
import { Competition, FixtureSummary } from '../core/models';

@Component({
  selector: 'app-matches',
  imports: [DatePipe, FormsModule, RouterLink],
  template: `
    <div class="bar">
      <button (click)="shift(-1)" aria-label="Jour precedent">‹</button>
      <input type="date" [ngModel]="day()" (ngModelChange)="setDay($event)" />
      <button (click)="shift(1)" aria-label="Jour suivant">›</button>
      <select [ngModel]="competition()" (ngModelChange)="setCompetition($event)">
        <option [ngValue]="null">Toutes les competitions</option>
        @for (c of competitions(); track c.code) { <option [value]="c.code">{{ c.name }}</option> }
      </select>
    </div>
    @if (error()) { <p class="error">{{ error() }}</p> }
    @if (!loading() && fixtures().length === 0) { <p class="muted">Aucun match ce jour-la.</p> }
    @for (f of fixtures(); track f.id) {
      <a class="match" [routerLink]="['/match', f.id]">
        <span class="comp">{{ f.competition.name }}</span>
        <span class="team home">{{ f.home.name }}</span>
        <span class="score" [class.live]="f.status === 'LIVE' || f.status === 'HALFTIME'">
          @if (f.status === 'SCHEDULED') { {{ f.kickoffAt | date: 'HH:mm' }} }
          @else { {{ f.home.score ?? 0 }} - {{ f.away.score ?? 0 }} }
        </span>
        <span class="team away">{{ f.away.name }}</span>
        <span class="state">
          @switch (f.status) {
            @case ('LIVE') { {{ f.minute }}' }
            @case ('HALFTIME') { MT }
            @case ('FINISHED') { Termine }
            @case ('POSTPONED') { Reporte }
            @case ('CANCELLED') { Annule }
          }
        </span>
      </a>
    }
  `,
})
export class Matches implements OnInit, OnDestroy {
  private readonly api = inject(ScoreApi);
  readonly day = signal(today());
  readonly competition = signal<string | null>(null);
  readonly competitions = signal<Competition[]>([]);
  readonly fixtures = signal<FixtureSummary[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  private stop?: () => void;
  private timer?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.api.competitions().then((c) => this.competitions.set(c)).catch(() => undefined);
    this.load();
    this.stop = this.api.watch(() => this.reloadSoon());
  }
  ngOnDestroy() { this.stop?.(); clearTimeout(this.timer); }

  setDay(d: string) { this.day.set(d); this.load(); }
  setCompetition(c: string | null) { this.competition.set(c); this.load(); }
  shift(delta: number) {
    const d = new Date(this.day() + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    this.setDay(d.toISOString().slice(0, 10));
  }
  private reloadSoon() { clearTimeout(this.timer); this.timer = setTimeout(() => this.load(), 500); }
  private load() {
    this.api.fixtures(this.day(), this.competition())
      .then((f) => { this.fixtures.set(f); this.error.set(''); })
      .catch((e: Error) => this.error.set(e.message))
      .finally(() => this.loading.set(false));
  }
}

function today(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());
}
