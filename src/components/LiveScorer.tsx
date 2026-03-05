import React, { useState, useEffect, useMemo } from 'react';
import { Match, Player, Ball } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, RotateCcw, User, History, TrendingUp } from 'lucide-react';

interface Props {
  match: Match;
  players: Player[];
  initialBalls: Ball[];
  onBallAdded: (ball: Ball) => void;
  onFinish: () => void;
}

export default function LiveScorer({ match, players, initialBalls, onBallAdded, onFinish }: Props) {
  const [balls, setBalls] = useState<Ball[]>(initialBalls);
  const [inning, setInning] = useState(1);
  const [strikerId, setStrikerId] = useState('');
  const [nonStrikerId, setNonStrikerId] = useState('');
  const [bowlerId, setBowlerId] = useState('');

  // Derived stats
  const stats = useMemo(() => {
    const currentInningBalls = balls.filter(b => b.inning === inning);
    const runs = currentInningBalls.reduce((acc, b) => acc + b.runs + b.extras, 0);
    const wickets = currentInningBalls.reduce((acc, b) => acc + b.wicket, 0);
    const validBalls = currentInningBalls.filter(b => b.extra_type !== 'wide' && b.extra_type !== 'no_ball').length;
    const overs = Math.floor(validBalls / 6);
    const ballsInOver = validBalls % 6;
    
    return { runs, wickets, overs, ballsInOver, totalBalls: validBalls };
  }, [balls, inning]);

  // Player selection logic
  const team1Players = players.filter(p => p.id.startsWith('t1'));
  const team2Players = players.filter(p => p.id.startsWith('t2'));
  
  const battingTeam = (inning === 1) 
    ? (match.toss_decision === 'bat' ? (match.toss_winner === match.team1_name ? team1Players : team2Players) : (match.toss_winner === match.team1_name ? team2Players : team1Players))
    : (match.toss_decision === 'bat' ? (match.toss_winner === match.team1_name ? team2Players : team1Players) : (match.toss_winner === match.team1_name ? team1Players : team2Players));

  const bowlingTeam = battingTeam === team1Players ? team2Players : team1Players;

  useEffect(() => {
    if (!strikerId && battingTeam.length > 0) setStrikerId(battingTeam[0].id);
    if (!nonStrikerId && battingTeam.length > 1) setNonStrikerId(battingTeam[1].id);
    if (!bowlerId && bowlingTeam.length > 0) setBowlerId(bowlingTeam[0].id);
  }, [battingTeam, bowlingTeam]);

  const addBall = (runs: number, extras: number = 0, extraType?: Ball['extra_type'], wicket: number = 0, wicketType?: string) => {
    const newBall: Ball = {
      match_id: match.id,
      inning,
      over_num: stats.overs,
      ball_num: stats.ballsInOver + 1,
      batsman_id: strikerId,
      bowler_id: bowlerId,
      runs,
      extras,
      extra_type: extraType,
      wicket,
      wicket_type: wicketType
    };

    setBalls([...balls, newBall]);
    onBallAdded(newBall);

    // Strike rotation
    if ((runs + extras) % 2 !== 0 && !extraType) {
      setStrikerId(nonStrikerId);
      setNonStrikerId(strikerId);
    }

    // Over end rotation
    if (stats.ballsInOver === 5 && !extraType) {
      setStrikerId(nonStrikerId);
      setNonStrikerId(strikerId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Scoreboard Header */}
      <motion.div 
        layout
        className="glass p-8 rounded-[2.5rem] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <TrendingUp className="w-32 h-32" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 text-xs font-bold rounded-full uppercase tracking-wider">
                Innings {inning}
              </span>
              <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
                {match.format} • {match.total_overs} Overs
              </span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter flex items-baseline gap-2">
              {stats.runs}<span className="text-zinc-500">/</span>{stats.wickets}
            </h2>
            <p className="text-zinc-400 font-medium mt-1">
              Overs: <span className="text-white">{stats.overs}.{stats.ballsInOver}</span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Current Run Rate</p>
            <p className="text-3xl font-mono font-bold">
              {stats.totalBalls > 0 ? ((stats.runs / stats.totalBalls) * 6).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Player Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-4 rounded-2xl">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Striker</label>
          <select 
            className="bg-transparent w-full font-semibold focus:outline-none"
            value={strikerId}
            onChange={e => setStrikerId(e.target.value)}
          >
            {battingTeam.map(p => <option key={p.id} value={p.id} className="bg-zinc-900">{p.name}</option>)}
          </select>
        </div>
        <div className="glass p-4 rounded-2xl">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Non-Striker</label>
          <select 
            className="bg-transparent w-full font-semibold focus:outline-none"
            value={nonStrikerId}
            onChange={e => setNonStrikerId(e.target.value)}
          >
            {battingTeam.map(p => <option key={p.id} value={p.id} className="bg-zinc-900">{p.name}</option>)}
          </select>
        </div>
        <div className="glass p-4 rounded-2xl">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Bowler</label>
          <select 
            className="bg-transparent w-full font-semibold focus:outline-none"
            value={bowlerId}
            onChange={e => setBowlerId(e.target.value)}
          >
            {bowlingTeam.map(p => <option key={p.id} value={p.id} className="bg-zinc-900">{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {[0, 1, 2, 3, 4, 6].map(run => (
          <button 
            key={run}
            onClick={() => addBall(run)}
            className="aspect-square glass rounded-2xl flex items-center justify-center text-2xl font-bold hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
          >
            {run}
          </button>
        ))}
        <button 
          onClick={() => addBall(0, 1, 'wide')}
          className="aspect-square glass rounded-2xl flex flex-col items-center justify-center text-sm font-bold hover:bg-amber-500 transition-all active:scale-90"
        >
          WD
        </button>
        <button 
          onClick={() => addBall(0, 1, 'no_ball')}
          className="aspect-square glass rounded-2xl flex flex-col items-center justify-center text-sm font-bold hover:bg-amber-500 transition-all active:scale-90"
        >
          NB
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button 
          onClick={() => addBall(0, 0, undefined, 1, 'Bowled')}
          className="py-4 glass rounded-2xl font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
        >
          WICKET
        </button>
        <button 
          onClick={() => {
            setStrikerId(nonStrikerId);
            setNonStrikerId(strikerId);
          }}
          className="py-4 glass rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> SWAP
        </button>
        <button 
          onClick={() => setInning(inning === 1 ? 2 : 1)}
          className="py-4 glass rounded-2xl font-bold hover:bg-zinc-700 transition-all"
        >
          CHANGE INNING
        </button>
        <button 
          onClick={onFinish}
          className="py-4 bg-emerald-600 rounded-2xl font-bold text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
        >
          FINISH MATCH
        </button>
      </div>

      {/* Recent Balls */}
      <div className="glass p-6 rounded-3xl">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <History className="w-3 h-3" /> Recent Balls
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <AnimatePresence mode="popLayout">
            {balls.filter(b => b.inning === inning).slice(-12).reverse().map((b, i) => (
              <motion.div 
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border ${
                  b.wicket ? 'bg-red-500 border-red-400 text-white' : 
                  b.runs === 4 ? 'bg-blue-500 border-blue-400 text-white' :
                  b.runs === 6 ? 'bg-purple-500 border-purple-400 text-white' :
                  b.extra_type ? 'bg-amber-500 border-amber-400 text-white' :
                  'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                {b.wicket ? 'W' : b.extra_type ? b.extra_type[0].toUpperCase() : b.runs}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Player Stats */}
      <div className="glass p-6 rounded-3xl overflow-hidden">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <User className="w-3 h-3" /> Batting Stats
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-white/5">
                <th className="pb-2 font-medium">Batsman</th>
                <th className="pb-2 font-medium text-right">R</th>
                <th className="pb-2 font-medium text-right">B</th>
                <th className="pb-2 font-medium text-right">4s</th>
                <th className="pb-2 font-medium text-right">6s</th>
                <th className="pb-2 font-medium text-right">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {battingTeam.map(player => {
                const pBalls = balls.filter(b => b.batsman_id === player.id && b.inning === inning);
                const runs = pBalls.reduce((acc, b) => acc + b.runs, 0);
                const bCount = pBalls.filter(b => b.extra_type !== 'wide').length;
                const fours = pBalls.filter(b => b.runs === 4).length;
                const sixes = pBalls.filter(b => b.runs === 6).length;
                const sr = bCount > 0 ? ((runs / bCount) * 100).toFixed(1) : '0.0';
                
                if (bCount === 0 && runs === 0) return null;

                return (
                  <tr key={player.id} className={player.id === strikerId ? 'text-emerald-400' : ''}>
                    <td className="py-2 font-medium">{player.name}{player.id === strikerId ? '*' : ''}</td>
                    <td className="py-2 text-right font-bold">{runs}</td>
                    <td className="py-2 text-right text-zinc-500">{bCount}</td>
                    <td className="py-2 text-right text-zinc-500">{fours}</td>
                    <td className="py-2 text-right text-zinc-500">{sixes}</td>
                    <td className="py-2 text-right text-zinc-500">{sr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
