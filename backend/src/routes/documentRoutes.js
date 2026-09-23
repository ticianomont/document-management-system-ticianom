const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const multer = require('multer');

const {
  uploadDocument,
  listDocuments,
  downloadDocument,
} = require('../controllers/documentController');
const { ValidationError } = require('../utils/errors');

const router = express.Router();
const storageDir = path.join(__dirname, '../../storage');

fs.mkdirSync(storageDir, { recursive: true });

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
];

const MAX_UPLOAD_SIZE_BYTES = (Number(process.env.MAX_UPLOAD_SIZE_MB) || 10) * 1024 * 1024;

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, storageDir);
    },
    filename: (req, file, callback) => {
      // Nome gerado a partir de um id aleatório: nunca usar originalname (evita path traversal).
      const safeExtension = path.extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, '');
      callback(null, `${crypto.randomUUID()}${safeExtension}`);
    },
  }),
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
  },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return callback(new ValidationError('Tipo de arquivo não permitido'));
    }

    return callback(null, true);
  },
});

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/documents', listDocuments);
router.get('/documents/:id/download', downloadDocument);

module.exports = router;
