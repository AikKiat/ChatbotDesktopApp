# Redis Setup for ChatbotDesktopApp

## Installation

### Windows:
1. Download Redis from: https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`
3. Or use WSL2: `sudo apt-get install redis-server && redis-server`

### macOS:
```bash
brew install redis
brew services start redis
```

### Linux:
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

## Configuration for LRU Eviction

Edit `redis.conf`:

```conf
# Set max memory (e.g., 256MB for chat cache)
maxmemory 256mb

# Use LRU eviction policy (evict least recently used keys)
maxmemory-policy allkeys-lru
```

Restart Redis after changes:
```bash
redis-server /path/to/redis.conf
```

## Verify Installation

```bash
redis-cli ping
# Should return: PONG
```

## Project Dependencies

Install Redis client:
```bash
cd backend
npm install redis
```

## Cache Behavior

- **Storage**: Last 100 messages per chat
- **TTL**: 24 hours (auto-refresh on access)
- **Eviction**: Least Recently Used (LRU) chats evicted when memory full
- **Fallback**: If Redis is unavailable, app continues using PostgreSQL only

## Testing Cache

```bash
# Connect to Redis CLI
redis-cli

# View all chat keys
KEYS chat:*:messages

# View messages for chat ID 1
LRANGE chat:1:messages 0 -1

# Check TTL
TTL chat:1:messages

# Clear all cache
FLUSHALL
```
