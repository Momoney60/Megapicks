'use client'
import { useState, useEffect } from 'react'
import { Calendar, Trophy, TrendingUp, Users, Home, Clock, DollarSign, Lock, Unlock } from 'lucide-react'

export default function MegaPicks() {
  const [currentPage, setCurrentPage] = useState('headquarters')
  const [timeToLock, setTimeToLock] = useState('Loading...')
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const lockTime = new Date('2025-01-19T13:00:00')
      const now = new Date()
      const diff = lockTime.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeToLock('LOCKED')
        setIsLocked(true)
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeToLock(`${days}d ${hours}h ${minutes}m`)
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

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
          <div className="text-2xl font-bold text-green-400">$520</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Mega Pot</span>
            <Trophy className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-yellow-400">$1,800</div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="text-sm text-gray-400 mb-2">LEAGUE NOTES</div>
        <p className="text-gray-200">Week 18 is here! Remember: all picks lock at Sunday 1PM ET. Good luck!</p>
      </div>

      <div className="space-y-3">
        <div className="text-lg font-bold text-gray-200">This Week's Games</div>
        <div className="bg-gray-900 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-400">Sun 1:00 PM</div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-500">BUF</span>
              <span className="text-gray-500">@</span>
              <span className="font-bold text-red-500">KC</span>
            </div>
          </div>
          <div className="text-sm text-gray-400">KC -2.5</div>
        </div>
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
        <p className="text-gray-400">Pick submission coming soon!</p>
      </div>
    </div>
  )

  const renderRankings = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Week 17 Rankings</h2>
        <p className="text-gray-400">Rankings will appear here once the season starts!</p>
      </div>
    </div>
  )

  const pages: { [key: string]: JSX.Element } = {
    headquarters: renderHeadquarters(),
    picks: renderPicks(),
    rankings: renderRankings()
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <div className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                MEGAPICKS
              </div>
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => setCurrentPage('headquarters')}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    currentPage === 'headquarters' 
                      ? 'bg-orange-600 text-white' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-sm font-semibold">HQ</span>
                </button>
                <button
                  onClick={() => setCurrentPage('picks')}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    currentPage === 'picks' 
                      ? 'bg-orange-600 text-white' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-sm font-semibold">Picks</span>
                </button>
                <button
                  onClick={() => setCurrentPage('rankings')}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    currentPage === 'rankings' 
                      ? 'bg-orange-600 text-white' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-sm font-semibold">Rankings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {pages[currentPage]}
      </main>
    </div>
  )
}
