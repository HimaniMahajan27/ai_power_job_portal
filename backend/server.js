const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Passport config
require('./config/passport')(passport);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Store connected users
const connectedUsers = new Map(); // userId -> socketId

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Session middleware (required for passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/cover-letter', require('./routes/coverLetter'));
app.use('/api/experiences', require('./routes/experiences'));
app.use('/api/practice-test', require('./routes/practiceTest'));

// Health check
app.get('/api', (req, res) => {
  res.json({ 
    message: '🚀 Job Portal API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      jobs: '/api/jobs',
      applications: '/api/applications',
      messages: '/api/messages'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins - register their socket ID
  socket.on('user:join', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
    
    // Notify all clients that this user is online
    io.emit('user:online', { userId, socketId: socket.id });
  });

  // Listen for messages
  socket.on('message:send', async (data) => {
    try {
      const { senderId, receiverId, content } = data;
      
      console.log(`Message from ${senderId} to ${receiverId}:`, content);
      
      // Save message to database
      const Message = require('./models/Message');
      const User = require('./models/User');
      
      let message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        subject: 'Direct Message',
        content: content,
        threadId: `${senderId}_${receiverId}`,
        read: false
      });

      // Populate sender and receiver
      message = await message.populate(['sender', 'receiver']);

      const messageData = {
        _id: message._id,
        sender: message.sender,
        receiver: message.receiver,
        content: message.content,
        createdAt: message.createdAt,
        read: message.read
      };

      // Send message to receiver if they're online
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        console.log(`Sending message to receiver on socket ${receiverSocketId}`);
        io.to(receiverSocketId).emit('message:receive', messageData);
      } else {
        console.log(`Receiver ${receiverId} is not online`);
      }

      // Confirm to sender
      console.log(`Confirming message sent to sender ${senderId}`);
      socket.emit('message:sent', messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message', details: error.message });
    }
  });

  // Mark message as read
  socket.on('message:read', async (messageId) => {
    try {
      const Message = require('./models/Message');
      await Message.findByIdAndUpdate(messageId, { 
        read: true, 
        readAt: new Date() 
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  // User typing indicator
  socket.on('user:typing', (data) => {
    const { senderId, receiverId } = data;
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user:typing', { userId: senderId });
    }
  });

  // User disconnects
  socket.on('disconnect', () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        io.emit('user:offline', { userId });
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🌟 Job Portal Server Running 🌟   ║
  ╠══════════════════════════════════════╣
  ║  Port: ${PORT}                          ║
  ║  Environment: ${process.env.NODE_ENV || 'development'}          ║
  ║  Database: Connected ✅              ║
  ║  WebSocket: Ready ✅                 ║
  ╚══════════════════════════════════════╝
  `);
});
