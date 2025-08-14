import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, TrendingUp, Users, Home, ChevronRight, Lock, Unlock, AlertCircle, DollarSign, Clock } from 'lucide-react';

// Mock data for demonstration
const mockGames = [
  { id: 1, home: 'KC', away: 'BUF', spread: -2.5, total: 48.5, homeScore: 0, awayScore: 0, kickoff: '2025-01-19T13:00:00', status: 'scheduled' },
  { id: 2, home: 'DAL', away: 'NYG', spread: -7, total: 44, homeScore: 0, awayScore: 0, kickoff: '2025-01-19T13:00:00', status: 'scheduled' },
  { id: 3, home: 'GB', away: 'CHI', spread: -3.5, total: 41.5, homeScore: 0, awayScore: 0, kickoff: '2025-01-19T16:25:00', status: 'scheduled' },
];

const mockContestants = [
  { id: 1, handle: 'GridironGuru', atsPoints: 12.5, parlayPoints: 6, totalPoints: 18.5, helmet: { shell: '#fc440f', facemask: '#ffffff', stripe: '#000000', decal: '⚡' } },
  { id: 2, handle: 'PickEmPro', atsPoints: 11, parlayPoints: 3, totalPoints: 14, helmet: { shell: '#00bcd4', facemask: '#ffffff', stripe: '#ffffff', decal: '★' } },
  { id: 3, handle: 'BettingBeast', atsPoints: 10.5, parlayPoints: 9, totalPoints: 19.5, helmet: { shell: '#a4e600', facemask: '#000000', stripe: '#000000', decal: '💀' } },
];

// Team colors for visual appeal
const teamColors = {
  KC: '#E31837', BUF: '#00338D', DAL: '#003594', NYG: '#0B2265',
  GB: '#203731', CHI: '#0B162A', SF: '#AA0000', SEA: '#002244'
};

// Mini Helmet Component
const MiniHelmet = ({ config, size = 'sm', glowing = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  return (
    <div className={`${sizeClasses[size]} relative inline-flex items-center justify-center ${glowing ? 'animate-pulse' : ''}`}>
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <ellipse cx="20" cy="20" rx="18" ry="16" fill={config.shell} stroke={config.facemask} strokeWidth="1"/>
        <rect x="18" y="5" width="4" height="30" fill={config.stripe} opacity="0.6"/>
        <text x="20" y="25" fontSize="14" textAnchor="middle" fill={config.facemask}>{config.decal}</text>
      </svg>
    </div>
  );
};

// Mini Field Component
const MiniField = ({ possession, yardLine, down, distance, redZone, size = 'sm' }) => {
  const ballPosition = yardLine ? (yardLine / 100) * 100 : 50;
  
  return (
    <div className="relative bg-green-700 rounded-sm overflow-hidden" style={{ height: size === 'sm' ? '24px' : '40px', width: '100%' }}>
      {/* End zones */}
      <div className="absolute left-0 top-0 bottom-0 w-[10%] bg-blue-800 border-r border-white"></div>
      <div className="absolute right-0 top-0 bottom-0 w-[10%] bg-red-800 border-l border-white"></div>
      
      {/* Yard lines */}
      {[20, 30, 40, 50, 60, 70, 80].map(yard => (
        <div key={yard} className="absolute top-0 bottom-0 w-px bg-white opacity-40" style={{ left: `${yard}%` }}></div>
      ))}
      
      {/* Ball marker */}
      {possession && (
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full shadow-lg transition-all duration-500"
          style={{ left: `${ballPosition}%` }}
        ></div>
      )}
      
      {/* Down & Distance (only show on larger sizes or in red zone) */}
      {size !== 'sm' && down && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-mono">
          {down}&{distance}
        </div>
      )}
    </div>
  );
};

