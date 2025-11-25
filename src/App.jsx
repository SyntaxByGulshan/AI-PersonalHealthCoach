import React, { useState } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AIChat from './pages/AIChat';
import DietPlan from './pages/DietPlan';
import WorkoutPlan from './pages/WorkoutPlan';
import DailyHabits from './pages/DailyHabits';
import Progress from './pages/Progress';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <Profile />;
      case 'habits':
        return <DailyHabits />;
      case 'chat':
        return <AIChat />;
      case 'diet':
        return <DietPlan />;
      case 'workout':
        return <WorkoutPlan />;
      case 'progress':
        return <Progress />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Provider store={store}>
      <div className="flex min-h-screen bg-dark text-white font-sans">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 bg-darker min-h-screen 
          ml-0
          md:ml-24
          lg:ml-64
          pt-16 md:pt-0
        ">
          {renderContent()}
        </main>
      </div>
    </Provider>
  );
}

export default App;
