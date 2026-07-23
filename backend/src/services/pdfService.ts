import PDFDocument from 'pdfkit';
import { Response } from 'express';

export const generateTransactionsPDF = (
  res: Response,
  userName: string,
  transactions: any[]
): void => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Stream PDF to the Express response
  doc.pipe(res);

  // Colors
  const primaryColor = '#10B981';
  const textColor = '#1E293B';
  const lightTextColor = '#64748B';
  const tableHeaderBg = '#F8FAFC';
  const incomeColor = '#10B981';
  const expenseColor = '#EF4444';

  // Title & Header
  doc
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .fontSize(24)
    .text('MoneyMate', 50, 50);

  doc
    .fillColor(textColor)
    .font('Helvetica')
    .fontSize(10)
    .text('Financial Account Statement', 50, 75);

  doc
    .fillColor(lightTextColor)
    .text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 50, 90)
    .text(`Client: ${userName}`, 50, 105);

  doc.moveDown(2);

  // Financial Summary Cards
  const incomeVal = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseVal = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balanceVal = incomeVal - expenseVal;

  const summaryTop = 135;
  doc
    .rect(50, summaryTop, 150, 60)
    .fillColor('#ECFDF5')
    .fill()
    .strokeColor('#A7F3D0')
    .stroke();
  doc
    .fillColor(incomeColor)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text('TOTAL INCOME', 60, summaryTop + 12)
    .fontSize(13)
    .text(`INR ${incomeVal.toLocaleString('en-IN')}`, 60, summaryTop + 28);

  doc
    .rect(215, summaryTop, 150, 60)
    .fillColor('#FEF2F2')
    .fill()
    .strokeColor('#FCA5A5')
    .stroke();
  doc
    .fillColor(expenseColor)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text('TOTAL EXPENSES', 225, summaryTop + 12)
    .fontSize(13)
    .text(`INR ${expenseVal.toLocaleString('en-IN')}`, 225, summaryTop + 28);

  doc
    .rect(380, summaryTop, 165, 60)
    .fillColor('#EEF2F6')
    .fill()
    .strokeColor('#CBD5E1')
    .stroke();
  doc
    .fillColor(textColor)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text('NET BALANCE', 390, summaryTop + 12)
    .fontSize(13)
    .text(`INR ${balanceVal.toLocaleString('en-IN')}`, 390, summaryTop + 28);

  doc.moveDown(5);

  // Table header
  const tableTop = 230;
  doc
    .rect(50, tableTop, 495, 20)
    .fillColor(tableHeaderBg)
    .fill()
    .strokeColor('#E2E8F0')
    .stroke();

  doc
    .fillColor(textColor)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('Date', 60, tableTop + 6)
    .text('Description', 140, tableTop + 6)
    .text('Category', 280, tableTop + 6)
    .text('Type', 390, tableTop + 6)
    .text('Amount (INR)', 460, tableTop + 6);

  let currentY = tableTop + 20;

  transactions.forEach((transaction) => {
    if (currentY > 750) {
      doc.addPage();
      currentY = 50;
      doc
        .rect(50, currentY, 495, 20)
        .fillColor(tableHeaderBg)
        .fill();
      doc
        .fillColor(textColor)
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('Date', 60, currentY + 6)
        .text('Description', 140, currentY + 6)
        .text('Category', 280, currentY + 6)
        .text('Type', 390, currentY + 6)
        .text('Amount (INR)', 460, currentY + 6);
      currentY += 20;
    }

    doc
      .fillColor(textColor)
      .font('Helvetica')
      .fontSize(9)
      .text(new Date(transaction.date).toLocaleDateString('en-IN'), 60, currentY + 6)
      .text(transaction.description || '-', 140, currentY + 6)
      .text(transaction.category?.name || 'Uncategorized', 280, currentY + 6);

    const isInc = transaction.type === 'income';
    doc
      .fillColor(isInc ? incomeColor : expenseColor)
      .font('Helvetica-Bold')
      .text(isInc ? 'INCOME' : 'EXPENSE', 390, currentY + 6)
      .text(`${isInc ? '+' : '-'}INR ${transaction.amount.toLocaleString('en-IN')}`, 460, currentY + 6);

    doc
      .moveTo(50, currentY + 20)
      .lineTo(545, currentY + 20)
      .strokeColor('#F1F5F9')
      .stroke();

    currentY += 20;
  });

  doc.end();
};
