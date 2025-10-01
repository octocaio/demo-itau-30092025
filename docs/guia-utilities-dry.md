# 📘 Guia de Utilização das Utilities DRY

Este documento descreve as utilities criadas para eliminar duplicação de código na API Bancária Itaú.

## 🎯 Objetivo

Eliminar violações do princípio DRY (Don't Repeat Yourself) através de utilities reutilizáveis que padronizam:
- Formatação de respostas HTTP
- Tratamento de erros em models

---

## 📦 ResponseFormatter

**Localização**: `src/utils/responseFormatter.js`

### Descrição

Utility para padronizar todas as respostas HTTP da API, eliminando 28+ duplicações de código nos controllers.

### Métodos Disponíveis

#### 1. `ResponseFormatter.success(res, data, message?, statusCode?)`

Formata resposta de sucesso padrão.

**Parâmetros**:
- `res` (Object): Objeto de resposta do Express
- `data` (any): Dados a serem retornados
- `message` (string, opcional): Mensagem customizada (padrão: "Operação realizada com sucesso")
- `statusCode` (number, opcional): Código HTTP (padrão: 200)

**Exemplo**:
```javascript
// Em um controller
const clientes = await Cliente.listar();
return ResponseFormatter.success(res, clientes);

// Resposta:
// {
//   "success": true,
//   "message": "Operação realizada com sucesso",
//   "data": [...],
//   "count": 10,  // Adicionado automaticamente para arrays
//   "timestamp": "2025-10-01T03:39:00.000Z"
// }
```

#### 2. `ResponseFormatter.created(res, data, message?)`

Atalho para resposta de criação (201).

**Exemplo**:
```javascript
const cliente = await Cliente.criar(value);
return ResponseFormatter.created(res, cliente, 'Cliente criado com sucesso');

// Resposta com status 201
```

#### 3. `ResponseFormatter.error(res, message, details?, statusCode?)`

Formata resposta de erro genérico.

**Parâmetros**:
- `res` (Object): Objeto de resposta do Express
- `message` (string): Mensagem de erro
- `details` (any, opcional): Detalhes adicionais do erro
- `statusCode` (number, opcional): Código HTTP (padrão: 400)

**Exemplo**:
```javascript
if (saldo < 0) {
    return ResponseFormatter.error(res, 'Saldo não pode ser negativo');
}

// Resposta:
// {
//   "success": false,
//   "error": {
//     "message": "Saldo não pode ser negativo",
//     "code": 400
//   },
//   "timestamp": "2025-10-01T03:39:00.000Z"
// }
```

#### 4. `ResponseFormatter.validationError(res, joiError, message?)`

Formata erros de validação do Joi.

**Exemplo**:
```javascript
const { error, value } = clienteSchema.validate(req.body);
if (error) {
    return ResponseFormatter.validationError(res, error);
}

// Resposta:
// {
//   "success": false,
//   "error": {
//     "message": "Dados inválidos",
//     "code": 400,
//     "details": ["CPF inválido", "Email é obrigatório"]
//   },
//   "timestamp": "2025-10-01T03:39:00.000Z"
// }
```

#### 5. `ResponseFormatter.notFound(res, entity?)`

Formata resposta de recurso não encontrado (404).

**Parâmetros**:
- `res` (Object): Objeto de resposta do Express
- `entity` (string, opcional): Nome da entidade (padrão: "Recurso")

**Exemplo**:
```javascript
const cliente = await Cliente.buscarPorCpf(cpf);
if (!cliente) {
    return ResponseFormatter.notFound(res, 'Cliente');
}

// Resposta:
// {
//   "success": false,
//   "error": {
//     "message": "Cliente não encontrado",
//     "code": 404
//   },
//   "timestamp": "2025-10-01T03:39:00.000Z"
// }
```

#### 6. `ResponseFormatter.noContent(res, message?)`

Formata resposta de sucesso sem dados (200).

**Exemplo**:
```javascript
await Cliente.desativar(cpf);
return ResponseFormatter.noContent(res, 'Cliente desativado com sucesso');

// Resposta:
// {
//   "success": true,
//   "message": "Cliente desativado com sucesso",
//   "timestamp": "2025-10-01T03:39:00.000Z"
// }
```

### Benefícios

- ✅ Elimina 28+ duplicações de código
- ✅ Padroniza formato de todas as respostas
- ✅ Adiciona timestamp automaticamente
- ✅ Adiciona count para arrays automaticamente
- ✅ Log automático de erros de validação
- ✅ Facilita manutenção futura

---

## 🛡️ ModelWrapper

**Localização**: `src/utils/modelWrapper.js`

### Descrição

Utility para padronizar tratamento de erros em models, eliminando 26+ blocos try/catch idênticos.

### Métodos Disponíveis

#### 1. `ModelWrapper.execute(operation, operationName, errorMessage?)`

Executa operação de banco com tratamento de erros padronizado.

**Parâmetros**:
- `operation` (Function): Função assíncrona com a operação
- `operationName` (string): Nome descritivo da operação (para logs)
- `errorMessage` (string, opcional): Mensagem de erro customizada

**Exemplo**:
```javascript
// ANTES (com duplicação):
static async buscarPorCpf(cpf) {
    try {
        const query = 'SELECT * FROM clientes WHERE cpf = ?';
        return await database.get(query, [cpf]);
    } catch (error) {
        logger.error('Erro ao buscar cliente por CPF:', error);
        throw new Error('Erro interno do servidor ao buscar cliente');
    }
}

// DEPOIS (sem duplicação):
static async buscarPorCpf(cpf) {
    return ModelWrapper.execute(
        async () => {
            const query = 'SELECT * FROM clientes WHERE cpf = ?';
            return await database.get(query, [cpf]);
        },
        'buscar cliente por CPF'
    );
}
```

**Comportamento**:
- Executa a operação
- Em caso de erro, faz log automático
- Re-lança erros customizados de negócio ("Cliente não encontrado", etc)
- Lança erro genérico para erros de banco (SQLite)

#### 2. `ModelWrapper.executeWithConstraints(operation, operationName, constraintMessages)`

Executa operação com tratamento específico para constraints do SQLite.

**Parâmetros**:
- `operation` (Function): Função assíncrona com a operação
- `operationName` (string): Nome descritivo da operação
- `constraintMessages` (Object): Mapeamento de tipos de constraint para mensagens
  - `primaryKey` (string): Mensagem para SQLITE_CONSTRAINT_PRIMARYKEY
  - `unique` (string): Mensagem para SQLITE_CONSTRAINT_UNIQUE
  - `foreignKey` (string): Mensagem para SQLITE_CONSTRAINT_FOREIGNKEY

**Exemplo**:
```javascript
// ANTES (com duplicação):
static async criar(dados) {
    try {
        const query = 'INSERT INTO clientes (cpf, nome) VALUES (?, ?)';
        await database.run(query, [dados.cpf, dados.nome]);
        return await this.buscarPorCpf(dados.cpf);
    } catch (error) {
        logger.error('Erro ao criar cliente:', error);
        
        if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
            throw new Error('Cliente com este CPF já existe');
        }
        
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new Error('Email já está em uso');
        }
        
        throw new Error('Erro interno do servidor ao criar cliente');
    }
}

// DEPOIS (sem duplicação):
static async criar(dados) {
    return ModelWrapper.executeWithConstraints(
        async () => {
            const query = 'INSERT INTO clientes (cpf, nome) VALUES (?, ?)';
            await database.run(query, [dados.cpf, dados.nome]);
            return await this.buscarPorCpf(dados.cpf);
        },
        'criar cliente',
        {
            primaryKey: 'Cliente com este CPF já existe',
            unique: 'Email já está em uso'
        }
    );
}
```

### Benefícios

- ✅ Elimina 26+ blocos try/catch duplicados
- ✅ Padroniza log de erros
- ✅ Trata erros de constraint automaticamente
- ✅ Preserva erros de negócio customizados
- ✅ Reduz possibilidade de erros de implementação

---

## 🎓 Guia de Migração

### Para Novos Controllers

```javascript
const ResponseFormatter = require('../utils/responseFormatter');
const { asyncHandler } = require('../middleware/errorHandler');

class NovoController {
    static criarRecurso = asyncHandler(async (req, res) => {
        // Validação
        const { error, value } = schema.validate(req.body);
        if (error) {
            return ResponseFormatter.validationError(res, error);
        }
        
        // Criar recurso
        const recurso = await Model.criar(value);
        
        // Resposta
        return ResponseFormatter.created(res, recurso, 'Recurso criado com sucesso');
    });
    
    static buscarRecurso = asyncHandler(async (req, res) => {
        const recurso = await Model.buscarPorId(req.params.id);
        
        if (!recurso) {
            return ResponseFormatter.notFound(res, 'Recurso');
        }
        
        return ResponseFormatter.success(res, recurso);
    });
    
    static listarRecursos = asyncHandler(async (req, res) => {
        const recursos = await Model.listar();
        return ResponseFormatter.success(res, recursos);
    });
}
```

### Para Novos Models

```javascript
const ModelWrapper = require('../utils/modelWrapper');
const database = require('../config/database');
const logger = require('../config/logger');

class NovoModel {
    static async criar(dados) {
        return ModelWrapper.executeWithConstraints(
            async () => {
                const query = 'INSERT INTO tabela (campo) VALUES (?)';
                await database.run(query, [dados.campo]);
                return await this.buscarPorId(lastId);
            },
            'criar registro',
            {
                primaryKey: 'Registro já existe',
                unique: 'Campo deve ser único'
            }
        );
    }
    
    static async buscarPorId(id) {
        return ModelWrapper.execute(
            async () => {
                const query = 'SELECT * FROM tabela WHERE id = ?';
                return await database.get(query, [id]);
            },
            'buscar registro por ID'
        );
    }
    
    static async listar() {
        return ModelWrapper.execute(
            async () => {
                return await database.all('SELECT * FROM tabela');
            },
            'listar registros'
        );
    }
}
```

---

## 📊 Métricas de Impacto

### Antes da Refatoração
- 28+ instâncias de formatação HTTP duplicada
- 26+ blocos try/catch idênticos
- ~1.200 linhas de código com duplicação
- Inconsistências no formato de respostas

### Após a Refatoração
- ✅ Zero duplicação de formatação HTTP
- ✅ Zero duplicação de tratamento de erros
- ✅ ~800 linhas de código (redução de 33%)
- ✅ Formato padronizado em 100% das respostas
- ✅ Logs consistentes em todos os models

---

## 🔍 Próximos Passos Sugeridos

### Opcional - Consolidação Adicional

Se surgir necessidade de consolidar ainda mais, considere:

1. **BaseController**: Classe base para controllers CRUD genéricos
2. **Repository Pattern**: Camada de abstração para operações de banco
3. **Service Layer**: Lógica de negócio separada dos controllers

Estes padrões podem trazer benefícios adicionais, mas representam mudanças arquiteturais mais significativas.

---

## 📝 Convenções e Boas Práticas

### ResponseFormatter
- ✅ Sempre use nos controllers
- ✅ Prefira métodos específicos (`created`, `notFound`) ao genérico `success`/`error`
- ✅ Mantenha mensagens em português brasileiro
- ✅ Use nomes de entidades descritivos no `notFound`

### ModelWrapper
- ✅ Sempre use em métodos de models que acessam banco
- ✅ Use `executeWithConstraints` para operações INSERT/UPDATE
- ✅ Use `execute` para operações SELECT
- ✅ Mantenha operações de negócio (verificações customizadas) fora do wrapper

---

*Documentação criada como parte da refatoração DRY da API Bancária Itaú*
*Versão: 1.0 | Data: Outubro 2025*
