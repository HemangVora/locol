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
  totalCharacters: number;
  avgLikesPerCast: number;
  engagementRate: number;
  consistencyScore: number;
}

export interface IGeneralScore {
  score: number;
  metrics: IGeneralMetrics;
  rating: string;
  feedback: string[];
  updatedAt: Date;
}

export interface IUser extends Document {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  bio?: string;
  signerUuid?: string;
  walletAddress?: string;
  web3Score?: IWeb3Score;
  generalScore?: IGeneralScore;
  casts?: any[];
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
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
  rating: { type: String, default: "Novice" },
  metrics: { type: Web3MetricsSchema, default: {} },
  expertise: [{ type: String }],
  feedback: [{ type: String }],
  updatedAt: { type: Date, default: Date.now },
});

// Define schema for general metrics
const GeneralMetricsSchema = new Schema<IGeneralMetrics>({
  totalCasts: { type: Number, default: 0 },
  totalLikes: { type: Number, default: 0 },
  totalReplies: { type: Number, default: 0 },
  totalCharacters: { type: Number, default: 0 },
  avgLikesPerCast: { type: Number, default: 0 },
  engagementRate: { type: Number, default: 0 },
  consistencyScore: { type: Number, default: 0 },
});

// Define schema for general score
const GeneralScoreSchema = new Schema<IGeneralScore>({
  score: { type: Number, default: 0 },
  metrics: { type: GeneralMetricsSchema, default: {} },
  rating: { type: String, default: "Beginner" },
  feedback: [{ type: String }],
  updatedAt: { type: Date, default: Date.now },
});

// Define User schema
const UserSchema = new Schema<IUser>(
  {
    fid: { type: Number, required: true, unique: true },
    username: { type: String, required: true },
    displayName: { type: String, required: true },
    pfpUrl: { type: String },
    bio: { type: String },
    signerUuid: { type: String },
    walletAddress: { type: String },
    web3Score: { type: Web3ScoreSchema },
    generalScore: { type: GeneralScoreSchema },
    casts: { type: [Schema.Types.Mixed], default: [] },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

// Check if model is already defined (for Next.js hot reloading)
let UserModel: Model<IUser>;

try {
  UserModel = mongoose.model<IUser>("User");
} catch (error) {
  UserModel = mongoose.model<IUser>("User", UserSchema);
}

export default UserModel;
