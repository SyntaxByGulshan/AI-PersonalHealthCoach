import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { generateWeeklyPlan } from '../../services/gemini';

const STORAGE_KEY = 'weeklyHealthPlan';
const WEEK_KEY = 'currentWeekStart';

// Get the start of the current week (Monday)
const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday as start of week
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
};

// Check if we're in a new week
const isNewWeek = () => {
    const currentWeekStart = getWeekStart();
    const savedWeekStart = localStorage.getItem(WEEK_KEY);
    return !savedWeekStart || savedWeekStart !== currentWeekStart;
};

// Default plans as fallback
const DEFAULT_PLAN = {
    diet: {
        Monday: {
            Breakfast: { name: 'Oatmeal & Berries', calories: '350 kcal', desc: 'Rolled oats, blueberries, honey' },
            Lunch: { name: 'Grilled Chicken Salad', calories: '450 kcal', desc: 'Chicken breast, greens, avocado' },
            Dinner: { name: 'Salmon & Quinoa', calories: '500 kcal', desc: 'Baked salmon, quinoa, broccoli' },
            Snack: { name: 'Greek Yogurt', calories: '150 kcal', desc: 'Plain yogurt, almonds' }
        },
        Tuesday: {
            Breakfast: { name: 'Egg White Omelette', calories: '300 kcal', desc: 'Egg whites, spinach, tomato' },
            Lunch: { name: 'Turkey Wrap', calories: '400 kcal', desc: 'Turkey, whole wheat wrap, veggies' },
            Dinner: { name: 'Chicken Stir Fry', calories: '480 kcal', desc: 'Chicken, mixed vegetables, rice' },
            Snack: { name: 'Apple & Peanut Butter', calories: '180 kcal', desc: 'Sliced apple, natural PB' }
        },
        Wednesday: {
            Breakfast: { name: 'Protein Smoothie', calories: '320 kcal', desc: 'Banana, protein powder, almond milk' },
            Lunch: { name: 'Tuna Bowl', calories: '420 kcal', desc: 'Tuna, brown rice, cucumber' },
            Dinner: { name: 'Lean Beef & Sweet Potato', calories: '520 kcal', desc: 'Ground beef, sweet potato, greens' },
            Snack: { name: 'Mixed Nuts', calories: '160 kcal', desc: 'Almonds, walnuts, cashews' }
        },
        Thursday: {
            Breakfast: { name: 'Avocado Toast', calories: '340 kcal', desc: 'Whole grain bread, avocado, egg' },
            Lunch: { name: 'Quinoa Buddha Bowl', calories: '440 kcal', desc: 'Quinoa, chickpeas, tahini' },
            Dinner: { name: 'Baked Cod & Asparagus', calories: '460 kcal', desc: 'Cod fillet, asparagus, lemon' },
            Snack: { name: 'Protein Bar', calories: '200 kcal', desc: 'High-protein energy bar' }
        },
        Friday: {
            Breakfast: { name: 'Berry Parfait', calories: '330 kcal', desc: 'Yogurt, granola, mixed berries' },
            Lunch: { name: 'Chicken Caesar Salad', calories: '410 kcal', desc: 'Grilled chicken, romaine, light dressing' },
            Dinner: { name: 'Shrimp Pasta', calories: '490 kcal', desc: 'Whole wheat pasta, shrimp, marinara' },
            Snack: { name: 'Cottage Cheese', calories: '120 kcal', desc: 'Low-fat cottage cheese, berries' }
        },
        Saturday: {
            Breakfast: { name: 'Pancakes & Fruit', calories: '380 kcal', desc: 'Protein pancakes, strawberries' },
            Lunch: { name: 'Veggie Burger', calories: '430 kcal', desc: 'Plant-based patty, whole wheat bun' },
            Dinner: { name: 'Steak & Veggies', calories: '540 kcal', desc: 'Sirloin steak, roasted vegetables' },
            Snack: { name: 'Dark Chocolate', calories: '140 kcal', desc: '70% dark chocolate squares' }
        },
        Sunday: {
            Breakfast: { name: 'French Toast', calories: '360 kcal', desc: 'Whole wheat bread, cinnamon, maple syrup' },
            Lunch: { name: 'Sushi Bowl', calories: '450 kcal', desc: 'Salmon, rice, edamame, seaweed' },
            Dinner: { name: 'Chicken Curry', calories: '510 kcal', desc: 'Chicken, curry sauce, brown rice' },
            Snack: { name: 'Hummus & Veggies', calories: '130 kcal', desc: 'Hummus, carrots, celery' }
        }
    },
    workout: {
        Monday: {
            focus: 'Chest & Triceps',
            exercises: [
                { name: 'Push-ups', sets: '3', reps: '12-15', desc: 'Keep core tight, chest to floor' },
                { name: 'Dumbbell Bench Press', sets: '3', reps: '10-12', desc: 'Control the weight down' },
                { name: 'Tricep Dips', sets: '3', reps: '12-15', desc: 'Use a chair or bench' },
                { name: 'Plank', sets: '3', reps: '45s', desc: 'Hold position, don\'t sag hips' }
            ]
        },
        Tuesday: {
            focus: 'Back & Biceps',
            exercises: [
                { name: 'Pull-ups (or Rows)', sets: '3', reps: '8-10', desc: 'Full range of motion' },
                { name: 'Dumbbell Rows', sets: '3', reps: '10-12', desc: 'Keep back flat' },
                { name: 'Bicep Curls', sets: '3', reps: '12-15', desc: 'Squeeze at the top' },
                { name: 'Superman', sets: '3', reps: '15', desc: 'Lift arms and legs simultaneously' }
            ]
        },
        Wednesday: {
            focus: 'Active Recovery',
            exercises: [
                { name: 'Light Jog/Walk', sets: '1', reps: '30m', desc: 'Keep heart rate moderate' },
                { name: 'Stretching Routine', sets: '1', reps: '15m', desc: 'Focus on tight areas' },
                { name: 'Yoga Flow', sets: '1', reps: '20m', desc: 'Basic sun salutations' }
            ]
        },
        Thursday: {
            focus: 'Legs & Shoulders',
            exercises: [
                { name: 'Squats', sets: '4', reps: '12-15', desc: 'Knees behind toes' },
                { name: 'Lunges', sets: '3', reps: '10/leg', desc: 'Keep torso upright' },
                { name: 'Shoulder Press', sets: '3', reps: '10-12', desc: 'Press straight up' },
                { name: 'Calf Raises', sets: '3', reps: '20', desc: 'Full extension' }
            ]
        },
        Friday: {
            focus: 'Full Body HIIT',
            exercises: [
                { name: 'Burpees', sets: '3', reps: '15', desc: 'Explosive movement' },
                { name: 'Mountain Climbers', sets: '3', reps: '40s', desc: 'Keep hips low' },
                { name: 'Jump Squats', sets: '3', reps: '15', desc: 'Soft landing' },
                { name: 'Russian Twists', sets: '3', reps: '20/side', desc: 'Feet off ground if possible' }
            ]
        },
        Saturday: {
            focus: 'Cardio & Core',
            exercises: [
                { name: 'Running/Cycling', sets: '1', reps: '45m', desc: 'Steady state cardio' },
                { name: 'Crunches', sets: '3', reps: '20', desc: 'Engage core' },
                { name: 'Leg Raises', sets: '3', reps: '15', desc: 'Control the descent' },
                { name: 'Bicycle Crunches', sets: '3', reps: '20/side', desc: 'Elbow to opposite knee' }
            ]
        },
        Sunday: {
            focus: 'Rest Day',
            exercises: [
                { name: 'Rest', sets: '1', reps: '0', desc: 'Take a break, you earned it!' },
                { name: 'Light Walk', sets: '1', reps: '20m', desc: 'Optional active recovery' }
            ]
        }
    },
    habits: [
        { id: 'water', name: 'Drink 8 glasses of water', points: 15, desc: 'Stay hydrated throughout the day' },
        { id: 'wakeup', name: 'Wake up before 7 AM', points: 10, desc: 'Start your day early and energized' },
        { id: 'sleep', name: 'Sleep by 10 PM', points: 10, desc: 'Get quality rest for recovery' },
        { id: 'steps', name: '10,000 steps today', points: 15, desc: 'Meet your daily step goal' },
        { id: 'meditation', name: '5-min meditation', points: 10, desc: 'Practice mindfulness and reduce stress' },
        { id: 'reading', name: 'Read for 20 minutes', points: 10, desc: 'Learn something new every day' }
    ],
    stepGoal: 10000
};

