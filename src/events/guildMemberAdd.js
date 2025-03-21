import { Events, EmbedBuilder } from "discord.js";
import config from "../../config/config.js";

export default {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member) {
    if (!config.welcome.enabled) return;

    try {
      // Get the welcome channel
      const welcomeChannel = member.guild.channels.cache.find(
        (channel) => channel.name === config.welcome.channel
      );

      if (!welcomeChannel) {
        console.warn(`Welcome channel "${config.welcome.channel}" not found.`);
        return;
      }

      // Create a welcome embed
      const welcomeEmbed = new EmbedBuilder()
        .setColor("#00cc00")
        .setTitle("👋 Welcome to the Community!")
        .setDescription(
          config.welcome.message.replace("{user}", `<@${member.id}>`)
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

      // Send the welcome message
      await welcomeChannel.send({ embeds: [welcomeEmbed] });

      // Optionally send a direct message to the new member
      try {
        await member.send(
          `Welcome to ${member.guild.name}! We're glad to have you here. If you need any help, feel free to ask in our help channels or mention me in any channel.`
        );
      } catch (error) {
        console.warn(
          `Could not send DM to new member ${member.user.tag}: ${error.message}`
        );
      }
    } catch (error) {
      console.error(`Error welcoming new member ${member.user.tag}:`, error);
    }
  },
};
