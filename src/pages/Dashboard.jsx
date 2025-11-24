import React, { useState, useEffect } from 'react';
import { stepCounter } from '../services/stepCounter';

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
    const [showNotification, setShowNotification] = useState(false);
    const [steps, setSteps] = useState(0);
    const [isTracking, setIsTracking] = useState(false);
    const [trackingError, setTrackingError] = useState(null);

    useEffect(() => {
        // Load saved steps from localStorage
        const savedSteps = localStorage.getItem('dailySteps');
        if (savedSteps) {
            const parsed = parseInt(savedSteps);
            setSteps(parsed);
            stepCounter.setSteps(parsed);
        }

        return () => {
            stepCounter.stop();
        };
    }, []);

    const handleStartTracking = async () => {
        const success = await stepCounter.start((newSteps) => {
            setSteps(newSteps);
            localStorage.setItem('dailySteps', newSteps.toString());
        });

        if (success) {
            setIsTracking(true);
            setTrackingError(null);
        } else {
            setTrackingError('Unable to access device motion sensors. This feature requires a mobile device with motion sensors and HTTPS.');
        }
    };

    const handleStopTracking = () => {
        stepCounter.stop();
        setIsTracking(false);
    };

    const handleResetSteps = () => {
        stepCounter.reset();
        setSteps(0);
        localStorage.setItem('dailySteps', '0');
    };

    const handleCheckIn = () => {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
    };

    const calories = Math.round(steps * 0.04); // Rough estimate: 0.04 calories per step

    return (
        <div className="p-8 space-y-8 relative">
            {showNotification && (
                <div className="fixed top-8 right-8 z-50 bg-secondary text-darker px-6 py-4 rounded-xl font-bold shadow-2xl animate-bounce">
                    ✅ Daily Check-in completed!<br />
                    <span className="text-sm">+500 Steps | +100 Calories</span>
                </div>
            )}

            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Welcome back, User! 👋</h2>
                    <p className="text-gray-400 mt-1">Here's your daily health overview.</p>
                </div>
                <div className="flex gap-2">
                    {!isTracking ? (
                        <button
                            onClick={handleStartTracking}
                            className="bg-secondary text-darker font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all"
                        >
                            🚶 Start Tracking
                        </button>
                    ) : (
                        <button
                            onClick={handleStopTracking}
                            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all"
                        >
                            ⏸️ Stop Tracking
                        </button>
                    )}
                    <button
                        onClick={handleCheckIn}
                        className="btn-primary cursor-pointer"
                    >
                        Daily Check-in
                    </button>
                </div>
            </header>

            {trackingError && (
                <div className="glass-card p-4 border-l-4 border-yellow-500">
                    <p className="text-yellow-500 text-sm">⚠️ {trackingError}</p>
                    <p className="text-gray-400 text-xs mt-2">Note: Step tracking works best on mobile devices. Make sure you're using HTTPS and grant motion permissions when prompted.</p>
                </div>
            )}

            {isTracking && (
                <div className="glass-card p-4 border-l-4 border-secondary">
                    <p className="text-secondary text-sm">✅ Step tracking is active! Walk around with your device to count steps.</p>
                    <button
                        onClick={handleResetSteps}
                        className="text-xs text-gray-400 hover:text-white mt-2 underline"
                    >
                        Reset step count
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Steps" value={steps.toLocaleString()} unit="/ 10k" icon="👣" color="primary" />
                <StatCard title="Calories" value={calories.toLocaleString()} unit="kcal" icon="🔥" color="orange-500" />
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
