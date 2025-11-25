import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'dailyHabitsData';

// Get today's date key
const getTodayKey = () => {
    return new Date().toISOString().split('T')[0];
};

// Load initial state from localStorage
const loadInitialState = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading habits from localStorage:', error);
    }

    const today = getTodayKey();
    return {
        completed: { [today]: {} },
        points: 0,
        streak: 0,
        lastDate: today
    };
};

const habitsSlice = createSlice({
    name: 'habits',
    initialState: loadInitialState(),
    reducers: {
        loadHabits: (state) => {
            const loaded = loadInitialState();
            Object.assign(state, loaded);
        },

        toggleHabit: (state, action) => {
            const { habitId, habitPoints } = action.payload;
            const today = getTodayKey();

            // Initialize today's data if needed
            if (!state.completed[today]) {
                state.completed[today] = {};
            }

            // Toggle completion
            const wasCompleted = state.completed[today][habitId] || false;
            state.completed[today][habitId] = !wasCompleted;

            // Update points
            if (!wasCompleted) {
                state.points += habitPoints;
            } else {
                state.points -= habitPoints;
            }

            // Update streak
            if (state.lastDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayKey = yesterday.toISOString().split('T')[0];

                // Check if yesterday had any completions
                if (state.completed[yesterdayKey] && Object.keys(state.completed[yesterdayKey]).length > 0) {
                    state.streak += 1;
                } else {
                    state.streak = 1;
                }

                state.lastDate = today;
            }

            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },

        resetHabits: (state) => {
            const today = getTodayKey();
            state.completed = { [today]: {} };
            state.points = 0;
            state.streak = 0;
            state.lastDate = today;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },

        resetDailyHabits: (state) => {
            // Reset daily completion but keep streak and total points
            const today = getTodayKey();
            if (!state.completed[today]) {
                state.completed[today] = {};
            } else {
                state.completed[today] = {};
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }
});

export const { loadHabits, toggleHabit, resetHabits, resetDailyHabits } = habitsSlice.actions;
export default habitsSlice.reducer;
