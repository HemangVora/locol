import { EmbedBuilder } from "discord.js";
import WalletIntegration from "../utils/wallet-integration.js";

// Initialize wallet integration
const walletIntegration = new WalletIntegration();

export default {
  data: {
    name: "score",
    description:
      "Calculate your community score based on wallet activity and Warpcast data",
  },
  async execute(message, args) {
    try {
      // Check if user has a wallet
      const userWallet = walletIntegration.getUserWalletData(message.author.id);

      if (!userWallet) {
        return message.reply(
          "You need to set up a wallet first. Use `!setup-wallet` to get started."
        );
      }

      // Show "calculating" message
      const calculatingMsg = await message.reply(
        "Calculating your community score based on wallet activity and Warpcast data..."
      );

      // Calculate the score
      const scoreResult = await walletIntegration.calculateUserScore(
        message.author.id
      );

      if (!scoreResult.success) {
        return calculatingMsg.edit(
          `Error calculating score: ${scoreResult.error}`
        );
      }

      // Format score factors
      const scoreFactorsText = scoreResult.scoreFactors.join("\n");

      // Create level bar
      const levelBar = createLevelBar(scoreResult.score);

      // Create and send the score embed
      const scoreEmbed = new EmbedBuilder()
        .setColor(getLevelColor(scoreResult.level))
        .setTitle(`🏆 Your Community Score: ${scoreResult.score} Points`)
        .setDescription(`Level: **${scoreResult.level}**\n${levelBar}`)
        .addFields(
          { name: "Score Breakdown", value: scoreFactorsText },
          {
            name: "Wallets Connected",
            value: `${scoreResult.walletCount} wallet(s)`,
            inline: true,
          },
          {
            name: "Warpcast",
            value: scoreResult.warpcastVerified
              ? "✅ Verified"
              : "❌ Not Connected",
            inline: true,
          },
          {
            name: "Improve Your Score",
            value:
              "Connect more wallets with `!connect-wallet` or link your Warpcast with `!connect-warpcast`.",
          }
        )
        .setFooter({
          text: "Score is calculated based on wallet activity and social connections",
        });

      calculatingMsg.edit({ content: null, embeds: [scoreEmbed] });
    } catch (error) {
      console.error("Error in score command:", error);
      message.reply(
        "Sorry, there was an error calculating your score. Please try again later."
      );
    }
  },
};

/**
 * Create a visual level bar based on score
 * @param {number} score - User score
 * @returns {string} - Visual level bar
 */
function createLevelBar(score) {
  const maxScore = 100;
  const percentage = Math.min(Math.round((score / maxScore) * 100), 100);
  const filledBars = Math.floor(percentage / 10);

  let bar = "";
  for (let i = 0; i < 10; i++) {
    if (i < filledBars) {
      bar += "█";
    } else {
      bar += "░";
    }
  }

  return `${bar} ${percentage}%`;
}

/**
 * Get color based on level
 * @param {string} level - User level
 * @returns {string} - Hex color code
 */
function getLevelColor(level) {
  switch (level) {
    case "Novice":
      return "#6E7C7C"; // Gray
    case "Apprentice":
      return "#4B9CD3"; // Blue
    case "Adept":
      return "#59CD90"; // Green
    case "Expert":
      return "#F4B942"; // Yellow
    case "Master":
      return "#E74C3C"; // Red
    default:
      return "#6E7C7C";
  }
}
