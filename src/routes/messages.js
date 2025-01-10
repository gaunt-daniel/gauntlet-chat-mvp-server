const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

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
router.post('/channel/:channelId', authenticateToken, async (req, res) => {
  try {
    console.log('Creating message:', {
      channelId: req.params.channelId,
      userId: req.user.uid,
      content: req.body.content
    });

    const result = await db.query(
      'INSERT INTO messages (channel_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [req.params.channelId, req.user.uid, req.body.content]
    );

    console.log('Created message:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 