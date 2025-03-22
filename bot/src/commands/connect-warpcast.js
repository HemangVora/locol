import { EmbedBuilder } from "discord.js";
import WalletIntegration from "../utils/wallet-integration.js";

// Initialize wallet integration
const walletIntegration = new WalletIntegration();

export default {
  data: {
    name: "connect-warpcast",
    description: "Connect your Warpcast account to your profile",
  },
  async execute(message, args) {
    try {
      // This command should only work in DMs
      if (message.channel.type !== 1) {
        // DM Channel type is 1
        return message.reply(
          "Please use this command in a direct message for privacy and security reasons."
        );
      }

      // Check if username is provided
      if (!args[0]) {
        return message.reply(
          "Please provide your Warpcast username. Usage: `!connect-warpcast yourusername`"
        );
      }

      const warpcastUsername = args[0].replace("@", ""); // Remove @ if included

      // Try to link the Warpcast account
      const linkResult = await walletIntegration.linkWarpcast(
        message.author.id,
        warpcastUsername
      );

      if (!linkResult.success) {
        return message.reply(`Error connecting Warpcast: ${linkResult.error}`);
      }

      // Send confirmation
      const warpcastEmbed = new EmbedBuilder()
        .setColor("#9B4DCA") // Warpcast's purple color
        .setTitle("🔗 Warpcast Connected Successfully")
        .setDescription(
          `Your Warpcast account has been connected to your profile.`
        )
        .addFields(
          { name: "Warpcast Username", value: `@${warpcastUsername}` },
          {
            name: "Verification Status",
            value: linkResult.warpcast.verified
              ? "✅ Verified"
              : "❌ Not Verified",
          },
          {
            name: "Followers",
            value: linkResult.warpcast.followers.toString(),
          },
          {
            name: "Next Steps",
            value:
              "Use `!score` to calculate your community score based on your wallet activity and Warpcast data.",
          }
        )
        .setFooter({
          text: "Warpcast data contributes to your overall community score",
        });

      message.reply({ embeds: [warpcastEmbed] });
    } catch (error) {
      console.error("Error in connect-warpcast command:", error);
      message.reply(
        "Sorry, there was an error processing your request. Please try again later."
      );
    }
  },
};
