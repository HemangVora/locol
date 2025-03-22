import { NextApiRequest, NextApiResponse } from "next";
import { NeynarAPIClient, isApiErrorResponse } from "@neynar/nodejs-sdk";
import {
  updateUserData,
  findUserByFid,
  createOrUpdateUser,
} from "../../services/userService";

// Create Neynar API client with API key
const client = new NeynarAPIClient({
  apiKey: process.env.NEYNAR_API_KEY!,
});

// Web3 related keywords to detect in casts
const web3Keywords = {
  blockchain: [
    "blockchain",
    "bitcoin",
    "ethereum",
    "solana",
    "polygon",
    "arbitrum",
    "optimism",
    "base",
    "zora",
    "avalanche",
    "cosmos",
  ],
  defi: [
    "defi",
    "liquidity",
    "yield",
    "stake",
    "staking",
    "dao",
    "governance",
    "airdrop",
    "token",
    "tokenomics",
  ],
  nft: [
    "nft",
    "collectible",
    "digital art",
    "mint",
    "pfp",
    "generative",
    "rarity",
    "collection",
  ],
  wallet: [
    "wallet",
    "metamask",
    "ledger",
    "cold wallet",
    "hot wallet",
    "self-custody",
    "seed phrase",
    "private key",
  ],
  concepts: [
    "web3",
    "crypto",
    "decentralized",
    "trustless",
    "permissionless",
    "on-chain",
    "off-chain",
    "gm",
    "wagmi",
    "ngmi",
  ],
};

// Function to calculate a user's score based on their casts
function calculateUserScore(casts: any[]) {
  if (!casts || casts.length === 0) {
    // Return default structure for empty casts
    return {
      score: 0,
      metrics: {
        totalCasts: 0,
        totalLikes: 0,
        totalReplies: 0,
        totalCharacters: 0,
        avgLikesPerCast: 0,
        engagementRate: 0,
        consistencyScore: 0,
      },
      rating: "Beginner",
      feedback: ["Start posting to build your Farcaster presence."],
      web3Score: {
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
          "Start engaging with Web3 topics to build your on-chain reputation.",
        ],
      },
    };
  }

  // Base metrics for scoring
  const metrics = {
    totalCasts: casts.length,
    totalLikes: 0,
    totalReplies: 0,
    totalCharacters: 0,
    avgLikesPerCast: 0,
    engagementRate: 0,
    consistencyScore: 0,
  };

  // Calculate total likes and replies
  casts.forEach((cast) => {
    metrics.totalLikes += cast.reactions?.likes_count || 0;
    metrics.totalReplies += cast.replies?.count || 0;
    metrics.totalCharacters += cast.text?.length || 0;
  });

  // Calculate average metrics
  metrics.avgLikesPerCast = metrics.totalLikes / metrics.totalCasts;

  // Engagement rate (likes + replies per cast)
  metrics.engagementRate =
    (metrics.totalLikes + metrics.totalReplies) / metrics.totalCasts;

  // Calculate time-based consistency
  if (casts.length > 1) {
    // Sort casts by timestamp
    const sortedCasts = [...casts].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Calculate average time between posts (in days)
    let totalTimeDiff = 0;
    for (let i = 1; i < sortedCasts.length; i++) {
      const timeDiff =
        new Date(sortedCasts[i].timestamp).getTime() -
        new Date(sortedCasts[i - 1].timestamp).getTime();
      totalTimeDiff += timeDiff;
    }

    const avgTimeBetweenPosts =
      totalTimeDiff / (sortedCasts.length - 1) / (1000 * 60 * 60 * 24);

    // Higher consistency score for more frequent posting (up to a point)
    // Optimal posting frequency considered to be ~1 post per day
    if (avgTimeBetweenPosts <= 1) {
      metrics.consistencyScore = 10;
    } else if (avgTimeBetweenPosts <= 3) {
      metrics.consistencyScore = 7;
    } else if (avgTimeBetweenPosts <= 7) {
      metrics.consistencyScore = 5;
    } else {
      metrics.consistencyScore = 3;
    }
  }

  // Calculate final score (weighted sum of different metrics)
  const score =
    metrics.totalCasts * 2 +
    metrics.avgLikesPerCast * 3 +
    metrics.engagementRate * 5 +
    metrics.consistencyScore * 2;

  // Normalize to a 0-100 scale
  const normalizedScore = Math.min(100, Math.round(score));

  // Calculate Web3 score
  const web3Analysis = analyzeWeb3Content(casts);

  return {
    score: normalizedScore,
    metrics,
    rating: getRating(normalizedScore),
    feedback: generateFeedback(metrics, normalizedScore),
    web3Score: {
      score: web3Analysis.score,
      rating: getWeb3Rating(web3Analysis.score),
      metrics: web3Analysis.metrics,
      expertise: web3Analysis.expertise,
      feedback: web3Analysis.feedback,
    },
  };
}

