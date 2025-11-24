import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
}

export const isConfigured = () => !!API_KEY;

export const sendMessage = async (history, userMessage, userStats) => {
    if (!model) throw new Error("Gemini API Key is missing");

    const systemContext = `
    You are an expert Personal Health Coach AI. 
    Your goal is to provide motivating, scientifically accurate, and personalized health advice.
    
    User's Current Stats:
    - Steps: ${userStats.steps}
    - Calories Burned: ${userStats.calories}
    - Water Intake: ${userStats.water}L
    - Sleep: ${userStats.sleep}
    
    Keep your responses concise, encouraging, and actionable.
  `;

    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: systemContext }],
            },
            {
                role: "model",
                parts: [{ text: "Understood. I am ready to act as your personal health coach with the provided context." }],
            },
            ...history.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }))
        ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
};

export const generatePlans = async (userStats) => {
    if (!model) throw new Error("Gemini API Key is missing");

    const prompt = `
    Generate a personalized daily workout plan and a daily meal plan based on these stats:
    - Activity Level: ${userStats.steps > 8000 ? 'Active' : 'Sedentary'}
    - Sleep Quality: ${parseInt(userStats.sleep) > 7 ? 'Good' : 'Needs Improvement'}
    
    Return ONLY a valid JSON object with this structure:
    {
      "workout": [
        { "name": "Exercise Name", "meta": "Duration • Intensity", "desc": "Brief description" }
      ],
      "diet": [
        { "name": "Meal Name", "meta": "Calories • Type", "desc": "Ingredients" }
      ]
    }
    Do not include markdown formatting or code blocks. Just the raw JSON.
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
        // Clean up any potential markdown code blocks if the model adds them
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse AI response:", text);
        throw new Error("Failed to generate plans");
    }
};
