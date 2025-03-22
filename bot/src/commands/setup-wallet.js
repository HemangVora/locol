import { EmbedBuilder } from "discord.js";
import WalletIntegration from "../utils/wallet-integration.js";

// Initialize wallet integration
const walletIntegration = new WalletIntegration();

export default {
  data: {
    name: "setup-wallet",
    description: "Set up your crypto wallet and connect other services",
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

      // Check if user already has a wallet
      const existingWallet = walletIntegration.getUserWalletData(
        message.author.id
      );

      if (existingWallet) {
        const walletEmbed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle("Your Wallet Setup")
          .setDescription(
            "You already have a wallet set up. Here are your wallet details:"
          )
          .addFields(
            {
              name: "Privy Wallet Address",
              value: existingWallet.privyWalletAddress,
            },
            {
              name: "Connected Wallets",
              value:
                existingWallet.connectedWallets.length > 0
                  ? existingWallet.connectedWallets.join("\n")
                  : "No external wallets connected",
            },
            {
              name: "Warpcast",
              value: existingWallet.warpcast
                ? `@${existingWallet.warpcast.username} (Verified)`
                : "Not connected",
            }
          )
          .setFooter({
            text: "Use !connect-wallet to add external wallets or !connect-warpcast to link your Warpcast account",
          });

        return message.reply({ embeds: [walletEmbed] });
      }

      // Create a new wallet for the user
      const walletResult = await walletIntegration.createPrivyWallet(
        message.author.id
      );

      if (!walletResult.success) {
        return message.reply(`Error creating wallet: ${walletResult.error}`);
      }

      // Send the confirmation and next steps
      const setupEmbed = new EmbedBuilder()
        .setColor("#00cc00")
        .setTitle("🎉 Wallet Created Successfully!")
        .setDescription(
          "Your Privy wallet has been created. Here are your wallet details:"
        )
        .addFields(
          { name: "Wallet Address", value: walletResult.walletAddress },
          {
            name: "Next Steps",
            value:
              "You can now connect your external wallets and Warpcast account to enhance your profile:",
          },
          {
            name: "!connect-wallet <address>",
            value: "Connect an external wallet",
          },
          {
            name: "!connect-warpcast <username>",
            value: "Connect your Warpcast account",
          },
          {
            name: "!score",
            value:
              "Calculate your community score based on your wallet activity and Warpcast data",
          }
        )
        .setFooter({
          text: "All wallet operations are performed in DMs for security",
        });

      message.reply({ embeds: [setupEmbed] });
    } catch (error) {
      console.error("Error in setup-wallet command:", error);
      message.reply(
        "Sorry, there was an error processing your request. Please try again later."
      );
    }
  },
};
