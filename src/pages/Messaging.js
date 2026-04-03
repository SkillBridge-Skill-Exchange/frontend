/**
 * Messaging Page (Real-Time)
 * ==========================
 * Full Socket.IO messaging with typing indicators, online/offline status,
 * file sharing, call buttons, read receipts, and group chats.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Send, User, MessageCircle, Info, Phone, Video,
  Paperclip, X, FileText, Download, Image as ImageIcon,
  Film, Loader, CheckCheck, Users, PhoneOff, PhoneIncoming, PhoneOutgoing,
  Check, ChevronDown, Reply, Copy, Forward, Pin, Bot, Star, List, Flag, Trash2,
  Mic, Square, Play, Pause, Headphones
} from 'lucide-react';

const CustomAudioPlayer = ({ src, duration, isSent, currentlyPlayingAudio, setCurrentlyPlayingAudio, messageId }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentlyPlayingAudio !== messageId && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }, [currentlyPlayingAudio, messageId, isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setCurrentlyPlayingAudio(messageId);
      audioRef.current?.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const seekTime = (e.target.value / 100) * audioRef.current.duration;
      if (isFinite(seekTime)) audioRef.current.currentTime = seekTime;
      setProgress(e.target.value);
    }
  };

  const formatSecs = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '220px', padding: '4px' }}>
      <button onClick={togglePlay} className="audio-play-btn" style={{ background: isSent ? 'rgba(255,255,255,0.2)' : '#38bdf8', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', flexShrink: 0 }}>
        {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" style={{marginLeft:'2px'}} />}
      </button>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
             {/* Small waveform dots representation */}
             <div className={`waveform-bar ${isPlaying ? 'playing' : ''}`}></div>
             <div className={`waveform-bar ${isPlaying ? 'playing' : ''}`} style={{animationDelay: '0.1s'}}></div>
             <div className={`waveform-bar ${isPlaying ? 'playing' : ''}`} style={{animationDelay: '0.2s'}}></div>
             <div className={`waveform-bar ${isPlaying ? 'playing' : ''}`} style={{animationDelay: '0.3s'}}></div>
             <input type="range" value={progress || 0} onChange={handleSeek} style={{ width: '100%', height: '4px', accentColor: isSent ? 'white' : '#38bdf8', cursor: 'pointer', opacity: 0.8, margin: '0 4px', flex: 1 }} />
        </div>
        <span style={{ fontSize: '0.75rem', color: isSent ? 'rgba(255,255,255,0.8)' : '#64748b', display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
          <span>{audioRef.current ? formatSecs(audioRef.current.currentTime) : '0:00'}</span>
          <span>{duration ? formatSecs(duration) : (audioRef.current?.duration ? formatSecs(audioRef.current.duration) : '0:00')}</span>
        </span>
      </div>
      <div style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '50%', background: isSent ? 'rgba(255,255,255,0.1)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Headphones size={18} color={isSent ? 'white' : '#94a3b8'} />
      </div>
      <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} onEnded={() => { setIsPlaying(false); setProgress(0); }} preload="metadata" />
    </div>
  );
};

