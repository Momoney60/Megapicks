import { NextResponse } from 'next/server'
import { fetchEspnGames } from '@/lib/espn'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
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
    return NextResponse.json({ games }, { headers: { 'cache-control': 'no-store' } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to fetch games' }, { status: 500 })
  }
}