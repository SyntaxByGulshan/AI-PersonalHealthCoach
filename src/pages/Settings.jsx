import React, { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';
import { User, Bell, Moon, Trash2, Download, Upload, Save, CheckCircle } from 'lucide-react';

const Settings = () => {
    const [saved, setSaved] = useState(false);
    const [settings, setSettings] = useState({
        notifications: true,
        dailyReminder: true,
        reminderTime: '09:00',
        weeklyReport: false,
        darkMode: true,
        soundEffects: true
    });

    useEffect(() => {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSaveSettings = () => {
        localStorage.setItem('appSettings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleExportData = () => {
        const profile = profileService.exportProfile();
        const dailySteps = localStorage.getItem('dailySteps') || '0';
        const habits = localStorage.getItem('dailyHabits') || '{}';
        const dietProgress = localStorage.getItem('dietProgress') || '{}';
        const workoutProgress = localStorage.getItem('workoutProgress') || '{}';

        const exportData = {
            profile,
            dailySteps,
            habits: JSON.parse(habits),
            dietProgress: JSON.parse(dietProgress),
            workoutProgress: JSON.parse(workoutProgress),
            settings,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-health-coach-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleImportData = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);

                    // Restore data
                    if (importedData.profile) {
                        profileService.saveProfile(importedData.profile);
                    }
                    if (importedData.dailySteps) {
                        localStorage.setItem('dailySteps', importedData.dailySteps);
                    }
                    if (importedData.habits) {
                        localStorage.setItem('dailyHabits', JSON.stringify(importedData.habits));
                    }
                    if (importedData.dietProgress) {
                        localStorage.setItem('dietProgress', JSON.stringify(importedData.dietProgress));
                    }
                    if (importedData.workoutProgress) {
                        localStorage.setItem('workoutProgress', JSON.stringify(importedData.workoutProgress));
                    }
                    if (importedData.settings) {
                        setSettings(importedData.settings);
                        localStorage.setItem('appSettings', JSON.stringify(importedData.settings));
                    }

                    alert('Data imported successfully! Please refresh the page to see changes.');
                } catch (error) {
                    alert('Error importing data. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    };

    const handleClearAllData = () => {
        const confirmed = window.confirm(
            '⚠️ WARNING: This will permanently delete ALL your data including profile, progress, and settings. This action cannot be undone. Are you sure?'
        );

        if (confirmed) {
            const doubleConfirm = window.confirm(
                'Are you ABSOLUTELY sure? This will erase everything!'
            );

            if (doubleConfirm) {
                localStorage.clear();
                alert('All data has been cleared. The page will now reload.');
                window.location.reload();
            }
        }
    };

    const profile = profileService.loadProfile();
    const isProfileComplete = profileService.isProfileComplete(profile);

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-white">Settings</h2>
                <p className="text-gray-400 mt-1">Manage your app preferences and data</p>
            </div>

            {/* Success Notification */}
            {saved && (
                <div className="glass-card p-4 border-l-4 border-green-500 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-500 font-medium">Settings saved successfully!</span>
                </div>
            )}

            {/* Profile Quick Info */}
            {isProfileComplete && (
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <User className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold text-white">Profile Overview</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-gray-400 text-sm">Name</p>
                            <p className="text-white font-medium">{profile.name}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Age</p>
                            <p className="text-white font-medium">{profile.age} years</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Weight</p>
                            <p className="text-white font-medium">{profile.weight} kg</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Goal</p>
                            <p className="text-white font-medium capitalize">
                                {profile.healthGoals?.[0]?.replace('_', ' ') || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Settings */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Bell className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-white">Notifications</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                            <p className="text-white font-medium">Enable Notifications</p>
                            <p className="text-gray-400 text-sm">Receive app notifications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.notifications}
                                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                            <p className="text-white font-medium">Daily Reminder</p>
                            <p className="text-gray-400 text-sm">Get reminded to log your progress</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.dailyReminder}
                                onChange={(e) => handleSettingChange('dailyReminder', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    {settings.dailyReminder && (
                        <div className="pl-4">
                            <label className="block text-gray-400 mb-2 text-sm">Reminder Time</label>
                            <input
                                type="time"
                                value={settings.reminderTime}
                                onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                            <p className="text-white font-medium">Weekly Report</p>
                            <p className="text-gray-400 text-sm">Receive weekly progress summary</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.weeklyReport}
                                onChange={(e) => handleSettingChange('weeklyReport', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Appearance Settings */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Moon className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-white">Appearance</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                            <p className="text-white font-medium">Dark Mode</p>
                            <p className="text-gray-400 text-sm">Use dark theme (recommended)</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.darkMode}
                                onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                            <p className="text-white font-medium">Sound Effects</p>
                            <p className="text-gray-400 text-sm">Play sounds for interactions</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.soundEffects}
                                onChange={(e) => handleSettingChange('soundEffects', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Save Settings Button */}
            <button
                onClick={handleSaveSettings}
                className="btn-primary w-full flex items-center justify-center gap-2"
            >
                <Save className="w-4 h-4" />
                Save Settings
            </button>

            {/* Data Management */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-6">Data Management</h3>

                <div className="space-y-4">
                    {/* Export Data */}
                    <button
                        onClick={handleExportData}
                        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 hover:border-primary/50"
                    >
                        <div className="flex items-center gap-3">
                            <Download className="w-5 h-5 text-primary" />
                            <div className="text-left">
                                <p className="text-white font-medium">Export Data</p>
                                <p className="text-gray-400 text-sm">Download all your data as JSON</p>
                            </div>
                        </div>
                        <span className="text-primary">→</span>
                    </button>

                    {/* Import Data */}
                    <label className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 hover:border-primary/50 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <Upload className="w-5 h-5 text-primary" />
                            <div className="text-left">
                                <p className="text-white font-medium">Import Data</p>
                                <p className="text-gray-400 text-sm">Restore from backup file</p>
                            </div>
                        </div>
                        <span className="text-primary">→</span>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportData}
                            className="hidden"
                        />
                    </label>

                    {/* Clear All Data */}
                    <button
                        onClick={handleClearAllData}
                        className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all border border-red-500/20 hover:border-red-500/50"
                    >
                        <div className="flex items-center gap-3">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            <div className="text-left">
                                <p className="text-red-500 font-medium">Clear All Data</p>
                                <p className="text-gray-400 text-sm">Permanently delete all app data</p>
                            </div>
                        </div>
                        <span className="text-red-500">⚠️</span>
                    </button>
                </div>
            </div>

            {/* App Info */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">About</h3>
                <div className="space-y-2 text-gray-400">
                    <p><span className="text-white font-medium">App Name:</span> AI Health Coach</p>
                    <p><span className="text-white font-medium">Version:</span> 1.0.0</p>
                    <p><span className="text-white font-medium">Storage Used:</span> {
                        new Blob([JSON.stringify(localStorage)]).size > 1024
                            ? `${(new Blob([JSON.stringify(localStorage)]).size / 1024).toFixed(2)} KB`
                            : `${new Blob([JSON.stringify(localStorage)]).size} bytes`
                    }</p>
                    <p className="text-sm pt-2">Made with ❤️ for your health journey</p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
