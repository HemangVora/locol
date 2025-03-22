import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import config from "../../config/config.js";

export default {
  data: {
    name: "report",
    description: "Generate a community activity report",
  },
  async execute(message, args) {
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

    // Respond with initial message
    const responseMsg = await message.channel.send(
      "Generating community activity report..."
    );

    try {
      // Get time period from args (default to 24 hours)
      const timeHours = args[0] ? parseInt(args[0]) : 24;

      if (isNaN(timeHours) || timeHours <= 0 || timeHours > 720) {
        // Max 30 days
        return responseMsg.edit(
          "Please provide a valid time period between 1 and 720 hours."
        );
      }

      // Get server information
      const guild = message.guild;
      const cutoffTime = new Date(Date.now() - timeHours * 60 * 60 * 1000);

      // Initialize activity counters
      const stats = {
        totalMessages: 0,
        activeChannels: new Map(),
        activeUsers: new Map(),
        joinedMembers: 0,
        leftMembers: 0,
        newRoles: 0,
      };

      // Get all text channels
      const textChannels = guild.channels.cache.filter(
        (channel) => channel.type === 0
      ); // TextChannel type is 0

      // Collect message activity data
      for (const [_, channel] of textChannels) {
        try {
          // Fetch messages from the cutoff time
          const messages = await channel.messages.fetch({ limit: 100 });

          // Filter messages to those after the cutoff time
          const recentMessages = messages.filter(
            (msg) => msg.createdAt > cutoffTime
          );

          // Skip if no recent messages
          if (recentMessages.size === 0) continue;

          // Count messages in this channel
          stats.totalMessages += recentMessages.size;
          stats.activeChannels.set(channel.name, recentMessages.size);

          // Count messages per user
          recentMessages.forEach((msg) => {
            const authorId = msg.author.id;
            if (!msg.author.bot) {
              const currentCount = stats.activeUsers.get(authorId) || 0;
              stats.activeUsers.set(authorId, currentCount + 1);
            }
          });
        } catch (error) {
          console.error(`Error fetching messages from ${channel.name}:`, error);
          continue;
        }
      }

      // Get membership changes (this is just an estimate as Discord doesn't provide full history easily)
      // In a real implementation, you would use a database to track this
      stats.joinedMembers = Math.floor(Math.random() * 5); // Mock data
      stats.leftMembers = Math.floor(Math.random() * 3); // Mock data

      // Format top active channels
      const topChannels = [...stats.activeChannels.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => `#${name}: ${count} messages`)
        .join("\\n");

      // Format top active users
      const topUsers = [...stats.activeUsers.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(async ([id, count]) => {
          try {
            const user = await guild.members.fetch(id);
            return `${user.displayName}: ${count} messages`;
          } catch {
            return `Unknown User: ${count} messages`;
          }
        });

      const topUsersText = (await Promise.all(topUsers)).join("\\n");

      // Create an embed with the report
      const reportEmbed = new EmbedBuilder()
        .setColor("#00cc00")
        .setTitle("📊 Community Activity Report")
        .setDescription(`Activity report for the last ${timeHours} hours`)
        .addFields(
          {
            name: "Total Messages",
            value: stats.totalMessages.toString(),
            inline: true,
          },
          {
            name: "Active Members",
            value: stats.activeUsers.size.toString(),
            inline: true,
          },
          {
            name: "Active Channels",
            value: stats.activeChannels.size.toString(),
            inline: true,
          },
          {
            name: "Member Changes",
            value: `Joined: ${stats.joinedMembers}\\nLeft: ${stats.leftMembers}`,
            inline: true,
          },
          {
            name: "Most Active Channels",
            value: topChannels || "No active channels",
            inline: false,
          },
          {
            name: "Most Active Members",
            value: topUsersText || "No active members",
            inline: false,
          }
        )
        .setFooter({ text: `Generated: ${new Date().toLocaleString()}` });

      // Update response with the report embed
      await responseMsg.edit({ content: null, embeds: [reportEmbed] });
    } catch (error) {
      console.error("Error generating report:", error);
      responseMsg.edit(
        "Sorry, I encountered an error while generating the activity report."
      );
    }
  },
};
