import { Events, EmbedBuilder } from "discord.js";
import config from "../../config/config.js";
import WalletIntegration from "../utils/wallet-integration.js";

// Initialize wallet integration
const walletIntegration = new WalletIntegration();

export default {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member) {
    try {
      // Send welcome message in the server's welcome channel if enabled
      if (config.welcome.enabled) {
        const welcomeChannel = member.guild.channels.cache.find(
          (channel) => channel.name === config.welcome.channel
        );

        if (welcomeChannel) {
          // Create a welcome embed
          const welcomeEmbed = new EmbedBuilder()
            .setColor("#00cc00")
            .setTitle("👋 Welcome to the Community!")
            .setDescription(
              config.welcome.message.replace("{user}", `<@${member.id}>`)
            )
            .addFields(
              {
                name: "📜 Rules",
                value:
                  "Make sure to read our community rules to understand the expectations.",
              },
              {
                name: "❓ Need Help?",
                value:
                  "Feel free to ask questions in the help channel or by using the !help command.",
              },
              {
                name: "🧭 Getting Started",
                value: "Introduce yourself and start exploring our channels!",
              }
            )
            .setImage("https://i.imgur.com/Ksr5FHM.png") // Placeholder welcome image
            .setFooter({ text: "We hope you enjoy your time here!" });

          await welcomeChannel.send({ embeds: [welcomeEmbed] });
        } else {
          console.warn(
            `Welcome channel "${config.welcome.channel}" not found.`
          );
        }
      }

      // Create a Privy wallet for the new member
      const walletResult = await walletIntegration.createPrivyWallet(member.id);

      if (!walletResult.success) {
        console.error(
          `Failed to create wallet for new member ${member.user.tag}: ${walletResult.error}`
        );
      } else {
        console.log(
          `Created Privy wallet for new member ${member.user.tag}: ${walletResult.walletAddress}`
        );
      }

      // Send a DM to the user about connecting wallets and Warpcast
      try {
        const onboardingEmbed = new EmbedBuilder()
          .setColor("#9B4DCA") // Purple color
          .setTitle("🔐 Your Community Wallet is Ready!")
          .setDescription(
            `Welcome to ${member.guild.name}! We've created a Privy wallet for you to enhance your experience.`
          )
          .addFields(
            {
              name: "Your Wallet Address",
              value: walletResult.success
                ? walletResult.walletAddress
                : "Error creating wallet. Please contact an administrator.",
            },

            {
              name: "Connect Your Warpcast Account",
              value:
                "Link your Warpcast account to validate your community presence. DM me: `!connect-warpcast YOUR_USERNAME`",
            },
            {
              name: "Check Your Score",
              value:
                "Once you've connected your accounts, check your community score with: `!score`",
            }
          )
          .setFooter({
            text: "All wallet operations work only in DMs for your security",
          });

        await member.send({ embeds: [onboardingEmbed] });

        // Send follow-up instructions
        await member.send(
          "By connecting your existing wallets and Warpcast account, we can validate your onchain activity and assign you the appropriate community roles and access. Your data is only used for verification purposes."
        );
      } catch (error) {
        console.warn(
          `Could not send DM to new member ${member.user.tag}: ${error.message}`
        );
      }
    } catch (error) {
      console.error(`Error handling new member ${member.user.tag}:`, error);
    }
  },
};
