applyTo:
  - data/**/*.sql
  - src/config/database.js
  - src/models/**/*.js
  - *.db
---
# Database Bancário - Instruções de Schema
Orientação especializada para evolução de schema SQLite, migrações e estratégia de dados bancários.

## Princípios de Migração Bancária
- Migrações históricas imutáveis: nunca modifique arquivos existentes—adicione novo arquivo sequencial.
- Cada arquivo de migração deve ser idempotente ou protegido (ex: `IF NOT EXISTS`).
- Forneça estratégia de DOWN/rollback quando possível (comente justificativa se impossível).
- ATENÇÃO: Migrações bancárias devem preservar integridade de dados financeiros.

## Checklist de Design de Schema Bancário
1. Foreign keys definidas com comportamento ON DELETE / ON UPDATE explícito.
2. Índices em: colunas FK, predicados WHERE de alta seletividade, índices compostos para filtros frequentes.
3. Use CHECK constraints para invariantes de domínio bancário (saldos não-negativos, tipos de conta válidos).
4. Evite over-normalização que complique queries sem benefício claro.
5. Prefira INTEGER primary keys (auto-increment) exceto para chaves naturais estáveis (número da conta).
6. CPF: sempre indexado e com constraint UNIQUE para evitar duplicação.
7. Saldos: use DECIMAL ou armazene em centavos (INTEGER) para precisão monetária.

## Performance & Optimization
- Evaluate query plans for slow endpoints (add covering indexes as needed).
- Consider partial indexes only if table sizes grow significantly; otherwise keep simple.

## Diretrizes de Seeding Bancário
- Determinístico: garanta que seeds produzam os mesmos IDs a cada execução.
- Mantenha dados de seed mínimos mas ilustrativos; volumes grandes pertencem a fixtures.
- Atualize seeds ao adicionar colunas NOT NULL sem defaults; garanta ordem referencial.
- Dados bancários: use CPFs válidos mas fictícios, contas com formato padrão brasileiro.
- Saldos realistas: valores que façam sentido no contexto bancário brasileiro.

## Review Red Flags
- Dropping and recreating tables for simple column additions (prefer ALTER when supported semantics suffice).
- Adding wide TEXT columns without need; consider normalization or constraints.
- Missing transaction around multi-statement data migrations altering existing rows.

## Testing
- Use in-memory DB for unit tests; ensure migrations run before repository tests.

## Estilo de Feedback Bancário
"Migração 005 adiciona `tipo_conta` mas seeds não foram atualizados; INSERTs existentes violarão NOT NULL. Adicione default 'corrente' ou modifique arquivo de seed."

"Tabela `contas` precisa de índice em `cpf_cliente` para otimizar consultas por cliente. Performance crítica para operações bancárias."
