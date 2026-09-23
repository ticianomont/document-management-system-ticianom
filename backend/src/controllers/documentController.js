const fs = require('node:fs');
const documentService = require('../services/documentService');
const { sendErrorResponse } = require('../utils/errors');

function uploadDocument(req, res) {
  try {
    const { file, body } = req;
    const owner = body?.owner;
    const document = documentService.uploadDocument(file, owner);

    return res.status(201).json(document);
  } catch (error) {
    // Remove o arquivo que o multer já gravou, evitando lixo órfão no storage.
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return sendErrorResponse(error, res, 'Erro ao enviar documento');
  }
}

function listDocuments(req, res) {
  try {
    const owner = req.query.owner;
    const documents = documentService.listDocuments(owner);

    return res.json(documents);
  } catch (error) {
    return sendErrorResponse(error, res, 'Erro ao listar documentos');
  }
}

function downloadDocument(req, res) {
  try {
    const { id } = req.params;
    const document = documentService.downloadDocument(id);

    return res.download(document.storagePath, document.originalName);
  } catch (error) {
    return sendErrorResponse(error, res, 'Erro ao baixar documento');
  }
}

module.exports = {
  uploadDocument,
  listDocuments,
  downloadDocument,
};
