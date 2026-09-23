const documentService = require('../services/documentService');

function uploadDocument(req, res) {
  try {
    const { file, body } = req;
    const owner = body?.owner;
    const document = documentService.uploadDocument(file, owner);

    return res.status(201).json(document);
  } catch (error) {
    const statusCode = error.message.includes('Arquivo') || error.message.includes('usuário') ? 400 : 500;
    return res.status(statusCode).json({ message: error.message });
  }
}

function listDocuments(req, res) {
  try {
    const owner = req.query.owner;
    const documents = documentService.listDocuments(owner);

    return res.json(documents);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar documentos' });
  }
}

function downloadDocument(req, res) {
  try {
    const { id } = req.params;
    const document = documentService.downloadDocument(id);

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    return res.download(document.storagePath, document.originalName);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao baixar documento' });
  }
}

module.exports = {
  uploadDocument,
  listDocuments,
  downloadDocument,
};
