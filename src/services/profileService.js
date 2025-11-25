// Profile Service - Manages user profile data and calculations

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

class ProfileService {
    // Save profile to localStorage
    saveProfile(profileData) {
        const profile = {
            ...profileData,
            profileCompleted: this.isProfileComplete(profileData),
            updatedAt: new Date().toISOString()
        };

        if (!profile.createdAt) {
            profile.createdAt = new Date().toISOString();
        }

        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
        return profile;
    }

    // Load profile from localStorage
    loadProfile() {
        const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                console.error('Error parsing profile data:', error);
                return { ...DEFAULT_PROFILE };
            }
        }
        return { ...DEFAULT_PROFILE };
    }

    // Check if profile is complete (all mandatory fields filled)
    isProfileComplete(profile = null) {
        const data = profile || this.loadProfile();

        const mandatoryFields = [
            'name', 'age', 'gender', 'height', 'weight',
            'targetWeight', 'activityLevel', 'dietaryPreference'
        ];

        return mandatoryFields.every(field => {
            const value = data[field];
            return value !== '' && value !== null && value !== undefined;
        }) && data.healthGoals && data.healthGoals.length > 0;
    }

    // Calculate BMI
    calculateBMI(weight, height) {
        if (!weight || !height) return null;
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        return Math.round(bmi * 10) / 10;
    }

    // Get BMI category
    getBMICategory(bmi) {
        if (!bmi) return 'Unknown';
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    }

    // Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
    calculateBMR(weight, height, age, gender) {
        if (!weight || !height || !age || !gender) return null;

        let bmr;
        if (gender === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }

        return Math.round(bmr);
    }

    // Calculate Total Daily Energy Expenditure (TDEE)
    calculateTDEE(bmr, activityLevel) {
        if (!bmr || !activityLevel) return null;
        const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
        return Math.round(bmr * multiplier);
    }

    // Calculate recommended daily calories based on goals
    calculateRecommendedCalories(profile = null) {
        const data = profile || this.loadProfile();
        const { weight, height, age, gender, activityLevel, healthGoals } = data;

        const bmr = this.calculateBMR(weight, height, age, gender);
        if (!bmr) return null;

        const tdee = this.calculateTDEE(bmr, activityLevel);
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
    }

    // Get macronutrient recommendations
    getMacroRecommendations(calories, healthGoals = []) {
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
    }

    // Get profile summary for AI context
    getProfileSummary() {
        const profile = this.loadProfile();
        if (!this.isProfileComplete(profile)) {
            return 'User profile incomplete';
        }

        const bmi = this.calculateBMI(profile.weight, profile.height);
        const calories = this.calculateRecommendedCalories(profile);

        return `
User Profile:
- Name: ${profile.name}
- Age: ${profile.age}, Gender: ${profile.gender}
- Height: ${profile.height}cm, Weight: ${profile.weight}kg, Target: ${profile.targetWeight}kg
- BMI: ${bmi} (${this.getBMICategory(bmi)})
- Activity Level: ${profile.activityLevel.replace('_', ' ')}
- Health Goals: ${profile.healthGoals.join(', ').replace(/_/g, ' ')}
- Dietary Preference: ${profile.dietaryPreference}
- Allergies: ${profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None'}
- Medical Conditions: ${profile.medicalConditions.length > 0 ? profile.medicalConditions.join(', ') : 'None'}
- Recommended Daily Calories: ${calories?.recommended || 'N/A'} kcal
- Sleep Schedule: ${profile.sleepTime} - ${profile.wakeTime}
- Water Goal: ${profile.waterIntakeGoal}L/day
    `.trim();
    }

    // Clear profile data
    clearProfile() {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
    }

    // Export profile data
    exportProfile() {
        return this.loadProfile();
    }
}

// Export singleton instance
export const profileService = new ProfileService();
