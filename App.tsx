import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MarketDetail from './pages/MarketDetail';
import CreateMarket from './pages/CreateMarket';
import { StoreProvider, useStore } from './context/StoreContext';
import { ShieldCheck, User, Trophy, Wallet, History, AlertTriangle } from 'lucide-react';
import { MarketStatus } from './types';

const ProfilePage = () => {
    const { user, markets, trades } = useStore();
    
    // Create a map of market status to filter active vs settled
    const marketStatusMap = React.useMemo(() => new Map(markets.map(m => [m.contractId, m.payload.status])), [markets]);

    // Filter trades belonging to current user
    const userTrades = trades.filter(t => t.payload.buyer === user.party);

    const activeTrades = userTrades.filter(t => {
        const status = marketStatusMap.get(t.payload.marketId);
        return status && status !== MarketStatus.RESOLVED && status !== MarketStatus.CANCELLED;
    });

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-cyan-500/20">
                    {user.username.charAt(0)}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <span className={`w-2 h-2 rounded-full ${user.isConnected ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                        {user.isConnected ? 'Wallet Connected' : 'Wallet Disconnected'}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Trophy size={100} />
                    </div>
                    <div className="text-slate-500 text-sm font-bold uppercase flex items-center gap-2">
                        <ShieldCheck size={16} /> Reputation Score
                    </div>
                    <div className="text-4xl font-bold text-emerald-400 mt-2">{user.reputation}</div>
                    <p className="text-xs text-slate-500 mt-2">Top 5% of traders</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wallet size={100} />
                    </div>
                    <div className="text-slate-500 text-sm font-bold uppercase flex items-center gap-2">
                        <Wallet size={16} /> Portfolio Value
                    </div>
                    <div className="text-4xl font-bold text-white mt-2">${user.portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <p className="text-xs text-slate-500 mt-2">Invested across {activeTrades.length} active trades</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <History size={100} />
                    </div>
                    <div className="text-slate-500 text-sm font-bold uppercase flex items-center gap-2">
                        <History size={16} /> Lifetime Trades
                    </div>
                    <div className="text-4xl font-bold text-cyan-400 mt-2">{userTrades.length}</div>
                    <p className="text-xs text-slate-500 mt-2">Total volume</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <History size={18} className="text-slate-400" /> Trade Contract History
                    </h3>
                </div>
                {userTrades.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">
                        No trades yet. Go exploring!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-950/30 text-xs uppercase font-bold text-slate-500">
                                <tr>
                                    <th className="p-4">Market ID</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Outcome</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Entry Price</th>
                                    <th className="p-4">Shares</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {userTrades.map((trade) => {
                                    const mStatus = marketStatusMap.get(trade.payload.marketId);
                                    const isResolved = mStatus === MarketStatus.RESOLVED;
                                    const shortId = trade.payload.marketId.split('::')[1] || trade.payload.marketId.substring(0,8);
                                    return (
                                        <tr key={trade.contractId} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4 font-mono text-xs text-slate-500" title={trade.payload.marketId}>
                                                ...{shortId}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">BUY</span>
                                            </td>
                                            <td className={`p-4 font-bold ${trade.payload.outcome === 'YES' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {trade.payload.outcome}
                                            </td>
                                            <td className="p-4 text-white">${trade.payload.amount.toFixed(2)}</td>
                                            <td className="p-4">${trade.payload.price.toFixed(2)}</td>
                                            <td className="p-4">{trade.payload.shares.toFixed(2)}</td>
                                            <td className="p-4">
                                                {isResolved ? (
                                                    <span className="text-xs font-bold text-slate-500">SETTLED</span>
                                                ) : (
                                                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ACTIVE
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">{new Date(trade.payload.timestamp).toLocaleDateString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminPage = () => {
    const { resetDemo, user } = useStore();
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <ShieldCheck className="text-rose-400" /> Governance Console
            </h1>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
                <AlertTriangle size={48} className="text-amber-500 mx-auto" />
                <h3 className="text-xl font-bold text-white">System Controls</h3>
                <p className="text-slate-400 max-w-lg mx-auto">
                    This is the administrative panel for DAO governance. In this demo environment, you can reset the application state to its initial configuration.
                </p>
                <button 
                    onClick={resetDemo}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-500/20"
                >
                    Reset Ledger State (ACS)
                </button>
            </div>
             {user.isConnected && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-left space-y-4">
                    <h3 className="text-lg font-bold text-white">Participant Node Status</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-slate-950 rounded border border-slate-700">
                            <div className="text-slate-500 uppercase text-xs font-bold">Party ID</div>
                            <div className="text-emerald-400 font-mono mt-1">{user.party}</div>
                        </div>
                        <div className="p-3 bg-slate-950 rounded border border-slate-700">
                            <div className="text-slate-500 uppercase text-xs font-bold">Ledger Connection</div>
                            <div className="text-white mt-1">Simulated / LocalStorage</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateMarket onCreate={(m) => console.log(m)} />} />
            <Route path="/market/:id" element={<MarketDetail />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Layout>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;