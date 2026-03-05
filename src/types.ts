export type MatchFormat = 'T20' | 'ODI' | 'Test' | 'Custom';

export interface Player {
  id: string;
  name: string;
}

export interface Ball {
  id?: number;
  match_id: string;
  inning: number;
  over_num: number;
  ball_num: number;
  batsman_id: string;
  bowler_id: string;
  runs: number;
  extras: number;
  extra_type?: 'wide' | 'no_ball' | 'bye' | 'leg_bye';
  wicket: number;
  wicket_type?: string;
  timestamp?: string;
}

export interface Match {
  id: string;
  team1_name: string;
  team2_name: string;
  format: MatchFormat;
  total_overs: number;
  toss_winner: string;
  toss_decision: 'bat' | 'bowl';
  status: 'live' | 'completed';
  created_at: string;
}

export interface MatchState {
  match: Match;
  players: Player[];
  balls: Ball[];
}
