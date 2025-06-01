const { CohereClient } = require("cohere-ai");
const db = require("../db");

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

exports.getExpenseSummary = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const userId = req.user.id;

    // Total spent per category
    const [categorySummary] = await db.query(`
      SELECT c.name AS category, SUM(e.amount) AS total
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ?
      GROUP BY e.category_id
    `, [userId]);

    // Monthly trend
    const [monthlyTrend] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(amount) AS total
      FROM expenses
      WHERE user_id = ?
      GROUP BY month
      ORDER BY month
    `, [userId]);

    // Prepare summary text for AI
    let summaryText = `You are analyzing a user's expense data for a financial dashboard. Write a concise summary (1–2 paragraphs) containing:\n` +
  `1. A short analysis of where the user spends most of their money (based on category totals).\n` +
  `2. A brief description of the monthly trend (are they spending more/less each month).\n` +
  `You only have 120 tokens to give summary.` +
  `Only include the analysis (no introductions or conclusions like "here's your summary"). Use simple, clear language.\n\n` +
  `Category Totals:\n`;
    for (const row of categorySummary) {
      summaryText += `- ${row.category}: ₹${row.total}\n`;
    }

    summaryText += `\nMonthly trend:\n`;
    for (const row of monthlyTrend) {
      summaryText += `- ${row.month}: ₹${row.total}\n`;
    }

    // Use Cohere to generate a summary
    const response = await cohere.generate({
      model: 'command',
      prompt: summaryText,
      max_tokens: 120,
      temperature: 0.4,
    });
    if (!response.generations || !response.generations[0]) {
    console.error("Invalid response from Cohere:", response);
    throw new Error("AI response was invalid");
    }

    const aiSummary = response.generations?.[0]?.text?.trim() || "No summary generated.";

    res.status(200).json({
      summary: aiSummary,
      rawData: { categorySummary, monthlyTrend }
    });
  } catch (error) {
    console.error("Error generating AI summary:", error);
    res.status(500).json({ message: "Server error" });
  }
};
