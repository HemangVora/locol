import { Events, ActivityType } from "discord.js";

export default {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    // Log that the bot is online
    console.log(`Ready! Logged in as ${client.user.tag}`);

    // Set the bot's status
    client.user.setPresence({
      activities: [
        {
          name: "the community",
          type: ActivityType.Watching,
        },
      ],
      status: "online",
    });

    // Log some stats
    console.log(`Bot is in ${client.guilds.cache.size} servers`);

    // Set up an interval to rotate the bot's status message
    const statusMessages = [
      { name: "the community", type: ActivityType.Watching },
      { name: "for questions", type: ActivityType.Listening },
      { name: "with AI", type: ActivityType.Playing },
      { name: "!help for commands", type: ActivityType.Playing },
    ];

    let statusIndex = 0;

    // Update status every 30 minutes
    setInterval(() => {
      statusIndex = (statusIndex + 1) % statusMessages.length;
      const status = statusMessages[statusIndex];

      client.user.setActivity({
        name: status.name,
        type: status.type,
      });
    }, 30 * 60 * 1000); // 30 minutes
  },
};
