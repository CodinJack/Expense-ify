const db = require("../db");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

// Middleware to check authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
}

exports.exportCSV = [
  ensureAuthenticated,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const [expenses] = await db.query(`
        SELECT e.id, e.amount, e.description, c.name AS category, e.created_at
        FROM expenses e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = ?
        ORDER BY e.created_at DESC
      `, [userId]);

      const fields = ['id', 'amount', 'description', 'category', 'created_at'];
      const parser = new Parser({ fields });
      const csv = parser.parse(expenses);

      res.header("Content-Type", "text/csv");
      res.attachment("expenses.csv");
      return res.send(csv);
    } catch (err) {
      console.error("CSV Export Error:", err);
      res.status(500).json({ message: "Failed to export CSV" });
    }
  }
];

exports.exportPDF = [
  ensureAuthenticated,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const [expenses] = await db.query(`
        SELECT e.amount, e.description, c.name AS category, e.created_at
        FROM expenses e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = ?
        ORDER BY e.created_at DESC
      `, [userId]);

      const doc = new PDFDocument({ margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=expenses.pdf");
      doc.pipe(res);

      // Title
      doc.fontSize(20).text("Expense Report", { align: "center" });
      doc.moveDown(1.5);

      // Table Headers
      const tableTop = doc.y;
      const colWidths = { date: 100, desc: 200, cat: 100, amount: 100 };
      const startX = 50;

      // Draw header background
      doc.rect(startX, tableTop, colWidths.date + colWidths.desc + colWidths.cat + colWidths.amount, 25)
        .fill("#f0f0f0")
        .stroke();

      doc
        .fillColor("black")
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Date", startX + 5, tableTop + 7, { width: colWidths.date })
        .text("Description", startX + colWidths.date + 5, tableTop + 7, { width: colWidths.desc })
        .text("Category", startX + colWidths.date + colWidths.desc + 5, tableTop + 7, { width: colWidths.cat })
        .text("Amount (₹)", startX + colWidths.date + colWidths.desc + colWidths.cat + 5, tableTop + 7, { width: colWidths.amount });

      doc.moveDown();
      doc.font("Helvetica");

      let y = tableTop + 30;
      for (const exp of expenses) {
        const date = new Date(exp.created_at).toLocaleDateString();

        // Draw row background
        doc.rect(startX, y, colWidths.date + colWidths.desc + colWidths.cat + colWidths.amount, 25)
          .fill(y % 2 === 0 ? "#ffffff" : "#f9f9f9")
          .stroke();

        doc
          .fillColor("black")
          .text(date, startX + 5, y + 7, { width: colWidths.date })
          .text(exp.description, startX + colWidths.date + 5, y + 7, { width: colWidths.desc })
          .text(exp.category || "Uncategorized", startX + colWidths.date + colWidths.desc + 5, y + 7, { width: colWidths.cat })
          .text(`₹${exp.amount}`, startX + colWidths.date + colWidths.desc + colWidths.cat + 5, y + 7, { width: colWidths.amount });

        y += 25;

        // Page break
        if (y > doc.page.height - 50) {
          doc.addPage();
          y = 50;
        }
      }

      doc.end();
    } catch (err) {
      console.error("PDF Export Error:", err);
      res.status(500).json({ message: "Failed to export PDF" });
    }
  }
];
