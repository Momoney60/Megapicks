import type { Game } from '@/app/types'

function parseSpread(details?: string, favoriteAbbrev?: string, homeAbbrev?: string): number | 0 {
  if (!details) return 0
  // Examples: "KC -3.5", "DAL -7", "Pick" or "Even"
  const parts = details.trim().split(/\s+/)
  if (!parts.length) return 0
  const maybeFav = parts[0]
  const maybeSpread = parts[1]
  if (!maybeSpread) return 0
  const parsed = parseFloat(maybeSpread)
  if (Number.isNaN(parsed)) return 0
  // Spread is relative to favorite. Convert to home team perspective if needed
  if (favoriteAbbrev && homeAbbrev) {
    // If favorite is the home team, spread is negative for home; else positive for home
    return favoriteAbbrev === homeAbbrev ? -Math.abs(parsed) : Math.abs(parsed)
  }
  // Fallback: return negative for favorites
  return maybeFav === homeAbbrev ? -Math.abs(parsed) : Math.abs(parsed)
}

function normalizeStatus(status?: any): string {
  const name: string | undefined = status?.type?.name || status?.type?.state
  if (!name) return 'scheduled'
  const normalized = name.toLowerCase()
  if (normalized.includes('final')) return 'final'
  if (normalized.includes('in') || normalized.includes('start') || normalized.includes('halftime')) return 'in_progress'
  return 'scheduled'
}

export async function fetchEspnGames(params?: { week?: number; year?: number; seasonType?: number }): Promise<Game[]> {
  const search = new URLSearchParams()
  if (params?.year) search.set('dates', String(params.year))
  if (params?.week) search.set('week', String(params.week))
  if (params?.seasonType) search.set('seasontype', String(params.seasonType))

  const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard${search.toString() ? `?${search.toString()}` : ''}`

  const res = await fetch(url, { next: { revalidate: 0 }, cache: 'no-store' })
  if (!res.ok) throw new Error(`ESPN fetch failed: ${res.status}`)
  const json: any = await res.json()

  const weekNumber: number | undefined = json?.week?.number

  const games: Game[] = (json?.events ?? []).map((event: any) => {
    const comp = event?.competitions?.[0]
    const competitors: any[] = comp?.competitors ?? []
    const home = competitors.find((c: any) => c?.homeAway === 'home')
    const away = competitors.find((c: any) => c?.homeAway === 'away')

    const odds = comp?.odds?.[0]
    const details: string | undefined = odds?.details // e.g., "KC -3.5"
    const overUnder: number | undefined = odds?.overUnder ? Number(odds.overUnder) : undefined

    const homeAbbrev: string = home?.team?.abbreviation ?? 'HOME'
    const awayAbbrev: string = away?.team?.abbreviation ?? 'AWAY'

    const spreadForHome = parseSpread(details, odds?.favorite?.abbreviation, homeAbbrev)

    const situation = comp?.situation

    const g: Game = {
      id: String(event?.id ?? comp?.id ?? crypto.randomUUID()),
      home_team: homeAbbrev,
      away_team: awayAbbrev,
      home_score: Number(home?.score ?? 0),
      away_score: Number(away?.score ?? 0),
      spread_current: typeof spreadForHome === 'number' ? spreadForHome : 0,
      total_current: typeof overUnder === 'number' ? overUnder : 0,
      kickoff_time: event?.date ?? new Date().toISOString(),
      status: normalizeStatus(event?.status),
      week: typeof weekNumber === 'number' ? weekNumber : params?.week ?? 1,
      possession: situation?.possession ?? undefined,
      yard_line: typeof situation?.yardLine === 'number' ? situation.yardLine : undefined,
      down: typeof situation?.down === 'number' ? situation.down : undefined,
      distance: typeof situation?.distance === 'number' ? situation.distance : undefined,
      quarter: comp?.status?.period ? String(comp.status.period) : undefined,
      time_remaining: comp?.status?.displayClock ?? undefined,
      is_redzone: Boolean(situation?.isRedZone ?? false),
    }

    return g
  })

  return games
}