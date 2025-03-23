# Locol AI Bot

A Discord bot that acts as an AI agent to provide Web3 scores and answer questions about user profiles.

## Features

- Calculate and display user Web3 scores
- Provide detailed reports on user activity metrics
- Answer questions about user profiles using AI
- Integrate with the Locol web application's API

## Commands

### Slash Commands

- `/score [fid]` - Calculate and display your Web3 score using your Farcaster ID (FID)
- `/ask [fid] [question]` - Ask questions about your Web3 profile

### Text Commands

- `!score [fid]` - Calculate and display your Web3 score
- `!ask [fid] [question]` - Ask questions about your Web3 profile

### Natural Language Interaction

The bot also responds to natural language queries that contain trigger keywords like "web3 score" or "my score" if they include a Farcaster ID (FID) in the message.

Examples:

- "What's my web3 score? FID: 123456"
- "How can I improve my score? My FID is 123456"
- "Tell me about my profile 123456"

## Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your Discord bot token and other required variables
4. Start the bot: `npm start`

## Docker Setup

See [DOCKER.md](DOCKER.md) for instructions on how to run the bot using Docker.

## Environment Variables

- `DISCORD_BOT_TOKEN` - Your Discord bot token
- `API_URL` - URL to the Locol API for score calculations (default: http://localhost:3000)
- `BOT_PREFIX` - Command prefix for text commands (default: !)
- `BOT_NAME` - Name of the bot (default: Locol)

## Integration with Locol Web Application

The bot communicates with the Locol web application API to fetch user scores and activity data. Make sure the API is accessible from the bot's environment.

## License

MIT
