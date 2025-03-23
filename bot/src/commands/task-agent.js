import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import config from "../../config/config.js";
import AIHelper from "../utils/ai-helper.js";
import fetch from "node-fetch";

// Initialize AI helper for task processing
const aiHelper = new AIHelper();

// Regex patterns for task detection
const FARCASTER_RAID_PATTERN =
  /raid\s+this\s+cast\s+on\s+farcaster\s+(?<link>https?:\/\/[^\s]+)/i;
const FARCASTER_LIKE_PATTERN =
  /(?:like|heart|favorite)\s+this\s+(?:cast|post)\s+(?:on\s+farcaster\s+)?(?<link>https?:\/\/[^\s]+)/i;
const TRANSACTION_PATTERN =
  /(?:transact|submit|send).*?\$(?<amount>\d+(?:\.\d+)?)/i;

export default {
  data: {
    name: "task-agent",
    description:
      "AI agent to handle community tasks like Farcaster raids and on-chain transactions",
  },
  async execute(message, args) {
    // This will be called explicitly with !task-agent command,
    // but the main functionality is in the messageCreateHandler
    console.log("task-agent command executed");
    await this.messageCreateHandler(message);
  },

  /**
   * Message event handler for detecting and processing tasks
   * This should be registered in messageCreate.js event
   */
  async messageCreateHandler(message) {
    // Skip messages from bots
    if (message.author.bot) return false;

    // Check if we're in the tasks channel
    if (!isTaskChannel(message.channel)) return false;

    const content = message.content.trim();

    // Check for Farcaster like request (simpler than raid)
    const likeMatch = content.match(FARCASTER_LIKE_PATTERN);
    if (likeMatch) {
      // Process the like request without responding in the task channel
      await processFarcasterLike(message, likeMatch.groups.link);
      return true;
    }

    // Check for Farcaster raid request
    const farcasterMatch = content.match(FARCASTER_RAID_PATTERN);
    if (farcasterMatch) {
      // Process the raid request without responding in the task channel
      await processFarcasterRaid(message, farcasterMatch.groups.link);
      return true;
    }

    // Check for transaction task
    const transactionMatch = content.match(TRANSACTION_PATTERN);
    if (transactionMatch) {
      // Process the transaction without responding in the task channel
      await processTransaction(message, transactionMatch.groups.amount);
      return true;
    }

    return false;
  },
};

/**
 * Check if the channel is designated for tasks
 * @param {object} channel - Discord channel object
 * @returns {boolean} - Whether this is a task channel
 */
function isTaskChannel(channel) {
  // Check if the channel name contains "task" or is in the config list
  return (
    channel.name.includes("task") ||
    (config.taskChannels && config.taskChannels.includes(channel.name))
  );
}

/**
 * Get the results channel where responses should be sent
 * @param {object} guild - Discord guild object
 * @returns {object} - Discord channel object or null if not found
 */
async function getResultsChannel(guild) {
  // Check if dedicated results channel exists
  const resultsChannelName = config.taskResultsChannel || "task-results";
  let resultsChannel = guild.channels.cache.find(
    (channel) => channel.name === resultsChannelName
  );

  // If results channel doesn't exist and we have permission, create it
  if (!resultsChannel) {
    try {
      // Try to find a general or bot category to put it in
      const category = guild.channels.cache.find(
        (channel) =>
          channel.type === 4 && // CategoryChannel type is 4
          (channel.name.toLowerCase().includes("bot") ||
            channel.name.toLowerCase().includes("general"))
      );

      // Create the results channel
      resultsChannel = await guild.channels.create({
        name: resultsChannelName,
        type: 0, // TextChannel type is 0
        parent: category ? category.id : null,
        topic: "Results of community tasks processed by the bot",
      });

      console.log(`Created new task results channel: ${resultsChannelName}`);
    } catch (error) {
      console.error("Failed to create task results channel:", error);

      // Fall back to general channel if we can't create one
      resultsChannel = guild.channels.cache.find(
        (channel) =>
          channel.type === 0 && // TextChannel type is 0
          (channel.name === "general" || channel.name === "bot-commands")
      );
    }
  }

  return resultsChannel;
}

/**
 * Process a Farcaster raid request without responding in the task channel
 * @param {object} message - Discord message object
 * @param {string} link - Farcaster cast link
 */
