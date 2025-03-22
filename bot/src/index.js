import { Client, GatewayIntentBits, Events, Collection } from "discord.js";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import botConfig from "../config/config.js";

// Load environment variables
config();

// Directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Command collection
client.commands = new Collection();
client.cooldowns = new Collection();

// Load command handlers
const loadCommands = async () => {
  try {
    const commandsPath = path.join(__dirname, "commands");

    // Create commands directory if it doesn't exist
    if (!fs.existsSync(commandsPath)) {
      fs.mkdirSync(commandsPath, { recursive: true });
      console.log("Created commands directory.");
    }

    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const { default: command } = await import(`file://${filePath}`);

      // Set a new item in the Collection with the command name as the key
      // and the exported module as the value
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        console.log(`Loaded command: ${command.data.name}`);
      } else {
        console.warn(`Command at ${filePath} is missing required properties.`);
      }
    }
  } catch (error) {
    console.error(`Error loading commands: ${error.message}`);
  }
};

// Load event handlers
const loadEvents = async () => {
  try {
    const eventsPath = path.join(__dirname, "events");

    // Create events directory if it doesn't exist
    if (!fs.existsSync(eventsPath)) {
      fs.mkdirSync(eventsPath, { recursive: true });
      console.log("Created events directory.");
    }

    const eventFiles = fs
      .readdirSync(eventsPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of eventFiles) {
      const filePath = path.join(eventsPath, file);
      const { default: event } = await import(`file://${filePath}`);

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }

      console.log(`Loaded event: ${event.name}`);
    }
  } catch (error) {
    console.error(`Error loading events: ${error.message}`);
  }
};

// Initial bot setup
const setupBot = async () => {
  console.log("Starting Discord Community AI Manager...");

  // Load commands and events
  await loadCommands();
  await loadEvents();

  // Create basic event handlers if none exist
  setupDefaultEvents();

  // Login to Discord with the bot token
  client.login(process.env.DISCORD_BOT_TOKEN).catch((error) => {
    console.error("Failed to login to Discord:", error);
    process.exit(1);
  });
};

// Setup default event handlers if none exist
const setupDefaultEvents = () => {
  // Ready event
  if (!client.listeners(Events.ClientReady).length) {
    client.once(Events.ClientReady, (c) => {
      console.log(`Ready! Logged in as ${c.user.tag}`);
    });
  }

  // Message event (for prefix commands)
  if (!client.listeners(Events.MessageCreate).length) {
    client.on(Events.MessageCreate, (message) => {
      // Ignore messages from bots or without the prefix
      if (message.author.bot) return;
      if (!message.content.startsWith(botConfig.prefix)) {
        // Check if we should auto-respond
        handleAutoResponse(message);
        return;
      }

      // Extract command and arguments
      const args = message.content
        .slice(botConfig.prefix.length)
        .trim()
        .split(/ +/);
      const commandName = args.shift().toLowerCase();

      // Execute command if it exists
      const command = client.commands.get(commandName);
      if (!command) return;

      try {
        command.execute(message, args);
      } catch (error) {
        console.error(error);
        message.reply("There was an error trying to execute that command!");
      }
    });
  }

  // New member event
  if (
    !client.listeners(Events.GuildMemberAdd).length &&
    botConfig.welcome.enabled
  ) {
    client.on(Events.GuildMemberAdd, (member) => {
      const welcomeChannel = member.guild.channels.cache.find(
        (channel) => channel.name === botConfig.welcome.channel
      );

      if (welcomeChannel) {
        welcomeChannel.send(
          botConfig.welcome.message.replace("{user}", `<@${member.id}>`)
        );
      }
    });
  }
};

// Auto-response logic
const handleAutoResponse = (message) => {
  if (!botConfig.autoRespond.enabled) return;

  // Check if we're in an ignored channel
  if (botConfig.ignoredChannels.includes(message.channel.name)) return;

  // Check if we should only respond in specific channels
  if (
    botConfig.activeChannels.length > 0 &&
    !botConfig.activeChannels.includes(message.channel.name)
  )
    return;

  // Check for trigger keywords
  const hasKeyword = botConfig.autoRespond.triggerKeywords.some((keyword) =>
    message.content.toLowerCase().includes(keyword.toLowerCase())
  );

  if (hasKeyword || Math.random() < botConfig.autoRespond.probability) {
    // We would integrate with an AI API here
    // For now, just send a basic response
    message.channel.send(
      `Hello ${message.author}, I noticed you might need help. I'm an AI assistant for this community. What can I do for you?`
    );
  }
};

// Start the bot
setupBot();
