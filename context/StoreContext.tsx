import React, { createContext, useContext, useState, useEffect } from 'react';
import { Market, UserProfile, Notification, MarketStatus, Trade, OracleStatus } from '../types';

interface StoreContextType {
  markets: Market[];
  user: UserProfile;
  notifications: Notification[];
  addMarket: (market: Market) => void;
  executeTrade: (marketId: string, outcome: 'YES' | 'NO', amount: number) => void;
  connectWallet: () => void;
  resolveMarket: (marketId: string, outcome: string) => void;
  updateMarketStatus: (marketId: string, status: MarketStatus) => void;
  markNotificationRead: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_USER: UserProfile = {
  id: 'u1',
  username: 'CryptoOracle',
  isConnected: false,
  balance: 2500.00,
  reputation: 100,
  badges: ['Early Adopter'],
  portfolioValue: 0,
  trades: []
};

// Seed data
const INITIAL_MARKETS: Market[] = [
  {
    id: 'm1',
    title: 'Will Bitcoin price exceed $100,000 by end of 2025?',
    description: 'Resolves YES if BTC/USD > 100k on Coingecko.',
    category: 'Crypto',
    endDate: '2025-12-31T23:59:59Z',
    status: MarketStatus.ACTIVE,
    outcomes: ['YES', 'NO'],
    probabilities: [0.65, 0.35],
    volume: 12500,
    liquidity: 5000,
    poolBalance: { YES: 3250, NO: 1750 },
    oracleConfig: {
      primarySource: { id: 'o1', name: 'CoinGecko API', type: 'API', url: 'https://api.coingecko.com', status: OracleStatus.VERIFIED },
      backupSources: [],
      resolutionCriteria: 'Closing price UTC',
      disputeWindowHours: 24
    },
    resolutionHistory: [],
    creatorId: 'system'
  },
  {
    id: 'm2',
    title: 'Will SpaceX Starship reach orbit in Q2 2024?',
    description: 'Resolves YES if Starship completes one full orbit.',
    category: 'Tech',
    endDate: '2024-06-30T23:59:59Z',
    status: MarketStatus.DISPUTE_WINDOW,
    outcomes: ['YES', 'NO'],
    probabilities: [0.85, 0.15],
    volume: 50000,
    liquidity: 10000,
    poolBalance: { YES: 8500, NO: 1500 },
    oracleConfig: {
      primarySource: { id: 'o2', name: 'SpaceX Official', type: 'API', status: OracleStatus.VERIFIED, reportedValue: 'YES' },
      backupSources: [],
      resolutionCriteria: 'Official press release',
      disputeWindowHours: 24
    },
    resolutionHistory: [
        { step: 'LOCK', timestamp: Date.now() - 100000, details: 'Market closed' },
        { step: 'ORACLE_FETCH', timestamp: Date.now() - 50000, details: 'Oracle returned YES' }
    ],
    creatorId: 'system'
  }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [markets, setMarkets] = useState<Market[]>(INITIAL_MARKETS);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

  const connectWallet = () => {
    setUser(prev => ({
      ...prev,
      isConnected: true,
      walletAddress: '0x71C...9A23'
    }));
    addNotification('Wallet Connected', 'Successfully connected to Ethereum Mainnet', 'SUCCESS');
  };

  const addMarket = (market: Market) => {
    setMarkets(prev => [market, ...prev]);
    addNotification('Market Created', `"${market.title}" is now active`, 'SUCCESS');
  };

  const executeTrade = (marketId: string, outcome: 'YES' | 'NO', amount: number) => {
    if (user.balance < amount) {
      addNotification('Trade Failed', 'Insufficient funds', 'ERROR');
      return;
    }

    setMarkets(prev => prev.map(m => {
      if (m.id !== marketId) return m;

      // AMM Logic: CPMM (Constant Product Market Maker) simplified
      // k = yes_balance * no_balance
      // buying YES increases yes_balance (user puts money in), reduces no_balance (conceptually)
      // Actually, standard CPMM for prediction markets:
      // You buy shares. Price = pool[outcome] / (pool[YES] + pool[NO])
      
      // Simplified simulation for this UI:
      const totalPool = m.poolBalance.YES + m.poolBalance.NO;
      const shares = amount / m.probabilities[outcome === 'YES' ? 0 : 1];
      
      // Price Impact
      const impact = (amount / m.liquidity) * 0.2; 
      let newYesProb = m.probabilities[0];
      
      if (outcome === 'YES') {
        newYesProb = Math.min(0.99, newYesProb + impact);
      } else {
        newYesProb = Math.max(0.01, newYesProb - impact);
      }

      return {
        ...m,
        volume: m.volume + amount,
        probabilities: [newYesProb, 1 - newYesProb],
        poolBalance: {
           YES: outcome === 'YES' ? m.poolBalance.YES + amount : m.poolBalance.YES,
           NO: outcome === 'NO' ? m.poolBalance.NO + amount : m.poolBalance.NO
        }
      };
    }));

    setUser(prev => ({
      ...prev,
      balance: prev.balance - amount,
      portfolioValue: prev.portfolioValue + amount,
      trades: [{
        id: Math.random().toString(36),
        marketId,
        outcome,
        amount,
        shares: amount, // simplified
        price: 1, // simplified
        timestamp: Date.now(),
        type: 'BUY',
        userId: prev.id
      }, ...prev.trades]
    }));

    addNotification('Trade Executed', `Bought $${amount} of ${outcome}`, 'SUCCESS');
  };

  const updateMarketStatus = (marketId: string, status: MarketStatus) => {
    setMarkets(prev => prev.map(m => {
      if (m.id !== marketId) return m;
      return { 
        ...m, 
        status,
        resolutionHistory: [...m.resolutionHistory, {
            step: `STATUS_CHANGE`,
            timestamp: Date.now(),
            details: `Status changed to ${status}`
        }]
      };
    }));
  };

  const resolveMarket = (marketId: string, outcome: string) => {
    setMarkets(prev => prev.map(m => {
      if (m.id !== marketId) return m;
      return {
        ...m,
        status: MarketStatus.RESOLVED,
        resolutionValue: outcome,
        resolutionHistory: [...m.resolutionHistory, {
            step: 'RESOLVED',
            timestamp: Date.now(),
            details: `Market resolved to ${outcome}`
        }]
      };
    }));
    addNotification('Market Resolved', `Market resolved to ${outcome}`, 'INFO');
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <StoreContext.Provider value={{
      markets,
      user,
      notifications,
      addMarket,
      executeTrade,
      connectWallet,
      resolveMarket,
      updateMarketStatus,
      markNotificationRead
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