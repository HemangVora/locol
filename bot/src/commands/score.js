import { SlashCommandBuilder } from "discord.js";
import { getUserScore, generateScoreReport } from "../utils/scoreProcessor.js";

export default {
  data: new SlashCommandBuilder()
    .setName("score")
    .setDescription("Check your Web3 score")
    .addStringOption((option) =>
      option
        .setName("fid")
        .setDescription("Your Farcaster ID")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const fid = interaction.options.getString("fid");

      // Mock user info - in production, you would fetch this from your database
      const userInfo = {
        fid,
        username: interaction.user.username,
        displayName: interaction.user.displayName || interaction.user.username,
        pfpUrl: interaction.user.displayAvatarURL(),
      };

      const scoreData = await getUserScore(userInfo);
      const report = generateScoreReport(scoreData);

      await interaction.editReply({
        content: `**${interaction.user.username}'s Web3 Score Report**\n\n${report}`,
        ephemeral: false,
      });
    } catch (error) {
      console.error("Error in score command:", error);
      await interaction.editReply({
        content:
          "Sorry, I was unable to fetch your score. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
