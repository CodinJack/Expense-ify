const { CohereClient } = require("cohere-ai");
const db = require("../db");

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized: Please log in' });
}

exports.addExpense = [
  ensureAuthenticated,
  async (req, res) => {
    const { amount, description } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ message: "Amount and description are required!" });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number!" });
    }

    try {
      // Fetch categories
      const [categoryRows] = await db.query("SELECT id, name FROM categories");
      const categoryMap = {};
      for (const row of categoryRows) {
        categoryMap[row.name.toLowerCase()] = row.id;
      }

      // Create prompt for generation
    const prompt = `Given the following expense description, return the best matching category from this list: ${Object.keys(categoryMap).join(", ")}.\n\nExpense: "${description}"\nCategory:`;

    const response = await cohere.generate({
    model: "command-light",
    prompt,
    temperature: 0.0,
    max_tokens: 10,
    stop_sequences: ["\n"],
    });

    if (!response.generations || !response.generations[0]) {
    console.error("Invalid response from Cohere:", response);
    throw new Error("AI response was invalid");
    }

    let rawPrediction = response.generations[0].text.trim().toLowerCase();
    let predictedName = rawPrediction.split(/[,|/]/)[0].trim();  // Split on comma, slash, or pipe

      // Simple cleanup for plural
      if (!categoryMap[predictedName] && predictedName.endsWith("s")) {
        predictedName = predictedName.slice(0, -1);
      }

      const category_id = categoryMap[predictedName] || null;

      // Insert into DB
      const [result] = await db.query(
        "INSERT INTO expenses (user_id, amount, description, category_id) VALUES (?, ?, ?, ?)",
        [req.user.id, parsedAmount, description, category_id]
      );

      res.status(200).json({
        message: "Expense Added",
        expenseId: result.insertId,
        predictedCategory: predictedName || "Uncategorized",
      });
    } catch (error) {
      console.error("Error adding expense with AI:", error);
      res.status(500).json({ message: "Server Error" });
    }
  },
];


// Get all expenses for logged-in user only
exports.getAllExpenses = [
  ensureAuthenticated,
  async (req, res) => {
    try {
      const [expenses] = await db.query(
        'SELECT e.id, e.amount, e.description, c.name as category, e.created_at as date FROM expenses e JOIN categories c where e.category_id = c.id and  user_id = ? ORDER BY date DESC;',
        [req.user.id]
      );
      res.status(200).json(expenses);
    } catch (error) {
      console.error('Error fetching expenses: ', error);
      res.status(500).json({ message: 'Server Error' });
    }
  },
];

// Get expense by ID (only if it belongs to logged-in user)
exports.getExpenseByID = [
  ensureAuthenticated,
  async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await db.query(
        'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
        [id, req.user.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Expense not found or unauthorized' });
      }
      res.status(200).json(rows[0]);
    } catch (error) {
      console.error('Error fetching expense: ', error);
      res.status(500).json({ message: 'Server Error' });
    }
  },
];

// Delete expense by ID (only if it belongs to logged-in user)
exports.deleteExpenseByID = [
  ensureAuthenticated,
  async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await db.query(
        'DELETE FROM expenses WHERE id = ? AND user_id = ?',
        [id, req.user.id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Expense not found or unauthorized' });
      }
      res.status(200).json({ message: 'Expense Deleted' });
    } catch (error) {
      console.error('Error deleting expense: ', error);
      res.status(500).json({ message: 'Server Error' });
    }
  },
];
