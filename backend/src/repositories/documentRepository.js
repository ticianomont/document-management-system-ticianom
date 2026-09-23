const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const storageDir = path.join(__dirname, '../../storage');
const documents = new Map();

function ensureStorageDirectory() {
  fs.mkdirSync(storageDir, { recursive: true });
}

function normalizeDocument(document) {
  const { storagePath, ...safeDocument } = document;
  return safeDocument;
}

function saveDocument(file, owner) {
  ensureStorageDirectory();

  const extension = path.extname(file.originalname);
  const documentId = crypto.randomUUID();
  const fileName = `${documentId}${extension}`;
  const destinationPath = path.join(storageDir, fileName);

  fs.renameSync(file.path, destinationPath);

  const document = {
    id: documentId,
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storagePath: destinationPath,
  };

  documents.set(documentId, document);

  return normalizeDocument(document);
}

function listDocuments(owner) {
  const sourceDocuments = [...documents.values()];
  const filteredDocuments = owner
    ? sourceDocuments.filter((document) => document.owner === owner)
    : sourceDocuments;

  return filteredDocuments.map((document) => normalizeDocument(document));
}

function getDocumentFile(id) {
  return documents.get(id) || null;
}

module.exports = {
  saveDocument,
  listDocuments,
  getDocumentFile,
};
