import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'chat', label: 'AI Coach', icon: '🤖' },
        { id: 'diet', label: 'Diet Plan', icon: '🍽️' },
        { id: 'workout', label: 'Workout', icon: '💪' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <div className="w-64 h-screen bg-darker border-r border-white/10 flex flex-col p-6 fixed left-0 top-0 z-50">
            <h1 className="text-2xl font-bold text-primary mb-10">AI Health</h1>
            <nav className="flex-1 space-y-4">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                            ? 'bg-primary/20 text-primary border border-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="mt-auto pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary"></div>
                    <div>
                        <p className="text-white font-medium">User</p>
                        <p className="text-xs text-gray-400">Premium Member</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
