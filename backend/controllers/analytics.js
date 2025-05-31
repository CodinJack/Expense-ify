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
    let summaryText = `Here are my categorized expenses:\n`;
    for (const row of categorySummary) {
      summaryText += `- ${row.category}: ₹${row.total}\n`;
    }

    summaryText += `\nMonthly trend:\n`;
    for (const row of monthlyTrend) {
      summaryText += `- ${row.month}: ₹${row.total}\n`;
    }

    // Use Cohere to generate a summary
    const response = await cohere.generate({
      model: 'command-light',
      prompt: `Summarize this expense data in simple language for a user:\n\n${summaryText}`,
      max_tokens: 150,
      temperature: 0.5,
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
