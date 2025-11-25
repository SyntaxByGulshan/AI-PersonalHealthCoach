import React, { useState, useEffect } from 'react';
import { stepCounter } from '../services/stepCounter';
import { profileService } from '../services/profileService';
import { Footprints, Flame, Droplets, Moon, Play, Pause, AlertTriangle, CheckCircle, Utensils, Award } from 'lucide-react';

const StatCard = ({ title, value, unit, icon, color }) => (
    <div className="glass-card p-4 md:p-6 flex flex-col justify-between h-32 md:h-40 relative overflow-hidden group hover:bg-white/10 transition-all">
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 blur-xl bg-${color}`}></div>
        <div className="flex justify-between items-start z-10">
            <h3 className="text-gray-400 font-medium text-sm md:text-base">{title}</h3>
            <span className="text-xl md:text-2xl text-primary">{icon}</span>
        </div>
        <div className="z-10">
            <div className="text-2xl md:text-3xl font-bold text-white">
                {value} <span className="text-xs md:text-sm text-gray-500 font-normal">{unit}</span>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [showNotification, setShowNotification] = useState(false);
    const [steps, setSteps] = useState(0);
    const [dietData, setDietData] = useState({ points: 0, totalCalories: 0, mealsCompleted: 0, totalMeals: 0 });
    const [isTracking, setIsTracking] = useState(false);
    const [trackingError, setTrackingError] = useState(null);
    const [profile, setProfile] = useState(profileService.loadProfile());

    useEffect(() => {
        const savedSteps = localStorage.getItem('dailySteps');
        if (savedSteps) {
            const parsed = parseInt(savedSteps);
            setSteps(parsed);
            stepCounter.setSteps(parsed);
        }

        const savedDiet = localStorage.getItem('dietProgress');
        if (savedDiet) {
            setDietData(JSON.parse(savedDiet));
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

    const calories = Math.round(steps * 0.04);
    const userName = profile.name || 'User';
    const isProfileComplete = profileService.isProfileComplete(profile);
    const bmi = isProfileComplete ? profileService.calculateBMI(profile.weight, profile.height) : null;
    const recommendedCalories = isProfileComplete ? profileService.calculateRecommendedCalories(profile) : null;

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 relative">
            {showNotification && (
                <div className="fixed top-4 right-4 md:top-8 md:right-8 z-50 bg-secondary text-darker px-4 py-3 md:px-6 md:py-4 rounded-xl font-bold shadow-2xl animate-bounce flex items-center gap-2 md:gap-3 max-w-xs md:max-w-none">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                    <div className="text-sm md:text-base">
                        Daily Check-in completed!<br />
                        <span className="text-xs md:text-sm font-normal">+500 Steps | +100 Calories</span>
                    </div>
                </div>
            )}

            <header className="space-y-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Welcome back, {userName}! 👋</h2>
                    <p className="text-gray-400 mt-1 text-sm md:text-base">
                        {isProfileComplete
                            ? `Here's your daily health overview. ${bmi ? `BMI: ${bmi} | ` : ''}${recommendedCalories ? `Daily Goal: ${recommendedCalories.recommended} kcal` : ''}`
                            : 'Complete your profile to get personalized recommendations'}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    {!isTracking ? (
                        <button
                            onClick={handleStartTracking}
                            className="bg-secondary text-darker font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                            <Play className="w-4 h-4" /> Start Tracking
                        </button>
                    ) : (
                        <button
                            onClick={handleStopTracking}
                            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                            <Pause className="w-4 h-4" /> Stop Tracking
                        </button>
                    )}
                    <button
                        onClick={handleCheckIn}
                        className="btn-primary cursor-pointer text-sm md:text-base"
                    >
                        Daily Check-in
                    </button>
                </div>
            </header>

            {trackingError && (
                <div className="glass-card p-3 md:p-4 border-l-4 border-yellow-500">
                    <div className="flex items-center gap-2 text-yellow-500 mb-1">
                        <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                        <p className="font-bold text-sm md:text-base">Tracking Error</p>
                    </div>
                    <p className="text-yellow-500 text-xs md:text-sm">{trackingError}</p>
                    <p className="text-gray-400 text-xs mt-2">Note: Step tracking works best on mobile devices.</p>
                </div>
            )}

            {isTracking && (
                <div className="glass-card p-3 md:p-4 border-l-4 border-secondary">
                    <div className="flex items-center gap-2 text-secondary mb-1">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                        <p className="font-bold text-sm md:text-base">Tracking Active</p>
                    </div>
                    <p className="text-secondary text-xs md:text-sm">Step tracking is active! Walk around with your device to count steps.</p>
                    <button
                        onClick={handleResetSteps}
                        className="text-xs text-gray-400 hover:text-white mt-2 underline"
                    >
                        Reset step count
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <StatCard title="Steps" value={steps.toLocaleString()} unit="/ 10k" icon={<Footprints size={28} />} color="primary" />
                <StatCard title="Calories Burned" value={calories.toLocaleString()} unit="kcal" icon={<Flame size={28} />} color="orange-500" />
                <StatCard title="Calories Eaten" value={dietData.totalCalories} unit="kcal" icon={<Utensils size={28} />} color="green-500" />
                <StatCard title="Diet Points" value={dietData.points} unit="pts" icon={<Award size={28} />} color="yellow-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-2 glass-card p-4 md:p-6 h-64 md:h-96">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-4">Activity Progress</h3>
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm md:text-base">
                        [Activity Graph Placeholder]
                    </div>
                </div>
                <div className="glass-card p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-4">Daily Goals</h3>
                    <div className="space-y-3 md:space-y-4">
                        {['Morning Yoga', 'Drink 2L Water', 'No Sugar'].map((goal, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 md:p-3 rounded-lg bg-white/5">
                                <div className="w-5 h-5 rounded-full border-2 border-secondary flex items-center justify-center flex-shrink-0">
                                    {i === 0 && <div className="w-3 h-3 bg-secondary rounded-full"></div>}
                                </div>
                                <span className={`text-sm md:text-base ${i === 0 ? 'text-gray-500 line-through' : 'text-white'}`}>{goal}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
