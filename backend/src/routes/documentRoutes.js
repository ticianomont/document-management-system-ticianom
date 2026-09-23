const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');

const {
  uploadDocument,
  listDocuments,
  downloadDocument,
} = require('../controllers/documentController');

const router = express.Router();
const storageDir = path.join(__dirname, '../../storage');

fs.mkdirSync(storageDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, storageDir);
    },
    filename: (req, file, callback) => {
      const safeName = file.originalname.replace(/\s+/g, '-');
      callback(null, `${Date.now()}-${safeName}`);
    },
  }),
});

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/documents', listDocuments);
router.get('/documents/:id/download', downloadDocument);

module.exports = router;
