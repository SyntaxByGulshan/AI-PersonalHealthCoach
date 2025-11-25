import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import weeklyPlanReducer from './slices/weeklyPlanSlice';
import habitsReducer from './slices/habitsSlice';
import stepsReducer from './slices/stepsSlice';
import progressReducer from './slices/progressSlice';
import localStorageMiddleware from './middleware/localStorageMiddleware';

const store = configureStore({
    reducer: {
        user: userReducer,
        weeklyPlan: weeklyPlanReducer,
        habits: habitsReducer,
        steps: stepsReducer,
        progress: progressReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for serializable check
                ignoredActions: ['weeklyPlan/generateNewPlan/pending', 'weeklyPlan/generateNewPlan/fulfilled'],
            },
        }).concat(localStorageMiddleware),
    devTools: process.env.NODE_ENV !== 'production'
});

export default store;
