import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { MarketStatus, OracleStatus } from '../types';
import { analyzeMarket } from '../services/geminiService';
import { fetchOracleData } from '../services/oracleService';
import { useStore } from '../context/StoreContext';
import { AreaChart, Area, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  Clock, Activity, BrainCircuit, CheckCircle, Lock, 
  Gavel, ShieldCheck, TrendingUp, ChevronRight, Network, FileKey
} from 'lucide-react';

const MarketDetail: React.FC = () => {
  const { id } = useParams(); // This is the contract ID now
  const { markets, user, exerciseTradeChoice, updateOracleData, exerciseResolveChoice, connectToParticipant } = useStore();
  
  // Find market by contractId (decoded)
  const market = markets.find(m => m.contractId === decodeURIComponent(id || ''));
  const payload = market?.payload;
  
  const [amount, setAmount] = useState<string>('');
  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO'>('YES');
  const [aiAnalysis, setAiAnalysis] = useState<{text: string, sentiment: string} | null>(null);

  // Mock chart data generation
  const chartData = useMemo(() => {
    if (!payload) return [];
    const data = [];
    let val = 50;
    const target = payload.probabilities[0] * 100;
    const steps = 7;
    for (let i = 0; i < steps; i++) {
        val = val + (target - val) * (0.3 + Math.random() * 0.1);
        data.push({
            name: `Day ${i+1}`,
            value: Math.round(val),
            amt: 2400
        });
    }
    data.push({ name: 'Now', value: Math.round(target), amt: 2400 });
    return data;
  }, [payload?.probabilities]);

  useEffect(() => {
    if (payload) {
      analyzeMarket(payload).then(setAiAnalysis);
    }
  }, [payload?.title]);

  // Simulate Oracle Resolution Flow
  useEffect(() => {
    if (!market || !payload) return;

    const runResolution = async () => {
      if (payload.status === MarketStatus.FETCHING_ORACLES) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const result = await fetchOracleData(payload.oracleConfig.primarySource);
        
        if (result.status === OracleStatus.VERIFIED && result.reportedValue) {
           updateOracleData(market.contractId, result);
        }
      }
    };

    runResolution();
  }, [payload?.status, market?.contractId, payload?.oracleConfig?.primarySource, updateOracleData]);

  const handleTrade = async () => {
    if (!market || !amount) return;
    await exerciseTradeChoice(market.contractId, selectedOutcome, parseFloat(amount));
    setAmount('');
  };

  const handleSimulateResolution = () => {
    if (!market || !payload) return;
    // For demo purposes, we manually trigger the choice
    if (payload.status === MarketStatus.DISPUTE_WINDOW) {
        const winner = payload.oracleConfig.primarySource.reportedValue || 'YES';
        exerciseResolveChoice(market.contractId, winner);
    }
  };

  if (!market || !payload) return <div className="p-10 text-center text-slate-500">Contract not found in Active Contract Set</div>;

  const yesProb = Math.round(payload.probabilities[0] * 100);
  const noProb = 100 - yesProb;
  const price = selectedOutcome === 'YES' ? payload.probabilities[0] : payload.probabilities[1];
  const estShares = amount ? (parseFloat(amount) / price).toFixed(2) : '0.00';
  
  const isResolved = payload.status === MarketStatus.RESOLVED;
  const isLocked = payload.status !== MarketStatus.ACTIVE;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide bg-slate-800 text-slate-300 border border-slate-700">
                    {payload.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={12} /> Ends {new Date(payload.endDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500 font-mono" title={market.contractId}>
                    <FileKey size={12} /> {market.contractId.split('::')[1]}...
                </span>
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight max-w-3xl">{payload.title}</h1>
        </div>
        <div className="flex items-center gap-2">
             {payload.status === MarketStatus.DISPUTE_WINDOW && (
                <button 
                    onClick={handleSimulateResolution}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-purple-500/20"
                >
                    Exercise 'Resolve' Choice
                </button>
            )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart & Info */}
        <div className="lg:col-span-2 space-y-6">
            {/* Chart Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                        <div className="text-5xl font-black text-emerald-400 tracking-tighter">{yesProb}%</div>
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Probability of YES</div>
                    </div>
                    <div className="text-right">
                         <div className="text-2xl font-bold text-slate-300">${payload.volume.toLocaleString()}</div>
                         <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Volume</div>
                    </div>
                </div>

                <div className="h-[250px] w-full relative z-10 -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                                itemStyle={{ color: '#10b981' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Oracle Status & Timeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="font-bold text-slate-200 mb-6 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-cyan-500" /> Smart Contract Lifecycle
                </h3>
                
                <div className="relative">
                     {/* Connector Line */}
                    <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-800"></div>

                    <div className="space-y-8">
                        {/* Step 1: Active */}
                        <div className="relative flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center z-10 bg-slate-900 transition-colors ${
                                payload.status === MarketStatus.ACTIVE 
                                ? 'border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                                : 'border-slate-700 text-slate-600'
                            }`}>
                                <Activity size={20} />
                            </div>
                            <div>
                                <h4 className={`font-bold ${payload.status === MarketStatus.ACTIVE ? 'text-emerald-400' : 'text-slate-500'}`}>Market Active</h4>
                                <p className="text-xs text-slate-500">Contract accepts 'Trade' choices.</p>
                            </div>
                        </div>

                        {/* Step 3: Oracle Fetch */}
                        <div className="relative flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center z-10 bg-slate-900 transition-colors ${
                                payload.status === MarketStatus.FETCHING_ORACLES
                                ? 'border-blue-500 text-blue-500 animate-pulse' 
                                : 'border-slate-800 text-slate-700'
                            }`}>
                                <BrainCircuit size={20} />
                            </div>
                            <div>
                                <h4 className={`font-bold ${payload.status === MarketStatus.FETCHING_ORACLES ? 'text-blue-400' : 'text-slate-500'}`}>
                                    Oracle Verification
                                </h4>
                                <p className="text-xs text-slate-500">
                                    Off-ledger automation querying {payload.oracleConfig.primarySource.name}...
                                </p>
                            </div>
                        </div>

                        {/* Step 5: Resolved */}
                         <div className="relative flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center z-10 bg-slate-900 transition-colors ${
                                payload.status === MarketStatus.RESOLVED
                                ? 'border-emerald-500 text-emerald-500' 
                                : 'border-slate-800 text-slate-700'
                            }`}>
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <h4 className={`font-bold ${payload.status === MarketStatus.RESOLVED ? 'text-emerald-400' : 'text-slate-500'}`}>Archived</h4>
                                <p className="text-xs text-slate-500">
                                    Final outcome: <span className="text-white font-bold">{payload.resolutionValue || 'PENDING'}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Trade Interface */}
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl sticky top-24">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <TrendingUp className="text-emerald-400" size={20} /> Exercise Trade
                    </h3>
                    <div className="text-xs font-mono text-slate-400">
                        Pool: ${(payload.liquidity + payload.volume).toLocaleString()}
                    </div>
                </div>

                {!user.isConnected ? (
                    <div className="text-center py-8 space-y-4">
                        <Network size={48} className="mx-auto text-slate-700" />
                        <p className="text-slate-400 text-sm">Connect to a Participant node to submit choices.</p>
                        <button 
                            onClick={connectToParticipant}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
                        >
                            Connect Participant
                        </button>
                    </div>
                ) : isResolved ? (
                    <div className="p-6 bg-slate-800/50 rounded-xl text-center border border-slate-700">
                        <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
                        <h4 className="text-white font-bold">Contract Archived</h4>
                        <p className="text-sm text-slate-400 mt-1">Choice execution disabled.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Outcome Toggle */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl">
                            <button
                                onClick={() => setSelectedOutcome('YES')}
                                className={`py-3 rounded-lg font-bold text-sm transition-all ${
                                    selectedOutcome === 'YES' 
                                    ? 'bg-emerald-600 text-white shadow-lg' 
                                    : 'text-slate-500 hover:text-white'
                                }`}
                            >
                                YES
                            </button>
                            <button
                                onClick={() => setSelectedOutcome('NO')}
                                className={`py-3 rounded-lg font-bold text-sm transition-all ${
                                    selectedOutcome === 'NO' 
                                    ? 'bg-rose-600 text-white shadow-lg' 
                                    : 'text-slate-500 hover:text-white'
                                }`}
                            >
                                NO
                            </button>
                        </div>

                        {/* Amount Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                <span>Amount (USDC)</span>
                                <span>Holding: ${user.balance.toFixed(2)}</span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                <input 
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-8 pr-4 text-white font-mono font-bold focus:ring-2 focus:ring-cyan-500 outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleTrade}
                            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > user.balance}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                                selectedOutcome === 'YES' 
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20' 
                                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            Submit Choice <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetail;