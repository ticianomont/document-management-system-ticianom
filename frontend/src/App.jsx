import { useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';

export default function App() {
  const [owner, setOwner] = useState('user-123');
  const [refreshKey, setRefreshKey] = useState(0);

  function handleUploadSuccess() {
    setRefreshKey((currentKey) => currentKey + 1);
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>
      <label>
        Usuário:{' '}
        <input value={owner} onChange={(event) => setOwner(event.target.value)} />
      </label>
      <UploadComponent owner={owner} onUploadSuccess={handleUploadSuccess} />
      <DocumentList owner={owner} refreshKey={refreshKey} />
    </main>
  );
}
