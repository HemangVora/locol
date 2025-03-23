import { Events } from "discord.js";
import config from "../../config/config.js";
import AIHelper from "../utils/ai-helper.js";
import { getUserScore, answerScoreQuestion } from "../utils/scoreProcessor.js";
import taskAgent from "../commands/task-agent.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize AI helper
const aiHelper = new AIHelper();

// Bot configuration
const PREFIX = process.env.BOT_PREFIX || "!";
const BOT_NAME = process.env.BOT_NAME || "Locol";

// Cache for user score data to avoid excessive API calls
const scoreCache = new Map();
// 30 minutes cache expiration
const CACHE_EXPIRY = 30 * 60 * 1000;

// Keywords for the bot to respond to
const TRIGGER_KEYWORDS = [
  "web3 score",
  "crypto score",
  "my score",
  "profile score",
  "score report",
  "how am i doing",
  "how active am i",
  "improve my score",
  "boost my score",
  "rank higher",
  "raid this cast on farcaster",
];

export default {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    // Ignore messages from bots (including self) to prevent loops
    if (message.author.bot) return;

    // Handle prefix commands (these are handled in index.js, so we don't need to process them here)
    if (message.content.startsWith(config.prefix)) return;
    console.log("messageCreateHandler 1", message);
    // Check if message was processed by task agent
    try {
      const handled = await taskAgent.messageCreateHandler(message);
      if (handled) return; // If task agent handled it, we're done
    } catch (error) {
      console.error("Error in task agent handler:", error);
      // Continue processing even if task agent fails
    }

    // Check if bot is mentioned
    const isMentioned = message.mentions.has(message.client.user.id);

    // Check if we're in an ignored channel
    if (config.ignoredChannels.includes(message.channel.name)) return;

    // Check if we should only respond in specific channels
    if (
      config.activeChannels.length > 0 &&
      !config.activeChannels.includes(message.channel.name)
    )
      return;

    // Check if moderation is active in this channel
    if (message.channel.moderationActive) {
      // Analyze message content for inappropriate content
      const analysis = aiHelper.analyzeText(message.content);

      if (analysis.needsModeration) {
        // Handle based on moderation settings
        switch (config.moderation.action) {
          case "warn":
            message.reply(
              "⚠️ Please be mindful of our community guidelines when posting."
            );
            break;
          case "delete":
            try {
              await message.delete();
              message.author.send(
                "⚠️ Your message was removed because it may not align with our community guidelines."
              );
            } catch (error) {
              console.error("Error deleting message:", error);
            }
            break;
          case "timeout":
            try {
              // Timeout the user for 5 minutes
              await message.member.timeout(
                5 * 60 * 1000,
                "Violated community guidelines"
              );
              message.author.send(
                "⚠️ You have been timed out for 5 minutes due to content that violates our community guidelines."
              );
            } catch (error) {
              console.error("Error timing out user:", error);
              message.reply(
                "⚠️ Please be mindful of our community guidelines when posting."
              );
            }
            break;
        }

        // Log the incident
        console.log(
          `Moderation action taken: ${config.moderation.action} for user ${message.author.tag}`
        );
        return;
      }
    }

    // If the bot is mentioned, always respond
    if (isMentioned) {
      message.channel.sendTyping();

      // Remove the mention from the message
      const content = message.content.replace(/<@!?(\d+)>/g, "").trim();

      try {
        // Generate AI response
        const response = await aiHelper.generateResponse(content, {
          systemPrompt: `You are a helpful assistant for the ${message.guild.name} Discord server. 
                         Be friendly, concise, and helpful.`,
        });

        message.reply(response);
      } catch (error) {
        console.error("Error generating response:", error);
        message.reply(
          "I'm sorry, I couldn't process your request at the moment."
        );
      }

      return;
    }

    // Auto-response for non-mentions
    if (config.autoRespond.enabled) {
      // Check for trigger keywords
      const hasKeyword = config.autoRespond.triggerKeywords.some((keyword) =>
        message.content.toLowerCase().includes(keyword.toLowerCase())
      );

      if (hasKeyword || Math.random() < config.autoRespond.probability) {
        message.channel.sendTyping();

        try {
          // Generate AI response
          const response = await aiHelper.generateResponse(message.content, {
            systemPrompt: `You are a helpful assistant for the ${message.guild.name} Discord server.
                           Be friendly, concise, and helpful. The user did not directly ask you for help,
                           but their message contains keywords that suggest they might need assistance.`,
          });

          message.reply(response);
        } catch (error) {
          console.error("Error generating auto-response:", error);
        }
      }
    }

    // Handle direct command with prefix
    if (message.content.startsWith(PREFIX)) {
      const args = message.content.slice(PREFIX.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      if (command === "score") {
        if (!args[0]) {
          return message.reply(
            "Please provide your Farcaster ID (FID). Example: `!score 123456`"
          );
        }

        const fid = args[0];
        await handleScoreCommand(message, fid);
        return;
      }

      if (command === "ask") {
        if (!args[0]) {
          return message.reply(
            "Please provide your Farcaster ID (FID) and a question. Example: `!ask 123456 what's my web3 score?`"
          );
        }

        const fid = args[0];
        const question = args.slice(1).join(" ");

        if (!question) {
          return message.reply(
            "Please provide a question after your FID. Example: `!ask 123456 what's my web3 score?`"
          );
        }

        await handleAskCommand(message, fid, question);
        return;
      }
    }

    // Check if the message is mentioning the bot or contains trigger keywords
    const hasTriggerKeyword = TRIGGER_KEYWORDS.some((keyword) =>
      message.content.toLowerCase().includes(keyword.toLowerCase())
    );

    // Handle mentions or trigger keywords
    if (hasTriggerKeyword) {
      // Extract the FID from the message
      const fidMatch =
        message.content.match(/\bfid:?\s*(\d+)/i) ||
        message.content.match(/\b(\d{6,})\b/);

      if (!fidMatch) {
        message.reply(
          `I can help you with your Web3 score and profile information. Please provide your Farcaster ID (FID) by saying something like "What's my score? FID: 123456"`
        );
        return;
      }

      const fid = fidMatch[1];

      // If it looks like a direct question, try to answer it
      if (message.content.includes("?")) {
        await handleAskCommand(message, fid, message.content);
      } else {
        // Otherwise, just show the score
        await handleScoreCommand(message, fid);
      }
    }
  },
};

