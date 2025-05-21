const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const WordExtractor = require('word-extractor');
const xlsx = require('xlsx');

const handleFileUpload = async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = path.resolve(file.path);
  const ext = path.extname(file.originalname).toLowerCase();
  try {
    let text = '';

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (ext === '.doc') {
      const extractor = new WordExtractor();
      const doc = await extractor.extract(filePath);
      text = doc.getBody();
    } else if (ext === '.txt') {
      text = fs.readFileSync(filePath, 'utf-8');
    } else if (ext === '.xlsx' || ext === '.xls') {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      text = xlsx.utils.sheet_to_csv(sheet); // Or .sheet_to_json()
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Optional: delete file after processing
    fs.unlinkSync(filePath);

    res.json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process file' });
  }
};

module.exports = { handleFileUpload };
