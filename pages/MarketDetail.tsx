import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MarketStatus, OracleStatus } from '../types';
import { analyzeMarket } from '../services/geminiService';
import { fetchOracleData, detectAnomalies } from '../services/oracleService';
import { useStore } from '../context/StoreContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Clock, Shield, Activity, BrainCircuit, CheckCircle, AlertTriangle, Lock } from 'lucide-react';

const MarketDetail: React.FC = () => {
  const { id } = useParams();
  const { markets, user, executeTrade, updateMarketStatus, resolveMarket } = useStore();
  const market = markets.find(m => m.id === id);
  
  const [activeTab, setActiveTab] = useState<'TRADE' | 'ORACLE' | 'DISPUTE'>('TRADE');
  const [amount, setAmount] = useState<string>('');
  const [outcome, setOutcome] = useState<'YES' | 'NO'>('YES');
  const [aiInsight, setAiInsight] = useState<{text: string, sentiment: string} | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (market && !aiInsight) {
      analyzeMarket(market).then(setAiInsight);
    }
  }, [market]);

  if (!market) return <div className="p-10 text-center">Market Not Found</div>;

  const yesProb = market.probabilities[0];
  const chartData = Array.from({length: 20}, (_, i) => ({
    date: i,
    prob: (yesProb * 100) + (Math.random() * 5 - 2.5) // Fake historical data
  }));

  // Handlers
  const handleTrade = () => {
    if (!amount) return;
    executeTrade(market.id, outcome, parseFloat(amount));
    setAmount('');
  };

  const simulateResolution = async () => {
    setIsResolving(true);
    updateMarketStatus(market.id, MarketStatus.LOCKED);
    updateMarketStatus(market.id, MarketStatus.FETCHING_ORACLES);

    // Simulate Oracle Delay
    const result = await fetchOracleData(market.oracleConfig.primarySource);
    
    if (result.status === OracleStatus.VERIFIED && result.reportedValue) {
      // Direct resolution for demo purposes
      resolveMarket(market.id, result.reportedValue);
    } else {
      updateMarketStatus(market.id, MarketStatus.DISPUTE_WINDOW);
    }
    setIsResolving(false);
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      {/* Left Column: Visuals & Data */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-3">
             <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs font-bold text-slate-400 uppercase tracking-wider">
                {market.category}
             </span>
             {market.status === MarketStatus.ACTIVE && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    LIVE TRADING
                </span>
             )}
             {market.status === MarketStatus.RESOLVED && (
                <span className="text-xs font-bold text-slate-900 bg-cyan-400 px-2 py-1 rounded-md">
                    RESOLVED: {market.resolutionValue}
                </span>
             )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">{market.title}</h1>
        </div>

        {/* Chart */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-[20%] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-500" />
           
           <div className="flex items-baseline gap-4 mb-8 relative z-10">
              <span className={`text-6xl font-mono font-bold tracking-tighter ${yesProb > 0.5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(yesProb * 100).toFixed(0)}%
              </span>
              <span className="text-lg text-slate-400 font-medium">probability of YES</span>
           </div>
           
           <div className="h-[250px] w-full relative z-10">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                 <defs>
                   <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor={yesProb > 0.5 ? "#10b981" : "#f43f5e"} stopOpacity={0.2}/>
                     <stop offset="95%" stopColor={yesProb > 0.5 ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Area 
                    type="monotone" 
                    dataKey="prob" 
                    stroke={yesProb > 0.5 ? "#10b981" : "#f43f5e"} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorProb)" 
                />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* AI Insight Section */}
        <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <BrainCircuit size={24} />
                </div>
                <div>
                    <h3 className="text-indigo-200 font-bold mb-1">Gemini AI Analysis</h3>
                    <p className="text-indigo-100/70 text-sm leading-relaxed mb-3">
                        {aiInsight ? aiInsight.text : "Connecting to neural engine..."}
                    </p>
                    {aiInsight && (
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${
                            aiInsight.sentiment === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            aiInsight.sentiment === 'BEARISH' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            'bg-slate-700 text-slate-300 border-slate-600'
                        }`}>
                            SENTIMENT: {aiInsight.sentiment}
                        </span>
                    )}
                </div>
            </div>
        </div>

        {/* Detailed Tabs */}
        <div className="border-t border-slate-800 pt-6">
            <div className="flex gap-6 border-b border-slate-800 mb-6">
                {['TRADE', 'ORACLE', 'DISPUTE'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-3 text-sm font-bold tracking-wide transition-colors border-b-2 ${
                            activeTab === tab 
                            ? 'border-cyan-500 text-cyan-400' 
                            : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {tab === 'TRADE' ? 'MARKET INFO' : tab === 'ORACLE' ? 'ORACLE DATA' : 'RESOLUTION'}
                    </button>
                ))}
            </div>

            {activeTab === 'TRADE' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                    <p className="text-slate-300 leading-relaxed">{market.description}</p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                            <label className="text-xs text-slate-500 font-bold uppercase">Resolution Criteria</label>
                            <p className="text-sm text-slate-200 mt-1">{market.oracleConfig.resolutionCriteria}</p>
                        </div>
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                            <label className="text-xs text-slate-500 font-bold uppercase">Volume</label>
                            <p className="text-sm text-slate-200 mt-1">${market.volume.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'ORACLE' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                     <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
                                <Activity size={20} />
                             </div>
                             <div>
                                 <div className="font-bold text-white">{market.oracleConfig.primarySource.name}</div>
                                 <div className="text-xs text-slate-500">{market.oracleConfig.primarySource.url}</div>
                             </div>
                         </div>
                         <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                             market.oracleConfig.primarySource.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                         }`}>
                             {market.oracleConfig.primarySource.status}
                         </div>
                     </div>
                </div>
            )}

            {activeTab === 'DISPUTE' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="relative pl-8 border-l-2 border-slate-800 space-y-8">
                        {market.resolutionHistory.map((step, idx) => (
                            <div key={idx} className="relative">
                                <span className="absolute -left-[39px] w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-600 z-10"></span>
                                <div className="text-sm font-bold text-slate-300">{step.details}</div>
                                <div className="text-xs text-slate-500 mt-1">{new Date(step.timestamp).toLocaleString()}</div>
                            </div>
                        ))}
                        {market.status === MarketStatus.ACTIVE && (
                            <div className="relative opacity-50">
                                <span className="absolute -left-[39px] w-5 h-5 rounded-full bg-slate-900 border-2 border-slate-800 z-10"></span>
                                <div className="text-sm font-bold text-slate-500">Market Active - Waiting for End Date</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Right Column: Trading Interface */}
      <div className="space-y-6">
        <div className="sticky top-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                {market.status !== MarketStatus.ACTIVE && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6">
                        <Lock size={48} className="text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Market Locked</h3>
                        <p className="text-slate-400 text-sm">Trading is suspended while verification is in progress.</p>
                    </div>
                )}
                
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    Trade Outcome
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button 
                        onClick={() => setOutcome('YES')}
                        className={`py-4 rounded-xl font-bold text-lg transition-all border ${
                            outcome === 'YES' 
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                    >
                        YES <span className="block text-xs font-normal opacity-80">${yesProb.toFixed(2)}</span>
                    </button>
                    <button 
                        onClick={() => setOutcome('NO')}
                        className={`py-4 rounded-xl font-bold text-lg transition-all border ${
                            outcome === 'NO' 
                            ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]' 
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                    >
                        NO <span className="block text-xs font-normal opacity-80">${(1-yesProb).toFixed(2)}</span>
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                        <div className="flex justify-between text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">
                            <span>Amount</span>
                            <span>Bal: ${user.balance.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-slate-500 text-xl mr-2">$</span>
                            <input 
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)} 
                                className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-slate-700"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Est. Shares</span>
                            <span className="text-white font-mono">
                                {amount ? (parseFloat(amount) / (outcome==='YES'?yesProb:(1-yesProb))).toFixed(2) : '0.00'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Fees (1%)</span>
                            <span className="text-slate-500 font-mono">$0.00</span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleTrade}
                    disabled={!user.isConnected || !amount}
                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
                >
                    {user.isConnected ? 'Place Order' : 'Connect Wallet to Trade'}
                </button>
            </div>

            {/* Admin/Debug Panel for Simulation */}
            <div className="mt-8 border border-slate-800 rounded-2xl p-4 opacity-50 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-3">
                    <Shield size={14} /> Dev Tools (Simulation)
                </div>
                <button 
                    onClick={simulateResolution}
                    disabled={isResolving || market.status !== MarketStatus.ACTIVE}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded border border-slate-700"
                >
                    {isResolving ? 'Fetching Oracle...' : 'Trigger Oracle Settlement'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetail;