import { EmbedBuilder } from "discord.js";
import AIHelper from "../utils/ai-helper.js";

export default {
  data: {
    name: "summary",
    description: "Summarize recent discussions in the channel",
  },
  async execute(message, args) {
    // Respond with initial message
    const responseMsg = await message.channel.send(
      "Working on a summary of recent discussions..."
    );

    try {
      // Initialize AI helper
      const aiHelper = new AIHelper();

      // Fetch recent messages (up to 50)
      const messageCount = args[0] ? parseInt(args[0]) : 50;
      const messages = await message.channel.messages.fetch({
        limit: Math.min(Math.max(messageCount, 10), 100), // Between 10 and 100 messages
        before: message.id, // Don't include the command message
      });

      // Skip if not enough messages
      if (messages.size < 5) {
        return responseMsg.edit(
          "Not enough recent messages to create a meaningful summary."
        );
      }

      // Format messages for summary
      const formattedMessages = messages
        .filter((msg) => !msg.author.bot) // Filter out bot messages
        .map((msg) => ({
          author: msg.author.username,
          content: msg.content,
          timestamp: msg.createdAt,
        }))
        .sort((a, b) => a.timestamp - b.timestamp); // Oldest first

      if (formattedMessages.length < 5) {
        return responseMsg.edit(
          "Not enough non-bot messages to create a meaningful summary."
        );
      }

      // Generate summary
      const summary = await aiHelper.summarizeConversation(formattedMessages);

      // Create an embed with the summary
      const summaryEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("📝 Conversation Summary")
        .setDescription(summary)
        .addFields(
          {
            name: "Time Period",
            value: `Last ${formattedMessages.length} messages`,
          },
          { name: "Generated", value: new Date().toLocaleString() }
        )
        .setFooter({
          text: "This summary was generated using AI and may not be perfect.",
        });

      // Update response with the summary embed
      await responseMsg.edit({ content: null, embeds: [summaryEmbed] });
    } catch (error) {
      console.error("Error generating summary:", error);
      responseMsg.edit(
        "Sorry, I encountered an error while generating the summary. Please try again later."
      );
    }
  },
};
