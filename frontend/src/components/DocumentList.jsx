// Lista os documentos disponíveis, buscando os metadados na API do backend.

import { useEffect, useState, useCallback } from 'react';
import { listDocuments } from '../services/documentApi';
import DownloadButton from './DownloadButton';

function formatSize(sizeInBytes) {
  return `${(sizeInBytes / 1024).toFixed(1)} KB`;
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString('pt-BR');
}

export default function DocumentList({ owner, refreshKey }) {
  const [documents, setDocuments] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const loadDocuments = useCallback(async () => {
    try {
      const fetchedDocuments = await listDocuments(owner);
      setDocuments(fetchedDocuments);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }, [owner]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments, refreshKey]);

  if (errorMessage) {
    return <p role="alert">{errorMessage}</p>;
  }

  return (
    <div>
      <h2>Documentos</h2>
      {documents.length === 0 ? (
        <p>Nenhum documento enviado ainda.</p>
      ) : (
        <ul>
          {documents.map((document) => (
            <li key={document.id}>
              {document.originalName} ({formatSize(document.size)}) -{' '}
              {formatDate(document.uploadedAt)} - dono: {document.owner}{' '}
              <DownloadButton documentId={document.id} fileName={document.originalName} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
