import React, { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';
import { User, Activity, Target, Heart, Utensils, AlertCircle, CheckCircle, ChevronRight, ChevronLeft, Save } from 'lucide-react';

const Profile = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [profile, setProfile] = useState(profileService.loadProfile());
    const [errors, setErrors] = useState({});
    const [saved, setSaved] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    const totalSteps = 5;

    useEffect(() => {
        if (profileService.isProfileComplete(profile)) {
            setShowSummary(true);
        }
    }, []);

    const handleInputChange = (field, value) => {
        setProfile(prev => ({
            ...prev,
            [field]: value
        }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleArrayToggle = (field, value) => {
        setProfile(prev => {
            const currentArray = prev[field] || [];
            const newArray = currentArray.includes(value)
                ? currentArray.filter(item => item !== value)
                : [...currentArray, value];
            return { ...prev, [field]: newArray };
        });
    };

    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 1:
                if (!profile.name?.trim()) newErrors.name = 'Name is required';
                if (!profile.age || profile.age < 10 || profile.age > 120) newErrors.age = 'Valid age required (10-120)';
                if (!profile.gender) newErrors.gender = 'Gender is required';
                break;
            case 2:
                if (!profile.height || profile.height < 100 || profile.height > 250) newErrors.height = 'Valid height required (100-250 cm)';
                if (!profile.weight || profile.weight < 30 || profile.weight > 300) newErrors.weight = 'Valid weight required (30-300 kg)';
                if (!profile.targetWeight || profile.targetWeight < 30 || profile.targetWeight > 300) newErrors.targetWeight = 'Valid target weight required';
                break;
            case 3:
                if (!profile.activityLevel) newErrors.activityLevel = 'Activity level is required';
                if (!profile.healthGoals || profile.healthGoals.length === 0) newErrors.healthGoals = 'Select at least one goal';
                break;
            case 4:
                if (!profile.dietaryPreference) newErrors.dietaryPreference = 'Dietary preference is required';
                break;
            case 5:
                if (!profile.sleepTime) newErrors.sleepTime = 'Sleep time is required';
                if (!profile.wakeTime) newErrors.wakeTime = 'Wake time is required';
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSave = () => {
        if (validateStep(currentStep)) {
            profileService.saveProfile(profile);
            setSaved(true);
            setShowSummary(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const handleEdit = () => {
        setShowSummary(false);
        setCurrentStep(1);
    };

    const bmi = profileService.calculateBMI(profile.weight, profile.height);
    const bmiCategory = profileService.getBMICategory(bmi);
    const calories = profileService.calculateRecommendedCalories(profile);
    const macros = calories ? profileService.getMacroRecommendations(calories.recommended, profile.healthGoals) : null;

    // Show summary view if profile exists (even if incomplete)
    if (showSummary) {
        const hasBasicInfo = profile.name || profile.age || profile.gender;
        const hasPhysicalMetrics = profile.height || profile.weight || profile.targetWeight;
        const hasHealthActivity = profile.activityLevel || (profile.healthGoals && profile.healthGoals.length > 0);
        const hasDietInfo = profile.dietaryPreference || (profile.allergies && profile.allergies.length > 0);
        const hasLifestyle = profile.sleepTime || profile.wakeTime || profile.waterIntakeGoal;

        return (
            <div className="p-4 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white">Your Profile</h2>
                        <p className="text-gray-400 mt-1 text-sm md:text-base">
                            {profileService.isProfileComplete(profile)
                                ? 'Your complete health profile'
                                : 'Add more details to get personalized recommendations'}
                        </p>
                    </div>
                    <button
                        onClick={handleEdit}
                        className="btn-primary flex items-center gap-2"
                    >
                        <User className="w-4 h-4" />
                        Edit Profile
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Personal Information - Only show if has data */}
                    {hasBasicInfo && (
                        <div className="glass-card p-4 md:p-6 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <User className="w-6 h-6 text-primary" />
                                <h3 className="text-lg md:text-xl font-bold text-white">Personal Information</h3>
                            </div>
                            <div className="space-y-3">
                                {profile.name && (
                                    <div className="flex justify-between text-sm md:text-base">
                                        <span className="text-gray-400">Name</span>
                                        <span className="text-white font-medium">{profile.name}</span>
                                    </div>
                                )}
                                {profile.age && (
                                    <div className="flex justify-between text-sm md:text-base">
                                        <span className="text-gray-400">Age</span>
                                        <span className="text-white font-medium">{profile.age} years</span>
                                    </div>
                                )}
                                {profile.gender && (
                                    <div className="flex justify-between text-sm md:text-base">
                                        <span className="text-gray-400">Gender</span>
                                        <span className="text-white font-medium capitalize">{profile.gender}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Physical Metrics - Only show if has data */}
                    {hasPhysicalMetrics && (
                        <div className="glass-card p-4 md:p-6 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Activity className="w-6 h-6 text-primary" />
                                <h3 className="text-lg md:text-xl font-bold text-white">Physical Metrics</h3>
                            </div>
                            <div className="space-y-3">
                                {profile.height && (
                                    <div className="flex justify-between text-sm md:text-base">
                                        <span className="text-gray-400">Height</span>
                                        <span className="text-white font-medium">{profile.height} cm</span>
                                    </div>
                                )}
                                {profile.weight && (
                                    <div className="flex justify-between text-sm md:text-base">
                                        <span className="text-gray-400">Current Weight</span>
                                        <span className="text-white font-medium">{profile.weight} kg</span>
                                    </div>
                                )}
                                {profile.targetWeight && (
                                    <div className="flex justify-between text-sm md:text-base">
                                        <span className="text-gray-400">Target Weight</span>
                                        <span className="text-white font-medium">{profile.targetWeight} kg</span>
                                    </div>
                                )}
                                {profile.height && profile.weight && bmi && (
                                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                        <span className="text-gray-400">BMI</span>
                                        <div className="text-right">
                                            <span className="text-white font-bold text-lg">{bmi}</span>
                                            <span className={`ml-2 text-sm ${bmiCategory === 'Normal' ? 'text-green-500' : bmiCategory === 'Overweight' ? 'text-yellow-500' : 'text-red-500'}`}>
                                                ({bmiCategory})
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Health & Activity - Only show if has data */}
                    {hasHealthActivity && (
                        <div className="glass-card p-4 md:p-6 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Target className="w-6 h-6 text-primary" />
                                <h3 className="text-lg md:text-xl font-bold text-white">Health & Activity</h3>
                            </div>
                            <div className="space-y-3">
                                {profile.activityLevel && (
                                    <div>
                                        <span className="text-gray-400 block mb-2 text-sm md:text-base">Activity Level</span>
                                        <span className="text-white font-medium capitalize text-sm md:text-base">{profile.activityLevel.replace('_', ' ')}</span>
                                    </div>
                                )}
                                {profile.healthGoals && profile.healthGoals.length > 0 && (
                                    <div>
                                        <span className="text-gray-400 block mb-2 text-sm md:text-base">Health Goals</span>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.healthGoals.map(goal => (
                                                <span key={goal} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs md:text-sm">
                                                    {goal.replace('_', ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Nutrition & Diet - Only show if has data */}
                    {hasDietInfo && (
                        <div className="glass-card p-4 md:p-6 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Utensils className="w-6 h-6 text-primary" />
                                <h3 className="text-lg md:text-xl font-bold text-white">Nutrition & Diet</h3>
                            </div>
                            <div className="space-y-3">
                                {profile.dietaryPreference && (
                                    <div className="flex justify-between text-sm md:text-base">
                                        <span className="text-gray-400">Dietary Preference</span>
                                        <span className="text-white font-medium capitalize">{profile.dietaryPreference.replace('_', ' ')}</span>
                                    </div>
                                )}
                                {profile.allergies && profile.allergies.length > 0 && (
                                    <div>
                                        <span className="text-gray-400 block mb-2 text-sm md:text-base">Allergies</span>
                                        <span className="text-white font-medium text-sm md:text-base">
                                            {profile.allergies.join(', ')}
                                        </span>
                                    </div>
                                )}
                                {profile.medicalConditions && profile.medicalConditions.length > 0 && (
                                    <div>
                                        <span className="text-gray-400 block mb-2 text-sm md:text-base">Medical Conditions</span>
                                        <span className="text-white font-medium text-sm md:text-base">
                                            {profile.medicalConditions.join(', ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Daily Recommendations - Only show if we can calculate */}
                {calories && (
                    <div className="glass-card p-4 md:p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Heart className="w-6 h-6 text-primary" />
                            <h3 className="text-lg md:text-xl font-bold text-white">Daily Recommendations</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            <div className="text-center">
                                <p className="text-gray-400 text-xs md:text-sm mb-2">Recommended Calories</p>
                                <p className="text-2xl md:text-3xl font-bold text-primary">{calories.recommended}</p>
                                <p className="text-gray-500 text-xs mt-1">kcal/day</p>
                            </div>
                            {macros && (
                                <>
                                    <div className="text-center">
                                        <p className="text-gray-400 text-xs md:text-sm mb-2">Protein</p>
                                        <p className="text-xl md:text-2xl font-bold text-white">{macros.protein}g</p>
                                        <p className="text-gray-500 text-xs mt-1">per day</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-400 text-xs md:text-sm mb-2">Carbs</p>
                                        <p className="text-xl md:text-2xl font-bold text-white">{macros.carbs}g</p>
                                        <p className="text-gray-500 text-xs mt-1">per day</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-400 text-xs md:text-sm mb-2">Fats</p>
                                        <p className="text-xl md:text-2xl font-bold text-white">{macros.fats}g</p>
                                        <p className="text-gray-500 text-xs mt-1">per day</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Lifestyle - Only show if has data */}
                {hasLifestyle && (
                    <div className="glass-card p-4 md:p-6">
                        <h3 className="text-lg md:text-xl font-bold text-white mb-4">Lifestyle</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            {(profile.sleepTime || profile.wakeTime) && (
                                <div>
                                    <span className="text-gray-400 block mb-2 text-sm">Sleep Schedule</span>
                                    <span className="text-white font-medium text-sm md:text-base">
                                        {profile.sleepTime || '--:--'} - {profile.wakeTime || '--:--'}
                                    </span>
                                </div>
                            )}
                            {profile.waterIntakeGoal && (
                                <div>
                                    <span className="text-gray-400 block mb-2 text-sm">Water Goal</span>
                                    <span className="text-white font-medium text-sm md:text-base">{profile.waterIntakeGoal}L per day</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty state message if no data at all */}
                {!hasBasicInfo && !hasPhysicalMetrics && !hasHealthActivity && !hasDietInfo && !hasLifestyle && (
                    <div className="glass-card p-8 text-center">
                        <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Profile Data Yet</h3>
                        <p className="text-gray-400 mb-6">Click "Edit Profile" to add your information and get personalized health recommendations.</p>
                        <button
                            onClick={handleEdit}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <User className="w-4 h-4" />
                            Add Profile Information
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Complete Your Profile</h2>
                <p className="text-gray-400 mt-1 text-sm md:text-base">Help us personalize your health journey</p>
            </div>

            <div className="mb-6 md:mb-8">
                <div className="flex justify-between mb-2">
                    <span className="text-xs md:text-sm text-gray-400">Step {currentStep} of {totalSteps}</span>
                    <span className="text-xs md:text-sm text-gray-400">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            {saved && (
                <div className="mb-6 glass-card p-4 border-l-4 border-green-500 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-500 font-medium text-sm md:text-base">Profile saved successfully!</span>
                </div>
            )}

            <div className="glass-card p-4 md:p-8">
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="w-6 h-6 text-primary" />
                            <h3 className="text-xl md:text-2xl font-bold text-white">Personal Information</h3>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-2 text-sm md:text-base">Full Name *</label>
                            <input
                                type="text"
                                value={profile.name || ''}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none text-sm md:text-base"
                                placeholder="Enter your name"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs md:text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" /> {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm md:text-base">Age *</label>
                                <input
                                    type="number"
                                    value={profile.age || ''}
                                    onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none text-sm md:text-base"
                                    placeholder="25"
                                    min="10"
                                    max="120"
                                />
                                {errors.age && (
                                    <p className="text-red-500 text-xs md:text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" /> {errors.age}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-400 mb-2 text-sm md:text-base">Gender *</label>
                                <select
                                    value={profile.gender || ''}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none text-sm md:text-base"
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.gender && (
                                    <p className="text-red-500 text-xs md:text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" /> {errors.gender}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="w-6 h-6 text-primary" />
                            <h3 className="text-xl md:text-2xl font-bold text-white">Physical Metrics</h3>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-2 text-sm md:text-base">Height (cm) *</label>
                            <input
                                type="number"
                                value={profile.height || ''}
                                onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none text-sm md:text-base"
                                placeholder="170"
                                min="100"
                                max="250"
                            />
                            {errors.height && (
                                <p className="text-red-500 text-xs md:text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" /> {errors.height}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm md:text-base">Current Weight (kg) *</label>
                                <input
                                    type="number"
                                    value={profile.weight || ''}
                                    onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none text-sm md:text-base"
                                    placeholder="70"
                                    min="30"
                                    max="300"
                                    step="0.1"
                                />
                                {errors.weight && (
                                    <p className="text-red-500 text-xs md:text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" /> {errors.weight}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-400 mb-2 text-sm md:text-base">Target Weight (kg) *</label>
                                <input
                                    type="number"
                                    value={profile.targetWeight || ''}
                                    onChange={(e) => handleInputChange('targetWeight', parseFloat(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none text-sm md:text-base"
                                    placeholder="65"
                                    min="30"
                                    max="300"
                                    step="0.1"
                                />
                                {errors.targetWeight && (
                                    <p className="text-red-500 text-xs md:text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" /> {errors.targetWeight}
                                    </p>
                                )}
                            </div>
                        </div>

                        {profile.height && profile.weight && (
                            <div className="glass-card p-4 bg-primary/10 border border-primary/20">
                                <p className="text-gray-400 text-xs md:text-sm mb-1">Your Current BMI</p>
                                <p className="text-xl md:text-2xl font-bold text-white">
                                    {profileService.calculateBMI(profile.weight, profile.height)}
                                    <span className="text-xs md:text-sm text-gray-400 ml-2">
                                        ({profileService.getBMICategory(profileService.calculateBMI(profile.weight, profile.height))})
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Target className="w-6 h-6 text-primary" />
                            <h3 className="text-xl md:text-2xl font-bold text-white">Activity & Goals</h3>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-3 text-sm md:text-base">Activity Level *</label>
                            <div className="space-y-2">
                                {[
                                    { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
                                    { value: 'lightly_active', label: 'Lightly Active', desc: 'Exercise 1-3 days/week' },
                                    { value: 'moderately_active', label: 'Moderately Active', desc: 'Exercise 3-5 days/week' },
                                    { value: 'very_active', label: 'Very Active', desc: 'Exercise 6-7 days/week' },
                                    { value: 'extremely_active', label: 'Extremely Active', desc: 'Physical job + exercise' }
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleInputChange('activityLevel', option.value)}
                                        className={`w-full text-left p-3 md:p-4 rounded-lg border transition-all ${profile.activityLevel === option.value
                                            ? 'bg-primary/20 border-primary text-white'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                    >
                                        <p className="font-medium text-sm md:text-base">{option.label}</p>
                                        <p className="text-xs md:text-sm opacity-75">{option.desc}</p>
                                    </button>
                                ))}
                            </div>
                            {errors.activityLevel && (
                                <p className="text-red-500 text-xs md:text-sm mt-2 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" /> {errors.activityLevel}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-3 text-sm md:text-base">Health Goals * (Select all that apply)</label>
                            <div className="grid grid-cols-2 gap-2 md:gap-3">
                                {[
                                    { value: 'weight_loss', label: 'Weight Loss' },
                                    { value: 'muscle_gain', label: 'Muscle Gain' },
                                    { value: 'maintain_weight', label: 'Maintain Weight' },
                                    { value: 'improve_fitness', label: 'Improve Fitness' },
                                    { value: 'general_health', label: 'General Health' },
                                    { value: 'increase_energy', label: 'Increase Energy' }
                                ].map(goal => (
                                    <button
                                        key={goal.value}
                                        onClick={() => handleArrayToggle('healthGoals', goal.value)}
                                        className={`p-2 md:p-3 rounded-lg border transition-all text-xs md:text-sm ${profile.healthGoals?.includes(goal.value)
                                            ? 'bg-primary/20 border-primary text-white'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                    >
                                        {goal.label}
                                    </button>
                                ))}
                            </div>
                            {errors.healthGoals && (
                                <p className="text-red-500 text-xs md:text-sm mt-2 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" /> {errors.healthGoals}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Utensils className="w-6 h-6 text-primary" />
                            <h3 className="text-xl md:text-2xl font-bold text-white">Dietary Preferences</h3>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-3 text-sm md:text-base">Dietary Preference *</label>
                            <div className="grid grid-cols-2 gap-2 md:gap-3">
                                {[
                                    { value: 'no_restrictions', label: 'No Restrictions' },
                                    { value: 'vegetarian', label: 'Vegetarian' },
                                    { value: 'vegan', label: 'Vegan' },
                                    { value: 'keto', label: 'Keto' },
                                    { value: 'paleo', label: 'Paleo' },
                                    { value: 'mediterranean', label: 'Mediterranean' }
                                ].map(diet => (
                                    <button
                                        key={diet.value}
                                        onClick={() => handleInputChange('dietaryPreference', diet.value)}
                                        className={`p-2 md:p-3 rounded-lg border transition-all text-xs md:text-sm ${profile.dietaryPreference === diet.value
                                            ? 'bg-primary/20 border-primary text-white'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                    >
                                        {diet.label}
                                    </button>
                                ))}
                            </div>
                            {errors.dietaryPreference && (
                                <p className="text-red-500 text-xs md:text-sm mt-2 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" /> {errors.dietaryPreference}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-3 text-sm md:text-base">Allergies (Optional)</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {['Dairy', 'Eggs', 'Nuts', 'Soy', 'Gluten', 'Shellfish'].map(allergy => (
                                    <button
                                        key={allergy}
                                        onClick={() => handleArrayToggle('allergies', allergy)}
                                        className={`p-2 rounded-lg border text-xs md:text-sm transition-all ${profile.allergies?.includes(allergy)
                                            ? 'bg-red-500/20 border-red-500 text-white'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                    >
                                        {allergy}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-3 text-sm md:text-base">Medical Conditions (Optional)</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {['Diabetes', 'Hypertension', 'Heart Disease', 'Thyroid', 'PCOS', 'Asthma'].map(condition => (
                                    <button
                                        key={condition}
                                        onClick={() => handleArrayToggle('medicalConditions', condition)}
                                        className={`p-2 rounded-lg border text-xs md:text-sm transition-all ${profile.medicalConditions?.includes(condition)
                                            ? 'bg-yellow-500/20 border-yellow-500 text-white'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                    >
                                        {condition}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 5 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Heart className="w-6 h-6 text-primary" />
                            <h3 className="text-xl md:text-2xl font-bold text-white">Lifestyle</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm md:text-base">Sleep Time *</label>
                                <input
                                    type="time"
                                    value={profile.sleepTime || ''}
                                    onChange={(e) => handleInputChange('sleepTime', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none text-sm md:text-base"
                                />
                                {errors.sleepTime && (
                                    <p className="text-red-500 text-xs md:text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" /> {errors.sleepTime}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-400 mb-2 text-sm md:text-base">Wake Time *</label>
                                <input
                                    type="time"
                                    value={profile.wakeTime || ''}
                                    onChange={(e) => handleInputChange('wakeTime', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none text-sm md:text-base"
                                />
                                {errors.wakeTime && (
                                    <p className="text-red-500 text-xs md:text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" /> {errors.wakeTime}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-2 text-sm md:text-base">Daily Water Intake Goal (Liters)</label>
                            <input
                                type="number"
                                value={profile.waterIntakeGoal || 2.5}
                                onChange={(e) => handleInputChange('waterIntakeGoal', parseFloat(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none text-sm md:text-base"
                                min="1"
                                max="10"
                                step="0.1"
                            />
                            <p className="text-gray-500 text-xs md:text-sm mt-1">Recommended: 2-3 liters per day</p>
                        </div>

                        <div className="glass-card p-4 bg-secondary/10 border border-secondary/20">
                            <p className="text-secondary font-medium mb-2 text-sm md:text-base">🎉 Almost there!</p>
                            <p className="text-gray-400 text-xs md:text-sm">
                                Click "Save Profile" to complete your profile and get personalized health recommendations.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between mt-6">
                <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all text-sm md:text-base ${currentStep === 1
                        ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                        : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </button>

                {currentStep < totalSteps ? (
                    <button
                        onClick={handleNext}
                        className="btn-primary flex items-center gap-2 text-sm md:text-base"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        onClick={handleSave}
                        className="bg-secondary text-darker font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg hover:bg-opacity-80 transition-all flex items-center gap-2 text-sm md:text-base"
                    >
                        <Save className="w-4 h-4" />
                        Save Profile
                    </button>
                )}
            </div>
        </div>
    );
};

export default Profile;
