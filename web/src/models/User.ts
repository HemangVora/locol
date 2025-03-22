import mongoose, { Schema, Document, Model } from "mongoose";

// Define interfaces
export interface IWeb3Metrics {
  totalWeb3Mentions: number;
  blockchainMentions: number;
  defiMentions: number;
  nftMentions: number;
  walletMentions: number;
  conceptMentions: number;
  web3Percentage: number;
  mostDiscussedCategory: string;
  categories: {
    blockchain: Record<string, number>;
    defi: Record<string, number>;
    nft: Record<string, number>;
    wallet: Record<string, number>;
    concepts: Record<string, number>;
  };
}

export interface IWeb3Score {
  score: number;
  rating: string;
  metrics: IWeb3Metrics;
  expertise: string[];
  feedback: string[];
  updatedAt: Date;
}

export interface IGeneralMetrics {
  totalCasts: number;
  totalLikes: number;
  totalReplies: number;
  totalRecasts: number;
  avgLikesPerCast: number;
  avgRepliesPerCast: number;
  avgRecastsPerCast: number;
  engagementRate: number;
  activityLevel: string;
}

export interface IGeneralScore {
  score: number;
  metrics: IGeneralMetrics;
  rating: string;
  feedback: string[];
  updatedAt: Date;
}

export interface IUser extends Document {
  fid?: number;
  username?: string;
  displayName: string;
  pfpUrl?: string;
  bio?: string;
  signerUuid?: string;
  discordId?: string;
  email?: string;
  walletAddress?: string;
  web3Score?: IWeb3Score;
  generalScore?: IGeneralScore;
  casts?: any[];
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
}

// Define schema for Web3 metrics
const Web3MetricsSchema = new Schema<IWeb3Metrics>({
  totalWeb3Mentions: { type: Number, default: 0 },
  blockchainMentions: { type: Number, default: 0 },
  defiMentions: { type: Number, default: 0 },
  nftMentions: { type: Number, default: 0 },
  walletMentions: { type: Number, default: 0 },
  conceptMentions: { type: Number, default: 0 },
  web3Percentage: { type: Number, default: 0 },
  mostDiscussedCategory: { type: String, default: "" },
  categories: {
    blockchain: { type: Map, of: Number, default: {} },
    defi: { type: Map, of: Number, default: {} },
    nft: { type: Map, of: Number, default: {} },
    wallet: { type: Map, of: Number, default: {} },
    concepts: { type: Map, of: Number, default: {} },
  },
});

// Define schema for Web3 score
const Web3ScoreSchema = new Schema<IWeb3Score>({
  score: { type: Number, default: 0 },
  rating: { type: String, default: "Web3 Observer" },
  metrics: { type: Web3MetricsSchema, default: () => ({}) },
  expertise: [{ type: String }],
  feedback: [{ type: String }],
  updatedAt: { type: Date, default: Date.now },
});

// Define schema for general metrics
const GeneralMetricsSchema = new Schema<IGeneralMetrics>({
  totalCasts: { type: Number, default: 0 },
  totalLikes: { type: Number, default: 0 },
  totalReplies: { type: Number, default: 0 },
  totalRecasts: { type: Number, default: 0 },
  avgLikesPerCast: { type: Number, default: 0 },
  avgRepliesPerCast: { type: Number, default: 0 },
  avgRecastsPerCast: { type: Number, default: 0 },
  engagementRate: { type: Number, default: 0 },
  activityLevel: { type: String, default: "Low" },
});

// Define schema for general score
const GeneralScoreSchema = new Schema<IGeneralScore>({
  score: { type: Number, default: 0 },
  metrics: { type: GeneralMetricsSchema, default: () => ({}) },
  rating: { type: String, default: "Beginner" },
  feedback: [{ type: String }],
  updatedAt: { type: Date, default: Date.now },
});

// User Schema
const UserSchema = new Schema<IUser>(
  {
    // Farcaster fields
    fid: { type: Number, sparse: true },
    username: { type: String },
    displayName: { type: String, required: true },
    pfpUrl: { type: String },
    bio: { type: String },
    signerUuid: { type: String },

    // Discord fields
    discordId: { type: String, sparse: true },
    email: { type: String, sparse: true },

    // Wallet address
    walletAddress: { type: String },

    // Scores
    web3Score: { type: Web3ScoreSchema },
    generalScore: { type: GeneralScoreSchema },

    // Casts
    casts: { type: [Schema.Types.Mixed] },

    // Use timestamps option instead of explicit createdAt/updatedAt
    lastActiveAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
UserSchema.index({ fid: 1 });
UserSchema.index({ discordId: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ walletAddress: 1 });

// Check if model is already defined (for Next.js hot reloading)
let UserModel: Model<IUser>;

try {
  UserModel = mongoose.model<IUser>("User");
} catch (error) {
  UserModel = mongoose.model<IUser>("User", UserSchema);
}

export default UserModel;
