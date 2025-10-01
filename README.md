# API Bancária de Demonstração - Itaú

Uma API bancária simples construída com Node.js, Express e SQLite para demonstração das funcionalidades básicas de um sistema bancário.

## 🚀 Funcionalidades

- ✅ Cadastrar clientes (nome, CPF, data de nascimento)
- ✅ Criar contas associadas a clientes (corrente e poupança)
- ✅ Consultar saldo de uma conta

## 🛠️ Tecnologias

- **Backend**: Node.js + Express.js
- **Banco de Dados**: SQLite3
- **Validação**: Joi
- **Logging**: Winston
- **Segurança**: Helmet + CORS

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Inicializar banco de dados
npm run init-db

# Executar em modo desenvolvimento
npm run dev

# Executar em produção
npm start
```

## 🔌 Endpoints da API

### Clientes
- `POST /api/clientes` - Cadastrar novo cliente
- `GET /api/clientes/:cpf` - Buscar cliente por CPF
- `GET /api/clientes` - Listar todos os clientes

### Contas
- `POST /api/contas` - Criar nova conta
- `GET /api/contas/saldo/:numero` - Consultar saldo
- `GET /api/contas/cliente/:cpf` - Listar contas do cliente

### Utilitários
- `GET /health` - Health check da API

## 📋 Exemplo de Uso

### 1. Cadastrar Cliente
```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "cpf": "123.456.789-09",
    "data_nascimento": "1990-05-15"
  }'
```

### 2. Criar Conta
```bash
curl -X POST http://localhost:3000/api/contas \
  -H "Content-Type: application/json" \
  -d '{
    "cpf_cliente": "12345678909",
    "tipo_conta": "corrente",
    "saldo_inicial": 1000.00
  }'
```

### 3. Consultar Saldo
```bash
curl -X GET http://localhost:3000/api/contas/saldo/123456
```

## 🏗️ Estrutura do Projeto

```
src/
├── config/          # Configurações do banco e logging
├── controllers/     # Controladores das rotas
├── models/         # Modelos de dados
├── routes/         # Definição das rotas
├── middleware/     # Middleware customizado
├── utils/          # Utilitários e validadores
└── server.js       # Servidor principal
```

## 🔐 Validações

- **CPF**: Validação completa com algoritmo brasileiro
- **Dados obrigatórios**: Verificação de campos necessários
- **Relacionamentos**: Conta só pode ser criada para cliente existente

## 📊 Banco de Dados

O sistema utiliza SQLite3 com as seguintes tabelas:
- `clientes`: Armazena dados dos clientes
- `contas`: Armazena informações das contas bancárias

## 🎯 Para Desenvolvimento

Este projeto foi criado para demonstrar as capacidades do GitHub Copilot no desenvolvimento de APIs bancárias, seguindo boas práticas de:
- Arquitetura MVC
- Validação de dados brasileiros
- Logging estruturado
- Tratamento de erros
- Segurança básica