/**
 * CallOverlay Component
 * =====================
 * Full-screen overlay for voice/video calls.
 * Renders globally — handles incoming call popup, outgoing call screen,
 * and connected call UI with controls.
 */
import React, { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import {
  Phone, PhoneOff, PhoneIncoming, Video, VideoOff,
  Mic, MicOff, X, User
} from 'lucide-react';

function CallOverlay() {
  const {
    callState, callInfo, incomingCall,
    localStream, remoteStream,
    isMuted, isCameraOff, callDuration,
    acceptCall, rejectCall, endCall,
    toggleMute, toggleCamera,
  } = useSocket();

  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      if (remoteVideoRef.current.srcObject !== remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    }
  }, [remoteStream, callState]);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      if (localVideoRef.current.srcObject !== localStream) {
        localVideoRef.current.srcObject = localStream;
      }
    }
  }, [localStream, callState]);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ─── INCOMING CALL POPUP ───
  if (incomingCall && callState === 'idle') {
    return (
      <div className="call-overlay-backdrop" id="incoming-call-overlay">
        <div className="incoming-call-modal">
          <div className="incoming-call-ripple">
            <div className="ripple-ring ring-1"></div>
            <div className="ripple-ring ring-2"></div>
            <div className="ripple-ring ring-3"></div>
            <div className="incoming-call-avatar">
              <User size={40} />
            </div>
          </div>
          <h2 className="incoming-call-name">{incomingCall.callerName}</h2>
          <p className="incoming-call-type">
            Incoming {incomingCall.callType === 'video' ? 'Video' : 'Voice'} Call...
          </p>
          <div className="incoming-call-actions">
            <button className="call-action-btn reject-btn" onClick={rejectCall} id="reject-call-btn">
              <PhoneOff size={24} />
              <span>Decline</span>
            </button>
            <button className="call-action-btn accept-btn" onClick={acceptCall} id="accept-call-btn">
              {incomingCall.callType === 'video' ? <Video size={24} /> : <Phone size={24} />}
              <span>Accept</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── NO ACTIVE CALL ───
  if (callState === 'idle' && !callInfo) return null;

  const isVideoCall = callInfo?.callType === 'video';

  // ─── CALLING / RINGING ───
  if (callState === 'calling' || callState === 'ringing') {
    return (
      <div className="call-overlay" id="outgoing-call-overlay">
        <div className="call-screen-content">
          <div className="call-avatar-large">
            <div className="call-pulse-ring"></div>
            <div className="call-avatar-inner">
              <User size={48} />
            </div>
          </div>
          <h2 className="call-peer-name">{callInfo?.peerName}</h2>
          <p className="call-status-text">
            {callState === 'calling' ? 'Calling...' : 'Ringing...'}
          </p>
          <div className="call-controls">
            <button className="call-control-btn end-call" onClick={endCall} id="end-outgoing-call-btn">
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── CONNECTED ───
  if (callState === 'connected') {
    return (
      <div className={`call-overlay ${isVideoCall ? 'video-call' : 'voice-call'}`} id="active-call-overlay">
        {isVideoCall ? (
          <>
            {/* Remote video — full screen */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote-video"
              id="remote-video"
            />
            {/* Local video — PiP overlay */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`local-video-pip ${isCameraOff ? 'camera-off' : ''}`}
              id="local-video"
            />
            {isCameraOff && (
              <div className="local-video-pip camera-off-placeholder">
                <VideoOff size={20} />
              </div>
            )}
          </>
        ) : (
          <div className="call-screen-content">
            <div className="call-avatar-large connected">
              <div className="call-avatar-inner">
                <User size={48} />
              </div>
            </div>
            <h2 className="call-peer-name">{callInfo?.peerName}</h2>
            <p className="call-duration">{formatDuration(callDuration)}</p>
            {/* Hidden audio element for voice call */}
            <video ref={remoteVideoRef} autoPlay playsInline style={{ display: 'none' }} />
          </div>
        )}

        {/* Call controls bar */}
        <div className="call-controls-bar">
          <div className="call-timer-badge">{formatDuration(callDuration)}</div>
          <div className="call-controls">
            <button
              className={`call-control-btn ${isMuted ? 'active' : ''}`}
              onClick={toggleMute}
              id="toggle-mute-btn"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
            {isVideoCall && (
              <button
                className={`call-control-btn ${isCameraOff ? 'active' : ''}`}
                onClick={toggleCamera}
                id="toggle-camera-btn"
                title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
              </button>
            )}
            <button className="call-control-btn end-call" onClick={endCall} id="end-active-call-btn">
              <PhoneOff size={22} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── CALL ENDED ───
  if (callState === 'ended') {
    return (
      <div className="call-overlay" id="call-ended-overlay">
        <div className="call-screen-content">
          <div className="call-avatar-large ended">
            <div className="call-avatar-inner">
              <PhoneOff size={40} />
            </div>
          </div>
          <h2 className="call-peer-name">{callInfo?.peerName || 'Unknown'}</h2>
          <p className="call-status-text ended">
            {callInfo?.failReason || 'Call Ended'}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default CallOverlay;
