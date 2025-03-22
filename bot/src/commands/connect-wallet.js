import { EmbedBuilder } from "discord.js";
import WalletIntegration from "../utils/wallet-integration.js";

// Initialize wallet integration
const walletIntegration = new WalletIntegration();

export default {
  data: {
    name: "connect-wallet",
    description: "Connect an external wallet to your account",
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

      // Check if wallet address is provided
      if (!args[0]) {
        return message.reply(
          "Please provide a wallet address. Usage: `!connect-wallet 0x123...`"
        );
      }

      const walletAddress = args[0];

      // Validate wallet address format
      if (!walletIntegration.isValidEthereumAddress(walletAddress)) {
        return message.reply(
          "Invalid Ethereum wallet address. Please provide a valid address starting with 0x followed by 40 hexadecimal characters."
        );
      }

      // Try to link the wallet
      const linkResult = await walletIntegration.linkExternalWallet(
        message.author.id,
        walletAddress
      );

      if (!linkResult.success) {
        return message.reply(`Error connecting wallet: ${linkResult.error}`);
      }

      // Send confirmation
      const connectedWallets = linkResult.connectedWallets.join("\n");

      const walletEmbed = new EmbedBuilder()
        .setColor("#00cc00")
        .setTitle("🔗 Wallet Connected Successfully")
        .setDescription(
          `Your external wallet has been connected to your account.`
        )
        .addFields(
          { name: "Connected Wallet", value: walletAddress },
          { name: "All Connected Wallets", value: connectedWallets || "None" },
          {
            name: "Next Steps",
            value:
              "You can connect more wallets with the same command, or link your Warpcast account with `!connect-warpcast <username>`.",
          }
        )
        .setFooter({ text: "Use !score to calculate your community score" });

      message.reply({ embeds: [walletEmbed] });
    } catch (error) {
      console.error("Error in connect-wallet command:", error);
      message.reply(
        "Sorry, there was an error processing your request. Please try again later."
      );
    }
  },
};
