import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import config from "../../config/config.js";

export default {
  data: {
    name: "moderate",
    description:
      "Activate moderation mode to monitor the channel for inappropriate content",
  },
  execute(message, args) {
    // Check if user has permission to use this command
    const member = message.member;
    const hasPermission =
      member.permissions.has(PermissionFlagsBits.ManageMessages) ||
      config.adminRoles.some((role) =>
        member.roles.cache.some((r) => r.name === role)
      );

    if (!hasPermission) {
      return message.reply(
        "You do not have permission to use this command. Only moderators and admins can use it."
      );
    }

    // Get moderation duration from args (default to 30 minutes)
    const duration = args[0] ? parseInt(args[0]) : 30;

    // Check if the duration is valid
    if (isNaN(duration) || duration <= 0 || duration > 120) {
      return message.reply(
        "Please provide a valid duration between 1 and 120 minutes."
      );
    }

    // Create a moderation embed
    const moderateEmbed = new EmbedBuilder()
      .setColor("#ff9900")
      .setTitle("🛡️ Moderation Mode Activated")
      .setDescription(
        `Moderation mode has been activated in this channel for ${duration} minutes. I will monitor messages for inappropriate content.`
      )
      .addFields(
        { name: "Moderator", value: `${message.author}` },
        { name: "Duration", value: `${duration} minutes` },
        {
          name: "Action",
          value: "Warning users who post inappropriate content",
        }
      )
      .setTimestamp();

    // Send the moderation message
    message.channel.send({ embeds: [moderateEmbed] });

    // Set a flag in the channel to indicate active moderation
    // In a real implementation, this would be stored in a database or memory cache
    message.channel.moderationActive = true;
    message.channel.moderationBy = message.author.id;

    // Set timeout to deactivate moderation after specified duration
    setTimeout(() => {
      if (message.channel.moderationActive) {
        message.channel.moderationActive = false;

        const endEmbed = new EmbedBuilder()
          .setColor("#00cc00")
          .setTitle("✅ Moderation Mode Ended")
          .setDescription(`Moderation mode has ended in this channel.`)
          .setTimestamp();

        message.channel.send({ embeds: [endEmbed] });
      }
    }, duration * 60 * 1000); // Convert minutes to milliseconds

    console.log(
      `Moderation mode activated in ${message.channel.name} by ${message.author.tag} for ${duration} minutes`
    );
  },
};
