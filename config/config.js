// Bot configuration
export default {
  // Command prefix
  prefix: process.env.PREFIX || "!",

  // Log level (debug, info, warn, error)
  logLevel: process.env.LOG_LEVEL || "info",

  // Cooldown for commands (in seconds)
  commandCooldown: 3,

  // Channels where the bot should be active (empty array means all channels)
  activeChannels: [],

  // Channels to ignore (bot won't respond in these channels)
  ignoredChannels: [],

  // Roles that can use admin commands
  adminRoles: ["Admin", "Moderator"],

  // Auto-response settings
  autoRespond: {
    enabled: true,
    // Probability (0-1) that the bot will respond to a message without being mentioned
    probability: 0.1,
    // Keywords that trigger responses
    triggerKeywords: ["help", "question", "how to", "what is"],
    // Cooldown between auto-responses (in seconds)
    cooldown: 60,
  },

  // Moderation settings
  moderation: {
    enabled: true,
    // Words or phrases to flag as inappropriate
    flaggedContent: [
      // Add inappropriate words/phrases here
    ],
    // Action to take when inappropriate content is detected ('warn', 'delete', 'timeout')
    action: "warn",
  },

  // Welcome message settings
  welcome: {
    enabled: true,
    // Channel to send welcome messages
    channel: "welcome",
    // Message to send when a new user joins
    message: "Welcome to the server, {user}! Feel free to introduce yourself.",
  },

  // FAQ settings
  faq: {
    // Topic-answer pairs for common questions
    topics: {
      rules:
        "Here are our community rules: 1) Be respectful 2) No spam 3) Use appropriate channels",
      roles:
        "Roles are assigned based on your activity and contributions to the community.",
      help: "For help, please ask in the #help channel or use the !help command.",
    },
  },
};
