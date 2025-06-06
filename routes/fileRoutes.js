const express = require('express');
const multer = require('multer');
const { handleFileUpload } = require('../Controllers/fileController');
const router = express.Router();

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

router.post('/upload', upload.single('file'), handleFileUpload);

module.exports = router;
