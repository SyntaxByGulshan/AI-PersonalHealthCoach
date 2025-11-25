import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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

export const generateWeeklyPlan = async (userProfile) => {
  if (!model) throw new Error("Gemini API Key is missing");

  const prompt = `
    Generate a comprehensive weekly health plan for a user with these stats:
    - Age: ${userProfile.age || '25'}
    - Weight: ${userProfile.weight || '70'}kg
    - Height: ${userProfile.height || '170'}cm
    - Goal: ${userProfile.goal || 'General Fitness'}
    - Activity Level: ${userProfile.activityLevel || 'Moderate'}

    Return ONLY a valid JSON object with this exact structure:
    {
      "diet": {
        "Monday": {
          "Breakfast": { "name": "...", "calories": "350 kcal", "desc": "..." },
          "Lunch": { "name": "...", "calories": "...", "desc": "..." },
          "Dinner": { "name": "...", "calories": "...", "desc": "..." },
          "Snack": { "name": "...", "calories": "...", "desc": "..." }
        },
        "Tuesday": { ... },
        "Wednesday": { ... },
        "Thursday": { ... },
        "Friday": { ... },
        "Saturday": { ... },
        "Sunday": { ... }
      },
      "workout": {
        "Monday": {
          "focus": "...",
          "exercises": [
            { "name": "...", "sets": "...", "reps": "...", "desc": "..." }
          ]
        },
        "Tuesday": { ... },
        "Wednesday": { ... },
        "Thursday": { ... },
        "Friday": { ... },
        "Saturday": { ... },
        "Sunday": { ... }
      },
      "habits": [
        { "id": "water", "name": "Drink Water", "points": 10, "desc": "..." },
        { "id": "sleep", "name": "Sleep Well", "points": 10, "desc": "..." },
        { "id": "steps", "name": "Walk Steps", "points": 15, "desc": "..." },
        { "id": "mindfulness", "name": "Meditation", "points": 10, "desc": "..." }
      ],
      "stepGoal": 10000
    }
    
    Ensure the plan is varied and scientifically sound.
    For habits, generate 4-6 daily habits. Use simple IDs like 'water', 'sleep', 'steps', 'diet', 'meditation', 'reading'.
    Do not include markdown formatting or code blocks. Just the raw JSON.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    throw new Error("Failed to generate weekly plan");
  }
};

// Deprecated: kept for backwards compatibility
export const generatePlans = async (userStats) => {
  const profile = {
    age: 25,
    weight: 70,
    height: 170,
    goal: 'General Fitness',
    activityLevel: userStats.steps > 8000 ? 'Active' : 'Moderate'
  };
  return await generateWeeklyPlan(profile);
};