async function processFarcasterRaid(message, link) {
  try {
    // Find the channel to post results in
    const resultsChannel = await getResultsChannel(message.guild);

    if (!resultsChannel) {
      // If we can't find a results channel, DM the user instead
      await message.author.send(
        "⚠️ I couldn't find a channel to post task results in. Please ask an admin to create a #task-results channel."
      );
      return;
    }

    // Validate the Farcaster link
    if (!isValidFarcasterLink(link)) {
      // DM the user with an error instead of posting in the channel
      await message.author.send(
        "❌ Invalid Farcaster link. Please provide a valid cast URL."
      );
      return;
    }

    // Generate AI prompt about what to do with the cast
    const prompt = `
I received a request to raid this Farcaster cast: ${link}
What should I suggest community members do with this cast? (like, recast, comment ideas)
Provide 3 specific suggestions based on the typical actions for a "raid".
Keep responses concise and actionable.
`;

    // Generate AI response with custom system prompt
    const aiResponse = await aiHelper.generateResponse(prompt, {
      systemPrompt:
        "You are a Web3 community coordinator who helps organize raids on Farcaster casts. A 'raid' means getting many community members to interact with a post. Be specific and actionable.",
      maxTokens: 300,
    });

    // Create embed for the raid instructions
    const raidEmbed = new EmbedBuilder()
      .setColor("#7645D9")
      .setTitle("🚀 Farcaster Raid Mission")
      .setDescription(`Let's raid this cast together: ${link}`)
      .addFields(
        {
          name: "Mission Instructions",
          value:
            aiResponse ||
            "Interact with the cast by liking, recasting, and leaving positive comments!",
        },
        {
          name: "Started By",
          value: `<@${message.author.id}>`,
          inline: true,
        },
        {
          name: "Status",
          value: "✅ Active",
          inline: true,
        }
      )
      .setFooter({
        text: `React with 👍 if you've completed the raid!`,
      });

    // Send to results channel, not the original task channel
    const responseMsg = await resultsChannel.send({
      content: `<@${message.author.id}>, your Farcaster raid task has been processed:`,
      embeds: [raidEmbed],
    });

    // Add a reaction for users to indicate completion
    await responseMsg.react("👍");

    // Let the user know in a DM that the task was processed
    try {
      await message.author.send({
        content: `Your Farcaster raid request has been processed and posted in the <#${resultsChannel.id}> channel!`,
      });
    } catch (error) {
      console.warn("Could not send DM to user:", error);
      // We don't respond in the task channel, so there's nothing more we can do
    }
  } catch (error) {
    console.error("Error handling Farcaster raid:", error);
    // DM the user with an error instead of posting in the channel
    try {
      await message.author.send(
        "Sorry, I encountered an error processing your Farcaster raid request."
      );
    } catch (dmError) {
      console.error("Could not send DM with error message:", dmError);
    }
  }
}

/**
 * Process a transaction task without responding in the task channel
 * @param {object} message - Discord message object
 * @param {string} amount - Transaction amount
 */
async function processTransaction(message, amount) {
  try {
    // Find the channel to post results in
    const resultsChannel = await getResultsChannel(message.guild);

    if (!resultsChannel) {
      // If we can't find a results channel, DM the user instead
      await message.author.send(
        "⚠️ I couldn't find a channel to post task results in. Please ask an admin to create a #task-results channel."
      );
      return;
    }

    // Create embedded instructions
    const transactionEmbed = new EmbedBuilder()
      .setColor("#F9A826")
      .setTitle(`💸 Transaction Task: $${amount}`)
      .setDescription("Follow these steps to complete the transaction:")
      .addFields(
        {
          name: "Step 1",
          value:
            "Connect your wallet using `!connect-wallet` if you haven't already",
        },
        {
          name: "Step 2",
          value: `Send $${amount} to the designated address (check your DMs for details)`,
        },
        {
          name: "Step 3",
          value:
            "Reply to this message with your transaction hash to verify completion",
        },
        {
          name: "Initiated By",
          value: `<@${message.author.id}>`,
          inline: true,
        },
        {
          name: "Status",
          value: "⏳ Pending",
          inline: true,
        }
      )
      .setFooter({
        text: "Transaction verification may take a few minutes",
      });

    // Send to results channel, not the original task channel
    const responseMsg = await resultsChannel.send({
      content: `<@${message.author.id}>, your transaction task has been processed:`,
      embeds: [transactionEmbed],
    });

    // Send DM with more detailed instructions
    try {
      await message.author.send({
        content: `Here are the detailed instructions for your $${amount} transaction task:
        
1. This is a simulated task for demonstration purposes
2. In a real implementation, we would provide the payment address and verification method
3. Stay tuned for more features as we develop the task system

Your transaction task has been posted in the <#${resultsChannel.id}> channel!`,
      });
    } catch (error) {
      console.warn("Could not send DM to user:", error);
      // Add a note to the public response in the results channel
      await responseMsg.edit({
        content: `<@${message.author.id}>, your transaction task has been processed. ⚠️ I couldn't send you a DM with detailed instructions. Please make sure your DMs are open.`,
        embeds: [transactionEmbed],
      });
    }
  } catch (error) {
    console.error("Error handling transaction task:", error);
    // DM the user with an error instead of posting in the channel
    try {
      await message.author.send(
        "Sorry, I encountered an error processing your transaction task."
      );
    } catch (dmError) {
      console.error("Could not send DM with error message:", dmError);
    }
  }
}

