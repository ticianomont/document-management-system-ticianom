// Formulário de envio de documentos: seleciona um arquivo, informa o dono e envia via API.

import { useState } from 'react';
import { uploadDocument } from '../services/documentApi';

export default function UploadComponent({ owner, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setErrorMessage('Selecione um arquivo para enviar');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const document = await uploadDocument(file, owner);
      setFile(null);
      event.target.reset();
      onUploadSuccess(document);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="card">
      <h2>Enviar documento</h2>
      <form className="upload-form" onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={(event) => setFile(event.target.files[0] || null)}
        />
        <button type="submit" className="btn" disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
      {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}
    </section>
  );
}
