import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from './store'
import { loadProfile } from './store/slices/userSlice'
import { loadPlan } from './store/slices/weeklyPlanSlice'
import { loadHabits } from './store/slices/habitsSlice'
import { loadSteps } from './store/slices/stepsSlice'
import { loadProgress } from './store/slices/progressSlice'

// Load persisted data on app start
store.dispatch(loadProfile());
store.dispatch(loadPlan());
store.dispatch(loadHabits());
store.dispatch(loadSteps());
store.dispatch(loadProgress());

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
