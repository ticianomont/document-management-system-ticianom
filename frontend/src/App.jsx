import { useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import './App.css';

export default function App() {
  const [owner, setOwner] = useState('user-123');
  const [refreshKey, setRefreshKey] = useState(0);

  function handleUploadSuccess() {
    setRefreshKey((currentKey) => currentKey + 1);
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>📄 Document Management System</h1>
        <p>Envie, liste e baixe seus documentos com facilidade.</p>
      </header>

      <label className="owner-field">
        Usuário:
        <input value={owner} onChange={(event) => setOwner(event.target.value)} />
      </label>

      <UploadComponent owner={owner} onUploadSuccess={handleUploadSuccess} />
      <DocumentList owner={owner} refreshKey={refreshKey} />
    </main>
  );
}
