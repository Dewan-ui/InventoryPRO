import { GoogleGenerativeAI } from "@google/generative-ai";
import { InventoryRecord } from "../types";

/**
 * AI Service for generating intelligent inventory insights.
 * Uses Google Gemini API (gemini-1.5-pro) to analyze stock levels and provide actionable recommendations.
 */
export const getInventoryInsights = async (data: InventoryRecord[]): Promise<string[] | null> => {
  // Use the API key exclusively from the environment variable process.env.API_KEY as per guidelines
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || data.length === 0) {
    console.debug("AI Insights: API key missing or no data available.");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      systemInstruction: "You are a senior supply chain analyst. Provide concise, data-driven, and high-impact strategic insights."
    });
    
    // Prepare a summary of the most recent data for the model
    const recentData = data.slice(-30).map(d => 
      `${d.date}: ${d.branchName} - ${d.deviceName} (Current: ${d.currentCount}, In: ${d.stockIn}, Out: ${d.stockOut})`
    ).join('\n');

    const prompt = `Analyze the following inventory data trends and provide exactly 3 professional, actionable insights for optimization:\n\n${recentData}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) return null;

    // Try to parse as JSON, fallback to splitting by newlines if not structured
    try {
      const parsed = JSON.parse(text);
      return parsed.insights || null;
    } catch {
      // If not JSON, split by newlines and take first 3
      const insights = text.split('\n').filter(line => line.trim()).slice(0, 3);
      return insights.length > 0 ? insights : null;
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