function Messaging() {
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');
  const targetConvId = searchParams.get('conversation');
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingEmitTimeoutRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [peerTyping, setPeerTyping] = useState(false);
  const [peerPresence, setPeerPresence] = useState({ isOnline: false, lastSeen: null });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  // Group creation modal state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);

  // Message Info modal state
  const [infoMessage, setInfoMessage] = useState(null);

  // Message Context Menu state
  const [messageContextMenu, setMessageContextMenu] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  // New action states
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null);
  const [showStarredModal, setShowStarredModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [forwardSelectedChats, setForwardSelectedChats] = useState([]);

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioPreviewBlob, setAudioPreviewBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  
  const recordingTimerRef = useRef(null);
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState(null);

  // Group Info state
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const { user } = useAuth();
  const { socket, onlineUsers, lastSeenMap, initiateCall } = useSocket();

  const myId = String(user?.id || user?._id || '');

  // ─── AUTO-SCROLL ───
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, peerTyping]);

  // ─── FETCH CONVERSATIONS ───
  const fetchConversations = useCallback(async () => {
    try {
      const res = await API.get('/messages/conversations');
      const convs = res.data.data || [];
      setConversations(convs);
      return convs;
    } catch (err) { console.error(err); return []; }
  }, []);

  useEffect(() => {
    const init = async () => {
      const convs = await fetchConversations();
      if (targetConvId) {
        const existing = convs.find(c => String(c.id || c._id) === targetConvId);
        if (existing) openConversation(existing);
      } else if (targetUserId) {
        const existing = convs.find(c =>
          !c.isGroup &&
          (String(c.user1_id_str || c.user1?.id) === targetUserId ||
           String(c.user2_id_str || c.user2?.id) === targetUserId)
        );
        if (existing) {
          openConversation(existing);
        } else {
          const peerRes = await API.get(`/users/${targetUserId}`).catch(() => null);
          const peerData = peerRes?.data?.data || { name: 'Peer' };
          setActiveChat({
            id: 'ghost', isGhost: true, isGroup: false,
            user1_id: myId, user2_id: targetUserId,
            user1: { name: user.name, id: myId },
            user2: { name: peerData.name, id: targetUserId, college: peerData.college }
          });
        }
      }
      setLoading(false);
    };
    init();
  }, [targetUserId, targetConvId, fetchConversations, myId, user.name]);

  // ─── OPEN CONVERSATION ───
  const openConversation = async (conv) => {
    setActiveChat(conv);
    setPeerTyping(false);
    setFilePreview(null);
    try {
      const res = await API.get(`/messages/${conv.id}`);
      setMessages(res.data.data || []);
      // Emit mark as read
      if (socket) {
        if (conv.isGroup) {
          socket.emit('mark_as_read', { conversationId: conv.id, senderId: myId }); // senderId is dummy here since backend handles groups uniquely
        } else {
          const partner = String(conv.user1?.id || conv.user1_id_str) === myId ? conv.user2 : conv.user1;
          const pId = String(partner?.id || partner?._id);
          if (pId) socket.emit('mark_as_read', { conversationId: conv.id, senderId: pId });
        }
      }
    } catch (err) { console.error(err); }
  };

  // ─── GET PEER ID / PARTNER ───
  const getPeerId = useCallback(() => {
    if (!activeChat || activeChat.isGroup) return null;
    if (activeChat.isGhost) return activeChat.user2_id;
    const u1 = String(activeChat.user1?.id || activeChat.user1_id_str || '');
    const u2 = String(activeChat.user2?.id || activeChat.user2_id_str || '');
    return u1 === myId ? u2 : u1;
  }, [activeChat, myId]);

  const getChatPartner = (conv) => {
    if (!conv || !user) return { name: 'Peer' };
    if (conv.isGroup) {
      return { name: conv.groupName || 'Group' };
    }
    const u1Id = String(conv.user1?.id || conv.user1_id_str || conv.user1_id || '').toLowerCase();
    return (u1Id === myId.toLowerCase()) ? (conv.user2 || {}) : (conv.user1 || {});
  };

  // ─── SOCKET LISTENERS ───
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msgData) => {
      // Check if it belongs to active chat
      if (activeChat && (msgData.conversation_id === activeChat.id || msgData.sender_id === getPeerId())) {
        if (activeChat.isGhost && msgData.sender_id === getPeerId()) return; // avoid duplicate before ID matches

        setMessages(prev => {
          if (prev.some(m => m.id === msgData.id)) return prev;
          return [...prev, msgData];
        });
        setPeerTyping(false);
        // Auto mark as read if in chat
        if (activeChat.isGroup) {
          socket.emit('mark_as_read', { conversationId: msgData.conversation_id, senderId: myId });
        } else {
          socket.emit('mark_as_read', { conversationId: msgData.conversation_id, senderId: msgData.sender_id });
        }
      }
      fetchConversations();
    };

    const handleRead = ({ conversationId, readerId, time }) => {
      if (String(readerId) === myId) return;
      setMessages(prev => prev.map(m => {
        if (m.conversation_id === conversationId && String(m.sender_id) === myId) {
          const reads = m.readBy || [];
          const readInfos = m.readInfo || [];
          if (reads.map(String).includes(String(readerId))) return m; // Standardize
          
          const newReads = Array.from(new Set([...reads.map(String), String(readerId)]));
          const newReadInfos = [...readInfos, { user: readerId, time: time ? new Date(time) : new Date() }];
          return { ...m, is_read: true, readBy: newReads, readInfo: newReadInfos };
        }
        return m;
      }));
    };

    const handleDeleted = ({ id, type }) => {
      setMessages(prev => prev.map(m => {
        if (String(m.id || m._id) === String(id)) {
          if (type === 'everyone') {
            return { ...m, isDeletedForEveryone: true, content: '🚫 This message was deleted' };
          } else if (type === 'me') {
            const currentDeletedFor = m.deletedFor || [];
            return { ...m, deletedFor: [...currentDeletedFor, myId] };
          }
        }
        return m;
      }));
    };

    const handleTyping = ({ userId, conversationId }) => {
      if (activeChat && (activeChat.id === conversationId || userId === getPeerId())) {
        if (String(userId) !== myId) setPeerTyping(true);
      }
    };

    const handleStopTyping = ({ userId, conversationId }) => {
      if (activeChat && (activeChat.id === conversationId || userId === getPeerId())) {
        if (String(userId) !== myId) setPeerTyping(false);
      }
    };

    const handlePinned = ({ conversationId, messageId }) => {
      if (activeChat && activeChat.id === conversationId) {
        setActiveChat(prev => ({ ...prev, pinnedMessageId: messageId }));
      }
      fetchConversations();
    };

    const handleUnpinned = ({ conversationId }) => {
      if (activeChat && activeChat.id === conversationId) {
        setActiveChat(prev => ({ ...prev, pinnedMessageId: null }));
      }
      fetchConversations();
    };

    const handleGroupUpdated = ({ conversation }) => {
      // Standardize the ID check
      const convId = conversation._id || conversation.id;
      const activeId = activeChat?._id || activeChat?.id;
      if (activeChat && String(convId) === String(activeId)) {
        setActiveChat(conversation);
      }
      fetchConversations();
    };

    const handleGroupRemoved = ({ conversationId }) => {
      const activeId = activeChat?._id || activeChat?.id;
      if (activeChat && String(activeId) === String(conversationId)) {
        setActiveChat(null);
        showToast("You were removed from the group");
      }
      fetchConversations();
    };

    const handleGroupLeft = ({ conversationId }) => {
      const activeId = activeChat?._id || activeChat?.id;
      if (activeChat && String(activeId) === String(conversationId)) {
        setActiveChat(null);
      }
      fetchConversations();
    };

    const handleStarred = ({ messageId, isStarred }) => {
      setMessages(prev => prev.map(m => {
        if (m.id === messageId || m._id === messageId) {
          const starredBy = m.starredBy || [];
          if (isStarred && !starredBy.includes(myId)) return { ...m, starredBy: [...starredBy, myId] };
          if (!isStarred) return { ...m, starredBy: starredBy.filter(id => String(id) !== myId) };
        }
        return m;
      }));
    };

    socket.on('message_receive', handleReceive);
    socket.on('messages_read', handleRead);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);
    socket.on('message_deleted', handleDeleted);
    socket.on('message_pinned', handlePinned);
    socket.on('message_unpinned', handleUnpinned);
    socket.on('message_starred', handleStarred);
    socket.on('group_updated', handleGroupUpdated);
    socket.on('group_removed', handleGroupRemoved);
    socket.on('group_left', handleGroupLeft);

    return () => {
      socket.off('message_receive', handleReceive);
      socket.off('messages_read', handleRead);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
      socket.off('message_deleted', handleDeleted);
      socket.off('message_pinned', handlePinned);
      socket.off('message_unpinned', handleUnpinned);
      socket.off('message_starred', handleStarred);
      socket.off('group_updated', handleGroupUpdated);
      socket.off('group_removed', handleGroupRemoved);
      socket.off('group_left', handleGroupLeft);
    };
  }, [socket, activeChat, getPeerId, fetchConversations, myId]);

  // ─── PRESENCE TRACKING ───
  useEffect(() => {
    if (!activeChat || activeChat.isGroup) return;
    const peerId = getPeerId();
    if (!peerId) return;

    const isOnline = onlineUsers.has(peerId);
    const lastSeen = lastSeenMap[peerId] || null;
    setPeerPresence({ isOnline, lastSeen });

    if (!isOnline && socket) {
      socket.emit('get_presence', { userId: peerId }, (data) => {
        if (data) setPeerPresence(data);
      });
    }
  }, [activeChat, getPeerId, onlineUsers, lastSeenMap, socket]);

  // ─── SEND MESSAGE ───
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !socket) return;
    const peerId = getPeerId();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socket.emit('stop_typing', { recipientId: peerId, conversationId: activeChat.id });
    }

    if (activeChat.isGhost) {
      try {
        const res = await API.post('/messages', { recipient_id: peerId, content: newMessage });
        const newConvs = await fetchConversations();
        const realOne = newConvs.find(c => !c.isGroup && (String(c.user1_id_str) === peerId || String(c.user2_id_str) === peerId));
        if (realOne) openConversation(realOne);
      } catch (err) { console.error(err); }
      setNewMessage('');
      return;
    }

    const replyData = replyingTo ? {
      messageId: replyingTo.id || replyingTo._id,
      senderId: replyingTo.sender_id,
      previewText: replyingTo.content?.substring(0, 50) || 'Attachment'
    } : null;

    socket.emit('message_send', {
      recipientId: peerId, // fallback for legacy
      conversationId: activeChat.id,
      content: newMessage,
      type: 'text',
      replyTo: replyData
    }, (response) => {
      if (response?.success) {
        setMessages(prev => prev.some(m => m.id === response.data.id) ? prev : [...prev, response.data]);
        fetchConversations();
      }
    });

    setNewMessage('');
    setReplyingTo(null);
  };

  // ─── TYPING DEBOUNCER ───
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !activeChat) return;

    if (typingEmitTimeoutRef.current) clearTimeout(typingEmitTimeoutRef.current);
    typingEmitTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { recipientId: getPeerId(), conversationId: activeChat.id });
    }, 300);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    // EXTENDED: Decoupled debounce to 3 seconds format exactly like requested
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { recipientId: getPeerId(), conversationId: activeChat.id });
    }, 3000); 
  };

  // ─── FILE UPLOAD ───
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return alert('File size must be under 10 MB');

    const preview = {
      file, name: file.name, type: file.type, size: file.size,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    };
    setFilePreview(preview);
  };

  const cancelFilePreview = () => {
    if (filePreview?.url) URL.revokeObjectURL(filePreview.url);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSend = async () => {
    if (!filePreview || !activeChat || !socket) return;
    const peerId = getPeerId();

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', filePreview.file);

      const uploadRes = await API.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total))
      });

      const { fileUrl, fileName, type } = uploadRes.data.data;

      if (activeChat.isGhost) {
        await API.post('/messages', { recipient_id: peerId, content: fileName, type, fileUrl, fileName });
        const newConvs = await fetchConversations();
        const realOne = newConvs.find(c => !c.isGroup && (String(c.user1_id_str) === peerId || String(c.user2_id_str) === peerId));
        if (realOne) openConversation(realOne);
      } else {
        socket.emit('message_send', {
          conversationId: activeChat.id, recipientId: peerId, content: fileName, type, fileUrl, fileName
        }, (response) => {
          if (response?.success) {
            setMessages(prev => prev.some(m => m.id === response.data.id) ? prev : [...prev, response.data]);
            fetchConversations();
          }
        });
      }
    } catch (err) { alert('Upload failed.'); }
    finally { setIsUploading(false); setUploadProgress(0); cancelFilePreview(); }
  };

  // ─── VOICE RECORDING HANDLERS ───
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioPreviewBlob(audioBlob);
        setAudioPreviewUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      showToast('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioPreviewBlob(null);
    setAudioPreviewUrl(null);
    setRecordingTime(0);
  };

  const sendAudioMessage = async () => {
    if (!audioPreviewBlob || !activeChat || !socket) return;
    const peerId = getPeerId();

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', audioPreviewBlob, `voice_message_${Date.now()}.webm`);

      const uploadRes = await API.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { fileUrl, fileName } = uploadRes.data.data;

      const payload = {
        conversationId: activeChat.id, recipientId: peerId, content: 'Voice message',
        type: 'audio', fileUrl, fileName, duration: recordingTime
      };

      socket.emit('message_send', payload, (response) => {
        if (response?.success) {
          setMessages(prev => prev.some(m => m.id === response.data.id) ? prev : [...prev, response.data]);
          fetchConversations();
        }
      });
    } catch (err) {
      showToast('Failed to send voice message.');
    } finally {
      setIsUploading(false);
      cancelRecording();
    }
  };

  // ─── CALL HANDLERS ───
  const handleVoiceCall = () => {
    if (activeChat.isGroup) {
      initiateCall(activeChat.id, activeChat.groupName || 'Group', 'voice', true);
    } else {
      const peerId = getPeerId();
      const partner = getChatPartner(activeChat);
      if (peerId && partner) initiateCall(peerId, partner.name, 'voice', false);
    }
  };

  const handleVideoCall = () => {
    if (activeChat.isGroup) {
      initiateCall(activeChat.id, activeChat.groupName || 'Group', 'video', true);
    } else {
      const peerId = getPeerId();
      const partner = getChatPartner(activeChat);
      if (peerId && partner) initiateCall(peerId, partner.name, 'video', false);
    }
  };

  const openMessageOptions = (e, m) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setMessageContextMenu({
      message: m,
      x: rect.left,
      y: rect.bottom + 5
    });
  };

  const handleDeleteMessage = (type) => {
    if (!messageToDelete) return;
    socket.emit('delete_message', { messageId: messageToDelete._id || messageToDelete.id, type });
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedContacts.length === 0) return alert("Select at least 1 contact and name the group.");
    try {
      await API.post('/messages/group', { name: groupName, members: selectedContacts });
      setShowGroupModal(false);
      setGroupName('');
      setSelectedContacts([]);
      await fetchConversations();
    } catch (e) {
      alert("Failed to create group");
    }
  };

  // ─── FORMATTERS ───
  const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const formatDuration = (sec) => {
    if (sec == null) return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };
  const formatLastSeen = (ts) => {
    if (!ts) return 'Offline';
    const d = new Date(ts);
    const diff = new Date() - d;
    if (diff < 60000) return 'Last seen just now';
    if (diff < 3600000) return `Last seen ${Math.floor(diff / 60000)}m ago`;
    return `Last seen at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };
  const isPartnerOnline = (conv) => {
    if (conv.isGroup) return false;
    const partnerId = String(getChatPartner(conv)?.id || getChatPartner(conv)?._id || '');
    return onlineUsers.has(partnerId);
  };

  // ─── CONTACTS LIST EXTRACTOR (FOR GROUP MODAL) ───
  const uniqueContacts = conversations.filter(c => !c.isGroup).map(c => getChatPartner(c)).filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);

  // ─── MESSAGE RENDERER ───
  const renderMessage = (m) => {
    const isSent = String(m.sender_id) === myId;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    // Message tick logic
    let tickIcon = null;
    if (isSent) {
      if (activeChat?.isGroup) {
        const expectedReads = (activeChat.members?.length || 0);
        const actualReads = (m.readBy?.length || 0);
        const everyoneRead = (expectedReads > 0 && actualReads >= expectedReads);
        tickIcon = everyoneRead 
          ? <CheckCheck size={14} color="#38bdf8" style={{marginLeft: '4px'}} /> 
          : <Check size={14} color="#cbd5e1" style={{marginLeft: '4px'}} />;
      } else {
        tickIcon = m.is_read 
          ? <CheckCheck size={14} color="#38bdf8" style={{marginLeft: '4px'}} /> 
          : <Check size={14} color="#cbd5e1" style={{marginLeft: '4px'}} />;
      }
    }

    if ((m.deletedFor || []).map(String).includes(myId)) return null;

    const renderContentBody = () => {
      if (m.isDeletedForEveryone) {
        return <p style={{ fontStyle: 'italic', color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>🚫 This message was deleted</p>;
      }
      
      if (m.type === 'system') {
        return <p style={{ color: '#64748b', margin: 0, fontSize: '0.8rem', textAlign: 'center', fontWeight: '700', padding: '0.25rem 1rem' }}>{m.content}</p>;
      }
      
      if (m.type === 'call') {
        const isMissed = m.callStatus === 'missed';
        const isDeclined = m.callStatus === 'declined';
        const color = (isMissed || isDeclined) ? '#ef4444' : '#22c55e';
        return (
          <div style={{ padding: '0.8rem 1.25rem', background: isSent?'rgba(255,255,255,0.1)':'white', borderRadius: '18px', display:'flex', alignItems:'center', gap:'0.75rem', border: isSent?'none':'1px solid #f1f5f9', color: isSent?'white':'#1e293b' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${color}20`, color, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {(isMissed || isDeclined) ? <PhoneOff size={20} /> : (isSent ? <PhoneOutgoing size={20} /> : <PhoneIncoming size={20} />)}
            </div>
            <div style={{ display:'flex', flexDirection:'column' }}>
              <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>
                {isMissed ? 'Missed Call' : isDeclined ? 'Declined Call' : 'Call Ended'}
              </span>
              <span style={{ fontSize: '0.75rem', color: isSent?'#cbd5e1':'#64748b', fontWeight:'600' }}>
                {m.callDuration ? formatDuration(m.callDuration) : '0s'}
              </span>
            </div>
          </div>
        );
      }

      if (m.type === 'image') return (
        <div className="media-bubble-content">
          <img src={m.fileUrl?.startsWith('http') ? m.fileUrl : `${baseUrl}${m.fileUrl}`} alt="Image" className="msg-image" onClick={() => window.open(m.fileUrl?.startsWith('http') ? m.fileUrl : `${baseUrl}${m.fileUrl}`, '_blank')} />
          {m.fileName && <span className="msg-file-name">{m.fileName}</span>}
        </div>
      );
      if (m.type === 'video') return (
        <div className="media-bubble-content">
          <video src={m.fileUrl?.startsWith('http') ? m.fileUrl : `${baseUrl}${m.fileUrl}`} controls className="msg-video" />
          {m.fileName && <span className="msg-file-name">{m.fileName}</span>}
        </div>
      );
      if (m.type === 'file') return (
        <div className="file-card">
          <div className="file-card-icon"><FileText size={24} /></div>
          <div className="file-card-info"><span className="file-card-name">{m.fileName || 'Document'}</span></div>
          <a href={m.fileUrl?.startsWith('http') ? m.fileUrl : `${baseUrl}${m.fileUrl}`} target="_blank" rel="noopener noreferrer" download className="file-download-btn"><Download size={18} /></a>
        </div>
      );
      if (m.type === 'audio') return (
        <CustomAudioPlayer 
          src={m.fileUrl?.startsWith('http') ? m.fileUrl : `${baseUrl}${m.fileUrl}`} 
          duration={m.duration || m.audioDuration} 
          isSent={isSent} 
          currentlyPlayingAudio={currentlyPlayingAudio} 
          setCurrentlyPlayingAudio={setCurrentlyPlayingAudio} 
          messageId={m.id || m._id} 
        />
      );
      return <p style={{ margin: 0 }}>{m.content}</p>;
    };

    return (
      <div key={m.id || m._id} id={`msg-${m.id || m._id}`} className={`msg-bubble-wrapper ${isSent ? 'sent' : 'received'}`} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {selectionMode && !m.isDeletedForEveryone && (
          <input type="checkbox" checked={selectedMessages.some(sm => (sm.id || sm._id) === (m.id || m._id))} 
                 onChange={(e) => {
                   if (e.target.checked) setSelectedMessages(prev => [...prev, m]);
                   else setSelectedMessages(prev => prev.filter(sm => (sm.id || sm._id) !== (m.id || m._id)));
                 }} style={{width:'18px', height:'18px', cursor:'pointer', flexShrink:0}} />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isSent ? 'flex-end' : 'flex-start', maxWidth: selectionMode ? 'calc(100% - 26px)' : '100%' }}>
        {!isSent && activeChat?.isGroup && (
          <span style={{fontSize:'0.7rem', fontWeight:'800', color:'#64748b', marginLeft:'4px', marginBottom:'2px'}}>
            {m.senderName || (activeChat.members || []).find(mem => String(mem.user?._id || mem.user?.id || mem) === String(m.sender_id))?.user?.name || 'Member'}
          </span>
        )}
        
        <div className={`msg-bubble ${m.type === 'image' || m.type === 'video' ? 'media-bubble' : m.type === 'file' ? 'file-bubble' : ''} ${isSent ? 'sent' : 'received'}`} style={{ position: 'relative' }}>
          {m.replyTo?.messageId && (
            <div onClick={() => {
              const el = document.getElementById(`msg-${m.replyTo.messageId}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }} style={{ background: isSent ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)', padding: '6px 8px', borderRadius: '8px', borderLeft: '4px solid #38bdf8', marginBottom: '6px', cursor: 'pointer', fontSize: '0.8rem', color: isSent ? 'rgba(255,255,255,0.9)' : '#475569' }}>
               <span style={{fontWeight:'800', display:'block', marginBottom:'2px'}}>Replying to {m.replyTo.senderId === myId ? 'you' : 'someone'}</span>
               <span style={{opacity:0.8}}>{m.replyTo.previewText}</span>
            </div>
          )}
          {!m.isDeletedForEveryone && (
            <button 
              className="msg-options-trigger" 
              onClick={(e) => openMessageOptions(e, m)}
              style={{
                position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', 
                color: isSent ? 'rgba(255,255,255,0.7)' : '#94a3b8', cursor: 'pointer', padding: '2px', 
                zIndex: 10, display: 'none' // Will show on hover via CSS
              }}
            >
              <ChevronDown size={16} />
            </button>
          )}
          
          {renderContentBody()}
          
          <span className="msg-timestamp" style={{display:'flex', alignItems:'center', justifyContent: 'flex-end', marginTop: '4px'}}>
            {formatTime(m.createdAt)}
            {isSent && !m.isDeletedForEveryone && (
              <Info size={12} color={isSent ? "rgba(255,255,255,0.7)" : "#cbd5e1"} style={{marginLeft:'6px', cursor:'pointer'}} onClick={() => setInfoMessage(m)} />
            )}
            {(m.starredBy || []).includes(myId) && <Star size={12} fill={isSent ? 'rgba(255,255,255,0.8)' : '#fbbf24'} color={isSent ? 'transparent' : '#fbbf24'} style={{marginLeft:'4px'}} />}
            {tickIcon}
          </span>
        </div>
        </div>
      </div>
    );
  };

  // ─── LOADING ───
  if (loading) return <div className="page" style={{ color: 'var(--primary)', textAlign: 'center', paddingTop: '10rem' }}><div className="spinner-premium" style={{ margin: '0 auto 1rem' }}></div>Loading conversations...</div>;

  return (
    <div className="page messaging-page">
      <div className="messaging-layout">
        {/* ─── SIDEBAR ─── */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <MessageCircle size={22} color="#2b6777" />
              <span>Chats</span>
            </div>
            <button onClick={() => setShowGroupModal(true)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--primary)' }} title="New Group">
              <Users size={20} />
            </button>
          </div>
          <div className="conversation-list">
            {conversations.length === 0 ? (
              <div className="empty-conversations">
                <MessageCircle size={36} style={{ opacity: 0.15, marginBottom: '0.75rem' }} />
                <p>No conversations yet</p>
                <span>Start chatting from a user's profile</span>
              </div>
            ) : (
              conversations.map((conv) => {
                const partnerName = getChatPartner(conv).name;
                const isOnline = isPartnerOnline(conv);
                const lastMsg = conv.messages?.[0];
                return (
                  <div className={`contact-row-msg ${activeChat?.id === conv.id ? 'active' : ''}`} key={conv.id} onClick={() => openConversation(conv)}>
                    <div className="contact-avatar-wrap">
                      <div className="contact-avatar">{partnerName?.[0]?.toUpperCase() || '?'}</div>
                      {isOnline && <div className="online-dot"></div>}
                    </div>
                    <div className="contact-info">
                      <div className="contact-name">{partnerName}</div>
                      <div className="contact-preview">
                        {lastMsg?.type === 'call' ? (lastMsg.callStatus === 'missed' ? 'Missed Call' : 'Call') :
                         lastMsg?.type === 'image' ? '📷 Photo' :
                         lastMsg?.type === 'file' ? '📎 File' :
                         lastMsg?.type === 'video' ? '🎥 Video' :
                         lastMsg?.content?.substring(0, 35) || 'Group Chat'}
                      </div>
                    </div>
                    {lastMsg?.createdAt && <span className="contact-time">{formatTime(lastMsg.createdAt)}</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ─── MAIN CHAT ─── */}
        <div className="chat-main">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="chat-main-header">
                <div 
                  className="chat-header-left" 
                  onClick={() => {
                    if (activeChat.isGroup) setShowGroupInfo(!showGroupInfo);
                    else navigate(`/profile/${getChatPartner(activeChat).id || getChatPartner(activeChat)._id}`);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="chat-header-avatar-wrap">
                    <div className="chat-header-avatar">{getChatPartner(activeChat).name?.[0]?.toUpperCase() || '?'}</div>
                    {peerPresence.isOnline && <div className="online-dot small"></div>}
                  </div>
                  <div className="chat-header-info">
                    <h3>{getChatPartner(activeChat).name}</h3>
                    <span className={`presence-status ${peerPresence.isOnline ? 'online' : 'offline'}`}>
                      {activeChat.isGroup ? `${activeChat.members?.length || 0} Members` : (peerPresence.isOnline ? 'Online' : formatLastSeen(peerPresence.lastSeen))}
                    </span>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <button className="chat-action-btn" onClick={handleVoiceCall} title="Voice Call" id="voice-call-btn"><Phone size={18} /></button>
                  <button className="chat-action-btn" onClick={handleVideoCall} title="Video Call" id="video-call-btn"><Video size={18} /></button>
                </div>
              </div>

              {activeChat.pinnedMessageId && (() => {
                  const pMsg = messages.find(m => (m.id || m._id) === activeChat.pinnedMessageId);
                  if(!pMsg) return null;
                  return (
                    <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize:'0.85rem', color: '#475569', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => document.getElementById(`msg-${activeChat.pinnedMessageId}`)?.scrollIntoView({behavior:'smooth', block:'center'})} onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}>
                       <Pin size={16} color="#38bdf8" style={{minWidth:'16px'}} />
                       <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                         <span style={{fontWeight:'700', color:'#38bdf8', marginRight:'6px'}}>Pinned Message</span>
                         {pMsg.type === 'text' ? pMsg.content : pMsg.fileName || pMsg.type}
                       </div>
                    </div>
                  );
              })()}
{/* Messages */}
              <div className="msg-list" ref={scrollRef}>
                {messages.length === 0 && (
                  <div className="chat-empty-state"><MessageCircle size={48} style={{ opacity: 0.08 }} /><p>No messages yet. Say hello! 👋</p></div>
                )}
                {messages.map(renderMessage)}
                {/* Typing indicator */}
                {peerTyping && (
                  <div className="msg-bubble-wrapper received">
                    <div className="msg-bubble received typing-bubble">
                      <div className="typing-dots"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* File preview bar */}
              {filePreview && (
                <div className="file-preview-bar">
                  <div className="file-preview-content">
                    {filePreview.url ? <img src={filePreview.url} alt="Preview" className="file-preview-thumb" /> : <div className="file-preview-icon">{filePreview.type?.startsWith('video/') ? <Film size={24} /> : <FileText size={24} />}</div>}
                    <div className="file-preview-info">
                      <span className="file-preview-name">{filePreview.name}</span>
                      <span className="file-preview-size">{formatFileSize(filePreview.size)}</span>
                    </div>
                    <button className="file-preview-cancel" onClick={cancelFilePreview}><X size={18} /></button>
                  </div>
                  {isUploading && <div className="upload-progress-bar"><div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }}></div></div>}
                  <button className="file-send-btn" onClick={handleFileSend} disabled={isUploading}>{isUploading ? <><Loader size={18} className="spin" /> Uploading...</> : <><Send size={18} /> Send</>}</button>
                </div>
              )}
              
              {replyingTo && (
                <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #38bdf8' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#38bdf8', marginBottom: '2px' }}>Replying to {replyingTo.senderName || 'Message'}</span>
                    <span style={{ fontSize: '0.85rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{replyingTo.content || replyingTo.fileName || 'Attachment'}</span>
                  </div>
                  <button type="button" onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
                </div>
              )}

              {/* Chat footer */}
              {isRecording ? (
                <div className="chat-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', fontWeight: '700', animation: 'pulse 1.5s infinite' }}>
                    <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%' }}></div>
                    Recording... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <button type="button" onClick={cancelRecording} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}><X size={18}/> Cancel</button>
                     <button type="button" onClick={stopRecording} style={{ background: '#38bdf8', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: '600', display:'flex', alignItems:'center', gap:'0.4rem' }}><Square size={14} fill="white" /> Stop</button>
                  </div>
                </div>
              ) : audioPreviewBlob ? (
                <div className="chat-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Mic size={20} color="#38bdf8" />
                    <audio src={audioPreviewUrl} controls style={{ height: '36px' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <button type="button" onClick={cancelRecording} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}><Trash2 size={18}/></button>
                     <button type="button" onClick={sendAudioMessage} disabled={isUploading} style={{ background: '#38bdf8', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: '600', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                       {isUploading ? <Loader size={16} className="spin" /> : <><Send size={16} /> Send</>}
                     </button>
                  </div>
                </div>
              ) : (
                <form className="chat-footer" onSubmit={handleSendMessage}>
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} hidden />
                  <button type="button" className="attach-btn" onClick={() => fileInputRef.current?.click()} title="Attach File" id="attach-file-btn"><Paperclip size={20} /></button>
                  <input type="text" placeholder="Type a message..." value={newMessage} onChange={handleInputChange} className="chat-input-full" id="message-input" />
                  {newMessage.trim() ? (
                    <button type="submit" className="btn-send-msg" id="send-message-btn"><Send size={20} /></button>
                  ) : (
                    <button type="button" className="btn-send-msg" onClick={startRecording} id="start-recording-btn" style={{ background: '#0284c7' }}><Mic size={20} /></button>
                  )}
                </form>
              )}
            </>
          ) : (
            <div className="chat-empty-placeholder">
              <div className="empty-chat-icon"><MessageCircle size={72} /></div>
              <h3>Welcome to Messages</h3>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>

        {/* ─── GROUP INFO SIDEBAR ─── */}
        {activeChat?.isGroup && showGroupInfo && (
          <div className="group-info-sidebar" style={{ width: '320px', borderLeft: '1px solid #e2e8f0', background: 'white', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s ease-out' }}>
             <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <h3 style={{ margin: 0 }}>Group Info</h3>
               <button onClick={() => setShowGroupInfo(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20}/></button>
             </div>
             
             <div style={{ padding: '1.5rem', textAlign: 'center', borderBottom: '1.5px solid #f8fafc' }}>
               <div style={{ width: '80px', height: '80px', background: '#38bdf8', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', fontWeight: '800' }}>
                 {activeChat.groupName?.[0]?.toUpperCase()}
               </div>
               <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{activeChat.groupName}</h2>
               <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Group • {activeChat.members?.length} Members</span>
             </div>

             <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '0 0.5rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#64748b' }}>{activeChat.members?.length} Members</span>
                  {activeChat.members?.find(m => String(m.user?._id || m.user) === myId)?.role === 'admin' && (
                    <button onClick={() => setShowAddMemberModal(true)} style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>+ Add Member</button>
                  )}
                </div>

                {activeChat.members?.map(member => {
                  const u = member.user || {};
                  const isUserAdmin = member.role === 'admin';
                  const isMe = String(u._id || u.id) === myId;
                  const currentAdmin = activeChat.members?.find(m => String(m.user?._id || m.user) === myId)?.role === 'admin';

                  return (
                    <div key={u._id || u.id} className="member-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.5rem', borderRadius: '8px', transition: 'background 0.2s', cursor: currentAdmin && !isMe ? 'pointer' : 'default' }} 
                         onMouseOver={(e) => currentAdmin && !isMe && (e.currentTarget.style.background = '#f8fafc')} 
                         onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                         onClick={() => {
                           if (currentAdmin && !isMe) {
                             if (window.confirm(`Manage ${u.name}?`)) {
                               const action = window.prompt(`Options: 1. ${isUserAdmin ? "Demote from Admin" : "Make Group Admin"} | 2. Remove from Group\n(Enter 1 or 2)`);
                               if (action === '1') {
                                 socket.emit('group_update_role', { conversationId: activeChat.id, memberId: u._id || u.id, role: isUserAdmin ? 'member' : 'admin' });
                               } else if (action === '2') {
                                 socket.emit('group_remove_member', { conversationId: activeChat.id, memberId: u._id || u.id });
                               }
                             }
                           }
                         }}>
                      <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#64748b' }}>{u.name?.[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{u.name} {isMe && '(You)'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{u.college || 'Student'}</div>
                      </div>
                      {isUserAdmin && <span style={{ fontSize: '0.7rem', color: '#10b981', border: '1px solid #10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>Admin</span>}
                    </div>
                  );
                })}
             </div>

             <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <button onClick={() => {
                  if (window.confirm('Are you sure you want to leave this group?')) {
                    socket.emit('group_leave', { conversationId: activeChat.id });
                    setShowGroupInfo(false);
                  }
                }} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: '#fef2f2', border: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Trash2 size={18} /> Leave Group
                </button>
             </div>
          </div>
        )}
      </div>

      {/* ADD MEMBER MODAL */}
      {showAddMemberModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', padding: '2rem' }}>
            <div className="modal-header">
              <h2>Add Members</h2>
              <button onClick={() => setShowAddMemberModal(false)} className="close-btn"><X size={20}/></button>
            </div>
            <div style={{ margin: '1.5rem 0', maxHeight: '300px', overflowY: 'auto' }}>
               {/* Simplified user selection for demo - in real app you'd fetch all users */}
               <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Enter User IDs (comma separated):</p>
               <input type="text" id="add-member-input" className="chat-input-full" style={{ border: '1px solid #e2e8f0', width: '100%', padding: '0.75rem' }} placeholder="user_id1, user_id2..." />
            </div>
            <button className="btn-publish" onClick={() => {
              const val = document.getElementById('add-member-input').value;
              const ids = val.split(',').map(s => s.trim()).filter(Boolean);
              if (ids.length > 0) {
                socket.emit('group_add_members', { conversationId: activeChat.id, memberIds: ids });
                setShowAddMemberModal(false);
              }
            }}>Add Selected</button>
          </div>
        </div>
      )}

      {/* GROUP CREATION MODAL */}
      {showGroupModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '400px', padding: '2rem'}}>
            <div className="modal-header" style={{marginBottom: '1.5rem'}}>
              <h2 style={{fontSize: '1.5rem'}}>Create Group</h2>
              <button className="close-btn" onClick={() => setShowGroupModal(false)}><X size={20}/></button>
            </div>
            <input 
              className="input-premium" 
              placeholder="Group Name" 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{marginBottom: '1rem'}}
            />
            <div style={{maxHeight:'200px', overflowY:'auto', border:'1.5px solid #f1f5f9', borderRadius:'14px', padding:'1rem'}}>
               {uniqueContacts.length === 0 ? <p style={{fontSize:'0.8rem', color:'#94a3b8', textAlign:'center'}}>No contacts to add yet.</p> : null}
               {uniqueContacts.map(contact => (
                 <label key={contact.id} style={{display:'flex', alignItems:'center', gap:'0.8rem', marginBottom:'0.8rem', cursor:'pointer', fontWeight:'700'}}>
                   <input type="checkbox" checked={selectedContacts.includes(contact.id)} onChange={(e) => {
                     if (e.target.checked) setSelectedContacts(prev => [...prev, contact.id]);
                     else setSelectedContacts(prev => prev.filter(c => c !== contact.id));
                   }} />
                   {contact.name || 'Unknown'}
                 </label>
               ))}
            </div>
            <button className="btn-publish" onClick={handleCreateGroup} style={{marginTop: '1.5rem', padding: '1rem'}}>
              Create
            </button>
          </div>
        </div>
      )}

      {/* MESSAGE INFO MODAL */}
      {infoMessage && (
        <div className="modal-overlay" onClick={() => setInfoMessage(null)}>
          <div className="modal-content" style={{maxWidth: '400px', padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto'}} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{marginBottom: '1rem'}}>
              <h2 style={{fontSize: '1.25rem'}}>Message Info</h2>
              <button className="close-btn" onClick={() => setInfoMessage(null)}><X size={20}/></button>
            </div>

            <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem', color:'#38bdf8'}}>
               <CheckCheck size={18} />
               <span style={{fontWeight:'700'}}>Read by</span>
            </div>
            <div style={{marginBottom:'1rem'}}>
               {activeChat?.members ? activeChat.members.map(member => {
                 if (String(member._id || member.id) === myId) return null; // Don't list myself
                 const hasRead = (infoMessage.readBy || []).map(String).includes(String(member._id || member.id));
                 if (!hasRead) return null;
                 
                 const rInfo = (infoMessage.readInfo || []).find(r => String(r.user || r.userId) === String(member._id || member.id));
                 const readTimeStr = rInfo?.time ? formatTime(rInfo.time) : '...';

                 return (
                   <div key={member._id} onClick={() => navigate(`/profile/${member._id || member.id}`)} style={{padding: '0.75rem 0', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #f1f5f9', cursor:'pointer'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                          <div className="contact-avatar" style={{width:'40px', height:'40px', fontSize:'1rem'}}>{member.name?.[0]?.toUpperCase()}</div>
                          <span style={{fontWeight:'600', fontSize:'0.95rem', color:'#334155'}}>{member.name}</span>
                      </div>
                      <span style={{fontSize: '0.8rem', color: '#38bdf8', fontWeight: '600'}}>{readTimeStr}</span>
                   </div>
                 );
               }) : (
                 // Fallback for 1-on-1 if members array is not populated
                 (() => {
                    const p = getChatPartner(activeChat);
                    const hasRead = (infoMessage.readBy || []).map(String).includes(String(p.id || p._id));
                    if (!hasRead) return null;
                    
                    const rInfo = (infoMessage.readInfo || []).find(r => String(r.user || r.userId) === String(p.id || p._id));
                    const readTimeStr = rInfo?.time ? formatTime(rInfo.time) : '...';

                    return (
                      <div onClick={() => navigate(`/profile/${p.id || p._id}`)} style={{padding: '0.75rem 0', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #f1f5f9', cursor:'pointer'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                              <div className="contact-avatar" style={{width:'40px', height:'40px', fontSize:'1rem'}}>{p.name?.[0]?.toUpperCase()}</div>
                              <span style={{fontWeight:'600', fontSize:'0.95rem', color:'#334155'}}>{p.name}</span>
                          </div>
                          <span style={{fontSize: '0.8rem', color: '#38bdf8', fontWeight: '600'}}>{readTimeStr}</span>
                      </div>
                    );
                 })()
               )}
               {(!infoMessage.readBy || infoMessage.readBy.length <= 1) && (
                 <p style={{fontSize:'0.85rem', color:'#94a3b8', padding: '0.5rem 0'}}>—</p>
               )}
            </div>

            <div style={{display:'flex', alignItems:'center', gap:'0.5rem', margin:'1.5rem 0 0.5rem', color:'#94a3b8'}}>
               <Check size={18} />
               <span style={{fontWeight:'700'}}>Delivered to</span>
            </div>
            <div>
               {activeChat?.members ? activeChat.members.map(member => {
                 if (String(member._id || member.id) === myId) return null;
                 const hasRead = (infoMessage.readBy || []).map(String).includes(String(member._id || member.id));
                 if (hasRead) return null; // If they read it, they aren't merely "delivered"
                 return (
                   <div key={member._id} onClick={() => navigate(`/profile/${member._id || member.id}`)} style={{padding: '0.75rem 0', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #f1f5f9', cursor:'pointer'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                          <div className="contact-avatar" style={{width:'40px', height:'40px', fontSize:'1rem'}}>{member.name?.[0]?.toUpperCase()}</div>
                          <span style={{fontWeight:'600', fontSize:'0.95rem', color:'#334155'}}>{member.name}</span>
                      </div>
                      <span style={{fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600'}}>Delivered</span>
                   </div>
                 );
               }) : (
                 (() => {
                    const p = getChatPartner(activeChat);
                    const hasRead = (infoMessage.readBy || []).map(String).includes(String(p.id || p._id));
                    if (hasRead) return null;
                    return (
                      <div onClick={() => navigate(`/profile/${p.id || p._id}`)} style={{padding: '0.75rem 0', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #f1f5f9', cursor:'pointer'}}>
                          <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                              <div className="contact-avatar" style={{width:'40px', height:'40px', fontSize:'1rem'}}>{p.name?.[0]?.toUpperCase()}</div>
                              <span style={{fontWeight:'600', fontSize:'0.95rem', color:'#334155'}}>{p.name}</span>
                          </div>
                          <span style={{fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600'}}>Delivered</span>
                      </div>
                    );
                 })()
               )}
            </div>
          </div>
        </div>
      )}

      {/* MESSAGE OPTIONS CONTEXT MENU */}
      {messageContextMenu && (
        <div 
          className="context-menu-overlay" 
          onClick={() => setMessageContextMenu(null)}
          onContextMenu={(e) => { e.preventDefault(); setMessageContextMenu(null); }}
          style={{ position: 'fixed', inset: 0, zIndex: 1000 }}
        >
          <div 
            className="message-context-menu"
            style={{
              position: 'absolute', top: messageContextMenu.y, left: messageContextMenu.x,
              background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              padding: '0.5rem', width: '180px', border: '1px solid #f1f5f9', zIndex: 1001,
              animation: 'fadeScale 0.1s ease-out'
            }}
          >
            <button className="menu-item" onClick={() => { setReplyingTo(messageContextMenu.message); document.getElementById('message-input')?.focus(); setMessageContextMenu(null); }}><Reply size={16} /> Reply</button>
            <button className="menu-item" onClick={() => { navigator.clipboard.writeText(messageContextMenu.message.content || ''); showToast("Message copied to clipboard"); setMessageContextMenu(null); }}><Copy size={16} /> Copy</button>
            <button className="menu-item" onClick={() => { setMessageToForward(messageContextMenu.message); setShowForwardModal(true); setMessageContextMenu(null); }}><Forward size={16} /> Forward</button>
            <button className="menu-item" onClick={() => { 
              const isPinned = activeChat?.pinnedMessageId === (messageContextMenu.message.id || messageContextMenu.message._id);
              if (isPinned) socket.emit('unpin_message', { conversationId: activeChat.id });
              else socket.emit('pin_message', { conversationId: activeChat.id, messageId: messageContextMenu.message.id || messageContextMenu.message._id });
              setMessageContextMenu(null); 
            }}><Pin size={16} /> {activeChat?.pinnedMessageId === (messageContextMenu.message.id || messageContextMenu.message._id) ? 'Unpin' : 'Pin'}</button>
            <button className="menu-item" style={{color:'#94a3b8', cursor:'not-allowed'}}><Bot size={16} /> Ask Meta AI</button>
            <button className="menu-item" onClick={() => { socket.emit('toggle_star_message', { messageId: messageContextMenu.message.id || messageContextMenu.message._id }); setMessageContextMenu(null); }}><Star size={16} /> {(messageContextMenu.message.starredBy || []).includes(myId) ? 'Unstar' : 'Star'}</button>
            <div style={{height:'1px', background:'#f1f5f9', margin:'0.3rem 0'}}></div>
            <button className="menu-item" onClick={() => { setSelectionMode(true); setSelectedMessages([messageContextMenu.message]); setMessageContextMenu(null); }}><List size={16} /> Select</button>
            <button className="menu-item" style={{color:'#94a3b8', cursor:'not-allowed'}}><Flag size={16} /> Report</button>
            <button 
              className="menu-item danger" 
              onClick={() => { 
                setMessageToDelete(messageContextMenu.message); 
                setShowDeleteModal(true); 
                setMessageContextMenu(null); 
              }}
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* DELETE MESSAGE MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" style={{maxWidth: '350px', padding: '1.5rem'}} onClick={(e) => e.stopPropagation()}>
            <h3 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>Delete message?</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
              {String(messageToDelete?.sender_id) === myId && !messageToDelete?.isDeletedForEveryone && (
                <button className="modal-action-btn danger-light" onClick={() => handleDeleteMessage('everyone')}>
                  Delete for everyone
                </button>
              )}
              <button className="modal-action-btn danger-light" onClick={() => handleDeleteMessage('me')}>
                Delete for me
              </button>
              <button className="modal-action-btn secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORWARD MODAL */}
      {showForwardModal && (
        <div className="modal-overlay" onClick={() => { setShowForwardModal(false); setForwardSelectedChats([]); setMessageToForward(null); }}>
          <div className="modal-content" style={{maxWidth: '400px', padding: '2rem'}} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{marginBottom: '1.5rem'}}>
              <h2 style={{fontSize: '1.5rem'}}>Forward Message</h2>
              <button className="close-btn" onClick={() => { setShowForwardModal(false); setForwardSelectedChats([]); setMessageToForward(null); }}><X size={20}/></button>
            </div>
            <div style={{maxHeight:'300px', overflowY:'auto', border:'1.5px solid #f1f5f9', borderRadius:'14px', padding:'1rem'}}>
               {conversations.length === 0 ? <p style={{fontSize:'0.8rem', color:'#94a3b8', textAlign:'center'}}>No conversations found.</p> : null}
               {conversations.map(conv => {
                 const partnerName = getChatPartner(conv).name;
                 return (
                   <label key={conv.id} style={{display:'flex', alignItems:'center', gap:'0.8rem', marginBottom:'0.8rem', cursor:'pointer', fontWeight:'700'}}>
                     <input type="checkbox" checked={forwardSelectedChats.includes(conv.id)} onChange={(e) => {
                       if (e.target.checked) setForwardSelectedChats(prev => [...prev, conv.id]);
                       else setForwardSelectedChats(prev => prev.filter(c => c !== conv.id));
                     }} />
                     {partnerName} {conv.isGroup ? '(Group)' : ''}
                   </label>
                 );
               })}
            </div>
            <button className="btn-publish" onClick={() => {
              if (forwardSelectedChats.length === 0) return alert('Select at least one chat.');
              const msgIds = selectionMode ? selectedMessages.map(m => m.id || m._id) : [messageToForward?.id || messageToForward?._id];
              socket.emit('forward_messages', { messageIds: msgIds, targetConversations: forwardSelectedChats, targetUsers: [] });
              setShowForwardModal(false);
              setForwardSelectedChats([]);
              setMessageToForward(null);
              if (selectionMode) {
                 setSelectionMode(false);
                 setSelectedMessages([]);
              }
              showToast("Message(s) forwarded successfully.");
            }} style={{marginTop: '1.5rem', padding: '1rem'}}>
              Forward
            </button>
          </div>
        </div>
      )}

      {/* SELECTION ACTION BAR */}
      {selectionMode && (
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', padding: '0.75rem 1.5rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', zIndex: 1000, color: 'white' }}>
           <span style={{fontWeight:'700', fontSize:'0.9rem'}}>{selectedMessages.length} Selected</span>
           <div style={{width:'1px', height:'20px', background:'rgba(255,255,255,0.2)'}}></div>
           <button onClick={() => { setShowForwardModal(true); setMessageToForward(selectedMessages[0]); }} style={{background:'none', border:'none', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', fontWeight:'600'}}><Forward size={16}/> Forward</button>
           <button onClick={() => {
             if (window.confirm(`Delete ${selectedMessages.length} messages for me?`)) {
               selectedMessages.forEach(m => socket.emit('delete_message', { messageId: m.id || m._id, type: 'me' }));
               setSelectionMode(false);
               setSelectedMessages([]);
             }
           }} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', fontWeight:'600'}}><Trash2 size={16}/> Delete</button>
           <div style={{width:'1px', height:'20px', background:'rgba(255,255,255,0.2)'}}></div>
           <button onClick={() => { setSelectionMode(false); setSelectedMessages([]); }} style={{background:'none', border:'none', color:'#cbd5e1', cursor:'pointer'}}>Cancel</button>
        </div>
      )}

      {/* TOAST SYSTEM */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '2rem', left: '2rem', background: '#1e293b', color: 'white', padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', zIndex: 9999, fontWeight: '600', animation: 'fadeScale 0.2s ease-out' }}>
           {toastMessage}
        </div>
      )}

      <style>
        {`
          .msg-bubble:hover .msg-options-trigger {
            display: flex !important;
            opacity: 1 !important;
          }
          .menu-item {
            display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.6rem 0.8rem;
            background: none; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem;
            font-weight: 600; color: #475569; transition: background 0.1s;
          }
          .menu-item:hover { background: #f8fafc; }
          .menu-item.danger { color: #ef4444; }
          .menu-item.danger:hover { background: #fef2f2; }
          .modal-action-btn {
            width: 100%; padding: 0.75rem; border-radius: 10px; border: none; font-weight: 700;
            cursor: pointer; text-align: left; font-size: 0.9rem; transition: background 0.2s;
          }
          .modal-action-btn.danger-light { background: #fef2f2; color: #ef4444; }
          .modal-action-btn.danger-light:hover { background: #fee2e2; }
          .modal-action-btn.secondary { background: #f1f5f9; color: #475569; }
          @keyframes fadeScale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .waveform-bar {
            width: 3px; height: 4px; background: currentColor; border-radius: 2px;
            opacity: 0.5; transition: height 0.1s;
          }
          .waveform-bar.playing {
            animation: waveform 1.2s ease-in-out infinite; opacity: 1;
          }
          @keyframes waveform {
            0%, 100% { height: 4px; }
            50% { height: 16px; }
          }
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
          }
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .member-item:hover {
            background: #f8fafc;
          }
        `}
      </style>
    </div>
  );
}

export default Messaging;