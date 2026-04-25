
import React, { useState } from 'react';
import { Professional } from '../types';
import { PROFESSIONALS_DATA } from '../constants';
import { ChatIcon, SearchIcon, ArrowRightIcon } from './Icons';

interface MyDoctorsProps {
    onStartChat: (recipient: Professional) => void;
}

const MyDoctors: React.FC<MyDoctorsProps> = ({ onStartChat }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Simulate "Previous Chats" by taking a subset of professionals
    // In a real app, this would come from a `chat_sessions` table
    const previousChats = PROFESSIONALS_DATA.slice(0, 3).map((pro, index) => ({
        ...pro,
        lastMessage: index === 0 ? "Please update me on your blood pressure readings." : "The prescription has been sent to your pharmacy.",
        lastMessageTime: index === 0 ? "10:30 AM" : "Yesterday",
        unread: index === 0
    }));

    const filteredProfessionals = PROFESSIONALS_DATA.filter(pro => 
        pro.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        pro.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            <div className="flex-shrink-0">
                <h2 className="text-2xl font-black mb-1">Messages</h2>
                <p className="text-boticare-gray-dark dark:text-gray-400 mb-6">Connect with your care team securely.</p>

                {/* Search / Start New Chat Input */}
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Start a new chat with a doctor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-white dark:bg-gray-800 rounded-2xl border border-boticare-gray-medium dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-base transition-all"
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-y-auto pr-2 no-scrollbar space-y-6">
                
                {/* Search Results (if searching) */}
                {searchTerm && (
                    <div className="animate-fade-in">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 ml-1">Search Results</h3>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-boticare-gray-medium dark:border-gray-700 overflow-hidden">
                            {filteredProfessionals.length > 0 ? (
                                filteredProfessionals.map((pro) => (
                                    <button 
                                        key={pro.id}
                                        onClick={() => onStartChat(pro)}
                                        className="w-full flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 text-left"
                                    >
                                        <img src={pro.avatar} alt={pro.name} className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-600 mr-4" />
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-gray-900 dark:text-white">{pro.name}</h4>
                                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{pro.specialty}</p>
                                        </div>
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                            <ChatIcon className="w-5 h-5" />
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">No doctors found matching "{searchTerm}"</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Recent Conversations List */}
                {!searchTerm && (
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 ml-1">Recent Conversations</h3>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-boticare-gray-medium dark:border-gray-700 overflow-hidden shadow-sm">
                            {previousChats.map((chat) => (
                                <button 
                                    key={chat.id}
                                    onClick={() => onStartChat(chat)}
                                    className="w-full flex items-center p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 text-left group relative"
                                >
                                    <div className="relative mr-4">
                                        <img src={chat.avatar} alt={chat.name} className="w-14 h-14 rounded-full border-2 border-white dark:border-gray-600 shadow-sm" />
                                        {chat.unread && <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-blue-500 border-2 border-white dark:border-gray-800 rounded-full"></div>}
                                    </div>
                                    <div className="flex-grow min-w-0 pr-4">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className={`text-base ${chat.unread ? 'font-black text-gray-900 dark:text-white' : 'font-bold text-gray-700 dark:text-gray-200'}`}>{chat.name}</h4>
                                            <span className={`text-xs ${chat.unread ? 'font-bold text-blue-600' : 'text-gray-400'}`}>{chat.lastMessageTime}</span>
                                        </div>
                                        <p className={`text-sm truncate ${chat.unread ? 'font-semibold text-gray-800 dark:text-gray-300' : 'text-gray-500'}`}>
                                            {chat.lastMessage}
                                        </p>
                                    </div>
                                    <ArrowRightIcon className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDoctors;