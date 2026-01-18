
import { GoogleGenAI } from "@google/genai";
import { InventoryRecord } from "../types";

// Note: process.env.API_KEY is handled by the environment
const ai = new GoogleGenAI({ apiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.API_KEY });

export const getInventoryInsights = async (data: InventoryRecord[]) => {
  if (!data || data.length === 0) return "No data available for analysis.";

  try {
    // We summarize the data to keep the prompt efficient
    const summary = data.slice(-20).map(d => 
      `${d.branchName}: ${d.deviceName} (In: ${d.stockIn}, Out: ${d.stockOut}, Current: ${d.currentCount})`
    ).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a senior supply chain consultant. Analyze this inventory data and provide 3 concise, high-impact bullet points regarding stock velocity, risks, or optimization opportunities. Keep it professional and under 60 words.
      
      DATA:
      ${summary}`,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to generate AI insights at this time. Please check your connection.";
  }
};
