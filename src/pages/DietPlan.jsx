import React, { useState, useEffect } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

// Default weekly meal plan
const DEFAULT_MEALS = {
    Monday: {
        Breakfast: { name: 'Oatmeal & Berries', calories: '350 kcal', desc: 'Rolled oats, blueberries, honey' },
        Lunch: { name: 'Grilled Chicken Salad', calories: '450 kcal', desc: 'Chicken breast, greens, avocado' },
        Dinner: { name: 'Salmon & Quinoa', calories: '500 kcal', desc: 'Baked salmon, quinoa, broccoli' },
        Snack: { name: 'Greek Yogurt', calories: '150 kcal', desc: 'Plain yogurt, almonds' }
    },
    Tuesday: {
        Breakfast: { name: 'Egg White Omelette', calories: '300 kcal', desc: 'Egg whites, spinach, tomato' },
        Lunch: { name: 'Turkey Wrap', calories: '400 kcal', desc: 'Turkey, whole wheat wrap, veggies' },
        Dinner: { name: 'Chicken Stir Fry', calories: '480 kcal', desc: 'Chicken, mixed vegetables, rice' },
        Snack: { name: 'Apple & Peanut Butter', calories: '180 kcal', desc: 'Sliced apple, natural PB' }
    },
    Wednesday: {
        Breakfast: { name: 'Protein Smoothie', calories: '320 kcal', desc: 'Banana, protein powder, almond milk' },
        Lunch: { name: 'Tuna Bowl', calories: '420 kcal', desc: 'Tuna, brown rice, cucumber' },
        Dinner: { name: 'Lean Beef & Sweet Potato', calories: '520 kcal', desc: 'Ground beef, sweet potato, greens' },
        Snack: { name: 'Mixed Nuts', calories: '160 kcal', desc: 'Almonds, walnuts, cashews' }
    },
    Thursday: {
        Breakfast: { name: 'Avocado Toast', calories: '340 kcal', desc: 'Whole grain bread, avocado, egg' },
        Lunch: { name: 'Quinoa Buddha Bowl', calories: '440 kcal', desc: 'Quinoa, chickpeas, tahini' },
        Dinner: { name: 'Baked Cod & Asparagus', calories: '460 kcal', desc: 'Cod fillet, asparagus, lemon' },
        Snack: { name: 'Protein Bar', calories: '200 kcal', desc: 'High-protein energy bar' }
    },
    Friday: {
        Breakfast: { name: 'Berry Parfait', calories: '330 kcal', desc: 'Yogurt, granola, mixed berries' },
        Lunch: { name: 'Chicken Caesar Salad', calories: '410 kcal', desc: 'Grilled chicken, romaine, light dressing' },
        Dinner: { name: 'Shrimp Pasta', calories: '490 kcal', desc: 'Whole wheat pasta, shrimp, marinara' },
        Snack: { name: 'Cottage Cheese', calories: '120 kcal', desc: 'Low-fat cottage cheese, berries' }
    },
    Saturday: {
        Breakfast: { name: 'Pancakes & Fruit', calories: '380 kcal', desc: 'Protein pancakes, strawberries' },
        Lunch: { name: 'Veggie Burger', calories: '430 kcal', desc: 'Plant-based patty, whole wheat bun' },
        Dinner: { name: 'Steak & Veggies', calories: '540 kcal', desc: 'Sirloin steak, roasted vegetables' },
        Snack: { name: 'Dark Chocolate', calories: '140 kcal', desc: '70% dark chocolate squares' }
    },
    Sunday: {
        Breakfast: { name: 'French Toast', calories: '360 kcal', desc: 'Whole wheat bread, cinnamon, maple syrup' },
        Lunch: { name: 'Sushi Bowl', calories: '450 kcal', desc: 'Salmon, rice, edamame, seaweed' },
        Dinner: { name: 'Chicken Curry', calories: '510 kcal', desc: 'Chicken, curry sauce, brown rice' },
        Snack: { name: 'Hummus & Veggies', calories: '130 kcal', desc: 'Hummus, carrots, celery' }
    }
};

