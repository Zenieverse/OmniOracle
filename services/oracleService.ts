import { OracleSource, OracleStatus } from "../types";

// Simulates fetching data from external APIs
export const fetchOracleData = async (source: OracleSource): Promise<OracleSource> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate real-world randomness and occasional failures/conflicts
      // For demo purposes, we heavily bias towards success and matching the generated market prompt
      const isSuccess = Math.random() > 0.05; 
      
      resolve({
        ...source,
        status: isSuccess ? OracleStatus.VERIFIED : OracleStatus.CONFLICT,
        reportedValue: isSuccess ? (Math.random() > 0.3 ? 'YES' : 'NO') : undefined, // Bias towards YES for optimistic demo
        timestamp: Date.now()
      });
    }, 1500); // 1.5s latency to match UI animation
  });
};

export const detectAnomalies = (sources: OracleSource[]): boolean => {
  if (sources.length < 2) return false;
  
  // Check if all reported values match
  const values = sources
    .filter(s => s.status === OracleStatus.VERIFIED && s.reportedValue)
    .map(s => s.reportedValue);

  if (values.length === 0) return true; // No successful reads is an anomaly
  return !values.every(v => v === values[0]);
};