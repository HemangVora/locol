import { SlashCommandBuilder } from "discord.js";
import { getUserScore, answerScoreQuestion } from "../utils/scoreProcessor.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask questions about your Web3 profile")
    .addStringOption((option) =>
      option
        .setName("fid")
        .setDescription("Your Farcaster ID")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("What do you want to know about your profile?")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const fid = interaction.options.getString("fid");
      const question = interaction.options.getString("question");

      // Mock user info - in production, you would fetch this from your database
      const userInfo = {
        fid,
        username: interaction.user.username,
        displayName: interaction.user.displayName || interaction.user.username,
        pfpUrl: interaction.user.displayAvatarURL(),
      };

      const scoreData = await getUserScore(userInfo);
      const answer = answerScoreQuestion(question, scoreData);

      await interaction.editReply({
        content: `**Question:** ${question}\n\n**Answer:** ${answer}`,
        ephemeral: false,
      });
    } catch (error) {
      console.error("Error in ask command:", error);
      await interaction.editReply({
        content:
          "Sorry, I was unable to answer your question at this time. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
