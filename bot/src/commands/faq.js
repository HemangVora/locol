import { EmbedBuilder } from "discord.js";
import config from "../../config/config.js";

export default {
  data: {
    name: "faq",
    description: "Answer frequently asked questions about the community",
  },
  execute(message, args) {
    // Get the FAQ topic from arguments
    const topic = args[0]?.toLowerCase();

    // If no topic provided, show available topics
    if (!topic || !config.faq.topics[topic]) {
      const availableTopics = Object.keys(config.faq.topics).join(", ");

      const helpEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("FAQ - Available Topics")
        .setDescription(
          `Please specify a topic for the FAQ. Available topics: **${availableTopics}**`
        )
        .addFields(
          { name: "Usage", value: `${config.prefix}faq [topic]` },
          { name: "Example", value: `${config.prefix}faq rules` }
        );

      return message.channel.send({ embeds: [helpEmbed] });
    }

    // Get the response for the specified topic
    const response = config.faq.topics[topic];

    // Create a styled embed for the FAQ response
    const faqEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`FAQ: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`)
      .setDescription(response);

    // Send the embed to the channel
    message.channel.send({ embeds: [faqEmbed] });
  },
};
