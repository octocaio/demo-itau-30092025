const database = require('./database');
const logger = require('./logger');

// Script para inicializar o banco de dados com as tabelas necessárias
async function initDatabase() {
    try {
        await database.init();
        logger.info('Inicializando banco de dados...');

        // Criar tabela de clientes
        const createClientesTable = `
            CREATE TABLE IF NOT EXISTS clientes (
                cpf TEXT PRIMARY KEY,
                nome TEXT NOT NULL,
                email TEXT,
                telefone TEXT,
                data_nascimento DATE NOT NULL,
                endereco TEXT,
                cep TEXT,
                cidade TEXT,
                estado TEXT,
                status TEXT DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'INATIVO', 'SUSPENSO')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Criar tabela de contas
        const createContasTable = `
            CREATE TABLE IF NOT EXISTS contas (
                numero_conta TEXT PRIMARY KEY,
                cpf_cliente TEXT NOT NULL,
                saldo DECIMAL(15,2) DEFAULT 0.00,
                tipo_conta TEXT NOT NULL CHECK (tipo_conta IN ('corrente', 'poupanca')),
                ativa BOOLEAN DEFAULT TRUE,
                limite_diario DECIMAL(15,2) DEFAULT 5000.00,
                agencia TEXT DEFAULT '0001',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cpf_cliente) REFERENCES clientes(cpf)
            )
        `;

        // Executar criação das tabelas
        await database.run(createClientesTable);
        logger.info('Tabela clientes criada/verificada com sucesso');

        await database.run(createContasTable);
        logger.info('Tabela contas criada/verificada com sucesso');

        // Criar índices para performance
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email)',
            'CREATE INDEX IF NOT EXISTS idx_contas_cliente ON contas(cpf_cliente)',
            'CREATE INDEX IF NOT EXISTS idx_contas_ativa ON contas(ativa)'
        ];

        for (const indexSql of indexes) {
            await database.run(indexSql);
        }
        logger.info('Índices criados com sucesso');

        // Criar triggers para updated_at automático
        const triggerClientes = `
            CREATE TRIGGER IF NOT EXISTS atualizar_cliente_timestamp 
            AFTER UPDATE ON clientes
            FOR EACH ROW
            BEGIN
                UPDATE clientes SET updated_at = CURRENT_TIMESTAMP WHERE cpf = NEW.cpf;
            END
        `;

        const triggerContas = `
            CREATE TRIGGER IF NOT EXISTS atualizar_conta_timestamp 
            AFTER UPDATE ON contas
            FOR EACH ROW
            BEGIN
                UPDATE contas SET updated_at = CURRENT_TIMESTAMP WHERE numero_conta = NEW.numero_conta;
            END
        `;

        await database.run(triggerClientes);
        await database.run(triggerContas);
        logger.info('Triggers criados com sucesso');

        logger.info('Banco de dados inicializado com sucesso! 🎉');

    } catch (error) {
        logger.error('Erro ao inicializar banco de dados:', error);
        process.exit(1);
    }
}

// Se chamado diretamente, executar inicialização
if (require.main === module) {
    initDatabase().then(() => {
        process.exit(0);
    });
}

module.exports = initDatabase;