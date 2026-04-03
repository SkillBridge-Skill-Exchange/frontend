/**
 * Socket Context
 * ==============
 * Global Socket.IO connection with auth, online users tracking,
 * and WebRTC call state management.
 */
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { X, MessageCircle, Phone, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SocketContext = createContext();

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastSeenMap, setLastSeenMap] = useState({});
  const navigate = useNavigate();

  // Toast State
  const [toastMessage, setToastMessage] = useState(null);

  // Call state
  const [callState, setCallState] = useState('idle'); // idle | calling | ringing | connected | ended
  const [callInfo, setCallInfo] = useState(null); // { callId, peerId, peerName, callType }
  const [incomingCall, setIncomingCall] = useState(null); // { callId, callerId, callerName, callType, offer }
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const callTimerRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  // Cleanup helper
  const cleanupCall = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setCallDuration(0);
    pendingCandidatesRef.current = [];
  }, [localStream]);

  const startCallTimer = useCallback(() => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((peerId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice_candidate', {
          peerId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStream(stream);
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        console.warn('ICE connection failed/disconnected');
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, []);

  // Initiate a call
  const initiateCall = useCallback(async (peerId, peerName, callType, isGroup = false) => {
    if (!socketRef.current || callState !== 'idle') return;

    try {
      const constraints = {
        audio: true,
        video: callType === 'video' ? { width: 1280, height: 720 } : false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      const pc = createPeerConnection(peerId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      setCallState('calling');
      setCallInfo({ callId: null, peerId, peerName, callType });

      socketRef.current.emit('call_initiate', {
        recipientId: peerId,
        callType,
        offer: { type: offer.type, sdp: offer.sdp },
        isGroup
      });
    } catch (err) {
      console.error('Failed to initiate call:', err);
      cleanupCall();
      setCallState('idle');
      setCallInfo(null);
      alert(err.name === 'NotAllowedError'
        ? 'Camera/microphone permission denied. Please allow access and try again.'
        : 'Failed to start call. Please check your device permissions.');
    }
  }, [callState, createPeerConnection, cleanupCall]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!incomingCall || !socketRef.current) return;

    try {
      const constraints = {
        audio: true,
        video: incomingCall.callType === 'video' ? { width: 1280, height: 720 } : false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      const pc = createPeerConnection(incomingCall.callerId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));

      // Add any pending ICE candidates
      for (const candidate of pendingCandidatesRef.current) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) {}
      }
      pendingCandidatesRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current.emit('call_accept', {
        callId: incomingCall.callId,
        callerId: incomingCall.callerId,
        answer: { type: answer.type, sdp: answer.sdp }
      });

      setCallState('connected');
      setCallInfo({
        callId: incomingCall.callId,
        peerId: incomingCall.callerId,
        peerName: incomingCall.callerName,
        callType: incomingCall.callType
      });
      setIncomingCall(null);
      startCallTimer();
    } catch (err) {
      console.error('Failed to accept call:', err);
      if (socketRef.current && incomingCall) {
        socketRef.current.emit('call_reject', {
          callId: incomingCall.callId,
          callerId: incomingCall.callerId
        });
      }
      cleanupCall();
      setCallState('idle');
      setIncomingCall(null);
      alert(err.name === 'NotAllowedError'
        ? 'Camera/microphone permission denied.'
        : 'Failed to accept call.');
    }
  }, [incomingCall, createPeerConnection, cleanupCall, startCallTimer]);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    if (!incomingCall || !socketRef.current) return;
    socketRef.current.emit('call_reject', {
      callId: incomingCall.callId,
      callerId: incomingCall.callerId
    });
    setIncomingCall(null);
  }, [incomingCall]);

  // End active call
  const endCall = useCallback(() => {
    if (socketRef.current && callInfo) {
      socketRef.current.emit('call_end', {
        callId: callInfo.callId,
        peerId: callInfo.peerId
      });
    }
    cleanupCall();
    setCallState('ended');
    setCallInfo(prev => prev); // keep info for "Call Ended" screen
    setTimeout(() => {
      setCallState('idle');
      setCallInfo(null);
    }, 2000);
  }, [callInfo, cleanupCall]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  }, [localStream]);

  // Socket connection effect
  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(process.env.REACT_APP_API_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('🟢 Socket connected');
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(new Set(users));
      });

      newSocket.on('user_online', ({ userId }) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      newSocket.on('user_offline', ({ userId, lastSeen }) => {
        setOnlineUsers(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        if (lastSeen) {
          setLastSeenMap(prev => ({ ...prev, [userId]: lastSeen }));
        }
      });
      
      newSocket.on('message_receive', (msgData) => {
         // Fire global toast! 
         // If we are currently looking at this conversation, do not fire toast. But SocketContext doesn't have activeChat state easily blockable directly besides comparing window location.
         // Wait, the easiest way: Messaging.js can silence it, BUT it's easier to just do:
         if (window.location.pathname.startsWith('/messaging')) {
             // In messaging view, we'll let it slide or maybe ignore. Actually, we'll just show it unless it's sent by us.
         }
         
         setToastMessage({
            ...msgData,
            timestamp: Date.now()
         });
         
         setTimeout(() => {
            setToastMessage((prev) => prev?.timestamp === msgData.timestamp ? null : prev);
         }, 5000);
      });

      // ─── CALL EVENTS ───
      newSocket.on('incoming_call', (data) => {
        console.log('📞 Incoming call from', data.callerName);
        setIncomingCall(data);
      });

      newSocket.on('call_ringing', ({ callId }) => {
        setCallState('ringing');
        setCallInfo(prev => prev ? { ...prev, callId } : prev);
      });

      newSocket.on('call_accepted', async ({ callId, answer }) => {
        try {
          const pc = peerConnectionRef.current;
          if (pc && answer) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            // Add any pending ICE candidates
            for (const candidate of pendingCandidatesRef.current) {
              try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) {}
            }
            pendingCandidatesRef.current = [];
            setCallState('connected');
            setCallInfo(prev => prev ? { ...prev, callId } : prev);
            // Start timer
            setCallDuration(0);
            callTimerRef.current = setInterval(() => {
              setCallDuration(prev => prev + 1);
            }, 1000);
          }
        } catch (err) {
          console.error('Error handling call_accepted:', err);
        }
      });

      newSocket.on('call_rejected', ({ callId }) => {
        console.log('❌ Call rejected');
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
        if (callTimerRef.current) {
          clearInterval(callTimerRef.current);
        }
        // Stop tracks
        setLocalStream(prev => {
          if (prev) prev.getTracks().forEach(t => t.stop());
          return null;
        });
        setRemoteStream(null);
        setIsMuted(false);
        setIsCameraOff(false);
        setCallDuration(0);
        pendingCandidatesRef.current = [];
        setCallState('ended');
        setCallInfo(prev => prev);
        setTimeout(() => {
          setCallState('idle');
          setCallInfo(null);
        }, 2000);
      });

      newSocket.on('call_ended', ({ callId, reason }) => {
        console.log('📞 Call ended', reason || '');
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
        if (callTimerRef.current) {
          clearInterval(callTimerRef.current);
        }
        setLocalStream(prev => {
          if (prev) prev.getTracks().forEach(t => t.stop());
          return null;
        });
        setRemoteStream(null);
        setIsMuted(false);
        setIsCameraOff(false);
        setCallDuration(0);
        pendingCandidatesRef.current = [];
        setIncomingCall(null);
        setCallState('ended');
        setTimeout(() => {
          setCallState('idle');
          setCallInfo(null);
        }, 2000);
      });

      newSocket.on('call_failed', ({ callId, reason }) => {
        console.log('❌ Call failed:', reason);
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
        setLocalStream(prev => {
          if (prev) prev.getTracks().forEach(t => t.stop());
          return null;
        });
        setRemoteStream(null);
        pendingCandidatesRef.current = [];
        setCallState('ended');
        setCallInfo(prev => prev ? { ...prev, failReason: reason } : null);
        setTimeout(() => {
          setCallState('idle');
          setCallInfo(null);
        }, 3000);
      });

      newSocket.on('ice_candidate', async ({ candidate, from }) => {
        try {
          const pc = peerConnectionRef.current;
          if (pc && pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            // Queue candidate until remote description is set
            pendingCandidatesRef.current.push(candidate);
          }
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        socketRef.current = null;
        setSocket(null);
      };
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    }
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      lastSeenMap,
      callState,
      callInfo,
      incomingCall,
      localStream,
      remoteStream,
      isMuted,
      isCameraOff,
      callDuration,
      initiateCall,
      acceptCall,
      rejectCall,
      endCall,
      toggleMute,
      toggleCamera,
    }}>
      {children}

      {/* Global Message Toast Notification */}
      {toastMessage && (
         <div 
           style={{
              position: 'fixed', bottom: '2rem', right: '2rem', 
              background: '#fff', borderRadius: '12px', padding: '1rem', 
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'flex-start', gap: '1rem',
              zIndex: 9999, borderLeft: '4px solid #38bdf8', maxWidth: '350px', cursor: 'pointer',
              animation: 'slideInRight 0.3s ease-out forwards'
           }}
           onClick={() => {
              setToastMessage(null);
              navigate(`/messaging?conversation=${toastMessage.conversation_id}`);
           }}
         >
            <div style={{background:'#e0f2fe', padding:'0.5rem', borderRadius:'50%', color:'#0284c7'}}>
               {toastMessage.type === 'call' ? <Phone size={20}/> : toastMessage.type === 'file' ? <FileText size={20}/> : <MessageCircle size={20}/>}
            </div>
            <div style={{flex: 1, overflow:'hidden'}}>
               <p style={{margin: '0 0 0.25rem', fontWeight: '700', fontSize: '0.9rem', color:'#1e293b'}}>
                 {toastMessage.senderName || 'New Message'}
               </p>
               <p style={{margin: 0, fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                 {toastMessage.type === 'call' ? '📞 Call log' : toastMessage.type === 'file' ? '📁 Shared a file' : toastMessage.content}
               </p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setToastMessage(null); }}
              style={{background:'none', border:'none', color:'#94a3b8', cursor:'pointer', padding:'2px', display:'flex', alignItems:'center', justifyContent:'center'}}
            >
              <X size={16} />
            </button>
            <style>
              {`
                @keyframes slideInRight {
                  from { transform: translateX(100%); opacity: 0; }
                  to { transform: translateX(0); opacity: 1; }
                }
              `}
            </style>
         </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
