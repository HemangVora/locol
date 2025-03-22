import fetch from "node-fetch";

/**
 * Utility class for wallet integrations and user validation
 */
class WalletIntegration {
  constructor(privyApiKey = null, etherscanApiKey = null) {
    this.privyApiKey = privyApiKey || process.env.PRIVY_API_KEY;
    this.etherscanApiKey = etherscanApiKey || process.env.ETHERSCAN_API_KEY;
    this.userWallets = new Map(); // userId -> {privyWalletId, connectedWallets[]}
    this.userScores = new Map(); // userId -> score
  }

  /**
   * Create a new Privy wallet for a user
   * @param {string} userId - Discord user ID
   * @param {string} userEmail - User's email (optional)
   * @returns {Promise<object>} - Wallet creation result
   */
  async createPrivyWallet(userId, userEmail = null) {
    if (!this.privyApiKey) {
      console.warn("No Privy API key provided. Cannot create wallet.");
      return { success: false, error: "No API key configured" };
    }

    try {
      // In a real implementation, this would call the Privy API
      // This is a mock implementation
      console.log(`Creating Privy wallet for user ${userId}`);

      // Mock response
      const walletId = `privy_${Date.now()}_${userId}`;
      const walletAddress = `0x${Math.random().toString(16).substring(2, 42)}`;

      // Store wallet info
      this.userWallets.set(userId, {
        privyWalletId: walletId,
        privyWalletAddress: walletAddress,
        connectedWallets: [],
        warpcast: null,
      });

      return {
        success: true,
        walletId,
        walletAddress,
        message: "Privy wallet created successfully",
      };
    } catch (error) {
      console.error("Error creating Privy wallet:", error);
      return {
        success: false,
        error: error.message || "Failed to create wallet",
      };
    }
  }

  /**
   * Link an external wallet to a user's account
   * @param {string} userId - Discord user ID
   * @param {string} walletAddress - External wallet address
   * @returns {Promise<object>} - Linking result
   */
  async linkExternalWallet(userId, walletAddress) {
    try {
      // Check if user has a Privy wallet
      const userWallet = this.userWallets.get(userId);
      if (!userWallet) {
        return {
          success: false,
          error: "User does not have a Privy wallet. Create one first.",
        };
      }

      // Validate wallet address format
      if (!this.isValidEthereumAddress(walletAddress)) {
        return {
          success: false,
          error: "Invalid Ethereum wallet address format",
        };
      }

      // Add wallet to user's connected wallets if not already present
      if (!userWallet.connectedWallets.includes(walletAddress)) {
        userWallet.connectedWallets.push(walletAddress);
        this.userWallets.set(userId, userWallet);
      }

      return {
        success: true,
        message: "Wallet linked successfully",
        connectedWallets: userWallet.connectedWallets,
      };
    } catch (error) {
      console.error("Error linking external wallet:", error);
      return {
        success: false,
        error: error.message || "Failed to link wallet",
      };
    }
  }

  /**
   * Link Warpcast account to a user
   * @param {string} userId - Discord user ID
   * @param {string} warpcastUsername - Warpcast username
   * @returns {Promise<object>} - Linking result
   */
  async linkWarpcast(userId, warpcastUsername) {
    try {
      // Check if user has a Privy wallet
      const userWallet = this.userWallets.get(userId);
      if (!userWallet) {
        return {
          success: false,
          error: "User does not have a Privy wallet. Create one first.",
        };
      }

      // In a real implementation, this would verify the Warpcast account
      // For now, we'll just store the username
      userWallet.warpcast = {
        username: warpcastUsername,
        verified: true,
        followers: Math.floor(Math.random() * 1000),
      };

      this.userWallets.set(userId, userWallet);

      return {
        success: true,
        message: "Warpcast account linked successfully",
        warpcast: userWallet.warpcast,
      };
    } catch (error) {
      console.error("Error linking Warpcast:", error);
      return {
        success: false,
        error: error.message || "Failed to link Warpcast",
      };
    }
  }

