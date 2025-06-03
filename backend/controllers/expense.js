const { CohereClient } = require("cohere-ai");
const db = require("../db");

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const verifyToken = require("../middleware/verifyToken");

// Helper function to clean and process AI response
function processAIResponse(rawResponse, categoryMap) {
  if (!rawResponse) return null;
  
  // Step 1: Basic cleanup
  let cleaned = rawResponse
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]/g, '') // Remove punctuation
    .replace(/^\"|\"$/g, '') // Remove surrounding quotes
    .replace(/^'|'$/g, '') // Remove surrounding single quotes
    .replace(/\s+/g, ' '); // Normalize whitespace
  
  // Step 2: Handle common AI response patterns
  // Remove common prefixes that AI might add
  const prefixesToRemove = [
    'the category is',
    'category:',
    'answer:',
    'result:',
    'category name:',
    'best match:',
    'matching category:',
    'i would categorize this as',
    'this belongs to',
    'this falls under'
  ];
  
  for (const prefix of prefixesToRemove) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length).trim();
      break;
    }
  }
  
  // Step 3: Extract first meaningful word/phrase
  // Split on various delimiters and take first part
  let candidate = cleaned.split(/[,|/;\n\t]/)[0].trim();
  
  // Step 4: Try exact match first
  if (categoryMap[candidate]) {
    return candidate;
  }
  
  // Step 5: Try partial matching for common variations
  const categoryKeys = Object.keys(categoryMap);
  
  // Try removing 's' for plurals
  if (candidate.endsWith('s')) {
    const singular = candidate.slice(0, -1);
    if (categoryMap[singular]) {
      return singular;
    }
  }
  
  // Try adding 's' for plurals
  const plural = candidate + 's';
  if (categoryMap[plural]) {
    return plural;
  }
  
  // Step 6: Try fuzzy matching (contains/included in)
  for (const categoryKey of categoryKeys) {
    // Check if candidate contains category name
    if (candidate.includes(categoryKey) || categoryKey.includes(candidate)) {
      return categoryKey;
    }
  }
  
  // Step 7: Try common synonyms/variations
  const synonymMap = {
    'groceries': 'food',
    'gas': 'fuel',
    'gasoline': 'fuel',
    'petrol': 'fuel',
    'dining': 'food',
    'restaurant': 'food',
    'eating': 'food',
    'meal': 'food',
    'shopping': 'retail',
    'clothes': 'clothing',
    'apparel': 'clothing',
    'car': 'transportation',
    'vehicle': 'transportation',
    'taxi': 'transportation',
    'uber': 'transportation',
    'lyft': 'transportation',
    'medical': 'healthcare',
    'doctor': 'healthcare',
    'hospital': 'healthcare',
    'pharmacy': 'healthcare',
    'medicine': 'healthcare',
    'utility': 'utilities',
    'electric': 'utilities',
    'electricity': 'utilities',
    'water': 'utilities',
    'internet': 'utilities',
    'phone': 'utilities',
  };
  
  // Check if candidate matches any synonym
  if (synonymMap[candidate] && categoryMap[synonymMap[candidate]]) {
    return synonymMap[candidate];
  }
  
  // Step 8: Last resort - find closest match by word similarity
  let bestMatch = null;
  let bestScore = 0;
  
  for (const categoryKey of categoryKeys) {
    const similarity = calculateSimilarity(candidate, categoryKey);
    if (similarity > bestScore && similarity > 0.6) { // 60% similarity threshold
      bestScore = similarity;
      bestMatch = categoryKey;
    }
  }
  
  return bestMatch;
}

// Simple string similarity function (Jaccard similarity)
function calculateSimilarity(str1, str2) {
  const set1 = new Set(str1.split(''));
  const set2 = new Set(str2.split(''));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

exports.addExpense = [
  verifyToken,
  async (req, res) => {
    const { amount, description } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ message: "Amount and description are required!" });
    }

    const parsedAmount = parseFloat(amount).toFixed(2);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number!" });
    }

    try {
      // Fetch categories from database
      const [categoryRows] = await db.query("SELECT id, name FROM categories");
      const categoryMap = {};
      for (const row of categoryRows) {
        categoryMap[row.name.toLowerCase()] = row.id;
      }

      // Improved prompt with better instructions
      const categoryList = Object.keys(categoryMap).join(", ");
      const prompt = `You are a financial categorization assistant. Your job is to match expense descriptions to predefined categories.

Available categories: ${categoryList}

Rules:
1. Return ONLY the category name from the list above
2. Choose the MOST appropriate category
3. Do not add punctuation, explanations, or extra words
4. If unsure, choose the closest match

Expense description: "${description}"

Category:`;

      // Call Cohere API with improved parameters
      const response = await cohere.generate({
        model: "command",
        prompt,
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 15, // Slightly more tokens for category names
        stop_sequences: ["\n", ".", "!", "?", ";"], // Stop on punctuation
      });

      if (!response.generations || !response.generations[0]) {
        console.error("Invalid response from Cohere:", response);
        throw new Error("AI response was invalid");
      }

      const rawPrediction = response.generations[0].text;

      // Process the AI response with improved logic
      const predictedCategory = processAIResponse(rawPrediction, categoryMap);

      if (!predictedCategory) {
        console.error("Could not match AI response to any category:", rawPrediction);
        // Default to a general category or create "Other" category
        throw new Error("Could not categorize expense");
      }

      const category_id = categoryMap[predictedCategory];

      // Insert expense into database
      const [result] = await db.query(
        "INSERT INTO expenses (user_id, amount, description, category_id) VALUES (?, ?, ?, ?)",
        [req.user.id, parsedAmount, description, category_id]
      );

      res.status(200).json({
        message: "Expense Added",
        expenseId: result.insertId,
        predictedCategory: predictedCategory,
        confidence: "high" // You could implement confidence scoring
      });
      
    } catch (error) {
      console.error("Error adding expense with AI:", error);
      
      // Fallback: Try to add expense without AI categorization
      try {
        // Get a default "Other" or "Miscellaneous" category
        const [defaultCategory] = await db.query(
          "SELECT id FROM categories WHERE name IN ('other', 'miscellaneous', 'general') LIMIT 1"
        );
        
        if (defaultCategory.length > 0) {
          const [result] = await db.query(
            "INSERT INTO expenses (user_id, amount, description, category_id) VALUES (?, ?, ?, ?)",
            [req.user.id, parsedAmount, description, defaultCategory[0].id]
          );
          
          res.status(200).json({
            message: "Expense Added (manual categorization needed)",
            expenseId: result.insertId,
            predictedCategory: "other",
            warning: "AI categorization failed, defaulted to 'Other'"
          });
        } else {
          res.status(500).json({ 
            message: "Server Error: Could not categorize expense and no default category available" 
          });
        }
      } catch (fallbackError) {
        console.error("Fallback insertion also failed:", fallbackError);
        res.status(500).json({ message: "Server Error" });
      }
    }
  },
];

// Get all expenses for logged-in user only
exports.getAllExpenses = [
  verifyToken,
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
  verifyToken,
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
  verifyToken,
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
