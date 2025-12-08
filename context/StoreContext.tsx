import React, { createContext, useContext, useState, useEffect } from 'react';
import { Market, UserProfile, Notification, MarketStatus, Trade, OracleStatus, Template, Party } from '../types';
import { cantonApi } from '../services/cantonService';

interface StoreContextType {
  markets: Template<Market>[];
  trades: Template<Trade>[];
  user: UserProfile;
  notifications: Notification[];
  isLedgerReady: boolean;
  createMarketContract: (marketPayload: Market) => Promise<void>;
  exerciseTradeChoice: (marketCid: string, outcome: 'YES' | 'NO', amount: number) => Promise<void>;
  connectToParticipant: () => void;
  exerciseResolveChoice: (marketCid: string, outcome: string) => void;
  updateOracleData: (marketCid: string, source: any) => void;
  markNotificationRead: (id: string) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_USER_PARTY = 'user::12345';
const OPERATOR_PARTY = 'operator::primary';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [markets, setMarkets] = useState<Template<Market>[]>([]);
  const [trades, setTrades] = useState<Template<Trade>[]>([]);
  const [user, setUser] = useState<UserProfile>({
    party: '',
    username: 'Guest',
    isConnected: false,
    balance: 0,
    reputation: 0,
    portfolioValue: 0,
    contractIds: {}
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLedgerReady, setIsLedgerReady] = useState(false);

  // Restore session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('canton_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Poll the "Ledger" for updates (Simulating PQS updates)
  useEffect(() => {
      const pollLedger = async () => {
          const activeMarkets = await cantonApi.query<Market>('Market');
          const activeTrades = await cantonApi.query<Trade>('Trade');
          
          if (activeMarkets.length === 0 && !localStorage.getItem('canton_init')) {
             seedLedger();
          } else {
             setMarkets(activeMarkets);
          }
          
          setTrades(activeTrades);
          setIsLedgerReady(true);
      };

      const interval = setInterval(pollLedger, 2000); // Polling PQS
      pollLedger();
      return () => clearInterval(interval);
  }, []);

  // Recalculate Portfolio Value based on trades and current market probabilities
  useEffect(() => {
    if (!user.isConnected) return;
    
    let totalValue = 0;
    const userTrades = trades.filter(t => t.payload.buyer === user.party);
    
    userTrades.forEach(t => {
      const market = markets.find(m => m.contractId === t.payload.marketId);
      if (market && market.payload.status !== MarketStatus.RESOLVED) {
        // Current value = shares * current probability
        const currentProb = t.payload.outcome === 'YES' ? market.payload.probabilities[0] : market.payload.probabilities[1];
        totalValue += t.payload.shares * currentProb;
      }
    });

    setUser(prev => ({ ...prev, portfolioValue: totalValue }));
  }, [trades, markets, user.party, user.isConnected]);


  const addNotification = (title: string, message: string, type: Notification['type']) => {
    setNotifications(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      read: false,
      timestamp: Date.now()
    }, ...prev]);
  };

  const seedLedger = async () => {
      localStorage.setItem('canton_init', 'true');
      const m1: Market = {
        operator: OPERATOR_PARTY,
        title: 'Will Bitcoin price exceed $100,000 by end of 2025?',
        description: 'Resolves YES if BTC/USD > 100k on Coingecko.',
        category: 'Crypto',
        endDate: '2025-12-31',
        status: MarketStatus.ACTIVE,
        outcomes: ['YES', 'NO'],
        probabilities: [0.65, 0.35],
        volume: 12500,
        liquidity: 5000,
        poolBalance: { YES: 3250, NO: 1750 },
        oracleConfig: {
            primarySource: { id: 'o1', name: 'CoinGecko API', type: 'API', url: 'https://api.coingecko.com', status: OracleStatus.VERIFIED },
            resolutionCriteria: 'Closing price UTC',
            disputeWindowHours: 24
        }
      };
      await cantonApi.create('Market', m1, [OPERATOR_PARTY]);
  };

  const connectToParticipant = () => {
    const newUser = {
      party: INITIAL_USER_PARTY,
      username: 'Trader_Alice',
      isConnected: true,
      balance: 5000.00,
      reputation: 100,
      portfolioValue: 0,
      contractIds: {}
    };
    setUser(newUser);
    localStorage.setItem('canton_user', JSON.stringify(newUser));
    addNotification('Canton Participant Connected', `Allocated Party ID: ${INITIAL_USER_PARTY}`, 'SUCCESS');
  };

  const createMarketContract = async (marketPayload: Market) => {
    marketPayload.operator = user.party || OPERATOR_PARTY;
    await cantonApi.create('Market', marketPayload, [marketPayload.operator]);
    addNotification('Command Submitted', 'Create Market contract submitted to Global Synchronizer', 'INFO');
  };

  const exerciseTradeChoice = async (marketCid: string, outcome: 'YES' | 'NO', amount: number) => {
    if (user.balance < amount) {
      addNotification('Error', 'Insufficient funds in Asset Holding contract', 'ERROR');
      return;
    }

    const market = markets.find(m => m.contractId === marketCid);
    if (!market) return;

    // Calculate execution price and shares (AMM simulation)
    const price = outcome === 'YES' ? market.payload.probabilities[0] : market.payload.probabilities[1];
    const shares = amount / price;

    // 1. Create Trade Contract (Representing ownership)
    const tradePayload: Trade = {
        marketId: marketCid,
        buyer: user.party,
        outcome,
        amount,
        shares,
        price,
        timestamp: new Date().toISOString(),
        type: 'BUY'
    };
    await cantonApi.create('Trade', tradePayload, [user.party]);

    // 2. Submit Choice to Market (AMM state update)
    await cantonApi.exercise(marketCid, 'Trade', { outcome, amount, buyer: user.party });
    
    // 3. Local State Update (Optimistic)
    const newUserState = {
        ...user,
        balance: user.balance - amount
    };
    setUser(newUserState);
    localStorage.setItem('canton_user', JSON.stringify(newUserState));

    // Update local market state to reflect AMM shift (Simulation)
    setMarkets(prev => prev.map(m => {
        if (m.contractId !== marketCid) return m;
        
        const impact = (amount / m.payload.liquidity) * 0.2;
        let newYesProb = m.payload.probabilities[0];
        if (outcome === 'YES') newYesProb = Math.min(0.99, newYesProb + impact);
        else newYesProb = Math.max(0.01, newYesProb - impact);

        const newPayload = {
            ...m.payload,
            volume: m.payload.volume + amount,
            probabilities: [newYesProb, 1 - newYesProb]
        };
        
        // Persist to mock ledger
        const all = JSON.parse(localStorage.getItem('canton_acs_Market') || '[]');
        const updated = all.map((x: any) => x.contractId === marketCid ? { ...x, payload: newPayload } : x);
        localStorage.setItem('canton_acs_Market', JSON.stringify(updated));

        return { ...m, payload: newPayload };
    }));

    addNotification('Trade Choice Exercised', `Swap request submitted for ${outcome}`, 'SUCCESS');
  };

  const exerciseResolveChoice = async (marketCid: string, outcome: string) => {
      await cantonApi.exercise(marketCid, 'Resolve', { outcome });
      
      setMarkets(prev => prev.map(m => {
          if (m.contractId !== marketCid) return m;
          const newPayload = { ...m.payload, status: MarketStatus.RESOLVED, resolutionValue: outcome };
          
          // Persist
          const all = JSON.parse(localStorage.getItem('canton_acs_Market') || '[]');
          const updated = all.map((x: any) => x.contractId === marketCid ? { ...x, payload: newPayload } : x);
          localStorage.setItem('canton_acs_Market', JSON.stringify(updated));

          return { ...m, payload: newPayload };
      }));
      
      addNotification('Market Settled', `Resolution finalized on ledger. Outcome: ${outcome}`, 'SUCCESS');
  };

  const updateOracleData = (marketCid: string, source: any) => {
      setMarkets(prev => prev.map(m => {
          if (m.contractId !== marketCid) return m;
           const newPayload = { 
               ...m.payload, 
               oracleConfig: { ...m.payload.oracleConfig, primarySource: source },
               status: source.status === OracleStatus.VERIFIED ? MarketStatus.DISPUTE_WINDOW : m.payload.status
           };
           // Persist
           const all = JSON.parse(localStorage.getItem('canton_acs_Market') || '[]');
           const updated = all.map((x: any) => x.contractId === marketCid ? { ...x, payload: newPayload } : x);
           localStorage.setItem('canton_acs_Market', JSON.stringify(updated));
           return { ...m, payload: newPayload };
      }));
  };

  const resetDemo = () => {
    localStorage.removeItem('canton_acs_Market');
    localStorage.removeItem('canton_acs_Trade');
    localStorage.removeItem('canton_init');
    localStorage.removeItem('canton_user');
    window.location.reload();
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <StoreContext.Provider value={{
      markets,
      trades,
      user,
      notifications,
      isLedgerReady,
      createMarketContract,
      exerciseTradeChoice,
      connectToParticipant,
      exerciseResolveChoice,
      updateOracleData,
      markNotificationRead,
      resetDemo
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};