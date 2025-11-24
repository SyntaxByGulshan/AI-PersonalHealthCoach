import React from 'react';

const StatCard = ({ title, value, unit, icon, color }) => (
    <div className="glass-card p-6 flex flex-col justify-between h-40 relative overflow-hidden group hover:bg-white/10 transition-all">
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 blur-xl bg-${color}`}></div>
        <div className="flex justify-between items-start z-10">
            <h3 className="text-gray-400 font-medium">{title}</h3>
            <span className="text-2xl">{icon}</span>
        </div>
        <div className="z-10">
            <div className="text-3xl font-bold text-white">
                {value} <span className="text-sm text-gray-500 font-normal">{unit}</span>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    return (
        <div className="p-8 space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Welcome back, User! 👋</h2>
                    <p className="text-gray-400 mt-1">Here's your daily health overview.</p>
                </div>
                <button className="btn-primary">Daily Check-in</button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Steps" value="8,432" unit="/ 10k" icon="👣" color="primary" />
                <StatCard title="Calories" value="1,850" unit="kcal" icon="🔥" color="orange-500" />
                <StatCard title="Water" value="1.2" unit="L" icon="💧" color="blue-500" />
                <StatCard title="Sleep" value="7h 20m" unit="" icon="😴" color="purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
                <div className="lg:col-span-2 glass-card p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Activity Progress</h3>
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        {/* Placeholder for a chart */}
                        [Activity Graph Placeholder]
                    </div>
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Daily Goals</h3>
                    <div className="space-y-4">
                        {['Morning Yoga', 'Drink 2L Water', 'No Sugar'].map((goal, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                <div className="w-5 h-5 rounded-full border-2 border-secondary flex items-center justify-center">
                                    {i === 0 && <div className="w-3 h-3 bg-secondary rounded-full"></div>}
                                </div>
                                <span className={i === 0 ? 'text-gray-500 line-through' : 'text-white'}>{goal}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
