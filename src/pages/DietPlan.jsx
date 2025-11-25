import React, { useState, useEffect } from 'react';
import { Utensils, Sparkles, Loader } from 'lucide-react';
import { weeklyPlanService } from '../services/weeklyPlanService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const DietPlan = () => {
    const [meals, setMeals] = useState({});
    const [completedMeals, setCompletedMeals] = useState({});
    const [points, setPoints] = useState(0);
    const [currentDate] = useState(new Date());
    const [isLoaded, setIsLoaded] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        // Check for new week and load plan
        const initializePlan = async () => {
            try {
                await weeklyPlanService.checkAndResetWeek();
            } catch (error) {
                console.error('Failed to check/reset week:', error);
            }

            const plan = weeklyPlanService.getCurrentPlan();
            setMeals(plan.diet || {});

            const saved = localStorage.getItem('dietProgress');
            if (saved) {
                const data = JSON.parse(saved);
                setCompletedMeals(data.completed || {});
                setPoints(data.points || 0);
            }
            setIsLoaded(true);
        };

        initializePlan();

        // Subscribe to plan updates
        const unsubscribe = weeklyPlanService.subscribe((newPlan) => {
            setMeals(newPlan.diet || {});
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!isLoaded) return;

        const currentProgress = calculateProgress();
        const currentCalories = calculateDailyCalories();

        localStorage.setItem('dietProgress', JSON.stringify({
            completed: completedMeals,
            points: points,
            totalCalories: currentCalories,
            mealsCompleted: currentProgress.completed,
            totalMeals: currentProgress.total
        }));
    }, [completedMeals, points, isLoaded]);

    const toggleMeal = (dateKey, mealType) => {
        const key = `${dateKey}-${mealType}`;
        const wasCompleted = completedMeals[key];

        setCompletedMeals(prev => ({
            ...prev,
            [key]: !wasCompleted
        }));

        setPoints(prev => prev + (wasCompleted ? -5 : 10));
    };

    const getTodayDayName = () => {
        return DAYS[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1];
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const calculateProgress = () => {
        const total = MEAL_TYPES.length;
        const today = formatDate(currentDate);
        let completed = 0;

        MEAL_TYPES.forEach(meal => {
            if (completedMeals[`${today}-${meal}`]) completed++;
        });

        return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };

    const calculateDailyCalories = () => {
        const today = getTodayDayName();
        const todayMeals = meals[today] || {};
        const dateKey = formatDate(currentDate);
        let totalCalories = 0;

        MEAL_TYPES.forEach(mealType => {
            if (completedMeals[`${dateKey}-${mealType}`]) {
                const calories = parseInt(todayMeals[mealType]?.calories);
                if (!isNaN(calories)) {
                    totalCalories += calories;
                }
            }
        });

        return totalCalories;
    };

    const handleGenerateNewPlan = async () => {
        if (!confirm('Generate a new AI-powered weekly diet plan? This will replace your current plan.')) {
            return;
        }

        setIsGenerating(true);
        try {
            const result = await weeklyPlanService.generateNewPlan();
            if (result.success) {
                alert('✨ AI-generated weekly diet plan loaded successfully!');
            } else {
                alert('⚠️ AI generation unavailable. Using our expertly-crafted default plan instead!');
            }
        } catch (error) {
            alert('Using default plan. To enable AI features, add your Gemini API key.');
        } finally {
            setIsGenerating(false);
        }
    };

    const progress = calculateProgress();
    const caloriesConsumed = calculateDailyCalories();

    const todayName = getTodayDayName();
    const todayMealPlan = meals[todayName] || {};
    const todayDate = formatDate(currentDate);

    return (
        <div className="p-8 h-screen overflow-y-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        Today's Diet Plan <Utensils className="w-8 h-8 text-primary" />
                    </h2>
                    <p className="text-gray-400">Track your meals for {todayName}, {currentDate.toDateString()}</p>
                </div>
                <button
                    onClick={handleGenerateNewPlan}
                    disabled={isGenerating}
                    className="btn-primary flex items-center gap-2"
                >
                    {isGenerating ? (
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6">
                    <h3 className="text-gray-400 text-sm mb-2">Total Points</h3>
                    <div className="text-4xl font-bold text-primary">{points}</div>
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-gray-400 text-sm mb-2">Meals Completed</h3>
                    <div className="text-4xl font-bold text-white">{progress.completed}/{progress.total}</div>
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-gray-400 text-sm mb-2">Calories Consumed</h3>
                    <div className="flex items-center gap-3">
                        <div className="text-4xl font-bold text-secondary">{caloriesConsumed} <span className="text-lg text-gray-400">kcal</span></div>
                    </div>
                </div>
            </div>

            <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">Today's Meals</h3>
                </div>

                <div className="space-y-3">
                    {MEAL_TYPES.map((mealType) => {
                        const meal = todayMealPlan[mealType];
                        if (!meal) return null;

                        const key = `${todayDate}-${mealType}`;
                        const isCompleted = completedMeals[key];

                        return (
                            <div
                                key={mealType}
                                onClick={() => toggleMeal(todayDate, mealType)}
                                className={`p-4 rounded-lg flex items-start gap-3 transition-all cursor-pointer ${isCompleted ? 'bg-secondary/20 border border-secondary/30' : 'bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isCompleted || false}
                                    onChange={() => toggleMeal(todayDate, mealType)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-1 w-6 h-6 cursor-pointer accent-secondary"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase">{mealType}</span>
                                            <h4 className={`text-lg font-bold ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
                                                {meal.name}
                                            </h4>
                                        </div>
                                        <span className="text-sm text-primary font-medium">{meal.calories}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{meal.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DietPlan;
