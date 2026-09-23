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
  if (!file || !file.originalname || !file.path) {
    throw new Error('Arquivo obrigatório');
  }

  if (!owner || typeof owner !== 'string' || !owner.trim()) {
    throw new Error('Identificador do usuário obrigatório');
  }

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
    owner: owner.trim(),
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

function getDocumentById(id) {
  const document = documents.get(id);
  return document ? normalizeDocument(document) : null;
}

function getDocumentFile(id) {
  return documents.get(id) || null;
}

module.exports = {
  saveDocument,
  listDocuments,
  getDocumentById,
  getDocumentFile,
};
