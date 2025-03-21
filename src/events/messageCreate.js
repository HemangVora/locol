import { Events } from "discord.js";
import config from "../../config/config.js";
import AIHelper from "../utils/ai-helper.js";

// Initialize AI helper
const aiHelper = new AIHelper();

export default {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    // Ignore messages from bots (including self) to prevent loops
    if (message.author.bot) return;

    // Handle prefix commands (these are handled in index.js, so we don't need to process them here)
    if (message.content.startsWith(config.prefix)) return;

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
  },
};
