export enum MarketStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED', // Trading stopped, waiting for oracle
  FETCHING_ORACLES = 'FETCHING_ORACLES',
  DISPUTE_WINDOW = 'DISPUTE_WINDOW',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED'
}

export enum OutcomeType {
  BINARY = 'BINARY', // YES/NO
  MULTIPLE = 'MULTIPLE',
}

export enum OracleStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  CONFLICT = 'CONFLICT',
  REJECTED = 'REJECTED'
}

export interface OracleSource {
  id: string;
  name: string;
  type: 'API' | 'HUMAN_VALIDATOR' | 'AI_ANALYSIS';
  url?: string;
  status: OracleStatus;
  reportedValue?: string;
  timestamp?: number;
}

export interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  endDate: string; // ISO Date
  status: MarketStatus;
  outcomes: string[];
  probabilities: number[];
  volume: number;
  liquidity: number;
  poolBalance: { YES: number; NO: number }; // For AMM k=x*y
  oracleConfig: {
    primarySource: OracleSource;
    backupSources: OracleSource[];
    resolutionCriteria: string;
    disputeWindowHours: number;
  };
  resolutionValue?: string;
  resolutionHistory: {
    step: string;
    timestamp: number;
    details: string;
  }[];
  creatorId: string;
}

export interface Trade {
  id: string;
  marketId: string;
  outcome: string; // 'YES' | 'NO'
  amount: number; // USDC amount
  shares: number; // Number of shares bought
  price: number; // Avg price per share
  timestamp: number;
  type: 'BUY' | 'SELL';
  userId: string;
}

export interface UserProfile {
  id: string;
  username: string;
  walletAddress?: string;
  isConnected: boolean;
  balance: number;
  reputation: number; // 0-1000
  badges: string[];
  portfolioValue: number;
  trades: Trade[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  timestamp: number;
}