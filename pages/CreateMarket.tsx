import React, { useState } from 'react';
import { generateMarketFromPrompt } from '../services/geminiService';
import { Market } from '../types';
import { Sparkles, Loader2, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

interface CreateMarketProps {
  onCreate: (market: Partial<Market>) => void;
}

const CreateMarket: React.FC<CreateMarketProps> = () => {
  const { addMarket, user } = useStore();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<Partial<Market> | null>(null);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const market = await generateMarketFromPrompt(prompt);
      setGeneratedData(market);
    } catch (e) {
      alert("Failed to generate market. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (generatedData) {
      const newMarket: Market = {
        ...generatedData as Market,
        id: Math.random().toString(36).substr(2, 9),
        creatorId: user.id,
        resolutionHistory: [],
        volume: 0,
        poolBalance: { YES: 1000 * (generatedData.probabilities?.[0] || 0.5), NO: 1000 * (1 - (generatedData.probabilities?.[0] || 0.5)) }
      };
      addMarket(newMarket);
      navigate('/');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl mb-2 border border-cyan-500/20">
            <Sparkles className="text-cyan-400" size={32} />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">AI Market Architect</h1>
        <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Describe the event you want to predict. Our Gemini AI agent will structure the market, find oracle sources, and set resolution criteria for you.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        {!generatedData ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">
                What do you want to predict?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Will Bitcoin hit 100k before 2026?"
                className="w-full h-40 bg-slate-950/50 border border-slate-700 rounded-2xl p-5 text-slate-100 text-lg placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none transition-all"
              />
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" /> Analyzing Real-World Data...
                </>
              ) : (
                <>
                  <Sparkles size={20} /> Generate Market Structure
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white">Review Generated Market</h2>
                <button 
                    onClick={() => setGeneratedData(null)}
                    className="text-sm text-slate-400 hover:text-white"
                >
                    Reset
                </button>
            </div>

            <div className="grid gap-6">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title</label>
                    <p className="text-xl font-bold text-white mt-1 leading-tight">{generatedData.title}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                        <span className="block mt-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm w-fit font-medium text-slate-200">{generatedData.category}</span>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</label>
                        <p className="mt-2 text-slate-200 font-mono">{generatedData.endDate}</p>
                    </div>
                </div>

                <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800">
                    <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 block flex items-center gap-2">
                        <CheckCircle size={14} /> Resolution Criteria
                    </label>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        {generatedData.oracleConfig?.resolutionCriteria}
                    </p>
                </div>

                <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800">
                    <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 block flex items-center gap-2">
                        <Loader2 size={14} /> Oracle Configuration
                    </label>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Primary Source: <strong className="text-white">{generatedData.oracleConfig?.primarySource.name}</strong></span>
                        <span className="text-xs text-slate-500 truncate max-w-[200px]">{generatedData.oracleConfig?.primarySource.url}</span>
                    </div>
                </div>
                
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                    <p className="text-sm text-slate-400 mt-1">{generatedData.description}</p>
                </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-lg"
            >
               Deploy Market <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
      
      <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-200/70 text-sm">
        <AlertTriangle className="shrink-0 mt-0.5 text-amber-500" size={16} />
        <p>
            You are staking <strong>$1,000 USDC</strong> as initial liquidity. This amount is locked until market resolution. Ensure the resolution criteria is unambiguous to avoid disputes.
        </p>
      </div>
    </div>
  );
};

export default CreateMarket;