/**
 * Validate a Farcaster link
 * @param {string} link - Farcaster cast link
 * @returns {boolean} - Whether the link is valid
 */
function isValidFarcasterLink(link) {
  // Basic validation - check if it's from a known Farcaster domain
  return (
    link.includes("warpcast.com") ||
    link.includes("farcaster.xyz") ||
    link.startsWith("https://fc.xyz/") ||
    link.includes("fcast.me")
  );
}

/**
 * Process a simple Farcaster like request without responding in the task channel
 * @param {object} message - Discord message object
 * @param {string} link - Farcaster cast link
 */
async function processFarcasterLike(message, link) {
  try {
    // Find the channel to post results in
    const resultsChannel = await getResultsChannel(message.guild);

    if (!resultsChannel) {
      // If we can't find a results channel, DM the user instead
      await message.author.send(
        "⚠️ I couldn't find a channel to post task results in. Please ask an admin to create a #task-results channel."
      );
      return;
    }

    // Simulate interacting with Farcaster API
    // In a real implementation, you would use the Farcaster API to like the cast
    const castId = extractCastId(link);
    const likeStatus = simulateFarcasterLike(castId);

    // Create embed for the like confirmation
    const likeEmbed = new EmbedBuilder()
      .setColor("#36A2EB")
      .setTitle("💙 Farcaster Cast Liked")
      .setDescription(`Cast has been liked: ${link}`)
      .addFields(
        {
          name: "Cast ID",
          value: castId || "Unknown",
          inline: true,
        },
        {
          name: "Status",
          value: likeStatus.success ? "✅ Successfully Liked" : "❌ Failed",
          inline: true,
        },
        {
          name: "Requested By",
          value: `<@${message.author.id}>`,
          inline: true,
        }
      )
      .setFooter({
        text: `Processed on ${new Date().toLocaleString()}`,
      });

    // Send to results channel, not the original task channel
    const responseMsg = await resultsChannel.send({
      content: `<@${message.author.id}>, your Farcaster like request has been processed:`,
      embeds: [likeEmbed],
    });

    // Let the user know in a DM that the task was processed
    try {
      await message.author.send({
        content: `Your request to like the Farcaster cast has been processed.
        
Status: ${likeStatus.success ? "✅ Successfully liked" : "❌ Failed"}
Message: ${likeStatus.message}

A confirmation has been posted in the <#${resultsChannel.id}> channel.`,
      });
    } catch (error) {
      console.warn("Could not send DM to user:", error);
      // We don't respond in the task channel, so there's nothing more we can do
    }
  } catch (error) {
    console.error("Error handling Farcaster like:", error);
    // DM the user with an error instead of posting in the channel
    try {
      await message.author.send(
        "Sorry, I encountered an error processing your Farcaster like request."
      );
    } catch (dmError) {
      console.error("Could not send DM with error message:", dmError);
    }
  }
}

/**
 * Extract a cast ID from a Farcaster cast URL
 * @param {string} url - Farcaster cast URL
 * @returns {string} - Cast ID or 'Unknown'
 */
function extractCastId(url) {
  try {
    // Handle different Farcaster URL formats
    if (url.includes("warpcast.com")) {
      // Format: https://warpcast.com/username/0123456789
      const parts = url.split("/");
      return parts[parts.length - 1] || "Unknown";
    } else if (url.includes("fcast.me")) {
      // Format: https://fcast.me/c/0123456789
      const parts = url.split("/c/");
      return parts[parts.length - 1] || "Unknown";
    } else if (url.startsWith("https://fc.xyz/")) {
      // Format: https://fc.xyz/0123456789
      const parts = url.split("/");
      return parts[parts.length - 1] || "Unknown";
    }
    return "Unknown";
  } catch (error) {
    console.error("Error extracting cast ID:", error);
    return "Unknown";
  }
}

/**
 * Simulate liking a Farcaster cast
 * In a real implementation, this would call the Farcaster API
 * @param {string} castId - Farcaster cast ID
 * @returns {object} - Success status and message
 */
function simulateFarcasterLike(castId) {
  // This is a simulation - in a real implementation you would:
  // 1. Use proper authentication with the Farcaster API
  // 2. Make an API call to like the cast
  // 3. Return the actual result

  const success = Math.random() > 0.1; // 90% success rate for simulation

  return {
    success,
    message: success
      ? `Successfully liked cast ${castId}`
      : `Unable to like cast ${castId} - this is a simulation`,
  };
}
