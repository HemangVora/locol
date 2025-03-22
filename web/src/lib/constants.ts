import dotenv from "dotenv";

dotenv.config();

// MongoDB Connection String
export const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/locol";

// App Name
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Locol";

// User onboarding steps
export const ONBOARDING_STEPS = {
  CONNECT_FARCASTER: "Connect Farcaster",
  CONNECT_WALLET: "Connect Wallet",
  CREATE_CAST: "Create a Cast",
  EXPLORE_PROFILE: "Explore Your Profile",
};
// Web3 score thresholds
export const WEB3_SCORE_THRESHOLDS = {
  NOVICE: 20,
  BEGINNER: 40,
  INTERMEDIATE: 60,
  ADVANCED: 80,
  EXPERT: 90,
};
