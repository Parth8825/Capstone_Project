const PDFDocument = require("pdfkit");
const Paystub = require('../models/paystubModel');

function buildPDF(dataCallback, endCallback, paystubId){
  const doc = new PDFDocument();
  doc.on('data', dataCallback);
  doc.on('end', endCallback);
  
  Paystub.findOne({ _id: paystubId }).exec(function (err, paystub) {
    // Embed a font, set the font size, and render some text
    doc
      .fontSize(25)
      .text(`Your Paystub\n` +
            `\nName: ${paystub.employeeName}\n` +
            `Email: ${paystub.email}\n` +
            `Payrate: $${paystub.payrate}\n` +
            `Gross Pay: $${paystub.grossPay}\n` +
            `Taxes: $${paystub.taxes}\n` +
            `Take Home: $${paystub.takeHome}`, 100, 100);
    doc.end();
    });
}
module.exports = {buildPDF};  