const DietPlan = () => {
    const [completedMeals, setCompletedMeals] = useState({});
    const [points, setPoints] = useState(0);
    const [expandedDays, setExpandedDays] = useState({});
    const [viewMode, setViewMode] = useState('weekly');
    const [currentDate] = useState(new Date());

    useEffect(() => {
        const saved = localStorage.getItem('weeklyDiet Completion');
        if (saved) {
            const data = JSON.parse(saved);
            setCompletedMeals(data.completed || {});
            setPoints(data.points || 0);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('weeklyDietCompletion', JSON.stringify({
            completed: completedMeals,
            points: points
        }));
    }, [completedMeals, points]);

    const toggleMeal = (dateKey, mealType) => {
        const key = `${dateKey}-${mealType}`;
        const wasCompleted = completedMeals[key];

        setCompletedMeals(prev => ({
            ...prev,
            [key]: !wasCompleted
        }));

        setPoints(prev => prev + (wasCompleted ? -5 : 10));
    };

    const toggleDay = (day) => {
        setExpandedDays(prev => ({
            ...prev,
            [day]: !prev[day]
        }));
    };

    const resetWeek = () => {
        if (confirm('Reset all progress? This will clear all checkmarks and reset points to 0.')) {
            setCompletedMeals({});
            setPoints(0);
        }
    };

    const getTodayDayName = () => {
        return DAYS[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1];
    };

    const getMonthDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d));
        }
        return days;
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const getDayOfWeekName = (date) => {
        const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
        return DAYS[dayIndex];
    };

    const calculateProgress = () => {
        let total = 0;
        let completed = 0;

        if (viewMode === 'daily') {
            total = MEAL_TYPES.length;
            const today = formatDate(currentDate);
            MEAL_TYPES.forEach(meal => {
                if (completedMeals[`${today}-${meal}`]) completed++;
            });
        } else if (viewMode === 'weekly') {
            total = DAYS.length * MEAL_TYPES.length;
            completed = Object.values(completedMeals).filter(Boolean).length;
        } else if (viewMode === 'monthly') {
            const monthDays = getMonthDays();
            total = monthDays.length * MEAL_TYPES.length;
            monthDays.forEach(date => {
                const dateKey = formatDate(date);
                MEAL_TYPES.forEach(meal => {
                    if (completedMeals[`${dateKey}-${meal}`]) completed++;
                });
            });
        }

        return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };

    const progress = calculateProgress();

    const renderDailyView = () => {
        const today = getTodayDayName();
        const todayMeals = DEFAULT_MEALS[today];
        const dateKey = formatDate(currentDate);

        return (
            <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">Today's Meals - {today}</h3>
                    <p className="text-sm text-gray-400">{currentDate.toDateString()}</p>
                </div>

                <div className="space-y-3">
                    {MEAL_TYPES.map((mealType) => {
                        const meal = todayMeals[mealType];
                        const key = `${dateKey}-${mealType}`;
                        const isCompleted = completedMeals[key];

                        return (
                            <div
                                key={mealType}
                                className={`p-4 rounded-lg flex items-start gap-3 transition-all ${isCompleted ? 'bg-secondary/20 border border-secondary/30' : 'bg-white/5'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isCompleted || false}
                                    onChange={() => toggleMeal(dateKey, mealType)}
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
        );
    };

    const renderWeeklyView = () => {
        return (
            <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">This Week's Meals</h3>
                </div>

                <div className="space-y-3">
                    {DAYS.map((day) => {
                        const dayMeals = DEFAULT_MEALS[day];
                        const isExpanded = expandedDays[day];
                        const dayCompleted = MEAL_TYPES.filter(m => completedMeals[`${day}-${m}`]).length;

                        return (
                            <div key={day} className="border border-white/10 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => toggleDay(day)}
                                    className="w-full p-4 bg-white/5 hover:bg-white/10 transition-colors flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-bold text-white">{day}</span>
                                        <span className="text-sm text-gray-400">{dayCompleted}/4 meals</span>
                                    </div>
                                    <span className="text-white">{isExpanded ? '▼' : '▶'}</span>
                                </button>

                                {isExpanded && (
                                    <div className="p-4 space-y-3">
                                        {MEAL_TYPES.map((mealType) => {
                                            const meal = dayMeals[mealType];
                                            const key = `${day}-${mealType}`;
                                            const isCompleted = completedMeals[key];

                                            return (
                                                <div
                                                    key={mealType}
                                                    className={`p-3 rounded-lg flex items-start gap-3 transition-all ${isCompleted ? 'bg-secondary/20 border border-secondary/30' : 'bg-white/5'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isCompleted || false}
                                                        onChange={() => toggleMeal(day, mealType)}
                                                        className="mt-1 w-5 h-5 cursor-pointer accent-secondary"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <span className="text-xs text-gray-500 uppercase">{mealType}</span>
                                                                <h4 className={`font-bold ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
                                                                    {meal.name}
                                                                </h4>
                                                            </div>
                                                            <span className="text-xs text-primary">{meal.calories}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-400 mt-1">{meal.desc}</p>
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
        );
    };

    const renderMonthlyView = () => {
        const monthDays = getMonthDays();
        const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

        return (
            <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">{monthName} Meal Plan</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {monthDays.map((date) => {
                        const dateKey = formatDate(date);
                        const dayName = getDayOfWeekName(date);
                        const dayMeals = DEFAULT_MEALS[dayName];
                        const dayCompleted = MEAL_TYPES.filter(m => completedMeals[`${dateKey}-${m}`]).length;

                        return (
                            <div key={dateKey} className="border border-white/10 rounded-xl p-4 bg-white/5">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <h4 className="text-lg font-bold text-white">{dayName}</h4>
                                        <p className="text-xs text-gray-500">{date.getDate()}</p>
                                    </div>
                                    <span className="text-sm text-gray-400">{dayCompleted}/4</span>
                                </div>

                                <div className="space-y-2">
                                    {MEAL_TYPES.map((mealType) => {
                                        const meal = dayMeals[mealType];
                                        const key = `${dateKey}-${mealType}`;
                                        const isCompleted = completedMeals[key];

                                        return (
                                            <div key={mealType} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={isCompleted || false}
                                                    onChange={() => toggleMeal(dateKey, mealType)}
                                                    className="w-4 h-4 cursor-pointer accent-secondary"
                                                />
                                                <div className="flex-1">
                                                    <p className={`text-xs ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
                                                        {meal.name}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 h-screen overflow-y-auto">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-white">Diet Plan 🍽️</h2>
                <p className="text-gray-400">Track your meals and earn points!</p>
            </header>

            <div className="flex gap-2 mb-6">
                {['daily', 'weekly', 'monthly'].map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === mode
                                ? 'bg-primary text-darker'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                ))}
            </div>

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
                    <h3 className="text-gray-400 text-sm mb-2">{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Progress</h3>
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
                    onClick={resetWeek}
                    className="text-sm text-gray-400 hover:text-white underline"
                >
                    Reset All Progress
                </button>
            </div>

            {viewMode === 'daily' && renderDailyView()}
            {viewMode === 'weekly' && renderWeeklyView()}
            {viewMode === 'monthly' && renderMonthlyView()}
        </div>
    );
};

export default DietPlan;
