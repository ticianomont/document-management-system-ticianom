const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

process.env.MAX_UPLOAD_SIZE_MB = '1';
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

test('POST /upload sem arquivo retorna 400', async () => {
  const server = await startServer();

  try {
    const uploadBody = new FormData();
    uploadBody.append('owner', 'user-123');

    const response = await fetch(`http://localhost:${PORT}/upload`, {
      method: 'POST',
      body: uploadBody,
    });

    assert.strictEqual(response.status, 400);
    const body = await response.json();
    assert.ok(body.message, 'deve haver mensagem de erro');
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('POST /upload sem owner retorna 400', async () => {
  const server = await startServer();

  try {
    const uploadBody = new FormData();
    uploadBody.append('file', new Blob(['conteudo'], { type: 'text/plain' }), 'sample.txt');

    const response = await fetch(`http://localhost:${PORT}/upload`, {
      method: 'POST',
      body: uploadBody,
    });

    assert.strictEqual(response.status, 400);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('POST /upload com tipo de arquivo não permitido retorna 400', async () => {
  const server = await startServer();

  try {
    const uploadBody = new FormData();
    uploadBody.append('file', new Blob(['#!/bin/sh'], { type: 'application/x-sh' }), 'script.sh');
    uploadBody.append('owner', 'user-123');

    const response = await fetch(`http://localhost:${PORT}/upload`, {
      method: 'POST',
      body: uploadBody,
    });

    assert.strictEqual(response.status, 400);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('POST /upload com arquivo acima do limite retorna 413', async () => {
  const server = await startServer();

  try {
    const oversizedContent = new Uint8Array(2 * 1024 * 1024); // 2MB > limite de 1MB dos testes
    const uploadBody = new FormData();
    uploadBody.append('file', new Blob([oversizedContent], { type: 'text/plain' }), 'grande.txt');
    uploadBody.append('owner', 'user-123');

    const response = await fetch(`http://localhost:${PORT}/upload`, {
      method: 'POST',
      body: uploadBody,
    });

    assert.strictEqual(response.status, 413);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('GET /documents filtra corretamente por owner', async () => {
  const server = await startServer();

  try {
    const uploadBody = new FormData();
    uploadBody.append('file', new Blob(['conteudo'], { type: 'text/plain' }), 'sample.txt');
    uploadBody.append('owner', 'user-filtro');

    const uploadResponse = await fetch(`http://localhost:${PORT}/upload`, {
      method: 'POST',
      body: uploadBody,
    });
    const uploaded = await uploadResponse.json();

    const filteredResponse = await fetch(`http://localhost:${PORT}/documents?owner=user-filtro`);
    const filteredDocuments = await filteredResponse.json();
    assert.ok(filteredDocuments.every((document) => document.owner === 'user-filtro'));
    assert.ok(filteredDocuments.some((document) => document.id === uploaded.id));

    const emptyResponse = await fetch(`http://localhost:${PORT}/documents?owner=owner-inexistente`);
    const emptyDocuments = await emptyResponse.json();
    assert.deepStrictEqual(emptyDocuments, []);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('GET /documents/:id/download com id inexistente retorna 404', async () => {
  const server = await startServer();

  try {
    const response = await fetch(`http://localhost:${PORT}/documents/id-inexistente/download`);
    assert.strictEqual(response.status, 404);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
