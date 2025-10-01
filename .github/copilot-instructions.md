# Instruções Gerais do Copilot - Sistema Bancário Itaú

Este repositório implementa uma API bancária completa com frontend em português brasileiro. Use as instruções específicas por escopo para orientação detalhada.

# Informação do repositorio remoto
- **Organização**: itau
- **Repositório**: sistema-bancario

## Linguagem
- **Respostas do chat**: Português brasileiro
- **Código**: Inglês (variáveis, funções, etc..), Portugues Brasileiro(comentários técnicos)
- **Mensagens de usuário**: Português brasileiro
- **Documentação**: Português brasileiro

## Contexto do Projeto
- **Domínio**: Sistema bancário brasileiro
- **Stack**: Node.js + Express + SQLite + HTML5/CSS/JS
- **Padrões**: Validações brasileiras, compliance bancário, segurança
- **Testes**: BDD com Cucumber/Gherkin em português

## Tom e Estilo de Feedback
Seja conciso, prático e cite uma justificativa (cláusula "porque") para recomendações não triviais. Ofereça uma solução preferida; opcionalmente uma alternativa mais leve.

---
Se novos subsistemas forem adicionados (ex: `mobile/`, `worker/`), crie um novo `*.instructions.md` com globs `applyTo` ao invés de sobrecarregar este arquivo.


<!-- ## Instruções Específicas por Escopo

### 📁 `.github/instructions/api.instructions.md`
- **Aplica-se a**: `src/**/*.js`, `package.json`, `data/**/*.sql`, `docs/api-swagger.json`
- **Foco**: API Node.js + Express + SQLite para operações bancárias
- **Validações**: CPF brasileiro, telefone, dados bancários

### 📁 `.github/instructions/database.instructions.md`
- **Aplica-se a**: `data/**/*.sql`, `src/config/database.js`, `src/models/**/*.js`
- **Foco**: Schema SQLite, migrações, dados bancários brasileiros
- **Especial**: Integridade de dados financeiros, índices de performance

### 📁 `.github/instructions/frontend.instructions.md`
- **Aplica-se a**: `frontend/src/**`, `frontend/index.html`, configurações frontend
- **Foco**: Interface HTML5/CSS3/JavaScript responsiva
- **UI/UX**: Padrões do Itaú, acessibilidade, tema claro/escuro

### 📁 `.github/instructions/validacoes-brasileiras.instructions.md`
- **Aplica-se a**: `**/*cpf*`, `**/*telefone*`, `src/utils/validation.js`
- **Foco**: Validações específicas do Brasil (CPF, DDD, dados bancários)
- **Algoritmos**: Validação de CPF, máscaras, formatação brasileira

### 📁 `.github/instructions/testes-bdd.instructions.md`
- **Aplica-se a**: `features/**/*.feature`, `**/*cucumber*`, `**/*gherkin*`
- **Foco**: Testes BDD em português usando Gherkin
- **Cenários**: Operações bancárias, validações, casos de erro

### 📁 `.github/instructions/auditoria-logging.instructions.md`
- **Aplica-se a**: `**/*winston*`, `**/*audit*`, `logs/**/*.log`
- **Foco**: Compliance bancário, auditoria, logging de operações
- **Regulamentação**: Retenção de logs, dados sensíveis, integridade -->


