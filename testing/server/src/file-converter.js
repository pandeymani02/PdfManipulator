const path = require("path");
const fs = require("fs");
const mammoth = require("mammoth");
const { PDFDocument, rgb } = require("pdf-lib"); // For creating PDFs

const convertFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const inputPath = req.file.path;
    const originalName = path.parse(req.file.originalname).name;
    const outputPath = path.resolve("uploads", `${originalName}.pdf`);  // Fixed string interpolation

    // Read the Word file and extract content
    const fileBuffer = await fs.promises.readFile(inputPath);
    const { value: extractedText } = await mammoth.extractRawText({ buffer: fileBuffer });

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const fontSize = 12;
    const margin = 40;

    // Split the text into lines to fit the PDF width
    const lines = extractedText.split("\n");
    let yOffset = height - margin;

    for (const line of lines) {
      if (yOffset < margin) {
        page.drawText("...", { x: margin, y: yOffset, size: fontSize });
        break;
      }
      page.drawText(line, { x: margin, y: yOffset, size: fontSize, color: rgb(0, 0, 0) });
      yOffset -= fontSize + 4; // Adjust line spacing
    }

    const pdfBytes = await pdfDoc.save();

    // Save the PDF to disk
    await fs.promises.writeFile(outputPath, pdfBytes);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${originalName}.pdf"`  // Fixed string interpolation
    );
    res.sendFile(outputPath, () => {
      // Cleanup temporary files
      fs.unlink(inputPath, (err) => {
        if (err) console.error("Error deleting input file:", err);
      });
      fs.unlink(outputPath, (err) => {
        if (err) console.error("Error deleting output file:", err);
      });
    });
  } catch (error) {
    console.error("Conversion error:", error);
    res.status(500).send("Error converting file");
  }
};

const { getMetadata } = require("./metadata");

module.exports = { convertFile };
