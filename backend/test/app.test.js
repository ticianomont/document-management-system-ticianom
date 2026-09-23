const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../src/app');

const PORT = 3100;

async function startServer() {
  const server = app.listen(PORT);
  await new Promise((resolve) => server.once('listening', resolve));
  return server;
}

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('GET /health responde com status ok', async () => {
  const server = await startServer();

  try {
    const response = await fetch(`http://localhost:${PORT}/health`);
    const body = await response.json();

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(body, { status: 'ok' });
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('POST /upload, GET /documents e GET /documents/:id/download funcionam', async () => {
  const server = await startServer();

  try {
    const filePath = path.join(__dirname, 'fixtures', 'sample.txt');
    const uploadBody = new FormData();
    uploadBody.append('file', new Blob(['conteudo de teste do dms'], { type: 'text/plain' }), 'sample.txt');
    uploadBody.append('owner', 'user-123');

    const uploadResponse = await fetch(`http://localhost:${PORT}/upload`, {
      method: 'POST',
      body: uploadBody,
    });

    assert.strictEqual(uploadResponse.status, 201, 'upload deve retornar 201');
    const uploadBodyData = await uploadResponse.json();
    assert.strictEqual(uploadBodyData.originalName, 'sample.txt');
    assert.strictEqual(uploadBodyData.owner, 'user-123');
    assert.ok(uploadBodyData.id, 'deve existir um id');

    const listResponse = await fetch(`http://localhost:${PORT}/documents`);
    assert.strictEqual(listResponse.status, 200, 'listagem deve retornar 200');
    const documents = await listResponse.json();
    assert.ok(Array.isArray(documents), 'deve retornar um array');
    assert.ok(documents.some((document) => document.id === uploadBodyData.id), 'documento recém-criado deve aparecer na listagem');

    const downloadResponse = await fetch(`http://localhost:${PORT}/documents/${uploadBodyData.id}/download`);
    assert.strictEqual(downloadResponse.status, 200, 'download deve retornar 200');
    const textContent = await downloadResponse.text();
    assert.strictEqual(textContent, 'conteudo de teste do dms');

    const storedFile = path.join(__dirname, '..', 'storage');
    const files = fs.readdirSync(storedFile);
    assert.ok(files.length > 0, 'deve existir arquivo salvo no storage');
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
