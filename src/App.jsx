import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AIChat from './pages/AIChat';
import Plans from './pages/Plans';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'chat':
        return <AIChat />;
      case 'plans':
        return <Plans />;
      case 'settings':
        return (
          <div className="p-8 text-center text-gray-500">
            <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
            <p>Settings panel coming soon...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-dark text-white font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-64 bg-darker min-h-screen">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
