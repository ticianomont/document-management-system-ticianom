const documentRepository = require('../repositories/documentRepository');

function uploadDocument(file, owner) {
  return documentRepository.saveDocument(file, owner);
}

function listDocuments(owner) {
  return documentRepository.listDocuments(owner);
}

function getDocumentById(id) {
  return documentRepository.getDocumentById(id);
}

function downloadDocument(id) {
  return documentRepository.getDocumentFile(id);
}

module.exports = {
  uploadDocument,
  listDocuments,
  getDocumentById,
  downloadDocument,
};
