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
            `Weekly Hours: ${paystub.weeklyHours} hr\n` +
            `Date: ${paystub.date} \n` +
            `Payrate: $${paystub.payrate}\n` +
            `Gross Pay: $${paystub.grossPay}\n` +
            `CPP: $${paystub.cpp}\n` +
            `EI: $${paystub.ei}\n` +
            `Provincial Tax: $${paystub.provincialTaxes}\n` +
            `Federal Tax: $${paystub.federalTaxes}\n` +
            `Take Home: $${paystub.takeHome}`, 50, 100);
    doc.end();
    });
}
module.exports = {buildPDF};  