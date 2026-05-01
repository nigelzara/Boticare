
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getAIResponse, getWordSuggestions, generateSpeech, editImage, analyzeVideo } from '../services/geminiService';
import { ChatMessage, UserProfile } from '../types';
import { SendIcon, MicIcon, ThumbsUpIcon, ThumbsDownIcon, CopyIcon, TrashIcon, CheckCircleIcon, XIcon, PlusIcon, SpeakerIcon, MicOffIcon, EditIcon, CameraIcon, ImageIcon, FileIcon } from './Icons';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Part } from "@google/genai";

// General Helper
const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Audio Helper Functions
const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const encode = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

const createBlob = (data: Float32Array): Blob => {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const MAX_CHARS = 1000;
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
let nextStartTime = 0;

interface ChatBotProps {
    userProfile: UserProfile;
}

const ChatBot: React.FC<ChatBotProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
        sender: 'ai', 
        text: "Hello! I'm Boticare AI. How can I help you with your health questions today?", 
        timestamp: getCurrentTime() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ file: File; url: string; type: 'image' | 'video' } | null>(null);
  const [useGrounding, setUseGrounding] = useState(true);
  const [audioPlayingIndex, setAudioPlayingIndex] = useState<number | null>(null);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  
  // Live API State
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
  const sessionPromiseRef = useRef<ReturnType<typeof ai.live.connect> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestionTimeoutRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setShowUploadMenu(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    // Mark user messages as read once the AI responds (simulated by new message arriving)
    if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.sender === 'ai') {
            // If the last message is AI, mark previous user messages as read
            setMessages(prev => prev.map(msg => 
                msg.sender === 'user' && !msg.isRead ? { ...msg, isRead: true } : msg
            ));
        }
    }
  }, [messages.length]);

  useEffect(() => {
    if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    if (input.trim().length > 3) {
      suggestionTimeoutRef.current = window.setTimeout(async () => {
        const fetchedSuggestions = await getWordSuggestions(input, messages);
        if (input.trim().length > 3) setSuggestions(fetchedSuggestions.slice(0, 3));
      }, 500);
    } else {
      setSuggestions([]);
    }
    return () => { if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current); };
  }, [input, messages]);

  const handleSend = async () => {
    if ((input.trim() === '' && !uploadedFile) || isLoading) return;

    setSuggestions([]);
    const currentFile = uploadedFile;
    const currentInput = input;
    const currentTime = getCurrentTime();

    const userMessage: ChatMessage = { 
        sender: 'user', 
        text: currentInput, 
        imageUrl: currentFile?.type === 'image' ? currentFile.url : undefined,
        timestamp: currentTime,
        isRead: false // Initially unread
    };
    setMessages(prev => [...prev, userMessage]);
    
    setInput('');
    setUploadedFile(null);
    setIsLoading(true);

    try {
        if (currentFile) {
            if (currentFile.type === 'image') {
                const imagePart = await fileToGenerativePart(currentFile.file);
                const aiMessage = await getAIResponse(currentInput, imagePart, { useSearch: useGrounding });
                setMessages(prev => [...prev, aiMessage]);
            } else { // Video analysis
                const analysisText = await analyzeVideo(currentFile.file, currentInput);
                const aiMessage: ChatMessage = { 
                    sender: 'ai', 
                    text: analysisText, 
                    timestamp: getCurrentTime() 
                };
                setMessages(prev => [...prev, aiMessage]);
            }
        } else { // Text only
             let groundingOptions = { useSearch: useGrounding, useMaps: false, latitude: undefined, longitude: undefined };
            if (useGrounding) {
                if (/\b(near me|nearby|closest|find a)\b/i.test(currentInput)) {
                    groundingOptions.useMaps = true;
                    try {
                        const position = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
                        groundingOptions.latitude = position.coords.latitude;
                        groundingOptions.longitude = position.coords.longitude;
                    } catch (e) { console.warn("Could not get location for Maps grounding:", e); }
                }
            }
          const aiMessage = await getAIResponse(currentInput, null, groundingOptions);
          setMessages(prev => [...prev, aiMessage]);
        }
    } catch (error) {
      const errorMessage: ChatMessage = { 
          sender: 'ai', 
          text: 'Sorry, something went wrong.', 
          timestamp: getCurrentTime() 
        };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditImage = async () => {
    if (!uploadedFile || uploadedFile.type !== 'image' || !input.trim() || isLoading) return;

    setSuggestions([]);
    const currentFile = uploadedFile;
    const currentInput = input;
    const userMessage: ChatMessage = { 
        sender: 'user', 
        text: currentInput, 
        imageUrl: currentFile.url,
        timestamp: getCurrentTime(),
        isRead: false
    };
    setMessages(prev => [...prev, userMessage]);

    setInput('');
    setUploadedFile(null);
    setIsLoading(true);
    
    try {
        const imagePart = await fileToGenerativePart(currentFile.file);
        const editedB64 = await editImage(imagePart.inlineData.data, imagePart.inlineData.mimeType, currentInput);
        if (editedB64) {
            const aiMessage: ChatMessage = { 
                sender: 'ai', 
                text: 'Here is the edited image:', 
                imageUrl: `data:image/png;base64,${editedB64}`,
                timestamp: getCurrentTime()
            };
            setMessages(prev => [...prev, aiMessage]);
        } else {
            throw new Error("Editing failed to return an image.");
        }
    } catch (error) {
        const errorMessage: ChatMessage = { 
            sender: 'ai', 
            text: 'Sorry, I was unable to edit the image.', 
            timestamp: getCurrentTime()
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(prev => (prev.endsWith(' ') ? prev : prev + ' ') + suggestion + ' ');
    setSuggestions([]);
  };
  
  const handleConfirmClear = () => {
    setMessages([{ 
        sender: 'ai', 
        text: "Hello! I'm Boticare AI. How can I help you with your health questions today?", 
        timestamp: getCurrentTime()
    }]);
    setShowClearConfirm(false);
  };
  
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageIndex(index);
    setTimeout(() => setCopiedMessageIndex(null), 2000);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, filterType?: string) => {
    const file = event.target.files?.[0];
    if (file) {
        const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
        if (fileType) {
            setUploadedFile({
                file,
                url: URL.createObjectURL(file),
                type: fileType,
            });
        }
    }
    setShowUploadMenu(false);
  };

  const handlePlayAudio = async (text: string, index: number) => {
    if (audioPlayingIndex === index) return;
    setAudioPlayingIndex(index);
    const audioData = await generateSpeech(text);
    if (audioData) {
        const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
        const source = outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputAudioContext.destination);
        source.start();
        source.onended = () => setAudioPlayingIndex(null);
    } else {
        setAudioPlayingIndex(null);
    }
  };
  
  const stopLiveSession = useCallback(() => {
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close());
        sessionPromiseRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    setIsLiveSessionActive(false);
    setInput('');
  }, []);

  const startLiveSession = useCallback(async () => {
    if (isLiveSessionActive) {
        stopLiveSession();
        return;
    }

    setIsLiveSessionActive(true);
    setInput("Listening... Speak now. Click the mic again to stop.");

    let currentInputTranscription = '';
    let currentOutputTranscription = '';

    sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
            onopen: async () => {
                inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                
                scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const pcmBlob = createBlob(inputData);
                    sessionPromiseRef.current?.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };
                source.connect(scriptProcessorRef.current);
                scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (base64Audio) {
                    nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                    const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                    const source = outputAudioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputAudioContext.destination);
                    source.start(nextStartTime);
                    nextStartTime += audioBuffer.duration;
                }

                if (message.serverContent?.inputTranscription) {
                    currentInputTranscription += message.serverContent.inputTranscription.text;
                }
                if (message.serverContent?.outputTranscription) {
                    currentOutputTranscription += message.serverContent.outputTranscription.text;
                }

                if (message.serverContent?.turnComplete) {
                    if (currentInputTranscription.trim()) {
                        setMessages(prev => [...prev, { 
                            sender: 'user', 
                            text: currentInputTranscription.trim(), 
                            timestamp: getCurrentTime(),
                            isRead: true
                        }]);
                    }
                    if (currentOutputTranscription.trim()) {
                        setMessages(prev => [...prev, { 
                            sender: 'ai', 
                            text: currentOutputTranscription.trim(), 
                            timestamp: getCurrentTime()
                        }]);
                    }
                    currentInputTranscription = '';
                    currentOutputTranscription = '';
                }
            },
            onerror: (e: ErrorEvent) => { 
                console.error('Live session error:', e);
                setMessages(prev => [...prev, { 
                    sender: 'ai', 
                    text: "I'm sorry, the voice session disconnected due to an error. Please try again.", 
                    timestamp: getCurrentTime() 
                }]);
                stopLiveSession(); 
            },
            onclose: (e: CloseEvent) => { stopLiveSession(); },
        },
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        },
    });
  }, [isLiveSessionActive, stopLiveSession]);

  const AttachmentMenu = () => (
    <div ref={menuRef} className="absolute bottom-full left-0 mb-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 w-48 animate-fade-in z-50">
        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-boticare-gray dark:hover:bg-gray-700 rounded-xl transition-colors">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><CameraIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
            <span className="text-sm font-bold dark:text-gray-200">Camera</span>
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-boticare-gray dark:hover:bg-gray-700 rounded-xl transition-colors">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" /></div>
            <span className="text-sm font-bold dark:text-gray-200">Photos</span>
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-boticare-gray dark:hover:bg-gray-700 rounded-xl transition-colors">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg"><FileIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
            <span className="text-sm font-bold dark:text-gray-200">Files</span>
        </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto px-1 md:px-0">
      {/* Clear Chat Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl max-w-sm w-full dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4 mx-auto">
                <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-black text-center mb-2 dark:text-white">Clear Chat History?</h3>
            <p className="text-sm text-center text-gray-500 mb-6 dark:text-gray-400">All messages will be permanently removed. This action cannot be undone.</p>
            <div className="flex justify-center space-x-3">
              <button onClick={() => setShowClearConfirm(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
              <button onClick={handleConfirmClear} className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">Chat Bot</h2>
          <p className="hidden md:block text-boticare-gray-dark dark:text-gray-400">Ask health questions, upload images, and get grounded answers.</p>
        </div>
        <button onClick={() => setShowClearConfirm(true)} className="flex items-center space-x-2 text-xs md:text-sm font-bold text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 dark:text-gray-400 dark:border-gray-600 dark:hover:text-red-400 dark:hover:border-red-900 dark:hover:bg-red-900/20">
          <TrashIcon className="w-4 h-4" /><span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      <div className="flex-grow bg-white rounded-2xl border border-boticare-gray-medium overflow-hidden flex flex-col dark:bg-gray-800 dark:border-gray-700 shadow-sm relative">
        <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-6 no-scrollbar bg-gray-50/50 dark:bg-gray-900/20">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 group ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className="flex-shrink-0 flex flex-col justify-end">
                  {msg.sender === 'ai' ? (
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-boticare-blue-dark to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md mb-1">AI</div>
                  ) : (
                    <img src={userProfile.avatar} alt="user" className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover shadow-md mb-1 border-2 border-white dark:border-gray-700" />
                  )}
              </div>
              
              <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[75%]`}>
                  <div className={`p-3 md:p-4 rounded-2xl shadow-sm relative text-sm md:text-base leading-relaxed ${
                      msg.sender === 'ai' 
                        ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100' 
                        : 'bg-boticare-blue-dark text-white rounded-tr-none'
                  }`}>
                    {msg.imageUrl && <img src={msg.imageUrl} alt="content" className="rounded-lg mb-3 max-h-48 md:max-h-64 w-full object-cover border border-black/10"/>}
                    <p className="whitespace-pre-wrap">{msg.text.replace(/\*/g, '')}</p>
                    
                    {msg.sender === 'ai' && msg.sources && (
                        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-600/50">
                            <h4 className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-60">Sources</h4>
                            <ul className="space-y-1">
                                {msg.sources.map((source, i) => (
                                    <li key={i}><a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline dark:text-blue-300 truncate block flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                        {source.title}
                                    </a></li>
                                ))}
                            </ul>
                        </div>
                    )}
                  </div>
                  
                  {/* Timestamp & Status */}
                  <div className="flex items-center gap-1.5 mt-1.5 px-1 opacity-70 hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">{msg.timestamp}</span>
                      {msg.sender === 'user' && (
                          <div className="flex items-center" title={msg.isRead ? "Read" : "Sent"}>
                              <CheckCircleIcon className={`w-3 h-3 ${msg.isRead ? 'text-blue-500' : 'text-gray-300'}`} />
                              <CheckCircleIcon className={`w-3 h-3 -ml-1.5 ${msg.isRead ? 'text-blue-500' : 'text-gray-300'}`} />
                          </div>
                      )}
                  </div>
                  
                  {/* Actions for AI Messages */}
                  {msg.sender === 'ai' && index > 0 && (
                    <div className="flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                       <button onClick={() => handlePlayAudio(msg.text, index)} className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${audioPlayingIndex === index ? 'text-blue-600' : 'text-gray-400 hover:text-boticare-primary dark:text-gray-500 dark:hover:text-gray-300'}`}>
                            <SpeakerIcon className="w-3 h-3" /> {audioPlayingIndex === index ? 'Playing' : 'Listen'}
                        </button>
                       <button onClick={() => handleCopy(msg.text, index)} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-boticare-primary dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
                          {copiedMessageIndex === index ? <CheckCircleIcon className="w-3 h-3 text-green-500" /> : <CopyIcon className="w-3 h-3" />}
                          {copiedMessageIndex === index ? 'Copied' : 'Copy'}
                       </button>
                       <div className="flex items-center gap-2 ml-2 border-l pl-3 border-gray-200 dark:border-gray-700">
                           <button className="text-gray-300 hover:text-green-500 transition-colors"><ThumbsUpIcon className="w-3 h-3" /></button>
                           <button className="text-gray-300 hover:text-red-500 transition-colors"><ThumbsDownIcon className="w-3 h-3" /></button>
                       </div>
                    </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
             <div className="flex gap-3">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-boticare-blue-dark to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md">AI</div>
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none dark:bg-gray-700 dark:border-gray-600 shadow-sm">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Suggestions & Input Area */}
        <div className="p-4 bg-white border-t border-boticare-gray-medium dark:bg-gray-800 dark:border-gray-700 relative z-20">
          
          {/* AI Suggestions - Displayed ABOVE the input */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 animate-fade-in">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest self-center mr-1">Suggestions:</span>
                {suggestions.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSuggestionClick(s)} 
                    className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 rounded-full hover:bg-blue-100 hover:shadow-sm transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-blue-300 dark:hover:bg-gray-600 whitespace-nowrap"
                  >
                    {s}
                  </button>
                ))}
            </div>
          )}

          {/* Controls (Grounding & Attachments) */}
          <div className="flex justify-between items-center mb-2">
             <div className="flex items-center gap-1">
                 <button 
                    onClick={() => setShowUploadMenu(!showUploadMenu)} 
                    className="p-2 text-gray-400 hover:text-boticare-blue-dark hover:bg-gray-100 rounded-lg transition-all dark:text-gray-500 dark:hover:text-blue-400 dark:hover:bg-gray-700 relative" 
                    title="Add attachment"
                    disabled={isLiveSessionActive}
                >
                    <PlusIcon className="w-5 h-5" />
                    {showUploadMenu && <AttachmentMenu />}
                </button>
                {uploadedFile && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-lg dark:bg-gray-700 ml-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{uploadedFile.type}</span>
                        <button onClick={() => setUploadedFile(null)}><XIcon className="w-3 h-3 text-gray-400 hover:text-red-500" /></button>
                    </div>
                )}
             </div>
             
             <label htmlFor="grounding-toggle" className="flex items-center cursor-pointer group">
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 mr-2 transition-colors uppercase tracking-widest">Web Search</span>
                <div className="relative">
                  <input type="checkbox" id="grounding-toggle" className="sr-only" checked={useGrounding} onChange={() => setUseGrounding(!useGrounding)} />
                  <div className={`block w-8 h-5 rounded-full transition-colors ${useGrounding ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform shadow-sm ${useGrounding ? 'translate-x-3' : ''}`}></div>
                </div>
              </label>
          </div>
          
          <div className="relative flex items-center">
             <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                 <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,video/*" />
                 <button 
                    onClick={startLiveSession} 
                    className={`p-2 rounded-full transition-all ${isLiveSessionActive ? 'text-white bg-red-500 animate-pulse shadow-lg shadow-red-200' : 'text-gray-400 hover:text-boticare-blue-dark hover:bg-gray-100 dark:text-gray-500 dark:hover:text-blue-400 dark:hover:bg-gray-700'}`}
                    title="Voice Mode"
                 >
                    {isLiveSessionActive ? <MicOffIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
                 </button>
             </div>
             
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isLiveSessionActive ? "Listening..." : "Message AI..."}
              className={`w-full bg-gray-50 border border-gray-200 rounded-2xl resize-none pl-12 pr-14 py-3.5 shadow-inner focus:outline-none focus:ring-2 focus:ring-boticare-blue-dark focus:border-transparent dark:bg-gray-900/50 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500 text-sm md:text-base transition-all ${isLiveSessionActive ? 'ring-2 ring-red-500 border-red-500 bg-red-50' : ''}`}
              rows={1}
              maxLength={MAX_CHARS}
              disabled={isLoading || isLiveSessionActive}
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {uploadedFile?.type === 'image' && (
                    <button onClick={handleEditImage} disabled={isLoading || isLiveSessionActive || !input.trim()} className="text-[10px] font-bold bg-green-100 text-green-700 hover:bg-green-200 rounded-lg px-2 py-1.5 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-green-900/30 dark:text-green-400">
                        <EditIcon className="w-4 h-4" />
                    </button>
                )}
                 <button 
                    onClick={handleSend} 
                    disabled={isLoading || isLiveSessionActive || (input.trim() === '' && !uploadedFile)} 
                    className="bg-boticare-blue-dark text-white p-2 rounded-xl flex items-center justify-center hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-500 dark:disabled:bg-gray-700 transition-all shadow-md transform active:scale-95"
                >
                    <SendIcon className="w-5 h-5 ml-0.5" />
                </button>
            </div>
          </div>
          <p className="text-[9px] text-center text-gray-400 mt-2 dark:text-gray-600">AI can make mistakes. Verify important medical info.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
