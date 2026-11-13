export interface TeamRef { id: number; name: string; shortName?: string | null; logoUrl?: string | null; score?: number | null; }
export interface CompetitionRef { code: string; name: string; logoUrl?: string | null; }
export interface Competition extends CompetitionRef { id: number; country?: string | null; season?: number | null; }
export interface FixtureSummary {
  id: number; competition: CompetitionRef; round?: string | null; kickoffAt: string; status: string;
  minute?: number | null; venue?: string | null; referee?: string | null; home: TeamRef; away: TeamRef;
}
export interface MatchEvent { teamId: number | null; minute: number | null; extraMinute: number | null; type: string; detail: string | null; player: string | null; assist: string | null; }
export interface LineupPlayer { name: string; number: number | null; position: string | null; }
export interface Lineup { teamId: number; formation: string | null; coach: string | null; startingXi: LineupPlayer[]; bench: LineupPlayer[]; }
export interface Stats { teamId: number; possession: number | null; shots: number | null; shotsOnTarget: number | null; corners: number | null; fouls: number | null; yellowCards: number | null; redCards: number | null; expectedGoals: number | null; }
export interface Prediction { homePct: number | null; drawPct: number | null; awayPct: number | null; advice: string | null; }
export interface Injury { teamId: number; player: string; status: string | null; reason: string | null; }
export interface Press { teamId: number; phase: 'PRE_MATCH' | 'POST_MATCH'; speaker: string | null; title: string; url: string; publishedAt: string | null; summary: string; keyPoints: string[] | null; }
export interface MatchCenter {
  fixture: FixtureSummary | null; events: MatchEvent[]; lineups: Lineup[]; stats: Stats[];
  prediction: Prediction | null; injuries: Injury[]; press: Press[];
}
export interface StandingRow { rank: number; team: TeamRef; played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; points: number; form: string | null; }
