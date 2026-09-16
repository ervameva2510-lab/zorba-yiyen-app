require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zorba-yiyen', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/admin', require('./routes/admin'));

// Socket.io - Real-time Messaging
io.on('connection', (socket) => {
  console.log('🟢 User Connected:', socket.id);

  // Join room for messaging
  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`${userId} joined their room`);
  });

  // Send message
  socket.on('sendMessage', (data) => {
    io.to(data.recipientId).emit('receiveMessage', data);
  });

  // Join group room
  socket.on('joinGroup', (groupId) => {
    socket.join(`group-${groupId}`);
    console.log(`Joined group: ${groupId}`);
  });

  // Send group message
  socket.on('groupMessage', (data) => {
    io.to(`group-${data.groupId}`).emit('groupMessageReceived', data);
  });

  // SOS Alert
  socket.on('sosAlert', (data) => {
    io.to(`location-${data.location}`).emit('sosAlertReceived', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 User Disconnected:', socket.id);
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
