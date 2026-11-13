import { Injectable } from '@angular/core';
import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Competition, FixtureSummary, MatchCenter, StandingRow } from './models';

@Injectable({ providedIn: 'root' })
export class ScoreApi {
  private readonly client: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey, {
    realtime: { params: { eventsPerSecond: 5 } },
  });

  competitions() { return this.rpc<Competition[]>('sg_competitions', {}); }
  fixtures(day: string | null, competition: string | null) {
    return this.rpc<FixtureSummary[]>('sg_fixtures', { p_day: day, p_competition: competition });
  }
  matchCenter(id: number) { return this.rpc<MatchCenter>('sg_match_center', { p_fixture_id: id }); }
  standings(code: string) { return this.rpc<StandingRow[]>('sg_standings', { p_competition: code }); }

  /** Appelle onChange a chaque modification (temps reel) des matchs ou evenements ; renvoie la fonction d'arret. */
  watch(onChange: () => void): () => void {
    const channel: RealtimeChannel = this.client
      .channel('score-game-' + Math.random().toString(36).slice(2))
      .on('postgres_changes', { event: '*', schema: 'score_game', table: 'fixture' }, () => onChange())
      .on('postgres_changes', { event: '*', schema: 'score_game', table: 'fixture_event' }, () => onChange())
      .subscribe();
    return () => { void this.client.removeChannel(channel); };
  }

  private async rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
    const { data, error } = await this.client.rpc(fn, args);
    if (error) { throw new Error(error.message); }
    return data as T;
  }
}
