import { GoogleGenAI, Type } from "@google/genai";
import { Market, MarketStatus, OracleStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MARKET_CREATOR_INSTRUCTION = `
You are an expert Prediction Market Architect for the Canton Network. 
Convert user prompts into precise market specifications (Daml Template arguments).
Ensure resolution criteria is unambiguous.
`;

export const generateMarketFromPrompt = async (prompt: string): Promise<Partial<Market>> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: MARKET_CREATOR_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            endDate: { type: Type.STRING },
            initialProbability: { type: Type.NUMBER },
            resolutionCriteria: { type: Type.STRING },
            oracleName: { type: Type.STRING },
            oracleUrl: { type: Type.STRING },
          },
          required: ["title", "description", "category", "endDate", "initialProbability", "resolutionCriteria", "oracleName"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    const yesProb = data.initialProbability || 0.5;

    return {
      title: data.title,
      description: data.description,
      category: data.category,
      endDate: data.endDate,
      status: MarketStatus.ACTIVE,
      outcomes: ["YES", "NO"],
      probabilities: [yesProb, 1 - yesProb],
      volume: 0,
      liquidity: 1000,
      poolBalance: { YES: 1000 * yesProb, NO: 1000 * (1 - yesProb) },
      oracleConfig: {
        primarySource: {
          id: 'ai-gen-1',
          name: data.oracleName,
          type: 'API',
          url: data.oracleUrl,
          status: OracleStatus.PENDING
        },
        resolutionCriteria: data.resolutionCriteria,
        disputeWindowHours: 24
      }
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate market structure.");
  }
};

export const analyzeMarket = async (market: Market): Promise<{text: string, sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL'}> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze: "${market.title}". 
      Context: ${market.description}. 
      Current YES Prob: ${(market.probabilities[0] * 100).toFixed(1)}%.
      
      Return JSON with 'text' (30 words max insight) and 'sentiment' (BULLISH/BEARISH/NEUTRAL).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            sentiment: { type: Type.STRING, enum: ["BULLISH", "BEARISH", "NEUTRAL"] }
          },
          required: ["text", "sentiment"]
        }
      }
    });
    return JSON.parse(response.text || `{"text": "Analysis unavailable.", "sentiment": "NEUTRAL"}`);
  } catch (e) {
    return { text: "AI Analysis offline.", sentiment: "NEUTRAL" };
  }
};