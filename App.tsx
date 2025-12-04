import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MarketDetail from './pages/MarketDetail';
import CreateMarket from './pages/CreateMarket';
import { StoreProvider } from './context/StoreContext';
import { ShieldCheck, User } from 'lucide-react';

// Placeholder pages for specific route requirements
const ProfilePage = () => (
    <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <User className="text-cyan-400" /> User Profile
        </h1>
        <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="text-slate-500 text-sm font-bold uppercase">Reputation Score</div>
                <div className="text-4xl font-bold text-emerald-400 mt-2">100</div>
                <p className="text-xs text-slate-500 mt-2">Top 5% of traders</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="text-slate-500 text-sm font-bold uppercase">Total Volume</div>
                <div className="text-4xl font-bold text-white mt-2">$2,450</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="text-slate-500 text-sm font-bold uppercase">Markets Created</div>
                <div className="text-4xl font-bold text-cyan-400 mt-2">12</div>
            </div>
        </div>
    </div>
);

const AdminPage = () => (
    <div className="max-w-4xl mx-auto space-y-6">
         <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="text-rose-400" /> Governance Console
        </h1>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-slate-400">Governance DAO voting and dispute resolution panel.</p>
        </div>
    </div>
);

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