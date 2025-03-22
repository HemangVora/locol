import mongoose from "mongoose";
import UserModel, { IUser } from "../models/User";
import clientPromise from "../lib/mongodb";
import { APP_NAME } from "../lib/constants";

// Export UserModel as User for backwards compatibility
export const User = UserModel;

// Connect to database or use existing connection
export async function connectToMongoose() {
  if (mongoose.connection.readyState !== 1) {
    console.log("Not connected to MongoDB, connecting now...");
    await mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI as string);
    console.log("Connected to MongoDB");
  } else {
    console.log("Already connected to MongoDB");
  }
  return { mongoose };
}

// Find user by farcaster ID
export async function findUserByFid(fid: number): Promise<IUser | null> {
  await connectToMongoose();
  return UserModel.findOne({ fid });
}

// Find user by Discord ID
export async function findUserByDiscordId(
  discordId: string
): Promise<IUser | null> {
  await connectToMongoose();
  return UserModel.findOne({ discordId });
}

// Find user by email
export async function findUserByEmail(email: string): Promise<IUser | null> {
  await connectToMongoose();
  return UserModel.findOne({ email });
}

// Find user by wallet address
export async function findUserByWalletAddress(
  walletAddress: string
): Promise<IUser | null> {
  await connectToMongoose();
  return UserModel.findOne({ walletAddress });
}

// Create or update user from Farcaster data
export async function createOrUpdateUser(userData: {
  fid: number;
  username: string;
  displayName?: string;
  pfpUrl?: string;
  bio?: string;
  signerUuid?: string;
}): Promise<IUser> {
  await connectToMongoose();

  const { fid, username } = userData;
  if (!fid || !username) {
    throw new Error("FID and username are required");
  }

  // Try to find existing user
  let user = await UserModel.findOne({ fid });

  if (user) {
    // Update existing user
    Object.assign(user, userData);
    await user.save();
    return user;
  } else {
    // Create new user
    const newUser = new UserModel({
      ...userData,
      displayName: userData.displayName || username,
    });

    // Initialize scores for new users
    if (!newUser.web3Score) {
      newUser.web3Score = {
        score: 0,
        rating: "Web3 Observer",
        metrics: {
          totalWeb3Mentions: 0,
          blockchainMentions: 0,
          defiMentions: 0,
          nftMentions: 0,
          walletMentions: 0,
          conceptMentions: 0,
          web3Percentage: 0,
          mostDiscussedCategory: "",
          categories: {
            blockchain: {},
            defi: {},
            nft: {},
            wallet: {},
            concepts: {},
          },
        },
        expertise: ["Web3 Beginner"],
        feedback: [
          `Welcome to ${APP_NAME}! Start engaging with Web3 topics to build your score.`,
        ],
        updatedAt: new Date(),
      };
    }

    if (!newUser.generalScore) {
      newUser.generalScore = {
        score: 0,
        metrics: {
          totalCasts: 0,
          totalLikes: 0,
          totalReplies: 0,
          totalRecasts: 0,
          avgLikesPerCast: 0,
          avgRepliesPerCast: 0,
          avgRecastsPerCast: 0,
          engagementRate: 0,
          activityLevel: "Low",
        },
        rating: "Beginner",
        feedback: [
          `Welcome to ${APP_NAME}! Start posting to build your presence.`,
        ],
        updatedAt: new Date(),
      };
    }

    await newUser.save();
    return newUser;
  }
}

