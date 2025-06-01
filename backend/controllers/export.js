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
      res.attachment("expenses_report.csv");
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

      // Calculate totals for summary
      const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      const categorySummary = expenses.reduce((acc, exp) => {
        const cat = exp.category || "Uncategorized";
        acc[cat] = (acc[cat] || 0) + parseFloat(exp.amount);
        return acc;
      }, {});

      const doc = new PDFDocument({ 
        margin: 40,
        size: 'A4'
      });
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=expense_report.pdf");
      doc.pipe(res);

      // Colors
      const primaryColor = '#2563eb';
      const secondaryColor = '#f8fafc';
      const accentColor = '#e2e8f0';
      const textColor = '#1e293b';
      const mutedColor = '#64748b';

      // Header with gradient-like effect
      doc.rect(0, 0, doc.page.width, 120)
         .fill(primaryColor);

      doc.rect(0, 100, doc.page.width, 20)
         .fill('#1d4ed8');

      // Title and subtitle
      doc.fillColor('white')
         .font('Helvetica-Bold')
         .fontSize(28)
         .text('EXPENSE REPORT', 40, 35, { align: 'left' });

      doc.font('Helvetica')
         .fontSize(14)
         .fillColor('#e2e8f0')
         .text(`Generated on ${new Date().toLocaleDateString('en-US', { 
           year: 'numeric', 
           month: 'long', 
           day: 'numeric' 
         })}`, 40, 70);

      doc.moveDown(1);

      // Summary Cards Section
      const cardY = 140;
      const cardWidth = 160;
      const cardHeight = 80;
      const cardSpacing = 20;

      // Total Expenses Card
      doc.rect(40, cardY, cardWidth, cardHeight)
         .fill(secondaryColor)
         .stroke(accentColor);

      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(24)
         .text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, 50, cardY + 20, { width: cardWidth - 20, align: 'center' });

      doc.fillColor(mutedColor)
         .font('Helvetica')
         .fontSize(11)
         .text('Total Expenses', 50, cardY + 50, { width: cardWidth - 20, align: 'center' });

      // Total Transactions Card
      doc.rect(40 + cardWidth + cardSpacing, cardY, cardWidth, cardHeight)
         .fill(secondaryColor)
         .stroke(accentColor);

      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(24)
         .text(expenses.length.toString(), 50 + cardWidth + cardSpacing, cardY + 20, { width: cardWidth - 20, align: 'center' });

      doc.fillColor(mutedColor)
         .font('Helvetica')
         .fontSize(11)
         .text('Total Transactions', 50 + cardWidth + cardSpacing, cardY + 50, { width: cardWidth - 20, align: 'center' });

      // Categories Card
      doc.rect(40 + (cardWidth + cardSpacing) * 2, cardY, cardWidth, cardHeight)
         .fill(secondaryColor)
         .stroke(accentColor);

      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(24)
         .text(Object.keys(categorySummary).length.toString(), 50 + (cardWidth + cardSpacing) * 2, cardY + 20, { width: cardWidth - 20, align: 'center' });

      doc.fillColor(mutedColor)
         .font('Helvetica')
         .fontSize(11)
         .text('Categories', 50 + (cardWidth + cardSpacing) * 2, cardY + 50, { width: cardWidth - 20, align: 'center' });

      // Detailed Transactions Section
      doc.fillColor(textColor)
         .font('Helvetica-Bold')
         .fontSize(18)
         .text('Transaction Details', 40, cardY + cardHeight + 40);

      // Enhanced Table
      const tableTop = cardY + cardHeight + 80;
      const colWidths = { date: 100, desc: 220, cat: 120, amount: 100 };
      const startX = 40;
      const tableWidth = colWidths.date + colWidths.desc + colWidths.cat + colWidths.amount;

      // Table header with enhanced styling
      doc.rect(startX, tableTop, tableWidth, 35)
         .fill(primaryColor);

      doc.fillColor('white')
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('DATE', startX + 10, tableTop + 12, { width: colWidths.date - 20 })
         .text('DESCRIPTION', startX + colWidths.date + 10, tableTop + 12, { width: colWidths.desc - 20 })
         .text('CATEGORY', startX + colWidths.date + colWidths.desc + 10, tableTop + 12, { width: colWidths.cat - 20 })
         .text('AMOUNT', startX + colWidths.date + colWidths.desc + colWidths.cat + 10, tableTop + 12, { width: colWidths.amount - 20, align: 'right' });

      let y = tableTop + 35;
      let rowIndex = 0;

      for (const exp of expenses) {
        // Check for page break
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = 60;
          
          // Redraw header on new page
          doc.rect(startX, y - 35, tableWidth, 35)
             .fill(primaryColor);

          doc.fillColor('white')
             .font('Helvetica-Bold')
             .fontSize(12)
             .text('DATE', startX + 10, y - 23, { width: colWidths.date - 20 })
             .text('DESCRIPTION', startX + colWidths.date + 10, y - 23, { width: colWidths.desc - 20 })
             .text('CATEGORY', startX + colWidths.date + colWidths.desc + 10, y - 23, { width: colWidths.cat - 20 })
             .text('AMOUNT', startX + colWidths.date + colWidths.desc + colWidths.cat + 10, y - 23, { width: colWidths.amount - 20, align: 'right' });
        }

        const date = new Date(exp.created_at).toLocaleDateString('en-IN');
        const isEvenRow = rowIndex % 2 === 0;
        const rowHeight = 30;

        // Alternating row colors
        doc.rect(startX, y, tableWidth, rowHeight)
           .fill(isEvenRow ? '#ffffff' : '#f8fafc')
           .stroke('#e2e8f0');

        // Row content with improved typography
        doc.fillColor(textColor)
           .font('Helvetica')
           .fontSize(10)
           .text(date, startX + 10, y + 10, { width: colWidths.date - 20 })
           .text(exp.description.length > 35 ? exp.description.substring(0, 32) + '...' : exp.description, 
                 startX + colWidths.date + 10, y + 10, { width: colWidths.desc - 20 })
           .text(exp.category || "Uncategorized", 
                 startX + colWidths.date + colWidths.desc + 10, y + 10, { width: colWidths.cat - 20 });

        // Amount with currency formatting
        doc.fillColor(primaryColor)
           .font('Helvetica-Bold')
           .text(`Rs. ${parseFloat(exp.amount).toLocaleString('en-IN')}`, 
                 startX + colWidths.date + colWidths.desc + colWidths.cat + 10, y + 10, 
                 { width: colWidths.amount - 20, align: 'right' });

        y += rowHeight;
        rowIndex++;
      }

      // Footer with summary
      const footerY = y + 30;
      
      // Summary section
      doc.rect(startX, footerY, tableWidth, 40)
         .fill(secondaryColor)
         .stroke(accentColor);

      doc.fillColor(textColor)
         .font('Helvetica-Bold')
         .fontSize(14)
         .text('TOTAL AMOUNT:', startX + 10, footerY + 15, { width: tableWidth - 120 });

      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(16)
         .text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, 
               startX + tableWidth - 110, footerY + 13, { width: 100, align: 'right' });

      // Add page numbers to current page only
      doc.rect(40, doc.page.height - 60, doc.page.width - 80, 1)
         .fill(accentColor);

      doc.fillColor(mutedColor)
         .font('Helvetica')
         .fontSize(9)
         .text('Page 1', 
               40, doc.page.height - 45, { width: doc.page.width - 80, align: 'center' });

      doc.text('Expense Management System', 
               40, doc.page.height - 30, { width: doc.page.width - 80, align: 'center' });

      doc.end();
    } catch (err) {
      console.error("PDF Export Error:", err);
      res.status(500).json({ message: "Failed to export PDF" });
    }
  }
];