import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Send, User, MessageCircle, Info, ArrowLeft, RefreshCw } from 'lucide-react';

function Messaging() {
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');
  const scrollRef = useRef(null);
  
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [polling, setPolling] = useState(false);
  const { user } = useAuth();

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await API.get('/messages/conversations');
        const convs = res.data.data || [];
        setConversations(convs);
        
        // Handle Auto-Start from query param
        if (targetUserId) {
          const existing = convs.find(c => 
            (c.user1_id === targetUserId || c.user2_id === targetUserId)
          );
          
          if (existing) {
            openConversation(existing);
          } else {
            // "Ghost" chat placeholder - fetch real name for immediate identification
            const peerRes = await API.get(`/users/${targetUserId}`).catch(() => null);
            const peerData = peerRes?.data?.data || { name: 'Synchronizing Peer...' };
            
            setActiveChat({
              id: 'ghost',
              isGhost: true,
              user1_id: user.id || user._id,
              user2_id: targetUserId,
              user1: { name: user.name, id: user.id },
              user2: { name: peerData.name, id: targetUserId, college: peerData.college }
            });
          }
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchConversations();
  }, [targetUserId]);

  const openConversation = async (conv) => {
    setActiveChat(conv);
    try {
      const res = await API.get(`/messages/${conv.id}`);
      setMessages(res.data.data || []);
      setPolling(true);
    } catch (err) { console.error(err); }
  };

  // Sync polling for new messages
  useEffect(() => {
    let interval;
    if (polling && activeChat && !activeChat.isGhost) {
       interval = setInterval(async () => {
          try {
             const res = await API.get(`/messages/${activeChat.id}`);
             const newMsgs = res.data.data || [];
             if (newMsgs.length !== messages.length) {
                setMessages(newMsgs);
             }
          } catch (e) { /* silent sync */ }
       }, 5000);
    }
    return () => clearInterval(interval);
  }, [polling, activeChat, messages.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    
    // Ghost or Normal
    const recipient_id = activeChat.isGhost 
       ? activeChat.user2_id 
       : (activeChat.user1_id === user.id ? activeChat.user2_id : activeChat.user1_id);
       
    try {
      const res = await API.post('/messages', { recipient_id, content: newMessage });
      
      if (activeChat.isGhost) {
         // Transform Ghost to real conversation
         const refreshConvs = await API.get('/messages/conversations');
         const newConvs = refreshConvs.data.data || [];
         setConversations(newConvs);
         const realOne = newConvs.find(c => c.user1_id === recipient_id || c.user2_id === recipient_id);
         if (realOne) openConversation(realOne);
      } else {
         setMessages([...messages, res.data.data]);
      }
      setNewMessage('');
    } catch (err) { console.error(err); }
  };

  const getChatPartner = (conv) => {
    if (!conv || !user) return { name: 'Peer Node' };
    const myIdStr = String(user.id || user._id || '').toLowerCase();
    
    // Normalize IDs from any structure
    const u1Id = String(conv.user1_id || conv.user1?.id || conv.user1?._id || '').toLowerCase();
    const u2Id = String(conv.user2_id || conv.user2?.id || conv.user2?._id || '').toLowerCase();
    
    // Choose the partner that ISN'T me
    const partner = (u1Id === myIdStr) ? (conv.user2 || {}) : (conv.user1 || {});
    return partner;
  };

  if (loading) return <div className="page" style={{ color: 'white', textAlign: 'center', paddingTop: '10rem' }}>Opening campus portal...</div>;

  return (
    <div className="page messaging-page">
      <div className="messaging-layout">
        {/* SIDEBAR */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
             <MessageCircle size={24} color="#2b6777" style={{ verticalAlign: 'middle', marginRight: '0.75rem' }} />
             Campus Chats
          </div>
          <div className="conversation-list">
            {conversations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                 <p style={{ fontSize: '0.85rem' }}>No conversations started.</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div 
                  className={`contact-row-msg ${activeChat?.id === conv.id ? 'active' : ''}`} 
                  key={conv.id} 
                  onClick={() => openConversation(conv)}
                >
                  <div style={{ width: '40px', height: '40px', background: '#2b6777', color: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', marginRight: '1rem' }}>
                    {getChatPartner(conv).name?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', color: '#2b3a4a' }}>{getChatPartner(conv).name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{getChatPartner(conv).college}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAIN CHAT */}
        <div className="chat-main">
          {activeChat ? (
            <>
              <div className="chat-main-header">
                 <div style={{ width: '32px', height: '32px', background: '#52ab98', borderRadius: '8px' }}></div>
                 <h3>{getChatPartner(activeChat).name}</h3>
              </div>
              <div className="msg-list" ref={scrollRef}>
                {messages.map((m) => {
                  const myId = String(user.id || user._id || '');
                  const isSent = String(m.sender_id) === myId;
                  return (
                    <div key={m.id} className={`msg-bubble ${isSent ? 'sent' : 'received'}`}>
                      {m.content}
                    </div>
                  );
                })}
              </div>
              <form className="chat-footer" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  placeholder="Share a thought or ask for help..." 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  className="chat-input-full"
                />
                <button type="submit" className="btn-send-msg">
                   <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
               <Info size={64} style={{ opacity: 0.1, marginBottom: '2rem' }} />
               <p style={{ fontWeight: '800' }}>Select a peer to begin collaboration.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messaging;
