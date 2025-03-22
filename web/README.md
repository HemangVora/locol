# Farcaster Web3 Profile

This is a [RainbowKit](https://rainbowkit.com) + [wagmi](https://wagmi.sh) + [Next.js](https://nextjs.org/) project that integrates with Farcaster to analyze user profiles and calculate Web3 engagement scores.

## Features

- Farcaster authentication using Neynar
- Wallet connection with RainbowKit
- Web3 profile score calculation
- Persistent user data storage with MongoDB
- User onboarding flow

## Prerequisites

- Node.js 16+
- MongoDB (local or MongoDB Atlas)
- Neynar API credentials

## Getting Started

1. First, set up your environment variables:

```bash
# Copy the example env file
cp .env.example .env.local

# Edit the .env.local file with your credentials
```

2. Set up MongoDB:

You can either:

- Install MongoDB locally: [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)
- Use MongoDB Atlas: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

Update your `.env.local` file with your MongoDB connection string:

```
MONGODB_URI=mongodb://localhost:27017/locol
# Or for MongoDB Atlas
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
```

3. Install dependencies:

```bash
npm install
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/pages/api/*` - API routes for handling Farcaster authentication, casts, and scoring
- `src/lib/mongodb.ts` - MongoDB connection utilities
- `src/models/User.ts` - Mongoose model for user data
- `src/services/userService.ts` - Service for user data operations
- `src/lib/constants.ts` - App-wide constants and configuration

## Learn More

To learn more about this stack, take a look at the following resources:

- [RainbowKit Documentation](https://rainbowkit.com) - Learn how to customize your wallet connection flow.
- [wagmi Documentation](https://wagmi.sh) - Learn how to interact with Ethereum.
- [Next.js Documentation](https://nextjs.org/docs) - Learn how to build a Next.js application.
- [MongoDB Documentation](https://docs.mongodb.com/) - Learn about MongoDB.
- [Mongoose Documentation](https://mongoosejs.com/docs/) - Learn about Mongoose ODM for MongoDB.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

When deploying to Vercel, make sure to add your environment variables in the Vercel project settings.
