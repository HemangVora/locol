# Locol AI Bot - Docker Setup

This guide explains how to build and run the Locol AI Bot using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system
- A Discord bot token

## Setup

1. Make sure you have a valid `.env` file with the following variables:

```
# Discord Bot Token
DISCORD_BOT_TOKEN=your_discord_bot_token_here

# MongoDB Credentials
MONGO_USERNAME=your_mongo_username
MONGO_PASSWORD=your_mongo_password
MONGODB_URI=mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@mongo:27017/locol?authSource=admin

# API Configuration
API_PORT=3001
API_URL=http://localhost:3001
```

2. Build and start the services using Docker Compose:

```bash
docker-compose up -d
```

This will:

- Build the bot Docker image
- Start the MongoDB container
- Start the bot container connected to the MongoDB container

3. To view logs:

```bash
docker-compose logs -f
```

4. To stop the services:

```bash
docker-compose down
```

## Customization

You can modify the `docker-compose.yml` file to adjust the configuration according to your needs. For example, you can:

- Change the exposed ports
- Add more environment variables
- Configure volume mounts

## Troubleshooting

- If the bot fails to connect to MongoDB, make sure the MongoDB container is running and the connection string is correct.
- If the bot fails to start, check the logs for error messages.
- Make sure your Discord bot token is valid and has the necessary permissions.

## Advanced Configuration

To expose the bot's API to the internet, you can use a reverse proxy like Nginx. Make sure to set up proper security measures like HTTPS and rate limiting.

```nginx
server {
    listen 80;
    server_name your-bot-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
