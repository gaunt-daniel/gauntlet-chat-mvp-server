const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./db');
const messagesRouter = require('./routes/messages');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

// Update CORS to use correct port
app.use(cors({
  origin: 'http://localhost:5173'
}));

// Add this line to parse JSON bodies
app.use(express.json());

// Create Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173'
  }
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test successful' });
});

app.use('/api/messages', messagesRouter);
app.set('io', io);

// Socket.io connection handler with more logging
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_channel', (channelId) => {
    const room = `channel_${channelId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined ${room}`);
    
    // Log all rooms this socket is in
    console.log('Socket rooms:', [...socket.rooms]);
  });

  socket.on('leave_channel', (channelId) => {
    const room = `channel_${channelId}`;
    socket.leave(room);
    console.log(`Socket ${socket.id} left ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 