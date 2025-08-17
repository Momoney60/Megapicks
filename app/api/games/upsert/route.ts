import { NextResponse } from 'next/server'
import { fetchEspnGames } from '@/lib/espn'
import { createServerSupabaseServiceRoleClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const weekParam = searchParams.get('week')
  const yearParam = searchParams.get('year')
  const seasonTypeParam = searchParams.get('seasonType')

  try {
    const games = await fetchEspnGames({
      week: weekParam ? Number(weekParam) : undefined,
      year: yearParam ? Number(yearParam) : undefined,
      seasonType: seasonTypeParam ? Number(seasonTypeParam) : undefined,
    })

    const supabase = createServerSupabaseServiceRoleClient()

    const { data, error } = await supabase
      .from('games')
      .upsert(
        games.map(g => ({
          id: g.id,
          home_team: g.home_team,
          away_team: g.away_team,
          home_score: g.home_score,
          away_score: g.away_score,
          spread_current: g.spread_current,
          total_current: g.total_current,
          kickoff_time: g.kickoff_time,
          status: g.status,
          week: g.week,
          possession: g.possession,
          yard_line: g.yard_line,
          down: g.down,
          distance: g.distance,
          quarter: g.quarter,
          time_remaining: g.time_remaining,
          is_redzone: g.is_redzone,
        })),
        { onConflict: 'id' }
      )
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ upserted: data ?? [] }, { headers: { 'cache-control': 'no-store' } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to upsert games' }, { status: 500 })
  }
}