// Function to analyze Web3 content in casts
function analyzeWeb3Content(casts: any[]) {
  // Initialize metrics for Web3 content analysis
  const metrics: {
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
  } = {
    totalWeb3Mentions: 0,
    blockchainMentions: 0,
    defiMentions: 0,
    nftMentions: 0,
    walletMentions: 0,
    conceptMentions: 0,
    web3Percentage: 0,
    mostDiscussedCategory: "",
    // Track mentions for specific categories
    categories: {
      blockchain: {},
      defi: {},
      nft: {},
      wallet: {},
      concepts: {},
    },
  };

  // Count total casts that mention Web3 topics
  let web3Casts = 0;

  // Process each cast
  casts.forEach((cast) => {
    const text = cast.text.toLowerCase();
    let hasWeb3Content = false;

    // Check for keywords in each category
    Object.entries(web3Keywords).forEach(([category, keywords]) => {
      keywords.forEach((keyword) => {
        if (text.includes(keyword.toLowerCase())) {
          // Increment category counter
          if (category === "blockchain") metrics.blockchainMentions++;
          else if (category === "defi") metrics.defiMentions++;
          else if (category === "nft") metrics.nftMentions++;
          else if (category === "wallet") metrics.walletMentions++;
          else if (category === "concepts") metrics.conceptMentions++;

          metrics.totalWeb3Mentions++;
          hasWeb3Content = true;

          // Track specific keyword mentions
          const categoryMap =
            metrics.categories[category as keyof typeof metrics.categories];
          categoryMap[keyword] = (categoryMap[keyword] || 0) + 1;
        }
      });
    });

    if (hasWeb3Content) {
      web3Casts++;
    }
  });

  // Calculate percentage of casts that mention Web3 topics
  metrics.web3Percentage =
    casts.length > 0 ? (web3Casts / casts.length) * 100 : 0;

  // Determine most discussed category
  const categories = ["blockchain", "defi", "nft", "wallet", "concepts"];
  let maxCategory = "";
  let maxCount = 0;

  categories.forEach((category) => {
    const count =
      category === "blockchain"
        ? metrics.blockchainMentions
        : category === "defi"
        ? metrics.defiMentions
        : category === "nft"
        ? metrics.nftMentions
        : category === "wallet"
        ? metrics.walletMentions
        : metrics.conceptMentions;

    if (count > maxCount) {
      maxCount = count;
      maxCategory = category;
    }
  });

  metrics.mostDiscussedCategory = maxCategory;

  // Calculate Web3 score based on mentions and engagement
  const web3Score = calculateWeb3Score(metrics, casts);

  // Determine areas of expertise
  const expertise = determineWeb3Expertise(metrics);

  // Generate feedback
  const feedback = generateWeb3Feedback(metrics, web3Score);

  return {
    score: web3Score,
    metrics,
    expertise,
    feedback,
  };
}

// Calculate Web3 score based on mentions and engagement
function calculateWeb3Score(metrics: any, casts: any[]) {
  // Base score calculations
  const mentionScore = Math.min(metrics.totalWeb3Mentions * 2, 50);
  const diversityScore = calculateDiversityScore(metrics);
  const percentageScore = metrics.web3Percentage * 0.5;

  // Calculate engagement on Web3 posts
  let web3Engagement = 0;
  let web3CastsCount = 0;

  casts.forEach((cast) => {
    const text = cast.text.toLowerCase();
    let isWeb3Cast = false;

    // Check if cast mentions Web3 topics
    Object.values(web3Keywords)
      .flat()
      .forEach((keyword: string) => {
        if (text.includes(keyword.toLowerCase())) {
          isWeb3Cast = true;
        }
      });

    if (isWeb3Cast) {
      web3CastsCount++;
      web3Engagement +=
        (cast.reactions?.likes_count || 0) + (cast.replies?.count || 0);
    }
  });

  const engagementScore =
    web3CastsCount > 0
      ? Math.min((web3Engagement / web3CastsCount) * 5, 30)
      : 0;

  // Final Web3 score
  const rawScore =
    mentionScore + diversityScore + percentageScore + engagementScore;
  return Math.min(Math.round(rawScore), 100);
}

