
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, Patient, UserProfile, Professional } from '../types';
import { SendIcon, XIcon, UserIcon, ArrowRightIcon, BackIcon, ChatIcon, CheckCircleIcon } from './Icons';

interface PersonalChatProps {
    recipient: Patient | Professional | UserProfile | null; // Updated to include Professional
    userProfile: UserProfile;
    onClose: () => void;
}

// Helper to format timestamps for chat messages
const formatChatTimestamp = (timestamp: string): string => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    const diffDays = Math.round(Math.abs((now.getTime() - messageDate.getTime()) / oneDay));

    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const time = messageDate.toLocaleTimeString([], timeOptions);

    if (diffDays === 0 && now.getDate() === messageDate.getDate()) {
        return `Today, ${time}`;
    } else if (diffDays === 1 && now.getDate() - 1 === messageDate.getDate()) {
        return `Yesterday, ${time}`;
    } else {
        const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        const date = messageDate.toLocaleDateString([], dateOptions);
        return `${date}, ${time}`;
    }
};

const PersonalChat: React.FC<PersonalChatProps> = ({ recipient, userProfile, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isRecipientTyping, setIsRecipientTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Determine if the current user is a professional or patient based on userProfile
    const isCurrentUserProfessional = userProfile.role === 'professional';

    // Generate a unique key for local storage for this chat session
    const getLocalStorageKey = useCallback(() => {
        // Ensure recipient ID is available and use a consistent order for key generation
        const userId = userProfile.email; // Using email as a unique identifier for user
        const recipientIdentifier = recipient ? ('id' in recipient ? recipient.id.toString() : recipient.email) : 'unknown';
        // Sort identifiers to ensure a consistent key regardless of who is sender/recipient
        const sortedIdentifiers = [userId, recipientIdentifier].sort().join('_');
        return `boticare_chat_history_${sortedIdentifiers}`;
    }, [userProfile.email, recipient]);

    // Load chat history from local storage on mount
    useEffect(() => {
        const key = getLocalStorageKey();
        const savedMessages = localStorage.getItem(key);
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    }, [getLocalStorageKey]);

    // Save chat history to local storage whenever messages change
    useEffect(() => {
        const key = getLocalStorageKey();
        localStorage.setItem(key, JSON.stringify(messages));
        scrollToBottom();
    }, [messages, getLocalStorageKey]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = () => {
        if (!input.trim() || isRecipientTyping) return;

        const currentTime = new Date().toISOString(); // Use ISO string for consistent sorting
        
        const newMsg: ChatMessage = {
            sender: isCurrentUserProfessional ? 'professional' : 'patient',
            text: input,
            timestamp: currentTime,
            isRead: false // Initially unread
        };
        setMessages(prev => [...prev, newMsg]);
        setInput('');

        // Simulate "Read" status for the sent message after 1.5s
        setTimeout(() => {
            setMessages(prev => prev.map(m => m === newMsg ? { ...m, isRead: true } : m));
        }, 1500);

        // Simulate typing indicator and reply after 3s
        setIsRecipientTyping(true);
        setTimeout(() => {
            setIsRecipientTyping(false);
            const replyTime = new Date().toISOString();
            const reply: ChatMessage = {
                sender: isCurrentUserProfessional ? 'patient' : 'professional', // Recipient sends the reply
                text: "I've received your message and will review it shortly. Thank you.",
                timestamp: replyTime,
            };
            setMessages(prev => [...prev, reply]);
        }, 3000);
    };

    if (!recipient) return null;

    const recipientName = 'name' in recipient ? recipient.name : 'Unknown';
    const recipientAvatar = 'avatar' in recipient ? recipient.avatar : 'https://i.pravatar.cc/150';
    const recipientTitle = (recipient as Professional).professionalTitle || ''; // Only for Professional recipients

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-boticare-gray-medium dark:border-gray-700 shadow-xl animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg lg:hidden">
                        <BackIcon className="w-5 h-5 text-gray-500" />
                    </button>
                    <div className="relative">
                        <img src={recipientAvatar} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" alt={recipientName} />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{recipientTitle ? `${recipientTitle} ${recipientName}` : recipientName}</h3>
                        {isRecipientTyping ? (
                            <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider animate-pulse">Typing...</p>
                        ) : (
                            <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Online Now</p>
                        )}
                    </div>
                </div>
                <button onClick={onClose} className="hidden lg:block p-2 text-gray-400 hover:text-gray-600 transition-colors"><XIcon className="w-6 h-6"/></button>
            </div>

            {/* Chat Area */}
            <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-6 no-scrollbar bg-gray-50/50 dark:bg-gray-900/20">
                <div className="text-center py-4">
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-gray-200 dark:border-gray-600">
                        Secure End-to-End Encrypted Session
                    </span>
                </div>
                {messages.length === 0 && !isRecipientTyping && (
                    <div className="text-center py-20 opacity-50">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ChatIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">Start the conversation with {recipientTitle ? `${recipientTitle} ${recipientName}` : recipientName}</p>
                    </div>
                )}
                {messages
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // Sort messages by timestamp
                    .map((msg, idx) => {
                    // Determine if the message belongs to the current user (sent by them)
                    const isSentByMe = msg.sender === (isCurrentUserProfessional ? 'professional' : 'patient');
                    
                    return (
                        <div key={idx} className={`flex w-full ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base ${
                                    isSentByMe
                                        ? 'bg-boticare-blue-dark text-white rounded-tr-none'
                                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-tl-none'
                                }`}>
                                    <p>{msg.text}</p>
                                </div>
                                <div className="flex items-center gap-1 mt-1 px-1">
                                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">{formatChatTimestamp(msg.timestamp)}</span>
                                    {isSentByMe && (
                                        <div className="flex items-center" title={msg.isRead ? "Read" : "Sent"}>
                                            <CheckCircleIcon className={`w-3 h-3 ${msg.isRead ? 'text-blue-500' : 'text-gray-300'}`} />
                                            <CheckCircleIcon className={`w-3 h-3 -ml-1.5 ${msg.isRead ? 'text-blue-500' : 'text-gray-300'}`} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {isRecipientTyping && (
                    <div className="flex w-full justify-start">
                         <div className="flex-shrink-0 flex flex-col justify-end">
                            <img src={recipientAvatar} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" alt={recipientName} />
                        </div>
                        <div className="flex flex-col items-start max-w-[75%] ml-3">
                            <div className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm text-sm md:text-base">
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                <div className="relative flex items-center">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Type a secure message..."
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-14 py-3.5 shadow-inner focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-all"
                        disabled={isRecipientTyping}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isRecipientTyping}
                        className="absolute right-2 p-2 bg-boticare-blue-dark text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-700"
                    >
                        <SendIcon className="w-5 h-5 ml-0.5" />
                    </button>
                </div>
                <p className="text-[9px] text-center text-gray-400 mt-2">Boticare encrypted chat protocol v2.4.1</p>
            </div>
        </div>
    );
};

export default PersonalChat;