import { Market, MarketStatus, OracleStatus, Party, Template, Trade } from "../types";

// Simulation of the Canton Ledger JSON API
// In a real app, this would use @daml/ledger or fetch() to localhost:7575

const DELAY_MS = 800; // Simulate network latency across the Global Synchronizer

export const cantonApi = {
  // Query the Active Contract Set (ACS)
  query: async <T>(templateId: string): Promise<Template<T>[]> => {
    // This mocks a query against the Participant Query Store (PQS)
    return new Promise(resolve => {
        setTimeout(() => {
            const stored = localStorage.getItem(`canton_acs_${templateId}`);
            resolve(stored ? JSON.parse(stored) : []);
        }, DELAY_MS);
    });
  },

  // Submit a Command to the Ledger
  create: async <T>(templateId: string, payload: T, signatories: Party[]): Promise<Template<T>> => {
      return new Promise(resolve => {
          setTimeout(() => {
              const contractId = `${templateId}::${Math.random().toString(36).substr(2, 9)}`;
              const contract: Template<T> = {
                  contractId,
                  payload,
                  signatories,
                  observers: []
              };
              
              // Persist to mock ledger
              const existing = JSON.parse(localStorage.getItem(`canton_acs_${templateId}`) || '[]');
              localStorage.setItem(`canton_acs_${templateId}`, JSON.stringify([contract, ...existing]));
              
              resolve(contract);
          }, DELAY_MS);
      });
  },

  // Exercise a Choice on a Contract
  exercise: async <T, R>(contractId: string, choice: string, args: any): Promise<R> => {
      return new Promise(resolve => {
        setTimeout(() => {
            // In a real Daml ledger, this would trigger business logic.
            // Here we just acknowledge the command.
            console.log(`[Ledger] Exercised choice ${choice} on ${contractId} with args:`, args);
            resolve({ status: "success", transactionId: "tx_" + Date.now() } as any);
        }, DELAY_MS);
      });
  }
};