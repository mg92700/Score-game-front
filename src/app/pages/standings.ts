import { Component, OnInit, inject, signal } from '@angular/core';
import { ScoreApi } from '../core/score-api';
import { Competition, StandingRow } from '../core/models';

@Component({
  selector: 'app-standings',
  template: `
    <div class="bar">
      <select (change)="select($any($event.target).value)">
        @for (c of competitions(); track c.code) { <option [value]="c.code" [selected]="c.code === code()">{{ c.name }}</option> }
      </select>
    </div>
    @if (rows().length === 0) { <p class="muted">Classement indisponible.</p> }
    <table>
      <thead><tr><th>#</th><th>Equipe</th><th>J</th><th>G</th><th>N</th><th>P</th><th>Diff</th><th>Pts</th></tr></thead>
      <tbody>
        @for (r of rows(); track r.team.id) {
          <tr><td>{{ r.rank }}</td><td class="l">{{ r.team.name }}</td><td>{{ r.played }}</td><td>{{ r.won }}</td>
              <td>{{ r.drawn }}</td><td>{{ r.lost }}</td><td>{{ r.goalsFor - r.goalsAgainst }}</td><td><b>{{ r.points }}</b></td></tr>
        }
      </tbody>
    </table>
  `,
})
export class Standings implements OnInit {
  private readonly api = inject(ScoreApi);
  readonly competitions = signal<Competition[]>([]);
  readonly code = signal('');
  readonly rows = signal<StandingRow[]>([]);

  async ngOnInit() {
    const comps = await this.api.competitions();
    this.competitions.set(comps);
    if (comps.length) { this.select(comps[0].code); }
  }
  select(code: string) {
    this.code.set(code);
    this.api.standings(code).then((r) => this.rows.set(r)).catch(() => this.rows.set([]));
  }
}
