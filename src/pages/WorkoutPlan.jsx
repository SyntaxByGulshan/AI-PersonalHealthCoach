import React, { useState, useEffect } from 'react';
import { weeklyPlanService } from '../services/weeklyPlanService';
import { Dumbbell, Loader, Sparkles, ChevronDown, ChevronRight } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WorkoutPlan = () => {
    const [workouts, setWorkouts] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [completedExercises, setCompletedExercises] = useState({});
    const [points, setPoints] = useState(0);
    const [expandedDays, setExpandedDays] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Check for new week and load plan
        const initializePlan = async () => {
            try {
                await weeklyPlanService.checkAndResetWeek();
            } catch (error) {
                console.error('Failed to check/reset week:', error);
            }

            const plan = weeklyPlanService.getCurrentPlan();
            setWorkouts(plan.workout || {});

            const saved = localStorage.getItem('weeklyWorkoutCompletion');
            if (saved) {
                const data = JSON.parse(saved);
                setCompletedExercises(data.completed || {});
                setPoints(data.points || 0);
            }
            setIsLoaded(true);
        };

        initializePlan();

        // Subscribe to plan updates
        const unsubscribe = weeklyPlanService.subscribe((newPlan) => {
            setWorkouts(newPlan.workout || {});
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!isLoaded) return;

        localStorage.setItem('weeklyWorkoutCompletion', JSON.stringify({
            completed: completedExercises,
            points: points
        }));
    }, [completedExercises, points, isLoaded]);

    const handleGeneratePlan = async () => {
        if (!confirm('Generate a new AI-powered weekly workout plan? This will replace your current plan.')) {
            return;
        }

        setIsLoading(true);
        try {
            const result = await weeklyPlanService.generateNewPlan();
            if (result.success) {
                alert('✨ AI-generated weekly workout plan loaded successfully!');
            } else {
                alert('⚠️ AI generation unavailable. Using our expertly-crafted default plan instead!');
            }
        } catch (error) {
            console.error("Failed to generate plan:", error);
            alert("Using default plan. To enable AI features, add your Gemini API key.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExercise = (day, exerciseIndex) => {
        const key = `${day}-${exerciseIndex}`;
        const wasCompleted = completedExercises[key];

        setCompletedExercises(prev => ({
            ...prev,
            [key]: !wasCompleted
        }));

        setPoints(prev => prev + (wasCompleted ? -10 : 10));
    };

    const toggleDay = (day) => {
        setExpandedDays(prev => ({
            ...prev,
            [day]: !prev[day]
        }));
    };

    const resetProgress = () => {
        if (confirm('Reset all workout progress? This will clear all checkmarks and reset points to 0.')) {
            setCompletedExercises({});
            setPoints(0);
        }
    };

    const calculateProgress = () => {
        let total = 0;
        let completed = 0;

        DAYS.forEach(day => {
            const dayExercises = workouts[day]?.exercises || [];
            total += dayExercises.length;
            dayExercises.forEach((_, idx) => {
                if (completedExercises[`${day}-${idx}`]) completed++;
            });
        });

        return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };

    const progress = calculateProgress();

    return (
        <div className="p-8 h-screen overflow-y-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        Workout Plan <Dumbbell className="w-8 h-8 text-primary" />
                    </h2>
                    <p className="text-gray-400">Track your workouts and build strength!</p>
                </div>
                <button
                    onClick={handleGeneratePlan}
                    disabled={isLoading}
                    className="btn-primary flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" /> Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" /> Generate AI Plan
                        </>
                    )}
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6">
                    <h3 className="text-gray-400 text-sm mb-2">Total Points</h3>
                    <div className="text-4xl font-bold text-primary">{points}</div>
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-gray-400 text-sm mb-2">Exercises Completed</h3>
                    <div className="text-4xl font-bold text-white">{progress.completed}/{progress.total}</div>
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-gray-400 text-sm mb-2">Weekly Progress</h3>
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
            </div>

            <div className="mb-4 flex justify-end">
                <button
                    onClick={resetProgress}
                    className="text-sm text-gray-400 hover:text-white underline"
                >
                    Reset Progress
                </button>
            </div>

            <div className="space-y-4">
                {DAYS.map((day) => {
                    const dayPlan = workouts[day];
                    if (!dayPlan) return null;

                    const isExpanded = expandedDays[day];
                    const dayExercises = dayPlan.exercises || [];
                    const completedCount = dayExercises.filter((_, idx) => completedExercises[`${day}-${idx}`]).length;

                    return (
                        <div key={day} className="glass-card overflow-hidden">
                            <button
                                onClick={() => toggleDay(day)}
                                className="w-full p-6 flex justify-between items-center hover:bg-white/5 transition-colors"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-bold text-white">{day}</h3>
                                        <span className="text-sm text-primary bg-primary/10 px-2 py-0.5 rounded">
                                            {dayPlan.focus}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 text-left">
                                        {completedCount}/{dayExercises.length} exercises completed
                                    </p>
                                </div>
                                <span className="text-white">
                                    {isExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                                </span>
                            </button>

                            {isExpanded && (
                                <div className="p-6 pt-0 border-t border-white/10">
                                    <div className="space-y-3 mt-4">
                                        {dayExercises.map((exercise, idx) => {
                                            const key = `${day}-${idx}`;
                                            const isCompleted = completedExercises[key];

                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => toggleExercise(day, idx)}
                                                    className={`p-4 rounded-xl flex items-start gap-4 transition-all cursor-pointer ${isCompleted
                                                        ? 'bg-secondary/20 border border-secondary/30'
                                                        : 'bg-white/5 border border-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isCompleted || false}
                                                        onChange={() => toggleExercise(day, idx)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="mt-1 w-5 h-5 cursor-pointer accent-secondary"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className={`font-bold ${isCompleted ? 'line-through text-gray-500' : 'text-white'
                                                                }`}>
                                                                {exercise.name}
                                                            </h4>
                                                            <div className="text-xs text-right text-gray-400">
                                                                <div>{exercise.sets} sets</div>
                                                                <div>{exercise.reps} reps</div>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-400">{exercise.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WorkoutPlan;
