import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'progressData';
const DIET_PROGRESS_KEY = 'dietProgress';
const WORKOUT_PROGRESS_KEY = 'weeklyWorkoutCompletion';

// Points configuration
const POINTS_CONFIG = {
    diet: {
        completed: 10,
        skipped: -5
    },
    workout: {
        completed: 15,
        skipped: -5
    },
    stepsGoalBonus: 20
};

// Get today's date key
const getTodayKey = () => {
    return new Date().toISOString().split('T')[0];
};

// Get current week's Monday
const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
};

// Get all days of current week
const getWeekDays = () => {
    const weekStart = new Date(getWeekStart());
    const days = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
};

// Load initial state from localStorage
const loadInitialState = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            const currentWeek = getWeekStart();

            // Reset if it's a new week
            if (data.weekStart !== currentWeek) {
                return createFreshWeekState();
            }
            return data;
        }
    } catch (error) {
        console.error('Error loading progress from localStorage:', error);
    }

    return createFreshWeekState();
};

const createFreshWeekState = () => {
    const weekDays = getWeekDays();
    const dailyPoints = {};

    weekDays.forEach(day => {
        dailyPoints[day] = {
            diet: 0,
            workout: 0,
            habits: 0,
            steps: 0,
            total: 0
        };
    });

    return {
        weekStart: getWeekStart(),
        dailyPoints,
        weeklyTotal: 0,
        streaks: {
            current: 0,
            longest: 0
        },
        weeklyCompletion: {
            diet: 0,
            workout: 0,
            habits: 0,
            steps: 0
        },
        history: [] // Last 4 weeks
    };
};

const progressSlice = createSlice({
    name: 'progress',
    initialState: loadInitialState(),
    reducers: {
        loadProgress: (state) => {
            const loaded = loadInitialState();
            Object.assign(state, loaded);
        },

        trackDietCompletion: (state, action) => {
            const { day, mealType, completed } = action.payload;
            const today = day || getTodayKey();

            if (!state.dailyPoints[today]) {
                state.dailyPoints[today] = { diet: 0, workout: 0, habits: 0, steps: 0, total: 0 };
            }

            const points = completed ? POINTS_CONFIG.diet.completed : POINTS_CONFIG.diet.skipped;
            state.dailyPoints[today].diet += points;
            state.dailyPoints[today].total += points;

            // Update weekly total
            state.weeklyTotal = Object.values(state.dailyPoints).reduce((sum, day) => sum + day.total, 0);

            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },

        trackWorkoutCompletion: (state, action) => {
            const { day, completed } = action.payload;
            const today = day || getTodayKey();

            if (!state.dailyPoints[today]) {
                state.dailyPoints[today] = { diet: 0, workout: 0, habits: 0, steps: 0, total: 0 };
            }

            const points = completed ? POINTS_CONFIG.workout.completed : POINTS_CONFIG.workout.skipped;
            state.dailyPoints[today].workout += points;
            state.dailyPoints[today].total += points;

            // Update weekly total
            state.weeklyTotal = Object.values(state.dailyPoints).reduce((sum, day) => sum + day.total, 0);

            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },

        trackHabitCompletion: (state, action) => {
            const { points } = action.payload;
            const today = getTodayKey();

            if (!state.dailyPoints[today]) {
                state.dailyPoints[today] = { diet: 0, workout: 0, habits: 0, steps: 0, total: 0 };
            }

            state.dailyPoints[today].habits += points;
            state.dailyPoints[today].total += points;

            // Update weekly total
            state.weeklyTotal = Object.values(state.dailyPoints).reduce((sum, day) => sum + day.total, 0);

            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },

        trackStepsGoalAchieved: (state, action) => {
            const { achieved } = action.payload;
            const today = getTodayKey();

            if (!state.dailyPoints[today]) {
                state.dailyPoints[today] = { diet: 0, workout: 0, habits: 0, steps: 0, total: 0 };
            }

            // Only award bonus if achieved and not already awarded today
            if (achieved && state.dailyPoints[today].steps === 0) {
                state.dailyPoints[today].steps += POINTS_CONFIG.stepsGoalBonus;
                state.dailyPoints[today].total += POINTS_CONFIG.stepsGoalBonus;

                // Update weekly total
                state.weeklyTotal = Object.values(state.dailyPoints).reduce((sum, day) => sum + day.total, 0);

                // Save to localStorage
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            }
        },

        calculateCompletion: (state, action) => {
            const { category, completed, total } = action.payload;

            if (total > 0) {
                state.weeklyCompletion[category] = Math.round((completed / total) * 100);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            }
        },

        updateStreak: (state, action) => {
            const { streak } = action.payload;
            state.streaks.current = streak;

            if (streak > state.streaks.longest) {
                state.streaks.longest = streak;
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },

        resetWeeklyProgress: (state) => {
            // Save current week to history
            if (state.weeklyTotal > 0) {
                state.history.unshift({
                    weekStart: state.weekStart,
                    total: state.weeklyTotal,
                    completion: { ...state.weeklyCompletion }
                });

                // Keep only last 4 weeks
                if (state.history.length > 4) {
                    state.history = state.history.slice(0, 4);
                }
            }

            // Reset for new week
            const freshState = createFreshWeekState();
            state.weekStart = freshState.weekStart;
            state.dailyPoints = freshState.dailyPoints;
            state.weeklyTotal = 0;
            state.weeklyCompletion = freshState.weeklyCompletion;

            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },

        resetDailyProgress: (state) => {
            const today = getTodayKey();
            if (state.dailyPoints[today]) {
                state.dailyPoints[today] = { diet: 0, workout: 0, habits: 0, steps: 0, total: 0 };
                state.weeklyTotal = Object.values(state.dailyPoints).reduce((sum, day) => sum + day.total, 0);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            }
        }
    }
});

export const {
    loadProgress,
    trackDietCompletion,
    trackWorkoutCompletion,
    trackHabitCompletion,
    trackStepsGoalAchieved,
    calculateCompletion,
    updateStreak,
    resetWeeklyProgress,
    resetDailyProgress
} = progressSlice.actions;

export default progressSlice.reducer;
export { POINTS_CONFIG };
