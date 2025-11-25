import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'stepCounterData';

// Get today's date key
const getTodayKey = () => {
    return new Date().toISOString().split('T')[0];
};

// Load initial state from localStorage
const loadInitialState = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            const today = getTodayKey();

            // Reset if it's a new day
            if (data.date !== today) {
                return {
                    steps: 0,
                    isTracking: false,
                    goal: data.goal || 10000,
                    date: today
                };
            }
            return data;
        }
    } catch (error) {
        console.error('Error loading steps from localStorage:', error);
    }

    return {
        steps: 0,
        isTracking: false,
        goal: 10000,
        date: getTodayKey()
    };
};

const stepsSlice = createSlice({
    name: 'steps',
    initialState: loadInitialState(),
    reducers: {
        loadSteps: (state) => {
            const loaded = loadInitialState();
            Object.assign(state, loaded);
        },

        startTracking: (state) => {
            state.isTracking = true;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },

        stopTracking: (state) => {
            state.isTracking = false;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },

        updateSteps: (state, action) => {
            const today = getTodayKey();

            // Reset if new day
            if (state.date !== today) {
                state.steps = 0;
                state.date = today;
            }

            state.steps = action.payload;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },

        incrementSteps: (state, action) => {
            const today = getTodayKey();

            // Reset if new day
            if (state.date !== today) {
                state.steps = 0;
                state.date = today;
            }

            state.steps += (action.payload || 1);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },

        resetSteps: (state) => {
            state.steps = 0;
            state.date = getTodayKey();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },

        setGoal: (state, action) => {
            state.goal = action.payload;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }
});

export const {
    loadSteps,
    startTracking,
    stopTracking,
    updateSteps,
    incrementSteps,
    resetSteps,
    setGoal
} = stepsSlice.actions;

export default stepsSlice.reducer;
