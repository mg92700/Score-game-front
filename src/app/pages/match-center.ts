import { Component, OnDestroy, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScoreApi } from '../core/score-api';
import { Injury, Lineup, MatchCenter, Press, Stats } from '../core/models';

@Component({
  selector: 'app-match-center',
  imports: [DatePipe, RouterLink],
  template: `
    <a routerLink="/" class="back">‹ Matchs</a>
    @if (error()) { <p class="error">{{ error() }}</p> }
    @if (data(); as d) {
      @if (d.fixture; as f) {
        <header class="hero">
          <span class="comp">{{ f.competition.name }} @if (f.round) { · {{ f.round }} }</span>
          <div class="teams">
            <b>{{ f.home.name }}</b>
            <span class="score">
              @if (f.status === 'SCHEDULED') { {{ f.kickoffAt | date: 'dd/MM HH:mm' }} }
              @else { {{ f.home.score ?? 0 }} - {{ f.away.score ?? 0 }} }
            </span>
            <b>{{ f.away.name }}</b>
          </div>
          <span class="muted">{{ f.status }} @if (f.minute) { · {{ f.minute }}' } @if (f.venue) { · {{ f.venue }} }</span>
        </header>

        @if (d.prediction; as p) {
          <section><h2>Pronostic</h2>
            <div class="prob">
              <span>{{ f.home.name }} {{ p.homePct }}%</span><span>Nul {{ p.drawPct }}%</span><span>{{ f.away.name }} {{ p.awayPct }}%</span>
            </div>
            @if (p.advice) { <p class="muted">{{ p.advice }}</p> }
          </section>
        }

        <section><h2>Blesses et suspendus</h2>
          @for (side of sides(); track side.id) {
            <h3>{{ side.name }}</h3>
            @for (i of injuriesOf(side.id); track i.player) {
              <p class="row"><b>{{ i.player }}</b> <span class="muted">{{ i.status }} — {{ i.reason || 'motif non communique' }}</span></p>
            } @empty { <p class="muted">Aucune absence signalee.</p> }
          }
        </section>

        <section><h2>Conferences de presse</h2>
          @for (p of d.press; track p.url) {
            <article class="press">
              <h3>{{ teamName(p.teamId) }} · {{ p.phase === 'PRE_MATCH' ? 'Avant-match' : 'Apres-match' }}</h3>
              <p>{{ p.summary }}</p>
              @if (p.keyPoints?.length) { <ul>@for (k of p.keyPoints; track k) { <li>{{ k }}</li> }</ul> }
              <a [href]="p.url" target="_blank" rel="noopener noreferrer">Source : {{ p.title }}</a>
            </article>
          } @empty { <p class="muted">Pas encore de resume disponible.</p> }
        </section>

        @if (d.events.length) {
          <section><h2>Evenements</h2>
            @for (e of d.events; track $index) {
              <p class="row">{{ e.minute }}@if (e.extraMinute) {+{{ e.extraMinute }}}' · <b>{{ e.player }}</b> <span class="muted">{{ e.type }} {{ e.detail }}</span></p>
            }
          </section>
        }

        @if (d.stats.length) {
          <section><h2>Statistiques</h2>
            @for (row of statRows(d.stats); track row.label) {
              <p class="stat"><span>{{ row.home ?? '-' }}</span><span class="muted">{{ row.label }}</span><span>{{ row.away ?? '-' }}</span></p>
            }
          </section>
        }

        @if (d.lineups.length) {
          <section><h2>Compositions</h2>
            @for (l of d.lineups; track l.teamId) {
              <h3>{{ teamName(l.teamId) }} @if (l.formation) { <span class="muted">({{ l.formation }})</span> }</h3>
              <p>@for (p of l.startingXi; track $index) { <span class="chip">{{ p.number }} {{ p.name }}</span> }</p>
              @if (l.coach) { <p class="muted">Entraineur : {{ l.coach }}</p> }
            }
          </section>
        }
      } @else { <p class="muted">Match introuvable.</p> }
    }
  `,
})
export class MatchCenterPage implements OnInit, OnDestroy {
  readonly id = input.required<string>();
  private readonly api = inject(ScoreApi);
  readonly data = signal<MatchCenter | null>(null);
  readonly error = signal('');
  readonly sides = computed(() => {
    const f = this.data()?.fixture;
    return f ? [f.home, f.away] : [];
  });
  private stop?: () => void;
  private timer?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.load();
    this.stop = this.api.watch(() => { clearTimeout(this.timer); this.timer = setTimeout(() => this.load(), 500); });
  }
  ngOnDestroy() { this.stop?.(); clearTimeout(this.timer); }

  injuriesOf(teamId: number): Injury[] { return (this.data()?.injuries ?? []).filter((i) => i.teamId === teamId); }
  teamName(teamId: number): string { return this.sides().find((s) => s.id === teamId)?.name ?? ''; }

  statRows(stats: Stats[]) {
    const f = this.data()?.fixture;
    const home = stats.find((s) => s.teamId === f?.home.id);
    const away = stats.find((s) => s.teamId === f?.away.id);
    const rows: [string, keyof Stats][] = [
      ['Possession (%)', 'possession'], ['Tirs', 'shots'], ['Tirs cadres', 'shotsOnTarget'], ['Corners', 'corners'],
      ['Fautes', 'fouls'], ['Cartons jaunes', 'yellowCards'], ['Cartons rouges', 'redCards'], ['xG', 'expectedGoals'],
    ];
    return rows.map(([label, key]) => ({ label, home: home?.[key], away: away?.[key] }));
  }

  private load() {
    this.api.matchCenter(Number(this.id()))
      .then((d) => { this.data.set(d); this.error.set(''); })
      .catch((e: Error) => this.error.set(e.message));
  }
}

export type { Lineup, Press };
