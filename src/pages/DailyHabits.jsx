import React, { useState, useEffect } from 'react';
import { Droplets, Sun, Moon, Footprints, Brain, BookOpen, Sparkles, Flame, PartyPopper, Heart, Coffee, Salad } from 'lucide-react';
import { weeklyPlanService } from '../services/weeklyPlanService';

// Icon mapping for dynamic habit icons
const ICON_MAP = {
    water: <Droplets size={24} />,
    wakeup: <Sun size={24} />,
    sleep: <Moon size={24} />,
    steps: <Footprints size={24} />,
    meditation: <Brain size={24} />,
    reading: <BookOpen size={24} />,
    mindfulness: <Brain size={24} />,
    diet: <Salad size={24} />,
    exercise: <Heart size={24} />,
    coffee: <Coffee size={24} />
};

const getHabitIcon = (habitId) => {
    return ICON_MAP[habitId] || <Sparkles size={24} />;
};

const DailyHabits = () => {
    const [habits, setHabits] = useState([]);
    const [completedHabits, setCompletedHabits] = useState({});
    const [points, setPoints] = useState(0);
    const [streak, setStreak] = useState(0);
    const [currentDate] = useState(new Date());
    const [isLoaded, setIsLoaded] = useState(false);

    // Get today's date key
    const getTodayKey = () => {
        return currentDate.toISOString().split('T')[0];
    };

    // Load saved data from localStorage
    useEffect(() => {
        // Check for new week and load plan
        const initializePlan = async () => {
            try {
                await weeklyPlanService.checkAndResetWeek();
            } catch (error) {
                console.error('Failed to check/reset week:', error);
            }

            const plan = weeklyPlanService.getCurrentPlan();
            setHabits(plan.habits || []);

            const saved = localStorage.getItem('dailyHabitsData');
            if (saved) {
                const data = JSON.parse(saved);
                const today = getTodayKey();

                // Check if we need to reset for a new day
                if (data.lastDate !== today) {
                    // New day - reset completed habits but keep points and update streak
                    const previousDayCompleted = data.completed?.[data.lastDate];
                    const allHabitsCompleted = (plan.habits || []).every(h => previousDayCompleted?.[h.id]);

                    setCompletedHabits({ [today]: {} });
                    setPoints(data.points || 0);
                    setStreak(allHabitsCompleted ? (data.streak || 0) + 1 : 0);
                } else {
                    // Same day - restore state
                    setCompletedHabits(data.completed || { [today]: {} });
                    setPoints(data.points || 0);
                    setStreak(data.streak || 0);
                }
            } else {
                // First time - initialize
                const today = getTodayKey();
                setCompletedHabits({ [today]: {} });
            }
            setIsLoaded(true);
        };

        initializePlan();

        // Subscribe to plan updates
        const unsubscribe = weeklyPlanService.subscribe((newPlan) => {
            setHabits(newPlan.habits || []);
        });

        return unsubscribe;
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        if (!isLoaded) return;

        const today = getTodayKey();
        localStorage.setItem('dailyHabitsData', JSON.stringify({
            completed: completedHabits,
            points: points,
            streak: streak,
            lastDate: today
        }));
    }, [completedHabits, points, streak, isLoaded]);

    // Toggle habit completion
    const toggleHabit = (habitId, habitPoints) => {
        const today = getTodayKey();
        const isCompleted = completedHabits[today]?.[habitId];

        setCompletedHabits(prev => ({
            ...prev,
            [today]: {
                ...prev[today],
                [habitId]: !isCompleted
            }
        }));

        setPoints(prev => prev + (isCompleted ? -habitPoints : habitPoints));
    };

    // Calculate progress
    const calculateProgress = () => {
        const today = getTodayKey();
        const todayCompleted = completedHabits[today] || {};
        const completed = Object.values(todayCompleted).filter(Boolean).length;
        const total = habits.length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percent };
    };

    const progress = calculateProgress();

    // Reset all habits (for testing/demo purposes)
    const resetHabits = () => {
        if (confirm('Reset all habit progress? This will clear all checkmarks but keep your points.')) {
            const today = getTodayKey();
            setCompletedHabits({ [today]: {} });
        }
    };

    return (
        <div className="p-8 h-screen overflow-y-auto">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    Daily Habits <Sparkles className="w-8 h-8 text-secondary" />
                </h2>
                <p className="text-gray-400">Build healthy habits and earn extra points!</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="glass-card p-6">
                    <h3 className="text-gray-400 text-sm mb-2">Total Points</h3>
                    <div className="text-4xl font-bold text-primary">{points}</div>
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-gray-400 text-sm mb-2">Today's Progress</h3>
                    <div className="text-4xl font-bold text-white">{progress.completed}/{progress.total}</div>
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-gray-400 text-sm mb-2">Completion Rate</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
                            <div
                                className="bg-secondary h-full transition-all duration-500"
                                style={{ width: `${progress.percent}%` }}
                            ></div>
                        </div>
                        <span className="text-2xl font-bold text-white">{progress.percent}%</span>
                    </div>
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-gray-400 text-sm mb-2">Streak</h3>
                    <div className="text-4xl font-bold text-secondary flex items-center gap-2">
                        {streak} <Flame className="w-8 h-8 text-orange-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">consecutive days</p>
                </div>
            </div>

            {/* Habits List */}
            <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">Today's Habits</h3>
                    <button
                        onClick={resetHabits}
                        className="text-sm text-gray-400 hover:text-white underline"
                    >
                        Reset Progress
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {habits.map((habit) => {
                        const today = getTodayKey();
                        const isCompleted = completedHabits[today]?.[habit.id] || false;
                        const icon = getHabitIcon(habit.id);

                        return (
                            <div
                                key={habit.id}
                                className={`p-5 rounded-xl flex items-start gap-4 transition-all cursor-pointer ${isCompleted
                                    ? 'bg-secondary/20 border-2 border-secondary/30 shadow-lg'
                                    : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                                    }`}
                                onClick={() => toggleHabit(habit.id, habit.points)}
                            >
                                <input
                                    type="checkbox"
                                    checked={isCompleted}
                                    onChange={() => toggleHabit(habit.id, habit.points)}
                                    className="mt-1 w-6 h-6 cursor-pointer accent-secondary"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl text-primary">{icon}</span>
                                            <h4 className={`text-lg font-bold ${isCompleted ? 'line-through text-gray-500' : 'text-white'
                                                }`}>
                                                {habit.name}
                                            </h4>
                                        </div>
                                        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                            +{habit.points} pts
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400">{habit.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Motivational Message */}
                {progress.percent === 100 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg border border-primary/30 flex items-center justify-center gap-2">
                        <PartyPopper className="w-6 h-6 text-secondary" />
                        <p className="text-center text-lg font-bold text-white">
                            Amazing! You've completed all your habits today! Keep up the great work!
                        </p>
                        <PartyPopper className="w-6 h-6 text-secondary" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyHabits;