  /**
   * Calculate user score based on their wallet activities and Warpcast data
   * @param {string} userId - Discord user ID
   * @returns {Promise<object>} - User score result
   */
  async calculateUserScore(userId) {
    try {
      // Check if user has a wallet registered
      const userWallet = this.userWallets.get(userId);
      if (!userWallet) {
        return {
          success: false,
          error: "User does not have any wallets registered",
        };
      }

      let score = 0;
      let scoreFactors = [];

      // Base score for having a Privy wallet
      score += 10;
      scoreFactors.push("Privy wallet: +10");

      // Score for connected wallets
      const walletCount = userWallet.connectedWallets.length;
      score += walletCount * 5;
      if (walletCount > 0) {
        scoreFactors.push(
          `${walletCount} connected wallets: +${walletCount * 5}`
        );
      }

      // Check on-chain data for each wallet
      for (const wallet of userWallet.connectedWallets) {
        const onchainData = await this.getOnchainData(wallet);

        // Score based on transaction count
        if (onchainData.txCount > 0) {
          const txScore = Math.min(Math.floor(onchainData.txCount / 10), 20);
          score += txScore;
          scoreFactors.push(`Transaction activity: +${txScore}`);
        }

        // Score based on token holdings
        if (onchainData.tokenCount > 0) {
          const tokenScore = Math.min(onchainData.tokenCount * 2, 15);
          score += tokenScore;
          scoreFactors.push(`Token holdings: +${tokenScore}`);
        }
      }

      // Add score from Warpcast if linked
      if (userWallet.warpcast) {
        // Base score for linking Warpcast
        score += 15;
        scoreFactors.push("Warpcast linked: +15");

        // Bonus for follower count
        if (userWallet.warpcast.followers > 0) {
          const followerScore = Math.min(
            Math.floor(userWallet.warpcast.followers / 50),
            25
          );
          score += followerScore;
          scoreFactors.push(`Warpcast followers: +${followerScore}`);
        }
      }

      // Store the calculated score
      this.userScores.set(userId, score);

      return {
        success: true,
        score,
        scoreFactors,
        level: this.getScoreLevel(score),
        warpcastVerified: userWallet.warpcast
          ? userWallet.warpcast.verified
          : false,
        walletCount: walletCount + 1, // Including Privy wallet
      };
    } catch (error) {
      console.error("Error calculating user score:", error);
      return {
        success: false,
        error: error.message || "Failed to calculate score",
      };
    }
  }

  /**
   * Get on-chain data for a wallet address
   * @param {string} walletAddress - Ethereum wallet address
   * @returns {Promise<object>} - On-chain data
   */
  async getOnchainData(walletAddress) {
    try {
      // In a real implementation, this would call the Etherscan API or use an Ethereum provider
      // This is a mock implementation
      console.log(`Getting on-chain data for wallet ${walletAddress}`);

      // Generate some random data for demo purposes
      return {
        txCount: Math.floor(Math.random() * 100),
        balance: Math.random() * 10,
        tokenCount: Math.floor(Math.random() * 20),
        nftCount: Math.floor(Math.random() * 5),
      };
    } catch (error) {
      console.error("Error getting on-chain data:", error);
      return {
        txCount: 0,
        balance: 0,
        tokenCount: 0,
        nftCount: 0,
      };
    }
  }

  /**
   * Get user level based on score
   * @param {number} score - User score
   * @returns {string} - User level
   */
  getScoreLevel(score) {
    if (score < 20) return "Novice";
    if (score < 40) return "Apprentice";
    if (score < 60) return "Adept";
    if (score < 80) return "Expert";
    return "Master";
  }

  /**
   * Validate if a string is a valid Ethereum address
   * @param {string} address - Address to validate
   * @returns {boolean} - Is valid address
   */
  isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Get user wallet data
   * @param {string} userId - Discord user ID
   * @returns {object|null} - User wallet data
   */
  getUserWalletData(userId) {
    return this.userWallets.get(userId) || null;
  }
}

export default WalletIntegration;
