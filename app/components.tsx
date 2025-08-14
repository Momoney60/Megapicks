'use client'
import { Game, Contestant } from './types'

// Team colors
export const teamColors: { [key: string]: string } = {
  ARI: '#97233F', ATL: '#A71930', BAL: '#241773', BUF: '#00338D',
  CAR: '#0085CA', CHI: '#0B162A', CIN: '#FB4F14', CLE: '#311D00',
  DAL: '#003594', DEN: '#FB4F14', DET: '#0076B6', GB: '#203731',
  HOU: '#03202F', IND: '#002C5F', JAX: '#006778', KC: '#E31837',
  LAC: '#0080C6', LAR: '#003594', LV: '#000000', MIA: '#008E97',
  MIN: '#4F2683', NE: '#002244', NO: '#D3BC8D', NYG: '#0B2265',
  NYJ: '#125740', PHI: '#004C54', PIT: '#FFB612', SF: '#AA0000',
  SEA: '#002244', TB: '#D50A0A', TEN: '#0C2340', WAS: '#5A1414'
}

// Mini Helmet Component
export function MiniHelmet({ 
  config, 
  size = 'sm', 
  glowing = false 
}: { 
  config: Contestant['helmet_config']
  size?: 'sm' | 'md' | 'lg'
  glowing?: boolean 
}) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  return (
    <div className={`${sizeClasses[size]} relative inline-flex items-center justify-center ${glowing ? 'animate-pulse' : ''}`}>
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <ellipse cx="20" cy="20" rx="18" ry="16" fill={config.shell} stroke={config.facemask} strokeWidth="1"/>
        <rect x="18" y="5" width="4" height="30" fill={config.stripe} opacity="0.6"/>
        <text x="20" y="25" fontSize="14" textAnchor="middle" fill={config.facemask}>{config.decal}</text>
      </svg>
    </div>
  )
}

// Mini Field Component
export function MiniField({ 
  possession, 
  yardLine, 
  down, 
  distance, 
  size = 'sm' 
}: { 
  possession?: string
  yardLine?: number
  down?: number
  distance?: number
  size?: 'sm' | 'lg'
}) {
  const ballPosition = yardLine ? (yardLine / 100) * 100 : 50
  
  return (
    <div className="relative bg-green-700 rounded-sm overflow-hidden" style={{ height: size === 'sm' ? '24px' : '40px', width: '100%' }}>
      <div className="absolute left-0 top-0 bottom-0 w-[10%] bg-blue-800 border-r border-white"></div>
      <div className="absolute right-0 top-0 bottom-0 w-[10%] bg-red-800 border-l border-white"></div>
      
      {[20, 30, 40, 50, 60, 70, 80].map(yard => (
        <div key={yard} className="absolute top-0 bottom-0 w-px bg-white opacity-40" style={{ left: `${yard}%` }}></div>
      ))}
      
      {possession && (
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full shadow-lg transition-all duration-500"
          style={{ left: `${ballPosition}%` }}
        ></div>
      )}
      
      {size !== 'sm' && down && distance && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-mono">
          {down}&{distance}
        </div>
      )}
    </div>
  )
}

// Game Card Component  
export function GameCard({ 
  game, 
  onPickATS, 
  onToggleParlay, 
  atsPick, 
  inParlay, 
  locked 
}: {
  game: Game
  onPickATS: (gameId: string, team: string) => void
  onToggleParlay: (gameId: string) => void
  atsPick?: string
  inParlay: boolean
  locked: boolean
}) {
  return (
    <div className={`bg-gray-900 rounded-lg p-4 border ${locked ? 'border-gray-700 opacity-60' : 'border-gray-700'}`}>
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs text-gray-400">
          {new Date(game.kickoff_time).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
        </div>
        <div className="text-xs text-gray-400">O/U {game.total_current}</div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => !locked && onPickATS(game.id, game.away_team)}
          disabled={locked}
          className={`p-3 rounded-lg transition-all ${
            atsPick === game.away_team 
              ? 'bg-orange-600 border-2 border-orange-400' 
              : 'bg-gray-800 hover:bg-gray-700 border-2 border-transparent'
          } ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="font-bold text-lg" style={{ color: teamColors[game.away_team] || '#ffffff' }}>
            {game.away_team}
          </div>
          <div className="text-sm text-gray-300">
            {game.spread_current > 0 ? `+${game.spread_current}` : game.spread_current}
          </div>
        </button>
        
        <button
          onClick={() => !locked && onPickATS(game.id, game.home_team)}
          disabled={locked}
          className={`p-3 rounded-lg transition-all ${
            atsPick === game.home_team 
              ? 'bg-orange-600 border-2 border-orange-400'
              : 'bg-gray-800 hover:bg-gray-700 border-2 border-transparent'
          } ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="font-bold text-lg" style={{ color: teamColors[game.home_team] || '#ffffff' }}>
            {game.home_team}
          </div>
          <div className="text-sm text-gray-300">
            {game.spread_current < 0 ? game.spread_current : `+${Math.abs(game.spread_current)}`}
          </div>
        </button>
      </div>
      
      <button
        onClick={() => !locked && onToggleParlay(game.id)}
        disabled={locked}
        className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold transition-all ${
          inParlay
            ? 'bg-green-600 text-white'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        } ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {inParlay ? '🔗 In Parlay' : 'Add to Parlay'}
      </button>
    </div>
  )
}