// Calculate score based on diversity of Web3 topics
function calculateDiversityScore(metrics: any) {
  const categories = ["blockchain", "defi", "nft", "wallet", "concepts"];
  let categoriesWithMentions = 0;

  categories.forEach((category) => {
    if (metrics[category + "Mentions"] > 0) {
      categoriesWithMentions++;
    }
  });

  // 0-20 points based on category diversity
  return categoriesWithMentions * 4;
}

// Determine Web3 expertise areas based on mentions
function determineWeb3Expertise(metrics: any) {
  const expertise = [];
  const threshold = 3; // Minimum mentions to be considered knowledgeable

  // Check expertise in each category
  if (metrics.blockchainMentions >= threshold) {
    // Find most mentioned blockchains
    const blockchains = Object.entries(metrics.categories.blockchain)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 3)
      .map(([chain]) => chain);

    if (blockchains.length > 0) {
      expertise.push(`Blockchain: ${blockchains.join(", ")}`);
    } else {
      expertise.push("Blockchain");
    }
  }

  if (metrics.defiMentions >= threshold) {
    expertise.push("DeFi");
  }

  if (metrics.nftMentions >= threshold) {
    expertise.push("NFTs");
  }

  if (metrics.walletMentions >= threshold) {
    expertise.push("Wallet Security");
  }

  if (metrics.conceptMentions >= threshold) {
    expertise.push("Web3 Concepts");
  }

  return expertise.length > 0 ? expertise : ["Web3 Beginner"];
}

// Generate Web3-specific feedback
function generateWeb3Feedback(metrics: any, score: number) {
  const feedback = [];

  // Low Web3 engagement
  if (metrics.web3Percentage < 20) {
    feedback.push(
      "You could increase your Web3-related content to build more presence in the space."
    );
  }

  // Lack of diversity in topics
  const categories = ["blockchain", "defi", "nft", "wallet", "concepts"];
  let categoriesWithMentions = categories.filter(
    (category) => metrics[category + "Mentions"] > 0
  ).length;

  if (categoriesWithMentions <= 2 && metrics.totalWeb3Mentions > 5) {
    feedback.push(
      "Try diversifying your Web3 content across more topics like DeFi, NFTs, and blockchain technology."
    );
  }

  // Specific category recommendations
  if (metrics.blockchainMentions === 0) {
    feedback.push(
      "Consider discussing specific blockchains to demonstrate technical knowledge."
    );
  }

  if (metrics.defiMentions === 0 && metrics.totalWeb3Mentions > 3) {
    feedback.push(
      "DeFi is a major part of Web3 - engaging with this topic could enhance your profile."
    );
  }

  // Positive feedback for high scores
  if (score >= 70) {
    feedback.push(
      "Your Web3 knowledge shows through your casts! You're building a strong presence in the space."
    );
  } else if (score >= 50) {
    feedback.push(
      "You're actively engaged in Web3 conversations. Keep exploring diverse topics to become a thought leader."
    );
  }

  // Default feedback if none generated
  if (feedback.length === 0) {
    feedback.push(
      "Continue engaging with Web3 topics to build your on-chain reputation."
    );
  }

  return feedback;
}

// Function to get a Web3 expertise rating
function getWeb3Rating(score: number) {
  if (score >= 90) return "Web3 Expert";
  if (score >= 75) return "Web3 Enthusiast";
  if (score >= 60) return "Web3 Conversationalist";
  if (score >= 40) return "Web3 Curious";
  if (score >= 20) return "Web3 Newcomer";
  return "Web3 Observer";
}

// Function to get a rating based on score
function getRating(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Great";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  if (score >= 20) return "Fair";
  return "Beginner";
}

