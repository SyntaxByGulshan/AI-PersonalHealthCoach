import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Award, TrendingUp, Target, Flame, Calendar, BarChart3 } from 'lucide-react';

const Progress = () => {
    const progressState = useSelector(state => state.progress);

    // Get today's date key
    const getTodayKey = () => new Date().toISOString().split('T')[0];
    const today = getTodayKey();

    // Get today's points or default
    const todayPoints = progressState.dailyPoints[today] || { diet: 0, workout: 0, habits: 0, steps: 0, total: 0 };

    // Get array of this week's days
    const weekDays = useMemo(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dates = Object.keys(progressState.dailyPoints).sort();
        return dates.slice(-7).map((date, index) => ({
            day: days[index] || days[new Date(date).getDay()],
            date,
            points: progressState.dailyPoints[date] || { total: 0 }
        }));
    }, [progressState.dailyPoints]);

    // Find best day
    const bestDay = useMemo(() => {
        let best = { day: 'None', points: 0 };
        weekDays.forEach(d => {
            if (d.points.total > best.points) {
                best = { day: d.day, points: d.points.total };
            }
        });
        return best;
    }, [weekDays]);

    // Calculate max points for chart scaling
    const maxPoints = useMemo(() => {
        return Math.max(...weekDays.map(d => d.points.total), 100);
    }, [weekDays]);

    // Previous week comparison
    const previousWeekTotal = useMemo(() => {
        if (progressState.history.length > 0) {
            return progressState.history[0].total;
        }
        return 0;
    }, [progressState.history]);

    const weekChange = previousWeekTotal > 0
        ? Math.round(((progressState.weeklyTotal - previousWeekTotal) / previousWeekTotal) * 100)
        : 0;

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            {/* Header */}
            <header>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Progress & Analytics 📊</h2>
                <p className="text-gray-400 mt-1 text-sm md:text-base">
                    Track your daily and weekly progress with detailed insights
                </p>
            </header>

            {/* Today's Overview */}
            <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Today's Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="glass-card p-4 border-l-4 border-primary md:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-5 h-5 text-primary" />
                            <h4 className="font-bold text-white">Total Points</h4>
                        </div>
                        <div className="text-4xl font-bold text-primary mb-2">{todayPoints.total}</div>
                        <div className="text-xs text-gray-400">Keep it up! Every point counts.</div>
                    </div>

                    <div className="glass-card p-4 hover:bg-white/5 transition-all md:col-span-1">
                        <div className="text-xs text-gray-400 mb-1">Diet</div>
                        <div className="text-2xl font-bold text-green-500">+{todayPoints.diet}</div>
                        <div className="text-xs text-gray-500">points</div>
                    </div>

                    <div className="glass-card p-4 hover:bg-white/5 transition-all md:col-span-1">
                        <div className="text-xs text-gray-400 mb-1">Workout</div>
                        <div className="text-2xl font-bold text-orange-500">+{todayPoints.workout}</div>
                        <div className="text-xs text-gray-500">points</div>
                    </div>

                    <div className="glass-card p-4 hover:bg-white/5 transition-all md:col-span-1">
                        <div className="text-xs text-gray-400 mb-1">Other</div>
                        <div className="text-2xl font-bold text-purple-500">
                            +{todayPoints.habits + todayPoints.steps}
                        </div>
                        <div className="text-xs text-gray-500">points</div>
                    </div>
                </div>
            </div>

            {/* Weekly Summary */}
            <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-secondary" />
                    Weekly Summary
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

                    {/* Weekly Chart */}
                    <div className="glass-card p-4 md:p-6 lg:col-span-2">
                        <h4 className="font-bold text-white mb-4">Daily Points (This Week)</h4>
                        <div className="flex items-end justify-between gap-2 h-48">
                            {weekDays.map((dayData, index) => {
                                const height = maxPoints > 0 ? (dayData.points.total / maxPoints) * 100 : 0;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full bg-white/5 rounded-lg relative h-full flex items-end">
                                            <div
                                                className={`w-full rounded-lg transition-all ${dayData.points.total > 0 ? 'bg-gradient-to-t from-primary to-secondary' : 'bg-gray-700'
                                                    }`}
                                                style={{ height: `${height}%`, minHeight: dayData.points.total > 0 ? '8px' : '4px' }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-gray-400">{dayData.day}</div>
                                        <div className="text-xs font-bold text-white">{dayData.points.total}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Weekly Stats */}
                    <div className="space-y-4">
                        <div className="glass-card p-4 border-l-4 border-secondary">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-secondary" />
                                <h4 className="font-bold text-white">Weekly Total</h4>
                            </div>
                            <div className="text-3xl font-bold text-secondary mb-1">{progressState.weeklyTotal}</div>
                            {weekChange !== 0 && (
                                <div className={`text-xs ${weekChange > 0 ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                                    <span>{weekChange > 0 ? '↑' : '↓'}</span>
                                    <span>{Math.abs(weekChange)}% vs last week</span>
                                </div>
                            )}
                        </div>

                        <div className="glass-card p-4 border-l-4 border-yellow-500">
                            <div className="flex items-center gap-2 mb-2">
                                <Flame className="w-5 h-5 text-yellow-500" />
                                <h4 className="font-bold text-white">Current Streak</h4>
                            </div>
                            <div className="text-3xl font-bold text-yellow-500 mb-1">
                                {progressState.streaks.current}
                            </div>
                            <div className="text-xs text-gray-400">
                                {progressState.streaks.current === 1 ? 'day' : 'days'} | Best: {progressState.streaks.longest}
                            </div>
                        </div>

                        <div className="glass-card p-4 border-l-4 border-purple-500">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-5 h-5 text-purple-500" />
                                <h4 className="font-bold text-white">Best Day</h4>
                            </div>
                            <div className="text-2xl font-bold text-purple-500 mb-1">{bestDay.day}</div>
                            <div className="text-xs text-gray-400">{bestDay.points} points</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-4">Weekly Breakdown by Category</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card p-4">
                        <div className="text-sm text-gray-400 mb-2">Diet</div>
                        <div className="text-2xl font-bold text-green-500">
                            {progressState.weeklyCompletion.diet}%
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${progressState.weeklyCompletion.diet}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="glass-card p-4">
                        <div className="text-sm text-gray-400 mb-2">Workout</div>
                        <div className="text-2xl font-bold text-orange-500">
                            {progressState.weeklyCompletion.workout}%
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                            <div
                                className="bg-orange-500 h-2 rounded-full transition-all"
                                style={{ width: `${progressState.weeklyCompletion.workout}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="glass-card p-4">
                        <div className="text-sm text-gray-400 mb-2">Habits</div>
                        <div className="text-2xl font-bold text-blue-500">
                            {progressState.weeklyCompletion.habits}%
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${progressState.weeklyCompletion.habits}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="glass-card p-4">
                        <div className="text-sm text-gray-400 mb-2">Steps Goal</div>
                        <div className="text-2xl font-bold text-purple-500">
                            {progressState.weeklyCompletion.steps}%
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                            <div
                                className="bg-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${progressState.weeklyCompletion.steps}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insights */}
            {progressState.weeklyTotal > 0 && (
                <div className="glass-card p-4 md:p-6 border-l-4 border-primary">
                    <h3 className="text-lg font-bold text-white mb-3">💡 Insights</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                        {progressState.weeklyTotal >= previousWeekTotal && previousWeekTotal > 0 && (
                            <p>✨ Great job! You're performing better than last week!</p>
                        )}
                        {bestDay.points > 100 && (
                            <p>🔥 {bestDay.day} was your best day with {bestDay.points} points!</p>
                        )}
                        {progressState.streaks.current >= 3 && (
                            <p>🎯 You're on a {progressState.streaks.current}-day streak! Keep it going!</p>
                        )}
                        {todayPoints.total === 0 && (
                            <p>📈 No activity logged today yet. Start earning points by completing tasks!</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Progress;
