applyTo:
  - src/**/*.js
  - package.json
  - data/**/*.sql
  - docs/api-swagger.json
  - test-api.js
---
# API Bancária - Instruções de Revisão
Foco em correção, segurança, integridade de dados e consistência na camada Express + SQLite para operações bancárias.

## Princípios da API Bancária
- Mantenha controllers thin: validação + orquestração; mova lógica para services/repositories.
- Use SQL parametrizado SEMPRE; nunca construa queries com input do usuário.
- Retorne códigos HTTP apropriados via classes de erro compartilhadas (NotFound, Validation, Conflict).
- Preserve nomenclatura consistente: camelCase em modelos JavaScript, snake_case em colunas SQL.
- Documente mudanças: atualize Swagger ao adicionar/modificar endpoints bancários.
- Implemente validações específicas do Brasil: CPF, telefone, CEP, dados bancários.

## Checklist de Revisão Bancária
1. Validação de entrada: validações específicas (CPF, conta, agência) antes do DB.
2. Propagação de erros: repositories lançam erros de domínio -> middleware -> status correto.
3. Transações: agrupe operações bancárias que devem suceder/falhar juntas.
4. Performance: evite N+1 em consultas de conta/cliente; prefira JOINs.
5. Migrações: mudanças de schema acompanhadas de arquivo SQL sequencial.
6. Seeds: ajuste dados quando adicionar colunas NOT NULL ou dados de referência.
7. Swagger atualizado: novas rotas bancárias, modelos, exemplos, códigos de resposta.
8. Auditoria: log todas operações financeiras para compliance bancário.

## Data Integrity
- Enforce foreign keys (ensure config keeps them ON) & add indexes for new FK columns.
- Use CHECK constraints or application validation for domain rules (e.g., quantity >= 0).

## Testing Guidance
- Add unit tests for new repository methods (happy path + error cases) using in-memory DB.
- For route additions, integration test hitting the real Express app (e.g., supertest) verifying status + response shape.

## Considerações de Segurança Bancária
- Sanitize/limite paginação (max limits) para evitar table scans.
- NÃO vaze stack traces internos em respostas de produção.
- CORS: restrinja origins em produção para segurança bancária.
- Rate limiting: implemente limites de tentativas por CPF/conta.
- Criptografia: dados sensíveis (CPF, contas) devem ser protegidos.
- Headers de segurança: X-Frame-Options, CSP, HSTS para compliance.
- Auditoria: todas operações financeiras devem ser logadas.

## Estilo de Feedback Bancário
"`contaService.buscarComCliente()` está executando um SELECT por cliente (N+1). Considere uma única query JOIN retornando dados achatados e pós-processe."

"Validação de CPF ausente no endpoint `/api/clientes`. Adicione validação de CPF brasileiro no middleware de validação."
