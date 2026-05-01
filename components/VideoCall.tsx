
import React, { useState, useEffect, useRef } from 'react';
import { Professional, Appointment } from '../types';
import { MicIcon, MicOffIcon, VideoOnIcon, VideoOffIcon, EndCallIcon, UserIcon, AlertIcon } from './Icons';
import FeedbackModal from './FeedbackModal';
import { logVideoCallSession } from '../services/geminiService';

interface VideoCallProps {
  appointment: Appointment | null;
  professional?: Professional | null;
  onEndCall: () => void;
}

// Utility to generate a UUID without external dependencies
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const VideoCall: React.FC<VideoCallProps> = ({ appointment, professional, onEndCall }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const userStreamRef = useRef<MediaStream | null>(null);
  const callStartTimeRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string>(generateUUID());

  useEffect(() => {
    let mounted = true;

    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            }, 
            audio: {
                echoCancellation: true,
                noiseSuppression: true
            } 
        });
        
        if (mounted) {
            userStreamRef.current = stream;
            if (userVideoRef.current) {
                userVideoRef.current.srcObject = stream;
                await userVideoRef.current.play().catch(e => console.error("Video play failed", e));
            }
        }
      } catch (err: any) {
        console.error("Media Error:", err);
        if (mounted) {
            setMediaError("Unable to access camera or microphone. Please ensure you have granted permissions and are using HTTPS.");
            setConnectionState('failed');
        }
      }
    };

    startStream();

    return () => {
      mounted = false;
      if (userStreamRef.current) {
        userStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (mediaError) return;
    
    const connectTimer = setTimeout(() => {
        if (connectionState === 'connecting') {
            setConnectionState('connected');
            callStartTimeRef.current = new Date().toISOString();
        }
    }, 2500);

    return () => clearTimeout(connectTimer);
  }, [mediaError, connectionState]);

  useEffect(() => {
    if (connectionState !== 'connected') return;
    const timerId = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(timerId);
  }, [connectionState]);

  const toggleMic = () => { 
      if (userStreamRef.current) { 
          userStreamRef.current.getAudioTracks().forEach(t => t.enabled = !t.enabled); 
          setIsMuted(!isMuted); 
      } 
  };

  const toggleCamera = () => { 
      if (userStreamRef.current) { 
          userStreamRef.current.getVideoTracks().forEach(t => t.enabled = !t.enabled); 
          setIsCameraOn(!isCameraOn); 
      } 
  };
  
  const handleEndCallClick = async () => { 
      if (userStreamRef.current) {
          userStreamRef.current.getTracks().forEach(t => t.stop()); 
      }

      if (connectionState === 'connected' && appointment && callStartTimeRef.current) {
        const endTime = new Date().toISOString();
        const durationSeconds = elapsedTime;
        const recordingUrl = `https://mock-recording-url.com/${sessionIdRef.current}`;
        
        const proId = professional?.supabaseId || appointment.professionalId;
        const patId = appointment.patientId; // In patient view, user is patient

        if (proId && patId) {
            await logVideoCallSession(
                sessionIdRef.current,
                appointment.id.toString(),
                proId,
                patId,
                callStartTimeRef.current,
                endTime,
                durationSeconds,
                recordingUrl
            );
        } else {
            console.warn("Could not log video call session: Missing professional or patient Supabase ID.");
        }
      }
      setShowFeedback(true); 
  };

  const targetName = professional?.name || appointment?.doctorName || 'Practitioner';
  const targetAvatar = professional?.avatar || appointment?.avatar || 'https://i.pravatar.cc/150?u=pro';

  return (
    <div className="animate-fade-in space-y-4 pb-10 h-[calc(100vh-140px)] flex flex-col">
        {showFeedback && <FeedbackModal isOpen onClose={() => onEndCall()} onSubmit={() => onEndCall()} source="video_call" />}
        
        <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-boticare-gray-medium dark:border-gray-700 shadow-sm flex-shrink-0">
            {connectionState === 'connected' ? (
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
            ) : (
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
            )}
            
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${connectionState === 'connected' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800'}`}>
                {connectionState === 'connected' ? 'Live Encrypted' : 'Connecting...'}
            </span>
            
            <h2 className="text-lg font-bold truncate">Session with {targetName}</h2>
            <span className="text-sm font-mono font-bold text-blue-600 ml-auto">{Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}</span>
        </div>

        <div className="relative flex-grow bg-gray-900 rounded-3xl overflow-hidden shadow-2xl group border border-gray-800">
            <div className="absolute inset-0 flex items-center justify-center">
                {connectionState === 'connected' ? (
                    <img src={targetAvatar} className="w-full h-full object-cover opacity-80" alt={targetName} />
                ) : connectionState === 'failed' ? (
                    <div className="text-center p-8 space-y-4">
                        <AlertIcon className="w-16 h-16 text-red-500 mx-auto" />
                        <p className="text-white font-bold text-lg">{mediaError || "Connection Failed"}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-white font-bold tracking-wider uppercase text-sm">Establishing Secure Connection...</p>
                    </div>
                )}
            </div>

            {connectionState === 'connected' && (
                <div className="absolute bottom-6 left-6 text-white bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 z-10">
                    <p className="font-bold text-sm">{targetName}</p>
                    <p className="text-[10px] opacity-70 uppercase tracking-wider">Remote Stream • HD</p>
                </div>
            )}

            <div className="absolute top-6 right-6 w-32 h-48 md:w-48 md:h-32 bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl z-20 transition-all hover:scale-105">
                <video 
                    ref={userVideoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className={`w-full h-full object-cover transform scale-x-[-1] ${isCameraOn ? 'block' : 'hidden'}`} 
                />
                 {!isCameraOn && <div className="w-full h-full flex items-center justify-center bg-gray-700"><UserIcon className="w-12 h-12 text-gray-500" /></div>}
                <div className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-lg">You</div>
            </div>
            
            <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center space-x-6 z-30 transition-all duration-300">
                <button onClick={toggleMic} className={`p-4 rounded-full transition-all shadow-lg hover:scale-110 active:scale-95 ${isMuted ? 'bg-white text-red-600' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/20'}`}>
                    {isMuted ? <MicOffIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
                </button>
                
                <button onClick={handleEndCallClick} className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all">
                    <EndCallIcon className="w-8 h-8" />
                </button>

                <button onClick={toggleCamera} className={`p-4 rounded-full transition-all shadow-lg hover:scale-110 active:scale-95 ${!isCameraOn ? 'bg-white text-red-600' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/20'}`}>
                    {!isCameraOn ? <VideoOffIcon className="w-6 h-6" /> : <VideoOnIcon className="w-6 h-6" />}
                </button>
            </div>
        </div>
    </div>
  );
};

export default VideoCall;
