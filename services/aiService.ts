
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryRecord } from "../types";

export const getInventoryInsights = async (data: InventoryRecord[]): Promise<string[] | null> => {
  // Use process.env.API_KEY exclusively as per Gemini API guidelines
  if (!process.env.API_KEY || data.length === 0) {
    console.debug("AI Insights: API key missing or no data available.");
    return null;
  }

  try {
    // Creating instance right before call using process.env.API_KEY directly
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const recentData = data.slice(-30).map(d => 
      `${d.date}: ${d.branchName} - ${d.deviceName} (Current: ${d.currentCount}, In: ${d.stockIn}, Out: ${d.stockOut})`
    ).join('\n');

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyze the following inventory data trends and provide exactly 3 professional, actionable insights for optimization:\n\n${recentData}`,
      config: {
        systemInstruction: "You are a senior supply chain analyst. Provide concise, data-driven, and high-impact strategic insights. Format response as JSON.",
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

    // response.text is a property, not a method
    const jsonStr = response.text;
    if (!jsonStr) return null;

    const parsed = JSON.parse(jsonStr.trim());
    return parsed.insights || null;
  } catch (error) {
    console.error("Gemini AI Insights Error:", error);
    return null;
  }
};
