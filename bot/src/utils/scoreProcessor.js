import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const API_URL = process.env.API_URL || "http://localhost:3000";

/**
 * Fetch a user's score from the API
 * @param {Object} userInfo - User information with fid, username, and other details
 * @returns {Promise<Object>} - The user's score data
 */
export async function getUserScore(userInfo) {
  try {
    const response = await fetch(`${API_URL}/api/getScore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fid: userInfo.fid,
        username: userInfo.username,
        displayName: userInfo.displayName,
        pfpUrl: userInfo.pfpUrl,
        signerUuid: userInfo.signerUuid,
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching user score:", error);
    throw error;
  }
}

/**
 * Generate a human-readable score report
 * @param {Object} scoreData - User score data from the API
 * @returns {String} - Human-readable score report
 */
export function generateScoreReport(scoreData) {
  if (!scoreData || !scoreData.score) {
    return "No score data available for this user.";
  }

  const { score, web3Score } = scoreData;

  let report = `📊 **Score Report**\n\n`;
  report += `Overall Score: ${score.score}/100\n`;
  report += `Rating: ${score.rating}\n\n`;

  report += `📈 **Activity Metrics**\n`;
  report += `Total Casts: ${score.metrics.totalCasts}\n`;
  report += `Total Likes: ${score.metrics.totalLikes}\n`;
  report += `Engagement Rate: ${(score.metrics.engagementRate * 100).toFixed(
    2
  )}%\n\n`;

  if (web3Score) {
    report += `🌐 **Web3 Score: ${web3Score.score}/100**\n`;
    report += `Rating: ${web3Score.rating}\n`;
    report += `Most Discussed: ${web3Score.metrics.mostDiscussedCategory}\n\n`;

    if (web3Score.expertise && web3Score.expertise.length > 0) {
      report += `💡 **Expertise Areas**\n`;
      web3Score.expertise.forEach((area) => (report += `- ${area}\n`));
      report += "\n";
    }
  }

  if (score.feedback && score.feedback.length > 0) {
    report += `🔍 **Feedback**\n`;
    score.feedback.forEach((item) => (report += `- ${item}\n`));
  }

  return report;
}

/**
 * Answer user questions about their score or Web3 activity
 * @param {String} question - The user's question
 * @param {Object} scoreData - User score data from the API
 * @returns {String} - Answer to the user's question
 */
export function answerScoreQuestion(question, scoreData) {
  if (!scoreData || !scoreData.score) {
    return "I don't have enough information about your activity to answer that question.";
  }

  const lowercaseQuestion = question.toLowerCase();

  // Questions about overall score
  if (
    lowercaseQuestion.includes("overall score") ||
    lowercaseQuestion.includes("my score")
  ) {
    return `Your overall score is ${scoreData.score.score}/100, which gives you a rating of "${scoreData.score.rating}".`;
  }

  // Questions about Web3 score
  if (
    lowercaseQuestion.includes("web3 score") ||
    lowercaseQuestion.includes("crypto score")
  ) {
    if (scoreData.web3Score) {
      return `Your Web3 score is ${
        scoreData.web3Score.score
      }/100, with a rating of "${scoreData.web3Score.rating}". ${
        scoreData.web3Score.feedback
          ? "Here's some feedback: " + scoreData.web3Score.feedback[0]
          : ""
      }`;
    } else {
      return "I don't have information about your Web3 activity yet.";
    }
  }

  // Questions about activity
  if (
    lowercaseQuestion.includes("activity") ||
    lowercaseQuestion.includes("post") ||
    lowercaseQuestion.includes("cast")
  ) {
    return `You have created ${
      scoreData.score.metrics.totalCasts
    } casts, received ${
      scoreData.score.metrics.totalLikes
    } likes, and your engagement rate is ${(
      scoreData.score.metrics.engagementRate * 100
    ).toFixed(2)}%.`;
  }

  // Questions about how to improve
  if (
    lowercaseQuestion.includes("improve") ||
    lowercaseQuestion.includes("better") ||
    lowercaseQuestion.includes("increase")
  ) {
    if (scoreData.score.feedback && scoreData.score.feedback.length > 0) {
      return `Here's how you can improve your score: ${scoreData.score.feedback.join(
        " "
      )}`;
    } else {
      return "To improve your score, try posting more frequently, engaging with others' content, and discussing Web3 topics.";
    }
  }

  // Default response
  return "I can provide information about your overall score, Web3 activity, post history, and suggestions for improvement. What would you like to know?";
}

export default {
  getUserScore,
  generateScoreReport,
  answerScoreQuestion,
};
