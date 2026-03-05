import React, { useState, useEffect } from 'react';
import { Match, Player, Ball, MatchState } from './types';
import MatchSetup from './components/MatchSetup';
import LiveScorer from './components/LiveScorer';
import MatchHistory from './components/MatchHistory';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, History, LayoutDashboard, Settings, LogOut } from 'lucide-react';

type View = 'setup' | 'live' | 'history';

export default function App() {
  const [view, setView] = useState<View>('setup');
  const [activeMatch, setActiveMatch] = useState<MatchState | null>(null);

  const startMatch = async (data: any) => {
    const response = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      setActiveMatch({
        match: {
          id: data.id,
          team1_name: data.team1,
          team2_name: data.team2,
          format: data.format,
          total_overs: data.overs,
          toss_winner: data.tossWinner,
          toss_decision: data.tossDecision,
          status: 'live',
          created_at: new Date().toISOString()
        },
        players: [...data.players1, ...data.players2],
        balls: []
      });
      setView('live');
    }
  };

  const handleBallAdded = async (ball: Ball) => {
    if (!activeMatch) return;
    
    await fetch(`/api/matches/${activeMatch.match.id}/balls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ball)
    });

    setActiveMatch(prev => prev ? ({
      ...prev,
      balls: [...prev.balls, ball]
    }) : null);
  };

  const finishMatch = async () => {
    if (!activeMatch) return;
    await fetch(`/api/matches/${activeMatch.match.id}/finish`, { method: 'POST' });
    setView('history');
    setActiveMatch(null);
  };

  const selectMatchFromHistory = async (match: Match) => {
    const res = await fetch(`/api/matches/${match.id}`);
    const data = await res.json();
    setActiveMatch({
      match: data.match,
      players: data.players,
      balls: data.balls
    });
    setView('live');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black italic text-white">C</div>
          <span className="font-bold tracking-tight text-lg">CricScore <span className="text-emerald-500">Pro</span></span>
        </div>
        
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl">
          <button 
            onClick={() => setView('setup')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${view === 'setup' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Plus className="w-3 h-3" /> NEW
          </button>
          <button 
            onClick={() => setView('history')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${view === 'history' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <History className="w-3 h-3" /> HISTORY
          </button>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700" />
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {view === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MatchSetup onStart={startMatch} />
            </motion.div>
          )}

          {view === 'live' && activeMatch && (
            <motion.div
              key="live"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <LiveScorer 
                match={activeMatch.match}
                players={activeMatch.players}
                initialBalls={activeMatch.balls}
                onBallAdded={handleBallAdded}
                onFinish={finishMatch}
              />
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MatchHistory onSelect={selectMatchFromHistory} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden glass border-t border-white/5 p-4 flex justify-around items-center">
        <button onClick={() => setView('setup')} className={`p-2 ${view === 'setup' ? 'text-emerald-500' : 'text-zinc-500'}`}>
          <Plus className="w-6 h-6" />
        </button>
        <button onClick={() => setView('live')} className={`p-2 ${view === 'live' ? 'text-emerald-500' : 'text-zinc-500'}`}>
          <LayoutDashboard className="w-6 h-6" />
        </button>
        <button onClick={() => setView('history')} className={`p-2 ${view === 'history' ? 'text-emerald-500' : 'text-zinc-500'}`}>
          <History className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
