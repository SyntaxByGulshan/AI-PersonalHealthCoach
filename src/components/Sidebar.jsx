import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CheckSquare, Bot, Utensils, Dumbbell, User, Menu, X } from 'lucide-react';
import { profileService } from '../services/profileService';
import logo from '../assets/logo.png';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const [userName, setUserName] = useState('User');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const profile = profileService.loadProfile();
        if (profile.name) {
            setUserName(profile.name);
        }
    }, [activeTab]);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={24} /> },
        { id: 'profile', label: 'Profile', icon: <User size={24} /> },
        { id: 'habits', label: 'Daily Habits', icon: <CheckSquare size={24} /> },
        { id: 'chat', label: 'AI Coach', icon: <Bot size={24} /> },
        { id: 'diet', label: 'Diet Plan', icon: <Utensils size={24} /> },
        { id: 'workout', label: 'Workout', icon: <Dumbbell size={24} /> },
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden fixed top-4 left-4 z-50 bg-darker border border-white/10 p-3 rounded-xl text-primary hover:bg-white/5 transition-all"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed left-0 top-0 h-screen bg-darker border-r border-white/10 flex flex-col z-50 transition-all duration-300
                w-64 md:w-24 lg:w-64
                p-6 md:p-4 lg:p-6
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="mb-10 md:mb-8 lg:mb-10 flex items-center justify-center lg:justify-start gap-3">
                    <img
                        src={logo}
                        alt="Pulse AI"
                        className="w-10 h-10 md:w-8 md:h-8 lg:w-10 lg:h-10 object-contain"
                    />
                    <h1 className="text-xl font-bold text-primary md:hidden lg:block">Pulse AI</h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-3 md:space-y-4">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`
                                w-full flex items-center rounded-xl transition-all group relative
                                gap-3 px-4 py-3
                                md:justify-center md:px-0 md:py-4
                                lg:justify-start lg:gap-3 lg:px-4 lg:py-3
                                ${activeTab === item.id
                                    ? 'bg-primary/20 text-primary border border-primary/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                                }
                            `}
                            title={item.label}
                        >
                            <span className="text-xl flex-shrink-0">{item.icon}</span>
                            <span className="font-medium md:hidden lg:block">{item.label}</span>

                            {/* Tooltip for tablet */}
                            <span className="hidden md:block lg:hidden absolute left-full ml-2 bg-darker border border-white/10 px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </nav>

                {/* User Profile */}
                <div className="mt-auto pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 md:flex-col md:gap-2 lg:flex-row lg:gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex-shrink-0"></div>
                        <div className="md:hidden lg:block text-center lg:text-left">
                            <p className="text-white font-medium truncate text-sm">{userName}</p>
                            <p className="text-xs text-gray-400">Free Access</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