// Load initial state from localStorage
const loadInitialState = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return {
                plan: JSON.parse(stored),
                weekStart: localStorage.getItem(WEEK_KEY) || getWeekStart(),
                loading: false,
                error: null,
                lastGenerated: null
            };
        }
    } catch (error) {
        console.error('Error loading plan from localStorage:', error);
    }
    return {
        plan: DEFAULT_PLAN,
        weekStart: getWeekStart(),
        loading: false,
        error: null,
        lastGenerated: null
    };
};

// Async thunk for generating new weekly plan
export const generateNewPlan = createAsyncThunk(
    'weeklyPlan/generateNew',
    async (profile, { rejectWithValue }) => {
        try {
            const aiPlan = await generateWeeklyPlan(profile);

            // Merge with defaults in case AI response is incomplete
            const plan = {
                diet: aiPlan.diet || DEFAULT_PLAN.diet,
                workout: aiPlan.workout || DEFAULT_PLAN.workout,
                habits: aiPlan.habits || DEFAULT_PLAN.habits,
                stepGoal: aiPlan.stepGoal || DEFAULT_PLAN.stepGoal
            };

            return { plan, success: true };
        } catch (error) {
            console.warn('AI plan generation failed, using default plan:', error.message);
            // Fall back to defaults
            return { plan: DEFAULT_PLAN, success: false, error: error.message };
        }
    }
);

const weeklyPlanSlice = createSlice({
    name: 'weeklyPlan',
    initialState: loadInitialState(),
    reducers: {
        loadPlan: (state) => {
            const loaded = loadInitialState();
            Object.assign(state, loaded);
        },

        updatePlan: (state, action) => {
            state.plan = action.payload;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.plan));
            localStorage.setItem(WEEK_KEY, getWeekStart());
        },

        checkWeekReset: (state) => {
            if (isNewWeek()) {
                state.weekStart = getWeekStart();
                localStorage.setItem(WEEK_KEY, state.weekStart);
                // Note: Actual plan regeneration should be triggered separately
                return true;
            }
            return false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(generateNewPlan.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(generateNewPlan.fulfilled, (state, action) => {
                state.loading = false;
                state.plan = action.payload.plan;
                state.lastGenerated = new Date().toISOString();
                state.weekStart = getWeekStart();

                // Save to localStorage
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state.plan));
                localStorage.setItem(WEEK_KEY, state.weekStart);
            })
            .addCase(generateNewPlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                // Fall back to default plan
                state.plan = DEFAULT_PLAN;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state.plan));
            });
    }
});

export const { loadPlan, updatePlan, checkWeekReset } = weeklyPlanSlice.actions;
export default weeklyPlanSlice.reducer;
export { DEFAULT_PLAN };
