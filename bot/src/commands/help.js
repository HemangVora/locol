import { EmbedBuilder } from "discord.js";
import config from "../../config/config.js";

export default {
  data: {
    name: "help",
    description: "List all available commands and information about the bot",
  },
  execute(message, args) {
    const { prefix } = config;

    // Create an embed with the bot information
    const helpEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Community AI Assistant")
      .setDescription(
        "I am an AI assistant that helps manage this community. Here are the commands you can use:"
      )
      .addFields(
        { name: `${prefix}help`, value: "Shows this help message" },
        {
          name: `${prefix}faq [topic]`,
          value:
            "Answer frequently asked questions. Available topics: rules, roles, help",
        },
        {
          name: `${prefix}moderate`,
          value: "Activate moderation mode (Admin/Mod only)",
        },
        {
          name: `${prefix}summary`,
          value: "Summarize recent discussions in the channel",
        },
        {
          name: `${prefix}report`,
          value: "Generate a community activity report (Admin/Mod only)",
        },
        { name: `${prefix}welcome`, value: "Post the welcome message" }
      )
      .setFooter({
        text: 'You can also just chat with me by mentioning me or using keywords like "help" or "question"',
      });

    // Add wallet commands if wallet integration is enabled
    if (config.walletIntegration && config.walletIntegration.enabled) {
      helpEmbed.addFields([
        {
          name: "Wallet Commands",
          value:
            "The following commands help you set up and manage your crypto wallet:",
        },
        {
          name: `${prefix}setup-wallet`,
          value: "Create a new crypto wallet for your account (DM only)",
        },
        {
          name: `${prefix}connect-wallet <address>`,
          value: "Connect an external wallet to your account (DM only)",
        },
        {
          name: `${prefix}connect-warpcast <username>`,
          value: "Connect your Warpcast account (DM only)",
        },
        {
          name: `${prefix}score`,
          value:
            "Calculate your community score based on wallet activity and Warpcast data (DM only)",
        },
      ]);
    }

    // Send the embed to the channel
    message.channel.send({ embeds: [helpEmbed] });
  },
};
