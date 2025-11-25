import { createSlice } from '@reduxjs/toolkit';

const PROFILE_STORAGE_KEY = 'userProfile';

// Activity level multipliers for calorie calculation (Harris-Benedict)
const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9
};

// Default profile structure
const DEFAULT_PROFILE = {
    // Personal Info
    name: '',
    age: '',
    gender: '',

    // Physical Metrics
    height: '', // in cm
    weight: '', // in kg
    targetWeight: '', // in kg

    // Activity & Goals
    activityLevel: '',
    healthGoals: [],

    // Dietary Preferences
    dietaryPreference: '',
    allergies: [],
    restrictions: [],

    // Medical (optional)
    medicalConditions: [],

    // Lifestyle
    sleepTime: '',
    wakeTime: '',
    waterIntakeGoal: 2.5, // liters

    // Metadata
    profileCompleted: false,
    createdAt: null,
    updatedAt: null
};

// Load initial state from localStorage
const loadInitialState = () => {
    try {
        const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading profile from localStorage:', error);
    }
    return { ...DEFAULT_PROFILE };
};

// Utility functions for calculations
export const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10;
};

export const getBMICategory = (bmi) => {
    if (!bmi) return 'Unknown';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
};

export const calculateBMR = (weight, height, age, gender) => {
    if (!weight || !height || !age || !gender) return null;

    let bmr;
    if (gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    return Math.round(bmr);
};

export const calculateTDEE = (bmr, activityLevel) => {
    if (!bmr || !activityLevel) return null;
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
    return Math.round(bmr * multiplier);
};

export const calculateRecommendedCalories = (profile) => {
    const { weight, height, age, gender, activityLevel, healthGoals } = profile;

    const bmr = calculateBMR(weight, height, age, gender);
    if (!bmr) return null;

    const tdee = calculateTDEE(bmr, activityLevel);
    if (!tdee) return null;

    // Adjust based on primary health goal
    let calorieAdjustment = 0;

    if (healthGoals.includes('weight_loss')) {
        calorieAdjustment = -500; // 500 calorie deficit for ~0.5kg/week loss
    } else if (healthGoals.includes('muscle_gain')) {
        calorieAdjustment = 300; // 300 calorie surplus for muscle gain
    } else if (healthGoals.includes('maintain_weight')) {
        calorieAdjustment = 0;
    }

    return {
        bmr,
        tdee,
        recommended: tdee + calorieAdjustment,
        adjustment: calorieAdjustment
    };
};

export const getMacroRecommendations = (calories, healthGoals = []) => {
    if (!calories) return null;

    let proteinPercent = 0.30;
    let carbPercent = 0.40;
    let fatPercent = 0.30;

    // Adjust macros based on goals
    if (healthGoals.includes('muscle_gain')) {
        proteinPercent = 0.35;
        carbPercent = 0.40;
        fatPercent = 0.25;
    } else if (healthGoals.includes('weight_loss')) {
        proteinPercent = 0.35;
        carbPercent = 0.30;
        fatPercent = 0.35;
    }

    return {
        protein: Math.round((calories * proteinPercent) / 4), // 4 cal/g
        carbs: Math.round((calories * carbPercent) / 4), // 4 cal/g
        fats: Math.round((calories * fatPercent) / 9) // 9 cal/g
    };
};

const userSlice = createSlice({
    name: 'user',
    initialState: loadInitialState(),
    reducers: {
        updateProfile: (state, action) => {
            const profileData = action.payload;

            // Check if profile is complete
            const mandatoryFields = ['name', 'age', 'gender', 'height', 'weight', 'targetWeight', 'activityLevel', 'dietaryPreference'];
            const isComplete = mandatoryFields.every(field => {
                const value = profileData[field];
                return value !== '' && value !== null && value !== undefined;
            }) && profileData.healthGoals && profileData.healthGoals.length > 0;

            Object.assign(state, profileData);
            state.profileCompleted = isComplete;
            state.updatedAt = new Date().toISOString();

            if (!state.createdAt) {
                state.createdAt = new Date().toISOString();
            }

            // Save to localStorage
            localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state));
        },

        clearProfile: (state) => {
            Object.assign(state, DEFAULT_PROFILE);
            localStorage.removeItem(PROFILE_STORAGE_KEY);
        },

        loadProfile: (state) => {
            const loaded = loadInitialState();
            Object.assign(state, loaded);
        }
    }
});

export const { updateProfile, clearProfile, loadProfile } = userSlice.actions;
export default userSlice.reducer;
