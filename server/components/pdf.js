const path = require('path');
const PdfPrinter = require('pdfmake/src/printer');
const printer = new PdfPrinter({
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    },
    Roboto: {
        normal: path.join(__dirname, 'fonts', 'Roboto-Regular.ttf'),
        bold: path.join(__dirname, 'fonts', 'Roboto-Medium.ttf'),
        italics: path.join(__dirname, 'fonts', 'Roboto-Italic.ttf'),
        bolditalics: path.join(__dirname, 'fonts', 'Roboto-MediumItalic.ttf'),
    },
    SourceSansPro: {
        normal: path.join(__dirname, 'fonts', 'SourceSansPro-Regular.ttf'),
        bold: path.join(__dirname, 'fonts', 'SourceSansPro-SemiBold.ttf'),
        italics: path.join(__dirname, 'fonts', 'SourceSansPro-Italic.ttf'),
        bolditalics: path.join(__dirname, 'fonts', 'SourceSansPro-MediumItalic.ttf'),
    }

});

module.exports = function stream(content) {
    var doc = printer.createPdfKitDocument(content);
    doc.end();
    return doc;
}