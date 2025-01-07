-- Drop tables if they exist (useful for development)
DROP TABLE IF EXISTS direct_messages;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS user_channel;
DROP TABLE IF EXISTS channels;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    user_id VARCHAR PRIMARY KEY, -- Firebase UID
    email VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    role VARCHAR DEFAULT 'user',
    status VARCHAR DEFAULT 'offline',
    profile_picture VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Channels table
CREATE TABLE channels (
    channel_id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User-Channel junction table
CREATE TABLE user_channel (
    user_id VARCHAR REFERENCES users(user_id) ON DELETE CASCADE,
    channel_id INTEGER REFERENCES channels(channel_id) ON DELETE CASCADE,
    role VARCHAR DEFAULT 'member',
    PRIMARY KEY (user_id, channel_id)
);

-- Messages table
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    user_id VARCHAR REFERENCES users(user_id) ON DELETE CASCADE,
    channel_id INTEGER REFERENCES channels(channel_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Direct Messages table
CREATE TABLE direct_messages (
    message_id SERIAL PRIMARY KEY,
    sender_id VARCHAR REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id VARCHAR REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_messages_channel_id ON messages(channel_id);
CREATE INDEX idx_direct_messages_sender_id ON direct_messages(sender_id);
CREATE INDEX idx_direct_messages_receiver_id ON direct_messages(receiver_id); 