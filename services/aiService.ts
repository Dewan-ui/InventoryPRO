import { GoogleGenAI, Type } from "@google/genai";
import { InventoryRecord } from "../types";

/**
 * AI Service for generating intelligent inventory insights.
 * Uses Google Gemini API (gemini-3-pro-preview) to analyze stock levels and provide actionable recommendations.
 */
export const getInventoryInsights = async (data: InventoryRecord[]): Promise<string[] | null> => {
  // Use the API key exclusively from the environment variable process.env.API_KEY as per guidelines
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || data.length === 0) {
    console.debug("AI Insights: API key missing or no data available.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare a summary of the most recent data for the model
    const recentData = data.slice(-30).map(d => 
      `${d.date}: ${d.branchName} - ${d.deviceName} (Current: ${d.currentCount}, In: ${d.stockIn}, Out: ${d.stockOut})`
    ).join('\n');

    // Use gemini-3-pro-preview for complex reasoning and data analysis tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyze the following inventory data trends and provide exactly 3 professional, actionable insights for optimization:\n\n${recentData}`,
      config: {
        systemInstruction: "You are a senior supply chain analyst. Provide concise, data-driven, and high-impact strategic insights.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: { 
                type: Type.STRING,
                description: "A professional inventory management insight."
              },
              description: "A list of 3 strategic insights."
            }
          },
          required: ["insights"]
        }
      }
    });

    // Access the .text property directly as per the @google/genai SDK guidelines
    const jsonStr = response.text;
    if (!jsonStr) return null;

    const parsed = JSON.parse(jsonStr);
    return parsed.insights || null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
