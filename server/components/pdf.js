const path = require('path');
const PdfPrinter = require('pdfmake/src/printer');
const printer = new PdfPrinter({
    SourceSansPro: {
        normal: path.join(__dirname, 'fonts', 'SourceSansPro-Regular.ttf'),
        bold: path.join(__dirname, 'fonts', 'SourceSansPro-Semibold.ttf'),
        italics: path.join(__dirname, 'fonts', 'SourceSansPro-It.ttf'),
        bolditalics: path.join(__dirname, 'fonts', 'SourceSansPro-SemiboldIt.ttf'),
    }

});

module.exports = function stream(content) {
    var doc = printer.createPdfKitDocument(content);
    doc.end();
    return doc;
}