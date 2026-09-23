# Especificação - Document Management System (DMS)

## 1. Objetivo

Desenvolver um sistema web leve para gestão de documentos que permita ao usuário enviar, listar e baixar arquivos de forma simples, com armazenamento local e metadados em memória.

## 2. Escopo

### Dentro do escopo

- Upload de documentos
- Listagem de documentos
- Download de documentos
- Gestão simples por usuário
- Armazenamento local dos arquivos no filesystem da aplicação
- Metadados em memória durante a execução da aplicação

### Fora do escopo

- Armazenamento externo ou em nuvem
- Versionamento de documentos
- Controle avançado de permissões e papéis
- Sincronização entre múltiplas instâncias da aplicação
- Criptografia e auditoria de arquivos

## 3. Requisitos funcionais

| ID | Requisito | Descrição |
| --- | --- | --- |
| RF-01 | O usuário pode enviar um documento | O sistema deve aceitar um arquivo em multipart/form-data e registrar o documento. |
| RF-02 | O sistema deve retornar os metadados do documento criado | A resposta deve incluir identificador, nome original, tamanho, data de upload e dono. |
| RF-03 | O usuário pode listar os documentos enviados | A API deve devolver uma lista de metadados dos documentos disponíveis. |
| RF-04 | O usuário pode baixar um documento pelo identificador | O sistema deve localizar o arquivo pelo id e devolver o conteúdo binário. |
| RF-05 | O documento deve estar associado a um usuário | Cada registro deve manter o identificador do dono em metadados. |
| RF-06 | O sistema deve rejeitar entradas inválidas | Caso o arquivo seja ausente ou inválido, a aplicação deve responder com erro adequado. |

## 4. Requisitos não funcionais

| ID | Requisito | Descrição |
| --- | --- | --- |
| RNF-01 | Armazenamento local via multer | Os arquivos devem ser gravados no filesystem local da aplicação, usando multer com diskStorage. |
| RNF-02 | Metadados em memória | O sistema mantém os metadados dos documentos em memória nesta fase inicial, sem banco de dados. |
| RNF-03 | Configuração via variáveis de ambiente | A aplicação deve usar variáveis de ambiente para configuração básica, seguindo o princípio 12-Factor. |
| RNF-04 | Arquitetura simples e organizada | O backend deve seguir a separação em routes, controllers, services e repositories. |
| RNF-05 | Frontend funcional e leve | O frontend deve ser construído com React e comunicação via fetch usando o prefixo /api. |
| RNF-06 | Simplicidade como prioridade | O sistema deve evitar overengineering e priorizar soluções diretas, legíveis e fáceis de manter. |

## 5. Modelo de dados

| Campo | Tipo | Descrição |
| --- | --- | --- |
| id | string | Identificador único do documento. |
| originalName | string | Nome original do arquivo enviado. |
| size | number | Tamanho do arquivo em bytes. |
| uploadedAt | string | Data e hora do upload em formato ISO 8601. |
| owner | string | Identificador do usuário dono do documento. |

> Observação: o arquivo físico será armazenado localmente com um nome gerado internamente, enquanto os metadados acima representam o registro do documento e sua associação ao usuário.

## 6. Contratos de API

### POST /upload

- Descrição: envia um documento para armazenamento local.
- Entrada: arquivo em multipart/form-data.
- Campos esperados: arquivo e owner.
- Saída esperada: metadados do documento criado.

Exemplo de resposta HTTP 201:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "originalName": "relatorio.pdf",
  "size": 102400,
  "uploadedAt": "2026-09-23T10:30:00Z",
  "owner": "user-123"
}
```

Possíveis erros:
- 400 Bad Request: arquivo ausente ou dados inválidos.
- 500 Internal Server Error: falha na gravação do arquivo ou no registro de metadados.

### GET /documents

- Descrição: lista os documentos disponíveis.
- Saída esperada: array de metadados dos documentos armazenados.

Exemplo de resposta HTTP 200:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "originalName": "relatorio.pdf",
    "size": 102400,
    "uploadedAt": "2026-09-23T10:30:00Z",
    "owner": "user-123"
  }
]
```

### GET /documents/:id/download

- Descrição: baixa o arquivo associado a um documento específico.
- Entrada: identificador do documento na URL.
- Saída: conteúdo binário do arquivo, com cabeçalho apropriado para download.

Possíveis erros:
- 404 Not Found: documento não encontrado.
- 500 Internal Server Error: falha na leitura do arquivo.

## 7. Decisões arquiteturais

- Backend em Clean Architecture simples: routes, controllers, services e repositories.
- Camadas internas não devem depender de detalhes das camadas externas.
- Armazenamento local dos arquivos com multer e diskStorage na pasta de armazenamento da aplicação.
- Metadados mantidos em memória nesta fase para manter o projeto enxuto e fácil de evoluir.
- Frontend em React com componentes funcionais e comunicação via fetch usando o prefixo /api.
- O sistema deve permanecer sem banco de dados e sem serviços externos nesta fase.

## 8. Plano de execução

1. Definir escopo, regras de negócio e contratos de API.
2. Modelar os metadados do documento e as regras de associação ao usuário.
3. Preparar a camada de armazenamento local e o mecanismo de metadados em memória.
4. Implementar os fluxos de upload, listagem e download com validações básicas.
5. Validar cenários de sucesso e falha da API.
6. Construir a experiência do usuário para upload, listagem e download.
7. Integrar frontend e backend e validar o fluxo completo do sistema.
8. Revisar a documentação e ajustar o comportamento com base no uso real da aplicação.

---
