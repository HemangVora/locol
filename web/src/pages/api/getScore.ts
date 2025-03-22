import { NextApiRequest, NextApiResponse } from "next";
import { NeynarAPIClient, isApiErrorResponse } from "@neynar/nodejs-sdk";

// Create Neynar API client with API key
const client = new NeynarAPIClient({
  apiKey: process.env.NEYNAR_API_KEY!,
});

// Function to calculate a user's score based on their casts
function calculateUserScore(casts: any[]) {
  if (!casts || casts.length === 0) return 0;

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

  return {
    score: normalizedScore,
    metrics,
    rating: getRating(normalizedScore),
    feedback: generateFeedback(metrics, normalizedScore),
  };
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { fid } = req.body as { fid: number };

  if (!fid) {
    return res.status(400).json({ message: "FID is required" });
  }

  try {
    // Fetch user's recent casts
    const response = await client.fetchCastsForUser({ fid, limit: 25 });

    // Calculate score based on casts
    const scoreData = calculateUserScore(response.casts);

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
