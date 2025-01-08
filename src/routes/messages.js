const express = require('express');
const router = express.Router();
const db = require('../db');

// Get messages for a channel
router.get('/channel/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    console.log('Attempting to get messages for channel:', channelId);
    
    const result = await db.query(
      `SELECT messages.*, users.name as user_name 
       FROM messages 
       LEFT JOIN users ON messages.user_id = users.user_id 
       WHERE channel_id = $1 
       ORDER BY created_at ASC`,
      [channelId]
    );
    console.log('Query result:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Detailed error in GET /channel/:channelId:', {
      message: error.message,
      stack: error.stack,
      code: error.code  // PostgreSQL error code
    });
    res.status(500).json({ 
      error: 'Failed to get messages',
      details: error.message
    });
  }
});

// Send a message to a channel
router.post('/channel/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { content, userId } = req.body;
    
    console.log('Attempting to create message:', {
      channelId,
      content,
      userId
    });

    // First verify the channel exists
    const channelCheck = await db.query(
      'SELECT * FROM channels WHERE channel_id = $1',
      [channelId]
    );
    if (channelCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Then verify the user exists
    const userCheck = await db.query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const result = await db.query(
      `INSERT INTO messages (channel_id, user_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [channelId, userId, content]
    );
    
    console.log('Successfully created message:', result.rows[0]);
    
    // Emit the new message to all connected clients in this channel
    req.app.get('io').to(`channel_${channelId}`).emit('new_message', result.rows[0]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Detailed error in POST /channel/:channelId:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error.message
    });
  }
});

module.exports = router; 