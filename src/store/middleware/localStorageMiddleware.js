// Middleware for localStorage synchronization with debouncing

// Debounce function to limit localStorage writes
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Keys that should be persisted
const PERSIST_KEYS = {
    user: 'userProfile',
    weeklyPlan: 'weeklyHealthPlan',
    habits: 'dailyHabitsData',
    steps: 'stepCounterData',
    progress: 'progressData'
};

// Debounced save function
const debouncedSave = debounce((key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            console.error('LocalStorage quota exceeded. Clearing old data...');
            // Optionally implement cleanup strategy here
        } else {
            console.error('Error saving to localStorage:', error);
        }
    }
}, 500); // 500ms debounce

const localStorageMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    // Get the updated state
    const state = store.getState();

    // Save relevant slices to localStorage (debounced)
    // Note: Individual slices already handle their own persistence,
    // but this middleware can be used for additional orchestration if needed

    // For now, we'll let each slice handle its own persistence
    // This middleware is here for future extensibility

    return result;
};

export default localStorageMiddleware;
