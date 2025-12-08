import React from 'react';
import { Link } from 'react-router-dom';
import { Market, Template } from '../types';
import { TrendingUp, Clock, Activity, Hash } from 'lucide-react';

interface MarketCardProps {
  market: Template<Market>;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market }) => {
  const { payload, contractId } = market;
  const yesProb = Math.round(payload.probabilities[0] * 100);
  const noProb = 100 - yesProb;

  // Truncate Contract ID for display
  const shortCid = contractId.split('::')[1] || contractId;

  return (
    <Link to={`/market/${encodeURIComponent(contractId)}`} className="block group">
      <div className="h-full bg-slate-900/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-2xl p-5 transition-all duration-200 flex flex-col shadow-lg shadow-black/20 relative overflow-hidden">
        
        {/* Hover Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100"></div>

        <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-800 text-slate-300 border border-slate-700">
                    {payload.category}
                </span>
                {payload.status === 'Active' && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        LIVE
                    </span>
                )}
                 {payload.status !== 'Active' && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {payload.status}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-600 font-mono">
                <Hash size={10} /> {shortCid}
            </div>
        </div>

        <h3 className="text-lg font-bold text-slate-100 leading-snug mb-4 group-hover:text-cyan-50 transition-colors line-clamp-2 min-h-[3.5rem]">
            {payload.title}
        </h3>

        <div className="mt-auto space-y-4 relative z-10">
            {/* Probability Bar */}
            <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-emerald-400">YES {yesProb}%</span>
                    <span className="text-rose-400">NO {noProb}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: `${yesProb}%` }}></div>
                    <div className="h-full bg-rose-500" style={{ width: `${noProb}%` }}></div>
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-3">
                <span className="flex items-center gap-1.5">
                    <Activity size={14} /> ${payload.volume.toLocaleString()} Vol
                </span>
                <span className="flex items-center gap-1.5">
                    <Clock size={14} /> {new Date(payload.endDate).toLocaleDateString()}
                </span>
            </div>
        </div>
      </div>
    </Link>
  );
};