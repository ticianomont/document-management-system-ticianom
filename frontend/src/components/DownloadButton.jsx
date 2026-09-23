// Botão de download que aponta para o endpoint de download do backend.

import { getDownloadUrl } from '../services/documentApi';

export default function DownloadButton({ documentId, fileName }) {
  return (
    <a className="download-link" href={getDownloadUrl(documentId)} download={fileName}>
      ⬇ Baixar
    </a>
  );
}
