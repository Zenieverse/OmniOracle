export enum MarketStatus {
  ACTIVE = 'Active',
  LOCKED = 'Locked',
  FETCHING_ORACLES = 'FetchingOracles',
  DISPUTE_WINDOW = 'DisputeWindow',
  RESOLVED = 'Resolved',
  CANCELLED = 'Cancelled'
}

// Daml specific types
export type Party = string;
export type ContractId<T> = string;
export type ISO8601Date = string;

export interface Template<T> {
  contractId: ContractId<T>;
  payload: T;
  signatories: Party[];
  observers: Party[];
}

export enum OracleStatus {
  PENDING = 'Pending',
  VERIFIED = 'Verified',
  CONFLICT = 'Conflict',
  REJECTED = 'Rejected'
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

// Corresponds to 'template Market' in Daml
export interface Market {
  operator: Party;
  title: string;
  description: string;
  category: string;
  endDate: ISO8601Date;
  status: MarketStatus;
  outcomes: string[];
  probabilities: number[];
  volume: number;
  liquidity: number;
  poolBalance: { YES: number; NO: number };
  oracleConfig: {
    primarySource: OracleSource;
    resolutionCriteria: string;
    disputeWindowHours: number;
  };
  resolutionValue?: string;
}

// Corresponds to 'template Trade' in Daml
export interface Trade {
  marketId: ContractId<Market>;
  buyer: Party;
  outcome: string;
  amount: number;
  shares: number;
  price: number;
  timestamp: string;
  type: 'BUY' | 'SELL';
}

export interface UserProfile {
  party: Party;
  username: string;
  isConnected: boolean;
  balance: number; // In a real app, this would be holdings of an Asset contract
  reputation: number;
  portfolioValue: number;
  contractIds: {
    userContract?: ContractId<any>;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  timestamp: number;
}