// Create or update user from Discord Auth
export async function createOrUpdateUserFromAuth(userData: {
  discordId: string;
  email?: string;
  displayName: string;
  avatar?: string;
}): Promise<IUser> {
  await connectToMongoose();

  const { discordId, email, displayName } = userData;
  if (!discordId || !displayName) {
    throw new Error("Discord ID and display name are required");
  }

  // Try to find existing user by Discord ID
  let user = await UserModel.findOne({ discordId });

  // If no user found by Discord ID but we have an email, try finding by email
  if (!user && email) {
    user = await UserModel.findOne({ email });
  }

  if (user) {
    // Update existing user
    user.discordId = discordId;
    if (email) user.email = email;
    if (displayName) user.displayName = displayName;
    if (userData.avatar) user.pfpUrl = userData.avatar;

    await user.save();
    return user;
  } else {
    // Create new user
    const newUser = new UserModel({
      discordId,
      email,
      displayName,
      pfpUrl: userData.avatar,
    });

    // Initialize scores for new users
    if (!newUser.web3Score) {
      newUser.web3Score = {
        score: 0,
        rating: "Web3 Observer",
        metrics: {
          totalWeb3Mentions: 0,
          blockchainMentions: 0,
          defiMentions: 0,
          nftMentions: 0,
          walletMentions: 0,
          conceptMentions: 0,
          web3Percentage: 0,
          mostDiscussedCategory: "",
          categories: {
            blockchain: {},
            defi: {},
            nft: {},
            wallet: {},
            concepts: {},
          },
        },
        expertise: ["Web3 Beginner"],
        feedback: [
          `Welcome to ${APP_NAME}! Start engaging with Web3 topics to build your score.`,
        ],
        updatedAt: new Date(),
      };
    }

    if (!newUser.generalScore) {
      newUser.generalScore = {
        score: 0,
        metrics: {
          totalCasts: 0,
          totalLikes: 0,
          totalReplies: 0,
          totalRecasts: 0,
          avgLikesPerCast: 0,
          avgRepliesPerCast: 0,
          avgRecastsPerCast: 0,
          engagementRate: 0,
          activityLevel: "Low",
        },
        rating: "Beginner",
        feedback: [
          `Welcome to ${APP_NAME}! Start posting to build your presence.`,
        ],
        updatedAt: new Date(),
      };
    }

    await newUser.save();
    return newUser;
  }
}

// Link Farcaster account to existing user (by Discord ID or email)
export async function linkFarcasterAccount(
  identifier: { discordId?: string; email?: string },
  farcasterData: {
    fid: number;
    username: string;
    displayName?: string;
    pfpUrl?: string;
    signerUuid?: string;
  }
): Promise<IUser | null> {
  await connectToMongoose();

  let user = null;

  // Find user by Discord ID or email
  if (identifier.discordId) {
    user = await UserModel.findOne({ discordId: identifier.discordId });
  } else if (identifier.email) {
    user = await UserModel.findOne({ email: identifier.email });
  }

  if (!user) return null;

  // Update user with Farcaster data
  user.fid = farcasterData.fid;
  user.username = farcasterData.username;
  if (farcasterData.displayName) user.displayName = farcasterData.displayName;
  if (farcasterData.pfpUrl) user.pfpUrl = farcasterData.pfpUrl;
  if (farcasterData.signerUuid) user.signerUuid = farcasterData.signerUuid;

  await user.save();
  return user;
}

// Update wallet address
export async function updateWalletAddress(
  fid: number,
  walletAddress: string
): Promise<IUser | null> {
  await connectToMongoose();

  const user = await UserModel.findOneAndUpdate(
    { fid },
    { $set: { walletAddress, updatedAt: new Date() } },
    { new: true }
  );

  return user;
}

// Update wallet address by Discord ID
export async function updateWalletAddressByDiscordId(
  discordId: string,
  walletAddress: string
): Promise<IUser | null> {
  await connectToMongoose();

  const user = await UserModel.findOneAndUpdate(
    { discordId },
    { $set: { walletAddress, updatedAt: new Date() } },
    { new: true }
  );

  return user;
}

// Update web3 score
export async function updateWeb3Score(
  fid: number,
  web3Score: any
): Promise<IUser | null> {
  await connectToMongoose();

  const user = await UserModel.findOneAndUpdate(
    { fid },
    { $set: { web3Score, updatedAt: new Date() } },
    { new: true }
  );

  return user;
}

// Update general score
export async function updateGeneralScore(
  fid: number,
  generalScore: any
): Promise<IUser | null> {
  await connectToMongoose();

  const user = await UserModel.findOneAndUpdate(
    { fid },
    { $set: { generalScore, updatedAt: new Date() } },
    { new: true }
  );

  return user;
}

// Update user casts
export async function updateUserCasts(
  fid: number,
  casts: any[]
): Promise<IUser | null> {
  await connectToMongoose();

  const user = await UserModel.findOneAndUpdate(
    { fid },
    { $set: { casts, updatedAt: new Date(), lastActiveAt: new Date() } },
    { new: true }
  );

  return user;
}

// Update all user data at once
export async function updateUserData(
  fid: number,
  data: {
    casts?: any[];
    web3Score?: any;
    generalScore?: any;
    walletAddress?: string;
  }
): Promise<IUser | null> {
  await connectToMongoose();

  const updateData: any = { updatedAt: new Date() };
  if (data.casts) updateData.casts = data.casts;
  if (data.web3Score) updateData.web3Score = data.web3Score;
  if (data.generalScore) updateData.generalScore = data.generalScore;
  if (data.walletAddress) updateData.walletAddress = data.walletAddress;

  const user = await UserModel.findOneAndUpdate(
    { fid },
    { $set: updateData },
    { new: true }
  );

  return user;
}
