import React, { useState } from 'react';
import { MatchFormat, Player } from '../types';
import { Plus, Trash2, Trophy, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onStart: (data: any) => void;
}

export default function MatchSetup({ onStart }: Props) {
  const [team1, setTeam1] = useState('Team A');
  const [team2, setTeam2] = useState('Team B');
  const [format, setFormat] = useState<MatchFormat>('T20');
  const [overs, setOvers] = useState(20);
  const [tossWinner, setTossWinner] = useState('Team A');
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat');
  
  const [players1, setPlayers1] = useState<Player[]>(Array.from({ length: 11 }, (_, i) => ({ id: `t1p${i}`, name: `Player ${i + 1}` })));
  const [players2, setPlayers2] = useState<Player[]>(Array.from({ length: 11 }, (_, i) => ({ id: `t2p${i}`, name: `Player ${i + 1}` })));

  const handlePlayerChange = (team: 1 | 2, index: number, name: string) => {
    if (team === 1) {
      const newPlayers = [...players1];
      newPlayers[index].name = name;
      setPlayers1(newPlayers);
    } else {
      const newPlayers = [...players2];
      newPlayers[index].name = name;
      setPlayers2(newPlayers);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({
      id: crypto.randomUUID(),
      team1,
      team2,
      format,
      overs,
      tossWinner: tossWinner === 'Team A' ? team1 : team2,
      tossDecision,
      players1,
      players2
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-500/20 rounded-2xl">
          <Trophy className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match Setup</h1>
          <p className="text-zinc-400">Configure your cricket match details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-3xl space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" /> Team 1
            </h2>
            <input 
              className="input-field w-full" 
              placeholder="Team 1 Name"
              value={team1}
              onChange={e => setTeam1(e.target.value)}
            />
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {players1.map((p, i) => (
                <input 
                  key={p.id}
                  className="input-field w-full text-sm"
                  value={p.name}
                  onChange={e => handlePlayerChange(1, i, e.target.value)}
                />
              ))}
            </div>
          </div>

          <div className="glass p-6 rounded-3xl space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" /> Team 2
            </h2>
            <input 
              className="input-field w-full" 
              placeholder="Team 2 Name"
              value={team2}
              onChange={e => setTeam2(e.target.value)}
            />
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {players2.map((p, i) => (
                <input 
                  key={p.id}
                  className="input-field w-full text-sm"
                  value={p.name}
                  onChange={e => handlePlayerChange(2, i, e.target.value)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Format</label>
            <select 
              className="input-field w-full"
              value={format}
              onChange={e => {
                setFormat(e.target.value as MatchFormat);
                if (e.target.value === 'T20') setOvers(20);
                if (e.target.value === 'ODI') setOvers(50);
              }}
            >
              <option value="T20">T20</option>
              <option value="ODI">ODI</option>
              <option value="Test">Test</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Overs</label>
            <input 
              type="number" 
              className="input-field w-full"
              value={overs}
              onChange={e => setOvers(parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Toss Winner</label>
            <select 
              className="input-field w-full"
              value={tossWinner}
              onChange={e => setTossWinner(e.target.value)}
            >
              <option value="Team A">Team 1</option>
              <option value="Team B">Team 2</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Decision</label>
            <select 
              className="input-field w-full"
              value={tossDecision}
              onChange={e => setTossDecision(e.target.value as 'bat' | 'bowl')}
            >
              <option value="bat">Bat First</option>
              <option value="bowl">Bowl First</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-4 text-lg shadow-xl shadow-emerald-500/20">
          Start Match
        </button>
      </form>
    </motion.div>
  );
}
