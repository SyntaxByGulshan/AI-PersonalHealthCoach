import React, { useState, useEffect } from 'react';
import { generatePlans, isConfigured } from '../services/gemini';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Default weekly exercise plan
const DEFAULT_EXERCISES = {
    Monday: [
        { name: 'Morning Cardio', duration: '30 min', type: 'High Intensity', desc: 'Running or cycling' },
        { name: 'Upper Body Strength', duration: '20 min', type: 'Strength', desc: 'Push-ups, dumbbell press' },
    ],
    Tuesday: [
        { name: 'Yoga & Stretching', duration: '45 min', type: 'Flexibility', desc: 'Full body yoga flow' },
    ],
    Wednesday: [
        { name: 'HIIT Workout', duration: '25 min', type: 'High Intensity', desc: 'Burpees, jump squats, mountain climbers' },
        { name: 'Core Training', duration: '15 min', type: 'Strength', desc: 'Planks, crunches, leg raises' },
    ],
    Thursday: [
        { name: 'Lower Body Strength', duration: '30 min', type: 'Strength', desc: 'Squats, lunges, deadlifts' },
    ],
    Friday: [
        { name: 'Swimming', duration: '40 min', type: 'Cardio', desc: 'Lap swimming or water aerobics' },
    ],
    Saturday: [
        { name: 'Outdoor Activity', duration: '60 min', type: 'Cardio', desc: 'Hiking, biking, or sports' },
        { name: 'Full Body Circuit', duration: '20 min', type: 'Strength', desc: 'Mix of all muscle groups' },
    ],
    Sunday: [
        { name: 'Rest & Recovery', duration: '30 min', type: 'Recovery', desc: 'Light stretching, foam rolling' },
    ],
};

const WorkoutPlan = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [completedExercises, setCompletedExercises] = useState({});
    const [points, setPoints] = useState(0);
    const [expandedDays, setExpandedDays] = useState({});

    // Load completion state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('weeklyWorkoutCompletion');
        if (saved) {
            const data = JSON.parse(saved);
            setCompletedExercises(data.completed || {});
            setPoints(data.points || 0);
        }
    }, []);

    // Save to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('weeklyWorkoutCompletion', JSON.stringify({
            completed: completedExercises,
            points: points
        }));
    }, [completedExercises, points]);

    const toggleExercise = (day, exerciseIndex) => {
        const key = `${day}-${exerciseIndex}`;
        const wasCompleted = completedExercises[key];

        setCompletedExercises(prev => ({
            ...prev,
            [key]: !wasCompleted
        }));

        // Update points: +10 for complete, -5 for uncomplete
        setPoints(prev => prev + (wasCompleted ? -5 : 10));
    };

    const toggleDay = (day) => {
        setExpandedDays(prev => ({
            ...prev,
            [day]: !prev[day]
        }));
    };

    const resetWeek = () => {
        if (confirm('Reset this week\'s workout progress? This will clear all checkmarks and reset points to 0.')) {
            setCompletedExercises({});
            setPoints(0);
        }
    };

    const handleGenerate = async () => {
        if (!isConfigured()) {
            alert("Please configure your VITE_GEMINI_API_KEY in the .env file first.");
            return;
        }

        setIsLoading(true);
        try {
            const userStats = {
                steps: 8432,
                calories: 1850,
                water: 1.2,
                sleep: "7h 20m"
            };

            const plans = await generatePlans(userStats);
            // For now, just showing success - could update DEFAULT_EXERCISES with AI-generated plan
            alert("AI workout plan generated! (Demo mode - default plan shown)");
        } catch (error) {
            console.error(error);
            alert("Failed to generate workout plan. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate total exercises and completion
    const totalExercises = DAYS.reduce((sum, day) => sum + DEFAULT_EXERCISES[day].length, 0);
    const completedCount = Object.values(completedExercises).filter(Boolean).length;
    const progressPercent = Math.round((completedCount / totalExercises) * 100);

    return (
        <div className="p-8 h-screen overflow-y-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Workout Plan 💪</h2>
                    <p className="text-gray-400">Track your weekly exercises and earn points!</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <span className="animate-spin">⏳</span> Generating...
                        </>
                    ) : (
                        <>
                            <span>✨</span> Generate AI Plan
                        </>
                    )}
                </button>
            </header>

            {/* Points & Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6">
                    <h3 className="text-gray-400 text-sm mb-2">Workout Points</h3>
                    <div className="text-4xl font-bold text-secondary">{points}</div>
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-gray-400 text-sm mb-2">Exercises Completed</h3>
                    <div className="text-4xl font-bold text-white">{completedCount}/{totalExercises}</div>
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-gray-400 text-sm mb-2">Weekly Progress</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
                            <div
                                className="bg-secondary h-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                        <span className="text-2xl font-bold text-white">{progressPercent}%</span>
                    </div>
                </div>
            </div>

            {/* Weekly Workout Plan */}
            <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">This Week's Workouts</h3>
                    <button
                        onClick={resetWeek}
                        className="text-sm text-gray-400 hover:text-white underline"
                    >
                        Reset Week
                    </button>
                </div>

                <div className="space-y-3">
                    {DAYS.map((day) => {
                        const dayExercises = DEFAULT_EXERCISES[day];
                        const isExpanded = expandedDays[day];
                        const dayCompleted = dayExercises.filter((_, idx) => completedExercises[`${day}-${idx}`]).length;

                        return (
                            <div key={day} className="border border-white/10 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => toggleDay(day)}
                                    className="w-full p-4 bg-white/5 hover:bg-white/10 transition-colors flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-bold text-white">{day}</span>
                                        <span className="text-sm text-gray-400">{dayCompleted}/{dayExercises.length} exercises</span>
                                    </div>
                                    <span className="text-white">{isExpanded ? '▼' : '▶'}</span>
                                </button>

                                {isExpanded && (
                                    <div className="p-4 space-y-3">
                                        {dayExercises.map((exercise, idx) => {
                                            const key = `${day}-${idx}`;
                                            const isCompleted = completedExercises[key];

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`p-3 rounded-lg flex items-start gap-3 transition-all ${isCompleted ? 'bg-secondary/20 border border-secondary/30' : 'bg-white/5'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isCompleted || false}
                                                        onChange={() => toggleExercise(day, idx)}
                                                        className="mt-1 w-5 h-5 cursor-pointer accent-secondary"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className={`font-bold ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
                                                                    {exercise.name}
                                                                </h4>
                                                                <span className="text-xs text-gray-500">{exercise.type}</span>
                                                            </div>
                                                            <span className="text-xs text-primary">{exercise.duration}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-400 mt-1">{exercise.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WorkoutPlan;
