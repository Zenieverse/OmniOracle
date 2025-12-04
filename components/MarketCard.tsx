import React from 'react';
import { Link } from 'react-router-dom';
import { Market } from '../types';
import { TrendingUp, Clock, AlertCircle } from 'lucide-react';

interface MarketCardProps {
  market: Market;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market }) => {
  const yesProb = Math.round(market.probabilities[0] * 100);
  const noProb = 100 - yesProb;

  return (
    <Link to={`/market/${market.id}`} className="block group">
      <div className="h-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-2xl p-5 transition-all duration-200 flex flex-col shadow-lg shadow-black/20">
        
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-700 text-slate-300">
                    {market.category}
                </span>
                {market.status === 'ACTIVE' && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        LIVE
                    </span>
                )}
            </div>
            <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">
                <TrendingUp size={18} />
            </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-100 leading-snug mb-2 group-hover:text-cyan-50 transition-colors line-clamp-2">
          {market.title}
        </h3>

        <div className="mt-auto pt-4 space-y-3">
          {/* Probability Bar */}
          <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden flex">
            <div 
                className="h-full bg-emerald-500" 
                style={{ width: `${yesProb}%` }}
            />
            <div 
                className="h-full bg-rose-500" 
                style={{ width: `${noProb}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm font-medium">
            <span className="text-emerald-400">YES {yesProb}%</span>
            <span className="text-rose-400">NO {noProb}%</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-700/50">
            <div className="flex items-center gap-1">
                <span className="font-mono text-slate-400">${(market.volume / 1000).toFixed(1)}k</span> Vol
            </div>
            <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{new Date(market.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};