import { useRef, useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

export function useWebRTC({ callId, isCaller, callType }) {
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStatus, setCallStatus] = useState('idle');

  const getMedia = async () => {
    const constraints = callType === 'video'
      ? { audio: true, video: true }
      : { audio: true, video: false };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    return stream;
  };

  const initPeerConnection = (localStream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    pc.ontrack = (e) => setRemoteStream(e.streams[0]);

    pc.onicecandidate = async ({ candidate }) => {
      if (!candidate) return;
      const field = isCaller ? 'caller_ice' : 'callee_ice';
      // Append ICE candidate to the array in Supabase
      const { data } = await supabase.from('calls').select(field).eq('id', callId).single();
      const existing = data?.[field] || [];
      await supabase.from('calls').update({
        [field]: [...existing, candidate]
      }).eq('id', callId);
    };

    return pc;
  };

  // Caller: create offer
  const startCall = async () => {
    setCallStatus('calling');
    const stream = await getMedia();
    const pc = initPeerConnection(stream);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await supabase.from('calls').update({ offer: offer }).eq('id', callId);
  };

  // Callee: accept and create answer
  const acceptCall = async () => {
    setCallStatus('connecting');
    const { data } = await supabase.from('calls').select('offer').eq('id', callId).single();
    const stream = await getMedia();
    const pc = initPeerConnection(stream);
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await supabase.from('calls').update({ answer: answer, status: 'active' }).eq('id', callId);
  };

  // Listen for signaling updates
  useEffect(() => {
    if (!callId) return;
    const channel = supabase.channel(`call-${callId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls', filter: `id=eq.${callId}` },
        async (payload) => {
          const row = payload.new;
          const pc = pcRef.current;
          if (!pc) return;

          // Caller: receive answer
          if (isCaller && row.answer && !pc.currentRemoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(row.answer));
            setCallStatus('active');
          }

          // Add ICE candidates from the other side
          const candidates = isCaller ? row.callee_ice : row.caller_ice;
          if (candidates?.length) {
            for (const c of candidates) {
              try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
            }
          }

          if (row.status === 'ended') endCall();
        })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [callId]);

  const endCall = async () => {
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    setCallStatus('ended');
    setRemoteStream(null);
    if (callId) await supabase.from('calls').update({ status: 'ended' }).eq('id', callId);
  };

  return { localStreamRef, remoteStream, callStatus, startCall, acceptCall, endCall };
}
