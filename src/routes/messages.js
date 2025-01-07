const express = require('express');
const router = express.Router();
const db = require('../db');

// Get messages for a channel
router.get('/channel/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const result = await db.query(
      `SELECT messages.*, users.name as user_name 
       FROM messages 
       LEFT JOIN users ON messages.user_id = users.user_id 
       WHERE channel_id = $1 
       ORDER BY created_at ASC`,
      [channelId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send a message to a channel
router.post('/channel/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { content, userId } = req.body;
    
    const result = await db.query(
      `INSERT INTO messages (channel_id, user_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [channelId, userId, content]
    );
    
    // Emit the new message to all connected clients in this channel
    req.app.get('io').to(`channel_${channelId}`).emit('new_message', result.rows[0]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router; 