/**
 * Handle score command
 * @param {Object} message - Discord message object
 * @param {string} fid - Farcaster ID
 */
async function handleScoreCommand(message, fid) {
  try {
    // Show typing indicator
    await message.channel.sendTyping();

    const userInfo = {
      fid,
      username: message.author.username,
      displayName: message.member?.displayName || message.author.username,
      pfpUrl: message.author.displayAvatarURL(),
    };

    // Check cache first
    let scoreData;
    if (
      scoreCache.has(fid) &&
      scoreCache.get(fid).timestamp > Date.now() - CACHE_EXPIRY
    ) {
      scoreData = scoreCache.get(fid).data;
    } else {
      scoreData = await getUserScore(userInfo);
      // Cache the result
      scoreCache.set(fid, {
        data: scoreData,
        timestamp: Date.now(),
      });
    }

    const scoreReport =
      require("../utils/scoreProcessor.js").generateScoreReport(scoreData);

    message.reply(
      `**${message.author.username}'s Web3 Score Report**\n\n${scoreReport}`
    );
  } catch (error) {
    console.error("Error in score command:", error);
    message.reply(
      "Sorry, I was unable to fetch your score. Please try again later."
    );
  }
}

/**
 * Handle ask command
 * @param {Object} message - Discord message object
 * @param {string} fid - Farcaster ID
 * @param {string} question - User question
 */
async function handleAskCommand(message, fid, question) {
  try {
    // Show typing indicator
    await message.channel.sendTyping();

    const userInfo = {
      fid,
      username: message.author.username,
      displayName: message.member?.displayName || message.author.username,
      pfpUrl: message.author.displayAvatarURL(),
    };

    // Check cache first
    let scoreData;
    if (
      scoreCache.has(fid) &&
      scoreCache.get(fid).timestamp > Date.now() - CACHE_EXPIRY
    ) {
      scoreData = scoreCache.get(fid).data;
    } else {
      scoreData = await getUserScore(userInfo);
      // Cache the result
      scoreCache.set(fid, {
        data: scoreData,
        timestamp: Date.now(),
      });
    }

    const answer = require("../utils/scoreProcessor.js").answerScoreQuestion(
      question,
      scoreData
    );

    message.reply(answer);
  } catch (error) {
    console.error("Error in ask command:", error);
    message.reply(
      "Sorry, I was unable to answer your question at this time. Please try again later."
    );
  }
}
