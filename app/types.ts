export interface Game {
  id: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  spread_current: number
  total_current: number
  kickoff_time: string
  status: string
  week: number
  possession?: string
  yard_line?: number
  down?: number
  distance?: number
  quarter?: string
  time_remaining?: string
  is_redzone?: boolean
}

export interface Contestant {
  id: string
  handle: string
  ats_points: number
  parlay_points: number
  total_points: number
  helmet_config: {
    shell: string
    facemask: string
    stripe: string
    decal: string
  }
}

export interface Pick {
  game_id: string
  team: string
  spread: number
}
