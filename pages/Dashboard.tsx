import React, { useMemo } from 'react';
import { MarketCard } from '../components/MarketCard';
import { Search, Flame, Filter, Zap } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Dashboard: React.FC = () => {
  const { markets } = useStore();
  const [filter, setFilter] = React.useState('ALL');
  const [search, setSearch] = React.useState('');

  const filteredMarkets = useMemo(() => {
    return markets.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'ALL' || m.category === filter;
      return matchesSearch && matchesFilter;
    });
  }, [markets, filter, search]);

  const categories = ['ALL', 'Crypto', 'Politics', 'Sports', 'Tech', 'Science', 'Finance'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 p-8 md:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-6">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Predict the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Future</span>.
                <br />
                Profit from <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Truth</span>.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                The world's first AI-assisted decentralized prediction market. Trade on real-world events with verified oracle data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search markets (e.g. Bitcoin, Election...)" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-700 text-slate-100 pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                    />
                </div>
            </div>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-900/0 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 right-10 opacity-20 text-cyan-500 transform rotate-12">
            <Zap size={200} />
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md py-4 border-b border-slate-800/50 -mx-4 px-4 md:-mx-8 md:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Filter size={18} className="text-slate-500 mr-2 shrink-0" />
            {categories.map(cat => (
            <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all shrink-0 border ${
                filter === cat 
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
            >
                {cat}
            </button>
            ))}
        </div>
      </div>

      {/* Market Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-100 font-bold text-xl">
                <Flame className="text-orange-500 fill-orange-500/20" size={24} />
                <h2>Trending Markets</h2>
            </div>
            <span className="text-slate-500 text-sm">{filteredMarkets.length} active markets</span>
        </div>
        
        {filteredMarkets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
            <Search size={48} className="text-slate-700 mb-4" />
            <h3 className="text-slate-400 font-bold text-lg">No markets found</h3>
            <p className="text-slate-600">Try adjusting your search or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map(market => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;