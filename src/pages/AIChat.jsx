import React, { useState, useRef, useEffect } from 'react';
import { sendMessage, isConfigured } from '../services/gemini';

const AIChat = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: 'Hello! I am your personal health coach. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        if (!isConfigured()) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'ai',
                text: "⚠️ Please configure your VITE_GEMINI_API_KEY in the .env file to use the AI features."
            }]);
            return;
        }

        const userMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Mock user stats for now - in a real app these would come from a context/store
            const userStats = {
                steps: 8432,
                calories: 1850,
                water: 1.2,
                sleep: "7h 20m"
            };

            // Filter out the initial greeting and system messages from history sent to API
            const history = messages.filter(m => m.id !== 1).map(m => ({
                sender: m.sender,
                text: m.text
            }));

            const responseText = await sendMessage(history, input, userStats);

            const aiMsg = {
                id: Date.now() + 1,
                sender: 'ai',
                text: responseText
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'ai',
                text: "Sorry, I encountered an error connecting to the AI. Please check your API key."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col p-6">
            <header className="mb-6">
                <h2 className="text-3xl font-bold text-white">AI Coach 🤖</h2>
                <p className="text-gray-400">Ask me anything about your health, diet, or workouts.</p>
            </header>

            <div className="flex-1 glass-card p-6 mb-6 overflow-y-auto flex flex-col gap-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.sender === 'user'
                                ? 'bg-primary text-darker font-medium rounded-tr-none'
                                : 'bg-white/10 text-white rounded-tl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 text-white rounded-2xl rounded-tl-none p-4">
                            <div className="flex gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                />
                <button onClick={handleSend} disabled={isLoading} className="btn-primary px-8 disabled:opacity-50">
                    Send
                </button>
            </div>
        </div>
    );
};

export default AIChat;
