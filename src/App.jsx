import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AIChat from './pages/AIChat';
import DietPlan from './pages/DietPlan';
import WorkoutPlan from './pages/WorkoutPlan';
import DailyHabits from './pages/DailyHabits';

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
      default:
        return <Dashboard />;
    }
  };

  return (
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
  );
}

export default App;
