import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Send, User, MessageCircle, Info, Search as SearchIcon, Clock, Check, CheckCheck } from 'lucide-react';

function Messaging() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const scrollRef = useRef(null);
  const { user } = useAuth();

  const currentUserId = String(user?.id || user?._id);

  const fetchConversations = async () => {
    try {
      const res = await API.get('/messages/conversations');
      setConversations(res.data.data || []);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000); // Poll list every 5s
    return () => clearInterval(interval);
  }, []);

  // Polling for new messages in active chat
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const res = await API.get(`/messages/${activeChat.id}`);
        setMessages(res.data.data || []);
      } catch (err) { console.error(err); }
    };

    const interval = setInterval(fetchMessages, 3000); // Poll messages every 3s
    return () => clearInterval(interval);
  }, [activeChat]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const openConversation = async (conv) => {
    setActiveChat(conv);
    try {
      const res = await API.get(`/messages/${conv.id}`);
      setMessages(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    
    const partner = getChatPartner(activeChat);
    const recipient_id = partner?._id || partner?.id;
    
    if (!recipient_id) return;
    
    try {
      const res = await API.post('/messages', { recipient_id, content: newMessage });
      const sentMsg = { ...res.data.data, id: res.data.data._id || res.data.data.id };
      setMessages([...messages, sentMsg]);
      setNewMessage('');
      fetchConversations(); // Update list to show latest snippet
    } catch (err) { console.error("Send Error:", err); }
  };

  const getChatPartner = (conv) => {
    if (!conv || !user) return {};
    
    // Check populated user1_id or user1 object
    const u1 = conv.user1_id || conv.user1;
    const u1Id = String(u1?._id || u1?.id || u1);
    
    return u1Id === currentUserId ? (conv.user2_id || conv.user2) : u1;
  };

  const filteredConversations = conversations.filter(c => {
    const partner = getChatPartner(c);
    return partner?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const isOnline = (lastSeen) => {
    if (!lastSeen) return false;
    const diff = Math.abs(Math.floor((new Date() - new Date(lastSeen)) / 1000));
    return diff < 300; // 5 minutes threshold
  };

  const renderOnlineStatus = (lastSeen) => {
    if (!lastSeen) return 'Student Portal Active';
    const now = new Date();
    const last = new Date(lastSeen);
    const diffSeconds = Math.abs(Math.floor((now - last) / 1000));

    if (diffSeconds < 300) return <span style={{ color: '#22c55e' }}>🟢 Online</span>;
    if (diffSeconds < 3600) return `Active ${Math.floor(diffSeconds / 60)}m ago`;
    if (last.toDateString() === now.toDateString()) return `Active ${formatTime(lastSeen)}`;
    return `Active ${formatDate(lastSeen)}`;
  };

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <div className="spinner-premium"></div>
    </div>
  );

  return (
    <div className="page messaging-page">
      <div className="messaging-layout">
        {/* SIDEBAR */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <MessageCircle size={28} color="#2b6777" />
                <span style={{ fontWeight: 900, color: '#1e293b', fontSize: '1.25rem' }}>Campus Chats</span>
             </div>
             <div className="chat-search-wrapper">
                <SearchIcon size={16} color="#94a3b8" />
                <input 
                  type="text" 
                  placeholder="Search contacts..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
          <div className="conversation-list custom-scrollbar">
            {filteredConversations.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                 <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{searchTerm ? 'No matches found' : 'No conversations yet'}</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const partner = getChatPartner(conv);
                const lastMsg = conv.messages?.[0];
                return (
                  <div 
                    className={`contact-row-msg ${activeChat?.id === conv.id ? 'active' : ''}`} 
                    key={conv.id} 
                    onClick={() => openConversation(conv)}
                  >
                    <div className="contact-avatar-wrapper">
                      <div className="avatar-sm-v2">
                        {partner.name?.[0]}
                      </div>
                      {isOnline(partner.last_seen) && <div className="online-indicator-dot"></div>}
                      {conv.unreadCount > 0 && <div className="unread-dot">{conv.unreadCount}</div>}
                    </div>
                    <div className="contact-info-msg">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: '900', color: '#1e293b', fontSize: '0.95rem' }}>{partner.name}</span>
                        {lastMsg && <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>{formatTime(lastMsg.createdAt)}</span>}
                      </div>
                      <div className="last-msg-snippet">
                         {lastMsg ? lastMsg.content : 'No messages yet'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MAIN CHAT */}
        <div className="chat-main">
          {activeChat ? (
            <>
              <div className="chat-main-header">
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="avatar-sm-v2" style={{ width: '36px', height: '36px' }}>{getChatPartner(activeChat).name?.[0]}</div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>{getChatPartner(activeChat).name}</h3>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                        {renderOnlineStatus(getChatPartner(activeChat).last_seen)}
                      </div>
                    </div>
                 </div>
              </div>
              <div className="msg-list custom-scrollbar" ref={scrollRef}>
                {messages.map((m, idx) => {
                  const showDate = idx === 0 || formatDate(m.createdAt) !== formatDate(messages[idx - 1].createdAt);
                  return (
                    <React.Fragment key={m.id}>
                      {showDate && (
                        <div className="chat-date-divider">
                           <span>{formatDate(m.createdAt)}</span>
                        </div>
                      )}
                      <div className={`msg-bubble-v2 ${String(m.sender_id) === currentUserId ? 'sent' : 'received'}`}>
                        <div className="msg-content">{m.content}</div>
                        <div className="msg-meta">
                          {formatTime(m.createdAt)}
                          {String(m.sender_id) === currentUserId && (
                            <span style={{ marginLeft: '4px' }}>
                              {m.is_read ? <CheckCheck size={12} /> : <Check size={12} />}
                            </span>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
              <form className="chat-footer-v2" onSubmit={handleSendMessage}>
                <div className="input-with-actions">
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    className="chat-input-v2"
                  />
                  <button type="submit" className="btn-send-msg-v2" disabled={!newMessage.trim()}>
                     <Send size={20} />
                  </button>
                </div>
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
