import React, { useEffect, useState } from 'react';
import { Match } from '../types';
import { motion } from 'motion/react';
import { Calendar, Trophy, ChevronRight, Clock } from 'lucide-react';

interface Props {
  onSelect: (match: Match) => void;
}

export default function MatchHistory({ onSelect }: Props) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/matches')
      .then(res => res.json())
      .then(data => {
        setMatches(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading matches...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match History</h1>
          <p className="text-zinc-400">View past matches and scorecards</p>
        </div>
      </div>

      <div className="grid gap-4">
        {matches.map((match) => (
          <motion.button
            key={match.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(match)}
            className="glass p-6 rounded-3xl text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl ${match.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{match.format}</span>
                  <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                  <span className="text-xs font-medium text-zinc-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(match.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold">
                  {match.team1_name} <span className="text-zinc-500 font-medium">vs</span> {match.team2_name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    match.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'
                  }`}>
                    {match.status}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-zinc-700 group-hover:text-zinc-300 transition-colors" />
          </motion.button>
        ))}

        {matches.length === 0 && (
          <div className="glass p-12 rounded-[3rem] text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-zinc-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No matches found</h3>
            <p className="text-zinc-500">Start a new match to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
