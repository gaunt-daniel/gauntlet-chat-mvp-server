const admin = require('../config/firebase');
const db = require('../db');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Try to find or create user
    try {
      const result = await db.query(
        'INSERT INTO users (user_id, name, email) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO NOTHING RETURNING *',
        [decodedToken.uid, decodedToken.name || 'Anonymous', decodedToken.email]
      );
      console.log('User record:', result.rows[0]);
    } catch (dbError) {
      console.error('Error ensuring user exists:', dbError);
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authenticateToken; 