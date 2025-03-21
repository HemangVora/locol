# Discord Community AI Manager

An AI-powered Discord bot that helps with community management by monitoring chat, answering questions, and performing moderation tasks.

## Features

- Listens to messages and provides helpful responses
- Moderates inappropriate content
- Answers community FAQs
- Summarizes discussions
- Generates reports on community activity
- Helps onboard new members
- Custom commands for community management

## Setup

### Prerequisites

- Node.js 16.x or higher
- A Discord Bot Token (see [Discord Developer Portal](https://discord.com/developers/applications))
- Discord.js v14 (installed via npm)

### Installation

1. Clone this repository

```bash
git clone https://github.com/yourusername/discord-community-ai.git
cd discord-community-ai
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

Then edit the `.env` file and fill in your Discord Bot Token and other required values.

4. Start the bot

```bash
npm start
```

### Adding the Bot to Your Server

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application and go to the "OAuth2" tab
3. Under "OAuth2 URL Generator", select the following scopes:
   - bot
   - applications.commands
4. Select the required bot permissions:
   - Read Messages/View Channels
   - Send Messages
   - Manage Messages
   - Embed Links
   - Attach Files
   - Read Message History
   - Use Slash Commands
5. Copy the generated URL and open it in your browser to add the bot to your server

## Usage

### Commands

- `!help` - Shows available commands
- `!faq [topic]` - Answer common questions
- `!moderate` - Activate moderation mode
- `!summary` - Summarize recent discussions
- `!report` - Generate community activity report
- `!welcome` - Post welcome message for new members

## License

MIT