// Game Card Component
const GameCard = ({ game, onPickATS, onToggleParlay, atsPick, inParlay, locked }) => {
  return (
    <div className={`bg-gray-900 rounded-lg p-4 border ${locked ? 'border-gray-700 opacity-60' : 'border-gray-700'}`}>
      {locked && (
        <div className="flex items-center gap-1 text-red-400 text-sm mb-2">
          <Lock className="w-3 h-3" />
          <span className="font-semibold">LOCKED</span>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs text-gray-400">
          {new Date(game.kickoff).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
        </div>
        <div className="text-xs text-gray-400">O/U {game.total}</div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Away Team */}
        <button
          onClick={() => !locked && onPickATS(game.id, game.away)}
          disabled={locked}
          className={`p-3 rounded-lg transition-all ${
            atsPick === game.away 
              ? 'bg-orange-600 border-2 border-orange-400'
              : 'bg-gray-800 hover:bg-gray-700 border-2 border-transparent'
          } ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="font-bold text-lg" style={{ color: teamColors[game.home] || '#ffffff' }}>
            {game.home}
          </div>
          <div className="text-sm text-gray-300">
            {game.spread < 0 ? game.spread : `+${Math.abs(game.spread)}`}
          </div>
        </button>
      </div>
      
      {/* Parlay Toggle */}
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
  );
};

// Main App Component
export default function MegaPicks() {
  const [currentPage, setCurrentPage] = useState('headquarters');
  const [atsPicks, setAtsPicks] = useState({});
  const [parlayPicks, setParlayPicks] = useState(new Set());
  const [isLocked, setIsLocked] = useState(false);
  const [timeToLock, setTimeToLock] = useState('');
  const [weeklyPot, setWeeklyPot] = useState(520);
  const [megaPot, setMegaPot] = useState(1800);

  // Calculate time to lock
  useEffect(() => {
    const timer = setInterval(() => {
      const lockTime = new Date('2025-01-19T13:00:00');
      const now = new Date();
      const diff = lockTime - now;
      
      if (diff <= 0) {
        setIsLocked(true);
        setTimeToLock('LOCKED');
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeToLock(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleATSPick = (gameId, team) => {
    setAtsPicks(prev => ({ ...prev, [gameId]: team }));
  };

  const handleParlayToggle = (gameId) => {
    setParlayPicks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gameId)) {
        newSet.delete(gameId);
      } else {
        newSet.add(gameId);
      }
      return newSet;
    });
  };

  const canSubmit = Object.keys(atsPicks).length === mockGames.length && parlayPicks.size >= 3;

  const renderHeadquarters = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-black mb-2">MEGAPICKS HQ</h1>
        <div className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5" />
          <span>Picks lock in: <span className="font-mono font-bold">{timeToLock}</span></span>
        </div>
      </div>

      {/* Pots */}
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
          <div className="text-2xl font-bold text-yellow-400">${megaPot}          </div>
        </div>
      </div>

      {/* League Notes */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="text-sm text-gray-400 mb-2">LEAGUE NOTES</div>
        <p className="text-gray-200">Week 18 is here! Remember: all picks lock at Sunday 1PM ET. Don't forget to set your parlay (minimum 3 legs). Good luck!</p>
      </div>

      {/* Upcoming Games Preview */}
      <div className="space-y-3">
        <div className="text-lg font-bold text-gray-200">This Week's Games</div>
        {mockGames.slice(0, 3).map(game => (
          <div key={game.id} className="bg-gray-900 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400">
                {new Date(game.kickoff).toLocaleString('en-US', { weekday: 'short', hour: 'numeric' })}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold" style={{ color: teamColors[game.away] }}>{game.away}</span>
                <span className="text-gray-500">@</span>
                <span className="font-bold" style={{ color: teamColors[game.home] }}>{game.home}</span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {game.home} {game.spread < 0 ? game.spread : `+${game.spread}`}
            </div>
          </div>
        ))}
      </div>
    </div>

      {/* Last Week's Winner */}
      <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 rounded-lg p-4 border border-yellow-500/50">
        <div className="text-sm text-yellow-400 mb-2">LAST WEEK'S CHAMPION</div>
        <div className="flex items-center gap-3">
          <MiniHelmet config={mockContestants[2].helmet} size="md" glowing={true} />
          <div>
            <div className="font-bold text-lg">{mockContestants[2].handle}</div>
            <div className="text-sm text-gray-400">19.5 points • Won $260</div>
          </div>
        </div> 
              : 'bg-gray-800 hover:bg-gray-700 border-2 border-transparent'
          } ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="font-bold text-lg" style={{ color: teamColors[game.away] || '#ffffff' }}>
            {game.away}
          </div>
          <div className="text-sm text-gray-300">
            {game.spread > 0 ? `+${game.spread}` : game.spread}
          </div>
        </button>
        
        {/* Home Team */}
        <button
          onClick={() => !locked && onPickATS(game.id, game.home)}
          disabled={locked}
          className={`p-3 rounded-lg transition-all ${
            atsPick === game.home 
              ? 'bg-orange-600 border-2 border-orange-400'
