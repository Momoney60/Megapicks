'use client'
import { useState, useEffect } from 'react'
import { Calendar, Trophy, TrendingUp, Users, Home, Clock, DollarSign, Lock, Unlock, AlertCircle, ChevronRight } from 'lucide-react'
import { Game, Contestant, Pick } from './types'
import { MiniHelmet, MiniField, GameCard, teamColors } from './components'
import { supabase } from '@/lib/supabase'

// Mock data for testing
const mockGames: Game[] = [
  { id: '1', home_team: 'KC', away_team: 'BUF', home_score: 0, away_score: 0, spread_current: -2.5, total_current: 48.5, kickoff_time: '2025-01-19T13:00:00', status: 'scheduled', week: 1 },
  { id: '2', home_team: 'DAL', away_team: 'NYG', home_score: 0, away_score: 0, spread_current: -7, total_current: 44, kickoff_time: '2025-01-19T13:00:00', status: 'scheduled', week: 1 },
  { id: '3', home_team: 'GB', away_team: 'CHI', home_score: 0, away_score: 0, spread_current: -3.5, total_current: 41.5, kickoff_time: '2025-01-19T16:25:00', status: 'scheduled', week: 1 },
]

const mockContestants: Contestant[] = [
  { id: '1', handle: 'GridironGuru', ats_points: 12.5, parlay_points: 6, total_points: 18.5, helmet_config: { shell: '#fc440f', facemask: '#ffffff', stripe: '#000000', decal: '⚡' } },
  { id: '2', handle: 'PickEmPro', ats_points: 11, parlay_points: 3, total_points: 14, helmet_config: { shell: '#00bcd4', facemask: '#ffffff', stripe: '#ffffff', decal: '★' } },
  { id: '3', handle: 'BettingBeast', ats_points: 10.5, parlay_points: 9, total_points: 19.5, helmet_config: { shell: '#a4e600', facemask: '#000000', stripe: '#000000', decal: '💀' } },
]

export default function MegaPicks() {
  const [currentPage, setCurrentPage] = useState('headquarters')
  const [games, setGames] = useState<Game[]>(mockGames)
  const [contestants, setContestants] = useState<Contestant[]>(mockContestants)
  const [atsPicks, setAtsPicks] = useState<{ [key: string]: string }>({})
  const [parlayPicks, setParlayPicks] = useState<Set<string>>(new Set())
  const [isLocked, setIsLocked] = useState(false)
  const [timeToLock, setTimeToLock] = useState('')
  const [weeklyPot] = useState(520)
  const [megaPot] = useState(1800)
  const [loading, setLoading] = useState(false)

  // Calculate countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const lockTime = new Date('2025-01-19T13:00:00')
      const now = new Date()
      const diff = lockTime.getTime() - now.getTime()
      
      if (diff <= 0) {
        setIsLocked(true)
        setTimeToLock('LOCKED')
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeToLock(`${days}d ${hours}h ${minutes}m ${seconds}s`)
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  // Load games from Supabase
  useEffect(() => {
    loadGames()
  }, [])

  async function loadGames() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('week', 1)
        .order('kickoff_time')
      
      if (data && data.length > 0) {
        setGames(data)
      }
    } catch (error) {
      console.error('Error loading games:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleATSPick = (gameId: string, team: string) => {
    if (!isLocked) {
      setAtsPicks(prev => ({ ...prev, [gameId]: team }))
    }
  }

  const handleParlayToggle = (gameId: string) => {
    if (!isLocked) {
      setParlayPicks(prev => {
        const newSet = new Set(prev)
        if (newSet.has(gameId)) {
          newSet.delete(gameId)
        } else {
          newSet.add(gameId)
        }
        return newSet
      })
    }
  }

  const canSubmit = Object.keys(atsPicks).length === games.length && parlayPicks.size >= 3

  const submitPicks = async () => {
    if (!canSubmit || isLocked) return
    
    try {
      // Here you would submit to Supabase
      console.log('Submitting picks:', { atsPicks, parlayPicks: Array.from(parlayPicks) })
      alert('Picks submitted successfully!')
    } catch (error) {
      console.error('Error submitting picks:', error)
      alert('Error submitting picks. Please try again.')
    }
  }

  const renderHeadquarters = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-black mb-2">MEGAPICKS HQ</h1>
        <div className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5" />
          <span>Picks lock in: <span className="font-mono font-bold">{timeToLock}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Weekly Pot</span>
            <DollarSign className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-400">${weeklyPot}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Mega Pot</span>
            <Trophy className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-yellow-400">${megaPot}</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 rounded-lg p-4 border border-yellow-500/50">
        <div className="text-sm text-yellow-400 mb-2">LAST WEEK'S CHAMPION</div>
        <div className="flex items-center gap-3">
          <MiniHelmet config={contestants[2].helmet_config} size="md" glowing={true} />
          <div>
            <div className="font-bold text-lg">{contestants[2].handle}</div>
            <div className="text-sm text-gray-400">19.5 points • Won $260</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="text-sm text-gray-400 mb-2">LEAGUE NOTES</div>
        <p className="text-gray-200">Week 1 is here! Remember: all picks lock at Sunday 1PM ET. Don't forget to set your parlay (minimum 3 legs). Good luck!</p>
      </div>

      <div className="space-y-3">
        <div className="text-lg font-bold text-gray-200">This Week's Games</div>
        {games.slice(0, 3).map(game => (
          <div key={game.id} className="bg-gray-900 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400">
                {new Date(game.kickoff_time).toLocaleString('en-US', { weekday: 'short', hour: 'numeric' })}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold" style={{ color: teamColors[game.away_team] }}>{game.away_team}</span>
                <span className="text-gray-500">@</span>
                <span className="font-bold" style={{ color: teamColors[game.home_team] }}>{game.home_team}</span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {game.home_team} {game.spread_current < 0 ? game.spread_current : `+${game.spread_current}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPicks = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Make Your Picks</h2>
          {isLocked ? (
            <div className="flex items-center gap-2 text-red-400">
              <Lock className="w-4 h-4" />
              <span className="font-semibold">LOCKED</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-400">
              <Unlock className="w-4 h-4" />
              <span className="text-sm">{timeToLock} remaining</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">ATS Picks</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold">{Object.keys(atsPicks).length}/{games.length}</div>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${(Object.keys(atsPicks).length / games.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Parlay Legs</div>
            <div className="flex items-center gap-2">
              <div className={`text-lg font-bold ${parlayPicks.size >= 3 ? 'text-green-400' : 'text-red-400'}`}>
                {parlayPicks.size}/3+
              </div>
              {parlayPicks.size < 3 && (
                <AlertCircle class
