import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Send, User, MessageCircle, Info } from 'lucide-react';

function Messaging() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await API.get('/messages/conversations');
        setConversations(res.data.data || []);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchConversations();
  }, []);

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
    const recipient_id = activeChat.user1_id === user.id ? activeChat.user2_id : activeChat.user1_id;
    try {
      const res = await API.post('/messages', { recipient_id, content: newMessage });
      setMessages([...messages, res.data.data]);
      setNewMessage('');
    } catch (err) { console.error(err); }
  };

  const getChatPartner = (conv) => {
    return conv.user1_id === user.id ? conv.user2 : conv.user1;
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
              <div className="msg-list">
                {messages.map((m) => (
                  <div key={m.id} className={`msg-bubble ${m.sender_id === user.id ? 'sent' : 'received'}`}>
                    {m.content}
                  </div>
                ))}
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
