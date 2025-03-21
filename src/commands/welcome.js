import { EmbedBuilder } from "discord.js";
import config from "../../config/config.js";

export default {
  data: {
    name: "welcome",
    description: "Post a welcome message for new members",
  },
  execute(message, args) {
    // Check if there's a mentioned user
    const mentionedUser = message.mentions.users.first();
    const targetUser = mentionedUser || message.author;

    // Create a welcome embed message
    const welcomeEmbed = new EmbedBuilder()
      .setColor("#00cc00")
      .setTitle("👋 Welcome to the Community!")
      .setDescription(
        config.welcome.message.replace("{user}", `<@${targetUser.id}>`)
      )
      .addFields(
        {
          name: "📜 Rules",
          value:
            "Make sure to read our community rules to understand the expectations.",
        },
        {
          name: "❓ Need Help?",
          value:
            "Feel free to ask questions in the help channel or by using the !help command.",
        },
        {
          name: "🧭 Getting Started",
          value: "Introduce yourself and start exploring our channels!",
        }
      )
      .setImage("https://i.imgur.com/Ksr5FHM.png") // Placeholder welcome image
      .setFooter({ text: "We hope you enjoy your time here!" });

    // Send the welcome message to the channel
    message.channel.send({ embeds: [welcomeEmbed] });
  },
};
