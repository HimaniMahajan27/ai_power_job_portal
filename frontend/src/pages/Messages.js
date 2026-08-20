import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSend,
  FiSearch,
  FiMessageCircle,
  FiChevronLeft,
  FiCheck
} from 'react-icons/fi';
import DefaultAvatar from '../components/DefaultAvatar';
import './Messages.css';

const Messages = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user) return;

    const socketUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      newSocket.emit('user:join', user._id);
    });

    newSocket.on('message:receive', (message) => {
      console.log('Message received:', message);
      setConversationMessages(prev => [...prev, message]);
      
      // Mark message as read
      newSocket.emit('message:read', message._id);
    });

    newSocket.on('message:sent', (message) => {
      console.log('Message sent successfully:', message);
      setConversationMessages(prev => [...prev, message]);
    });

    newSocket.on('user:online', (data) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    });

    newSocket.on('user:offline', (data) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(data.userId);
        return updated;
      });
    });

    newSocket.on('user:typing', (data) => {
      setTypingUser(data.userId);
      setTimeout(() => setTypingUser(null), 3000);
    });

    newSocket.on('error', (data) => {
      toast.error(data.message);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Scroll to bottom ONLY when messages change, not on every render
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
    
    return () => clearTimeout(scrollTimer);
  }, [conversationMessages]); // Only when messages change

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get('messages/conversations');
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const { data } = await axios.get(`messages/users/search?query=${query}`);
      setSearchResults(data.users);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    }
  };

  const selectUserFromSearch = async (selectedUser) => {
    setSelectedConversation(selectedUser);
    setSearchQuery('');
    setSearchResults([]);
    
    try {
      const { data } = await axios.get(`messages/conversation/${selectedUser._id}`);
      setConversationMessages(data.messages);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation.user);
    setSearchQuery('');
    setSearchResults([]);
    setMessageInput(''); // Clear message input
    setConversationMessages([]); // This will show loading state

    try {
      console.log(`Fetching conversation with ${conversation.user._id}`);
      const { data } = await axios.get(`messages/conversation/${conversation.user._id}`);
      console.log('Loaded messages:', data.messages);
      setConversationMessages(data.messages);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load conversation');
      setConversationMessages([]); // Reset on error
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !selectedConversation) {
      return;
    }

    if (!socket) {
      toast.error('Not connected to chat server');
      return;
    }

    setSendingMessage(true);

    try {
      socket.emit('message:send', {
        senderId: user._id,
        receiverId: selectedConversation._id,
        content: messageInput
      });

      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleTyping = () => {
    if (socket && selectedConversation) {
      socket.emit('user:typing', {
        senderId: user._id,
        receiverId: selectedConversation._id
      });
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        {/* Sidebar - Conversations List */}
        <motion.div
          className="conversations-sidebar"
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="sidebar-header">
            <h2>Messages</h2>
          </div>

          {/* Search Box */}
          <div className="search-box">
            <FiSearch size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Search Results */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                className="search-results"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="search-results-header">Search Results</div>
                {searchResults.map((foundUser) => (
                  <div
                    key={foundUser._id}
                    className="user-search-item"
                    onClick={() => selectUserFromSearch(foundUser)}
                  >
                    <DefaultAvatar
                      src={foundUser.avatar}
                      alt={foundUser.name}
                      size={40}
                      className="user-avatar-small"
                    />
                    <div className="user-info">
                      <div className="user-name">{foundUser.name}</div>
                      <div className="user-email">{foundUser.email}</div>
                    </div>
                    {isUserOnline(foundUser._id) && <div className="online-indicator" />}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conversations List */}
          <div className="conversations-list">
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--gray-500)' }}>
                <FiMessageCircle size={32} style={{ margin: '0 auto 12px' }} />
                No conversations yet. Search for users to start chatting!
              </div>
            ) : (
              conversations.map((conv) => (
                <motion.div
                  key={conv.user._id}
                  className={`conversation-item ${
                    selectedConversation?._id === conv.user._id ? 'active' : ''
                  }`}
                  onClick={() => selectConversation(conv)}
                  whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                >
                  <div className="conversation-avatar-wrapper">
                    <DefaultAvatar
                      src={conv.user.avatar}
                      alt={conv.user.name}
                      size={48}
                      className="conversation-avatar"
                    />
                    {isUserOnline(conv.user._id) && (
                      <div className="online-badge" />
                    )}
                  </div>

                  <div className="conversation-details">
                    <div className="conversation-header">
                      <div className="conversation-name">{conv.user.name}</div>
                      <div className="message-time">
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="conversation-preview">
                      {conv.lastMessage.sender._id === user._id ? 'You: ' : ''}
                      {conv.lastMessage.content}
                    </div>
                  </div>

                  {conv.unreadCount > 0 && (
                    <div className="unread-badge">{conv.unreadCount}</div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <AnimatePresence mode="wait">
          {selectedConversation ? (
            <motion.div
              key={selectedConversation._id}
              className="chat-area"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-left">
                  <button
                    className="back-button"
                    onClick={() => {
                      setSelectedConversation(null);
                      setConversationMessages([]);
                    }}
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <div className="chat-user-info">
                    <DefaultAvatar
                      src={selectedConversation.avatar}
                      alt={selectedConversation.name}
                      size={40}
                      className="chat-avatar"
                    />
                    <div>
                      <div className="chat-user-name">{selectedConversation.name}</div>
                      <div className="chat-user-status">
                        {isUserOnline(selectedConversation._id) ? (
                          <span className="status-online">● Online</span>
                        ) : (
                          <span className="status-offline">● Offline</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Display */}
              <div className="messages-display">
                {conversationMessages.length === 0 ? (
                  <div className="no-messages">
                    <FiMessageCircle size={48} />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  conversationMessages.map((msg, idx) => {
                    const isOwnMessage = msg.sender._id === user._id;
                    return (
                      <motion.div
                        key={msg._id}
                        className={`message ${isOwnMessage ? 'own' : 'other'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {!isOwnMessage && (
                          <DefaultAvatar
                            src={msg.sender.avatar}
                            alt={msg.sender.name}
                            size={32}
                            className="message-avatar"
                          />
                        )}
                        <div className={`message-content ${isOwnMessage ? 'own' : ''}`}>
                          <div className="message-text">{msg.content}</div>
                          <div className="message-time">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {isOwnMessage && (
                              <span className="message-status">
                                {msg.read ? (
                                  <>
                                    <FiCheck size={12} style={{ display: 'inline' }} />
                                    <FiCheck size={12} style={{ display: 'inline', marginLeft: '-6px' }} />
                                  </>
                                ) : (
                                  <FiCheck size={12} />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}

                {typingUser === selectedConversation._id && (
                  <motion.div
                    className="message other typing-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type a message..."
                  className="message-input"
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  className="send-button"
                  disabled={!messageInput.trim() || sendingMessage}
                >
                  <FiSend size={18} />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              className="chat-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FiMessageCircle size={64} />
              <h2>Select a conversation</h2>
              <p>Search for users or select an existing conversation to start messaging</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Messages;