// Function to generate personalized feedback
function generateFeedback(metrics: any, score: number) {
  const feedback = [];

  if (metrics.totalCasts < 5) {
    feedback.push(
      "Try to increase your posting frequency to build a stronger presence."
    );
  }

  if (metrics.avgLikesPerCast < 2) {
    feedback.push(
      "Your posts could generate more engagement. Consider topics that resonate with your audience."
    );
  } else if (metrics.avgLikesPerCast > 10) {
    feedback.push(
      "Your content is getting great engagement! Keep creating similar content."
    );
  }

  if (metrics.consistencyScore < 5) {
    feedback.push(
      "More consistent posting could help build a stronger following."
    );
  }

  if (metrics.totalCharacters / metrics.totalCasts < 50) {
    feedback.push(
      "Your posts are quite short. Consider adding more depth to some of your casts."
    );
  }

  if (feedback.length === 0) {
    if (score >= 75) {
      feedback.push("You're doing great! Keep up the quality content.");
    } else {
      feedback.push("Keep engaging with the community to improve your score.");
    }
  }

  return feedback;
}

// Response structure that we send back to the client
export interface GetScoreResponse {
  displayName: string;
  username: string;
  avatar: string;
  generalScore: {
    score: number;
    metrics: {
      totalCasts: number;
      totalLikes: number;
      totalReplies: number;
      totalRecasts: number;
      avgLikesPerCast: number;
      avgRepliesPerCast: number;
      avgRecastsPerCast: number;
      engagementRate: number;
      activityLevel: string;
    };
    rating: string;
    feedback: string[];
  };
  web3Score: {
    score: number;
    rating: string;
    metrics: {
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
    };
    expertise: string[];
    feedback: string[];
  };
  casts: {
    hash: string;
    text: string;
    timestamp: string;
    mentions: string[];
    likeCount: number;
    replyCount: number;
    recastCount: number;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { fid, username, displayName, pfpUrl, signerUuid } = req.body as {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
    signerUuid?: string;
  };

  if (!fid) {
    return res.status(400).json({ message: "FID is required" });
  }

  try {
    // First, check if we have the user in the database
    let user = await findUserByFid(fid);

    // If we have user data and it was updated in the last hour, use that data
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    if (
      user &&
      user.web3Score &&
      user.generalScore &&
      user.casts &&
      user.casts.length > 0 &&
      new Date(user.updatedAt) > oneHourAgo
    ) {
      // Use cached data
      return res.status(200).json({
        message: "Score retrieved from database",
        data: {
          casts: user.casts,
          score: {
            score: user.generalScore.score,
            metrics: user.generalScore.metrics,
            rating: user.generalScore.rating,
            feedback: user.generalScore.feedback,
            web3Score: user.web3Score,
          },
        },
      });
    }

    // Fetch user's recent casts
    const response = await client.fetchCastsForUser({ fid, limit: 25 });

    // Calculate score based on casts
    const scoreData = calculateUserScore(response.casts);

    // Create or update user in the database
    const userData = {
      fid,
      username: username || `farcaster_${fid}`, // Default username if not provided
      displayName: displayName || username || `User ${fid}`, // Default displayName using username or fid
      pfpUrl,
      signerUuid,
    };

    if (!user) {
      // Create new user
      user = await createOrUpdateUser(userData);
    }

    // Update user with latest data
    await updateUserData(fid, {
      casts: response.casts,
      generalScore: {
        score: scoreData.score,
        metrics: scoreData.metrics,
        rating: scoreData.rating,
        feedback: scoreData.feedback,
        updatedAt: new Date(),
      },
      web3Score: {
        score: scoreData.web3Score.score,
        rating: scoreData.web3Score.rating,
        metrics: scoreData.web3Score.metrics,
        expertise: scoreData.web3Score.expertise,
        feedback: scoreData.web3Score.feedback,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      message: "Score calculated successfully",
      data: {
        casts: response.casts,
        score: scoreData,
      },
    });
  } catch (err) {
    console.error("Error fetching casts:", err);
    if (isApiErrorResponse(err)) {
      return res.status(err.response.status).json({
        ...err.response.data,
      });
    } else {
      return res.status(500).json({
        message: "Something went wrong",
      });
    }
  }
}
