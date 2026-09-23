const documentRepository = require('../repositories/documentRepository');
const { ValidationError, NotFoundError } = require('../utils/errors');

function validateFile(file) {
  if (!file || !file.originalname || !file.path) {
    throw new ValidationError('Arquivo obrigatório');
  }
}

function validateOwner(owner) {
  if (!owner || typeof owner !== 'string' || !owner.trim()) {
    throw new ValidationError('Identificador do usuário obrigatório');
  }
}

function uploadDocument(file, owner) {
  validateFile(file);
  validateOwner(owner);

  return documentRepository.saveDocument(file, owner.trim());
}

function listDocuments(owner) {
  return documentRepository.listDocuments(owner);
}

function downloadDocument(id) {
  const document = documentRepository.getDocumentFile(id);

  if (!document) {
    throw new NotFoundError('Documento não encontrado');
  }

  return document;
}

module.exports = {
  uploadDocument,
  listDocuments,
  downloadDocument,
};
