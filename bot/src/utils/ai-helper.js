import fetch from "node-fetch";

/**
 * Utility class for AI integrations
 */
class AIHelper {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY;
    this.context = [];
    this.maxContextLength = 10; // Keep track of last 10 interactions
  }

  /**
   * Add message to conversation context
   * @param {string} role - 'user', 'assistant', or 'system'
   * @param {string} content - Message content
   */
  addToContext(role, content) {
    this.context.push({ role, content });

    // Trim context if it exceeds max length
    if (this.context.length > this.maxContextLength) {
      this.context.shift();
    }
  }

  /**
   * Clear conversation context
   */
  clearContext() {
    this.context = [];
  }

  /**
   * Generate AI response using Anthropic Claude API
   * @param {string} prompt - User prompt
   * @param {object} options - Additional options
   * @returns {Promise<string>} - AI response
   */
  async generateResponse(prompt, options = {}) {
    // If no API key is set, return a default response
    if (!this.apiKey) {
      console.warn("No Anthropic API key provided. Using fallback response.");
      return this.getFallbackResponse(prompt);
    }

    try {
      // Add user message to context
      this.addToContext("user", prompt);

      // Prepare system prompt
      const systemPrompt =
        options.systemPrompt ||
        "You are a helpful community assistant for a Discord server.";

      // Make API call to Anthropic's Claude
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: options.model || "claude-3-sonnet-20240229",
          max_tokens: options.maxTokens || 500,
          temperature: options.temperature || 0.7,
          system: systemPrompt,
          messages: this.context.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error from Claude API:", data);
        return this.getFallbackResponse(prompt);
      }

      const aiResponse = data.content[0].text;

      // Add assistant response to context
      this.addToContext("assistant", aiResponse);

      return aiResponse;
    } catch (error) {
      console.error("Error generating AI response:", error);
      return this.getFallbackResponse(prompt);
    }
  }

  /**
   * Get a fallback response when AI integration is unavailable
   * @param {string} prompt - User prompt
   * @returns {string} - Fallback response
   */
  getFallbackResponse(prompt) {
    const fallbackResponses = [
      "I'm here to help! What can I do for you?",
      "Let me know if you need assistance with anything.",
      "I'm your community assistant. How can I help you today?",
      "I'm available to answer questions about the community.",
      "Need help? Just let me know what you're looking for.",
    ];

    // Simple keyword matching for better responses
    if (
      prompt.toLowerCase().includes("hello") ||
      prompt.toLowerCase().includes("hi")
    ) {
      return "Hello! How can I assist you today?";
    }

    if (prompt.toLowerCase().includes("help")) {
      return "I'd be happy to help! What do you need assistance with?";
    }

    if (prompt.toLowerCase().includes("thank")) {
      return "You're welcome! Let me know if you need anything else.";
    }

    // Return a random fallback response
    return fallbackResponses[
      Math.floor(Math.random() * fallbackResponses.length)
    ];
  }

  /**
   * Analyze text for sentiment and moderation
   * @param {string} text - Text to analyze
   * @returns {object} - Analysis results
   */
  analyzeText(text) {
    // Simple keyword-based analysis
    // In a real implementation, this would use AI or a more sophisticated algorithm
    const analysis = {
      sentiment: "neutral",
      toxicity: 0,
      needsModeration: false,
    };

    // Simple sentiment analysis
    const positiveWords = [
      "good",
      "great",
      "excellent",
      "amazing",
      "thank",
      "thanks",
      "appreciate",
      "happy",
      "love",
    ];
    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "hate",
      "dislike",
      "angry",
      "upset",
      "disappointed",
    ];

    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of positiveWords) {
      if (text.toLowerCase().includes(word)) positiveCount++;
    }

    for (const word of negativeWords) {
      if (text.toLowerCase().includes(word)) negativeCount++;
    }

    if (positiveCount > negativeCount) {
      analysis.sentiment = "positive";
    } else if (negativeCount > positiveCount) {
      analysis.sentiment = "negative";
    }

    // Simple toxicity detection
    // This is a very basic implementation and should be replaced with a proper moderation API
    const toxicWords = ["profanity1", "profanity2"]; // Replace with actual words

    let toxicCount = 0;
    for (const word of toxicWords) {
      if (text.toLowerCase().includes(word)) toxicCount++;
    }

    analysis.toxicity = toxicCount / text.split(" ").length;
    analysis.needsModeration = analysis.toxicity > 0.1;

    return analysis;
  }

  /**
   * Summarize a conversation
   * @param {Array} messages - Array of messages to summarize
   * @returns {Promise<string>} - Summary of the conversation
   */
  async summarizeConversation(messages) {
    if (!this.apiKey) {
      return "I can't generate a summary without an AI API key.";
    }

    try {
      const messagesText = messages
        .map((m) => `${m.author}: ${m.content}`)
        .join("\n");
      const prompt = `Please summarize the following conversation in 3-5 key points:\n\n${messagesText}`;

      return await this.generateResponse(prompt, {
        systemPrompt:
          "You summarize Discord conversations concisely and accurately.",
        maxTokens: 300,
      });
    } catch (error) {
      console.error("Error summarizing conversation:", error);
      return "I couldn't generate a summary at this time.";
    }
  }
}

export default AIHelper;
