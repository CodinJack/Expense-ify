const db = require('../db'); 


// Add a new expense
exports.addExpense = async (req, res) => {
  const { title, amount, date, description } = req.body;

  if (!title || !description || !date) {
    return res.status(400).json({ message: 'All fields are required!' });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number!' });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: 'Invalid date format!' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO expenses (title, amount, date, description) VALUES (?, ?, ?, ?)',
      [title, parsedAmount, parsedDate, description]
    );

    res.status(200).json({ message: 'Expense Added', expenseId: result.insertId });
  } catch (error) {
    console.error('Error inserting expense: ', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const [expenses] = await db.query('SELECT * FROM expenses ORDER BY created_at DESC');
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching expenses: ', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get expense by ID
exports.getExpenseByID = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM expenses WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching expense: ', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete expense by ID
exports.deleteExpenseByID = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM expenses WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json({ message: 'Expense Deleted' });
  } catch (error) {
    console.error('Error deleting expense: ', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
