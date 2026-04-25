
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, Patient, UserProfile, Professional } from '../types';
import { SendIcon, XIcon, BackIcon, CheckCircleIcon, SparklesIcon } from './Icons';
import { getWordSuggestions } from '../services/geminiService';

interface PersonalChatProps {
    recipient: Patient | Professional | UserProfile | null;
    userProfile: UserProfile;
    onClose: () => void;
}

const formatChatTimestamp = (timestamp: string): string => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const time = messageDate.toLocaleTimeString([], timeOptions);
    if (now.toDateString() === messageDate.toDateString()) return `Today, ${time}`;
    return `${messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
};

const PersonalChat: React.FC<PersonalChatProps> = ({ recipient, userProfile, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isRecipientTyping, setIsRecipientTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const suggestionTimeoutRef = useRef<number | null>(null);

    const isCurrentUserProfessional = userProfile.role === 'professional';

    const getLocalStorageKey = useCallback(() => {
        const userId = userProfile.email;
        const recipientIdentifier = recipient ? ('id' in recipient ? recipient.id.toString() : recipient.email) : 'unknown';
        const sortedIdentifiers = [userId, recipientIdentifier].sort().join('_');
        return `boticare_chat_history_${sortedIdentifiers}`;
    }, [userProfile.email, recipient]);

    // Load history and sort by timestamp
    useEffect(() => {
        const key = getLocalStorageKey();
        const savedMessages = localStorage.getItem(key);
        if (savedMessages) {
            try {
                const parsed: ChatMessage[] = JSON.parse(savedMessages);
                const sorted = parsed.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                setMessages(sorted);
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        }
    }, [getLocalStorageKey]);

    // Save history
    useEffect(() => {
        const key = getLocalStorageKey();
        localStorage.setItem(key, JSON.stringify(messages));
        scrollToBottom();
    }, [messages, getLocalStorageKey]);

    // Fetch AI suggestions based on conversation context
    useEffect(() => {
        if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
        suggestionTimeoutRef.current = window.setTimeout(async () => {
            if (messages.length > 0 || input.length > 2) {
                const fetched = await getWordSuggestions(input, messages);
                setSuggestions(fetched);
            } else {
                setSuggestions(["How are you feeling?", "Updates on labs?", "Next checkup?"]);
            }
        }, 800);
        return () => { if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current); };
    }, [messages, input]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = (textToSend: string = input) => {
        const text = textToSend.trim();
        if (!text || isRecipientTyping) return;

        const currentTime = new Date().toISOString();
        const newMsg: ChatMessage = {
            sender: isCurrentUserProfessional ? 'professional' : 'user',
            text: text,
            timestamp: currentTime,
            isRead: false,
            status: 'sent'
        };
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setSuggestions([]);

        // Simulate "Delivered" then "Read" receipt update
        setTimeout(() => {
            setMessages(prev => prev.map(m => (m.timestamp === currentTime ? { ...m, status: 'delivered' } : m)));
        }, 1500);
        
        setTimeout(() => {
            setMessages(prev => prev.map(m => (m.timestamp === currentTime ? { ...m, isRead: true, status: 'read' } : m)));
        }, 3500);

        setIsRecipientTyping(true);
        setTimeout(() => {
            setIsRecipientTyping(false);
            const reply: ChatMessage = {
                sender: 'ai', // Simulating response from the other person via AI for demo
                text: "I've received your message. Let me review your charts.",
                timestamp: new Date().toISOString(),
                status: 'read' // Incoming messages are typically 'read' by us immediately in this context or don't have status for sender
            };
            setMessages(prev => [...prev, reply]);
        }, 4500);
    };

    const handleSuggestionClick = (s: string) => {
        setInput(s);
    };

    if (!recipient) return null;

    const recipientName = 'name' in recipient ? recipient.name : 'Unknown';
    const recipientAvatar = 'avatar' in recipient ? recipient.avatar : 'https://i.pravatar.cc/150';

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-3xl border border-boticare-gray-medium dark:border-gray-700 shadow-xl animate-fade-in overflow-hidden">
            <div className="p-3 md:p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg lg:hidden"><BackIcon className="w-5 h-5 text-gray-500" /></button>
                    <div className="relative">
                        <img src={recipientAvatar} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" alt={recipientName} />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{recipientName}</h3>
                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">{isRecipientTyping ? 'Typing...' : 'Online'}</p>
                    </div>
                </div>
                <button onClick={onClose} className="hidden lg:block p-2 text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6"/></button>
            </div>

            <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-6 no-scrollbar bg-gray-50/50 dark:bg-gray-900/20">
                {messages.map((msg, idx) => {
                    const isSentByMe = msg.sender === 'user' || msg.sender === 'professional';
                    const isAI = msg.sender === 'ai';
                    return (
                        <div key={idx} className={`flex w-full ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[75%]`}>
                                <div className={`px-4 py-3 shadow-sm text-sm md:text-base border ${
                                    isSentByMe
                                        ? 'bg-emerald-600 text-white border-emerald-500 rounded-2xl rounded-tr-none'
                                        : isAI 
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-600 rounded-2xl rounded-tl-none'
                                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-100 dark:border-gray-600 rounded-2xl rounded-tl-none'
                                }`}>
                                    {isAI && <div className="flex items-center gap-1.5 mb-1 opacity-60"><SparklesIcon className="w-3 h-3" /><span className="text-[9px] font-black uppercase tracking-widest">Boticare AI</span></div>}
                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1.5 px-1 opacity-80">
                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{formatChatTimestamp(msg.timestamp)}</span>
                                    {isSentByMe && (
                                        <div className="flex items-center gap-1">
                                            {/* Status Text & Icon */}
                                            {msg.status === 'sent' && (
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sent</span>
                                            )}
                                            {msg.status === 'delivered' && (
                                                <>
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Delivered</span>
                                                    <CheckCircleIcon className="w-3 h-3 text-gray-400" />
                                                </>
                                            )}
                                            {msg.status === 'read' && (
                                                <>
                                                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Read</span>
                                                    <div className="flex -space-x-1">
                                                        <CheckCircleIcon className="w-3 h-3 text-emerald-500" />
                                                        <CheckCircleIcon className="w-3 h-3 text-emerald-500" />
                                                    </div>
                                                </>
                                            )}
                                            {/* Fallback for older messages without status field */}
                                            {!msg.status && (
                                                <span className="text-[9px] font-bold text-gray-400 uppercase">Sent</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {isRecipientTyping && (
                    <div className="flex items-center space-x-2 text-gray-400 p-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 md:p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                {suggestions.length > 0 && (
                    <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar pb-1 animate-fade-in px-1">
                        {suggestions.map((s, i) => (
                            <button 
                                key={i} 
                                onClick={() => handleSuggestionClick(s)} 
                                className="whitespace-nowrap px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800 hover:bg-blue-100 transition-all shadow-sm active:scale-95"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
                <div className="relative flex items-center">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Type a secure message..."
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-2xl pl-4 pr-14 py-3 md:py-3.5 shadow-inner focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white transition-all text-base md:text-base"
                    />
                    <button 
                        onClick={() => handleSend()} 
                        disabled={!input.trim() || isRecipientTyping} 
                        className="absolute right-2 p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all disabled:bg-gray-200 dark:disabled:bg-gray-700 shadow-md active:scale-95"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PersonalChat;
