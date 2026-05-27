import { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { useWebRTC } from '../src/hooks/useWebRTC';

export default function IncomingCalls() {
  const [incomingCall, setIncomingCall] = useState(null);
  const [callId, setCallId] = useState(null);
  const remoteAudioRef = useRef(null);

  const { localStreamRef, remoteStream, callStatus, acceptCall, endCall } =
    useWebRTC({ callId, isCaller: false, callType: incomingCall?.call_type });

  useEffect(() => {
    const setupListener = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const channel = supabase.channel('incoming-calls')
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'calls',
          filter: `callee_id=eq.${user.id}`
        }, (payload) => {
          setIncomingCall(payload.new);
        })
        .subscribe();

      return () => supabase.removeChannel(channel);
    };
    setupListener();
  }, []);

  const handleAccept = () => {
    setCallId(incomingCall.id);
  };

  useEffect(() => {
    if (callId) acceptCall();
  }, [callId]);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream)
      remoteAudioRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  return (
    <div>
      {incomingCall && callStatus === 'idle' && (
        <div>
          <p>Incoming {incomingCall.call_type} call from patient</p>
          <button onClick={handleAccept}>Accept</button>
          <button onClick={() => setIncomingCall(null)}>Decline</button>
        </div>
      )}
      <p>Status: {callStatus}</p>
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
}
