import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface NutrientData {
  name: string;
  amount: number; // in grams or mg
  unit: string;
  percentage: number; // proportion of total weight or daily value? Let's stick to proportion of weight for the chart
}

export interface FruitNutrients {
  fruitName: string;
  servingSize: string; // e.g., "100g"
  calories: number;
  macros: NutrientData[];
  micros: NutrientData[];
  description: string;
  colorTheme: string; // A hex color or tailwind class for the fruit
}

export async function getFruitNutrients(fruitName: string): Promise<FruitNutrients> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide detailed nutritional information for ${fruitName} per 100g serving. 
    Include macronutrients (Carbs, Protein, Fat, Fiber, Sugar) and key micronutrients (Vitamins, Minerals).
    Return the data in a structured JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fruitName: { type: Type.STRING },
          servingSize: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          description: { type: Type.STRING },
          colorTheme: { type: Type.STRING, description: "A vibrant hex color representing this fruit" },
          macros: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                percentage: { type: Type.NUMBER, description: "Percentage of total weight (0-100)" }
              },
              required: ["name", "amount", "unit", "percentage"]
            }
          },
          micros: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                percentage: { type: Type.NUMBER, description: "Percentage of Daily Value (0-100)" }
              },
              required: ["name", "amount", "unit", "percentage"]
            }
          }
        },
        required: ["fruitName", "servingSize", "calories", "macros", "micros", "description", "colorTheme"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as FruitNutrients;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Could not fetch nutrient data");
  }
}
