import mongoose from "mongoose";
import User, { IUser, IWeb3Score, IGeneralScore } from "../models/User";
import { MONGODB_URI } from "../lib/constants";

// Connect to MongoDB database
export async function connectToDatabase() {
  try {
    const connection = mongoose.connection;
    if (connection.readyState >= 1) {
      console.log("Already connected to MongoDB");
      return true;
    }

    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    return true;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return false;
  }
}

// Find a user by Farcaster ID
export async function findUserByFid(fid: number): Promise<IUser | null> {
  try {
    await connectToDatabase();
    return await User.findOne({ fid });
  } catch (error) {
    console.error(`Error finding user with FID ${fid}:`, error);
    return null;
  }
}

// Create or update a user
export async function createOrUpdateUser(userData: {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl?: string;
  bio?: string;
  signerUuid?: string;
}): Promise<IUser | null> {
  try {
    await connectToDatabase();

    // Check for required fields
    if (!userData.fid || !userData.username) {
      console.error("Missing required user data");
      return null;
    }

    // Check if user exists
    let user = await User.findOne({ fid: userData.fid });

    if (user) {
      // Update existing user
      Object.assign(user, {
        ...userData,
        lastActiveAt: new Date(),
      });

      await user.save();
      console.log(`Updated user ${userData.username} (${userData.fid})`);
    } else {
      // Create new user with initial scores
      user = new User({
        ...userData,
        web3Score: {
          score: 0,
          rating: "Novice",
          metrics: {},
          expertise: [],
          feedback: [
            "Connect your wallet to start building your Web3 identity.",
            "Post content related to blockchain, DeFi, or NFTs to improve your score.",
          ],
          updatedAt: new Date(),
        },
        generalScore: {
          score: 0,
          metrics: {},
          rating: "Beginner",
          feedback: [
            "Create posts to improve your engagement score.",
            "Engage with other users to build your Farcaster presence.",
          ],
          updatedAt: new Date(),
        },
        lastActiveAt: new Date(),
      });

      await user.save();
      console.log(`Created new user ${userData.username} (${userData.fid})`);
    }

    return user;
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return null;
  }
}

// Update user's wallet address
export async function updateWalletAddress(
  fid: number,
  walletAddress: string
): Promise<IUser | null> {
  try {
    await connectToDatabase();

    const user = await User.findOne({ fid });
    if (!user) {
      console.error(`User with FID ${fid} not found`);
      return null;
    }

    user.walletAddress = walletAddress;
    user.lastActiveAt = new Date();

    await user.save();
    console.log(`Updated wallet address for user ${user.username} (${fid})`);
    return user;
  } catch (error) {
    console.error(
      `Error updating wallet address for user with FID ${fid}:`,
      error
    );
    return null;
  }
}

// Update user's Web3 score
export async function updateWeb3Score(
  fid: number,
  web3Score: IWeb3Score
): Promise<IUser | null> {
  try {
    await connectToDatabase();

    const user = await User.findOne({ fid });
    if (!user) {
      console.error(`User with FID ${fid} not found`);
      return null;
    }

    user.web3Score = {
      ...web3Score,
      updatedAt: new Date(),
    };
    user.lastActiveAt = new Date();

    await user.save();
    console.log(`Updated Web3 score for user ${user.username} (${fid})`);
    return user;
  } catch (error) {
    console.error(`Error updating Web3 score for user with FID ${fid}:`, error);
    return null;
  }
}

// Update user's general score
export async function updateGeneralScore(
  fid: number,
  generalScore: IGeneralScore
): Promise<IUser | null> {
  try {
    await connectToDatabase();

    const user = await User.findOne({ fid });
    if (!user) {
      console.error(`User with FID ${fid} not found`);
      return null;
    }

    user.generalScore = {
      ...generalScore,
      updatedAt: new Date(),
    };
    user.lastActiveAt = new Date();

    await user.save();
    console.log(`Updated general score for user ${user.username} (${fid})`);
    return user;
  } catch (error) {
    console.error(
      `Error updating general score for user with FID ${fid}:`,
      error
    );
    return null;
  }
}

// Update user's recent casts
export async function updateUserCasts(
  fid: number,
  casts: any[]
): Promise<IUser | null> {
  try {
    await connectToDatabase();

    const user = await User.findOne({ fid });
    if (!user) {
      console.error(`User with FID ${fid} not found`);
      return null;
    }

    user.casts = casts;
    user.lastActiveAt = new Date();

    await user.save();
    console.log(`Updated casts for user ${user.username} (${fid})`);
    return user;
  } catch (error) {
    console.error(`Error updating casts for user with FID ${fid}:`, error);
    return null;
  }
}

// Update user data (multiple fields at once)
export async function updateUserData(
  fid: number,
  updates: {
    walletAddress?: string;
    web3Score?: IWeb3Score;
    generalScore?: IGeneralScore;
    casts?: any[];
    bio?: string;
    pfpUrl?: string;
    displayName?: string;
  }
): Promise<IUser | null> {
  try {
    await connectToDatabase();

    const user = await User.findOne({ fid });
    if (!user) {
      console.error(`User with FID ${fid} not found`);
      return null;
    }

    // Update only the fields that are present in the updates object
    if (updates.walletAddress) user.walletAddress = updates.walletAddress;
    if (updates.bio) user.bio = updates.bio;
    if (updates.pfpUrl) user.pfpUrl = updates.pfpUrl;
    if (updates.displayName) user.displayName = updates.displayName;

    if (updates.web3Score) {
      user.web3Score = {
        ...updates.web3Score,
        updatedAt: new Date(),
      };
    }

    if (updates.generalScore) {
      user.generalScore = {
        ...updates.generalScore,
        updatedAt: new Date(),
      };
    }

    if (updates.casts) {
      user.casts = updates.casts;
    }

    user.lastActiveAt = new Date();

    await user.save();
    console.log(`Updated data for user ${user.username} (${fid})`);
    return user;
  } catch (error) {
    console.error(`Error updating data for user with FID ${fid}:`, error);
    return null;
  }
}
