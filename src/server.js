const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Importar configurações
const database = require('./config/database');
const logger = require('./config/logger');
const initDatabase = require('./config/initDatabase');

// Importar middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');

// Importar rotas
const clienteRoutes = require('./routes/clienteRoutes');
const contaRoutes = require('./routes/contaRoutes');

// Criar aplicação Express
const app = express();

// Configurar porta
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));

// Middleware CORS
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API Bancária Itaú está funcionando',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Endpoint raiz com informações da API
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Bem-vindo à API Bancária Itaú',
        version: '1.0.0',
        documentation: {
            endpoints: {
                clientes: {
                    'POST /api/clientes': 'Cadastrar novo cliente',
                    'GET /api/clientes': 'Listar todos os clientes',
                    'GET /api/clientes/:cpf': 'Buscar cliente por CPF',
                    'PUT /api/clientes/:cpf': 'Atualizar cliente',
                    'DELETE /api/clientes/:cpf': 'Desativar cliente'
                },
                contas: {
                    'POST /api/contas': 'Criar nova conta',
                    'GET /api/contas': 'Listar todas as contas',
                    'GET /api/contas/numero/:numero': 'Buscar conta por número',
                    'GET /api/contas/saldo/:numero': 'Consultar saldo',
                    'GET /api/contas/cliente/:cpf': 'Listar contas do cliente',
                    'PUT /api/contas/:numero/saldo': 'Atualizar saldo',
                    'DELETE /api/contas/:numero': 'Desativar conta'
                },
                utilitarios: {
                    'GET /health': 'Health check da API'
                }
            }
        },
        timestamp: new Date().toISOString()
    });
});

// Registrar rotas da API
app.use('/api/clientes', clienteRoutes);
app.use('/api/contas', contaRoutes);

// Middleware para rotas não encontradas
app.use(notFoundHandler);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Função para inicializar o servidor
async function startServer() {
    try {
        // Inicializar banco de dados
        logger.info('Inicializando banco de dados...');
        await initDatabase();
        
        // Iniciar servidor
        const server = app.listen(PORT, () => {
            logger.info(`🏦 Servidor da API Bancária iniciado com sucesso!`, {
                port: PORT,
                environment: process.env.NODE_ENV || 'development',
                timestamp: new Date().toISOString()
            });
            
            console.log(`
🎉 API Bancária Itaú está rodando!
🌐 URL: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/health
📚 Documentação: http://localhost:${PORT}/

📋 Endpoints principais:
   • POST /api/clientes - Cadastrar cliente
   • GET /api/clientes/:cpf - Buscar cliente
   • POST /api/contas - Criar conta
   • GET /api/contas/saldo/:numero - Consultar saldo

🔧 Para desenvolvimento:
   • npm run dev - Executar com nodemon
   • npm run init-db - Reinicializar banco de dados
   • npm test - Executar testes
            `);
        });

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            logger.info('Recebido SIGTERM. Iniciando shutdown graceful...');
            
            server.close(async () => {
                logger.info('Servidor HTTP fechado.');
                
                try {
                    await database.close();
                    logger.info('Conexão com banco de dados fechada.');
                    process.exit(0);
                } catch (error) {
                    logger.error('Erro ao fechar conexão com banco:', error);
                    process.exit(1);
                }
            });
        });

        process.on('SIGINT', async () => {
            logger.info('Recebido SIGINT. Iniciando shutdown graceful...');
            
            server.close(async () => {
                logger.info('Servidor HTTP fechado.');
                
                try {
                    await database.close();
                    logger.info('Conexão com banco de dados fechada.');
                    process.exit(0);
                } catch (error) {
                    logger.error('Erro ao fechar conexão com banco:', error);
                    process.exit(1);
                }
            });
        });

    } catch (error) {
        logger.error('Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Inicializar servidor se executado diretamente
if (require.main === module) {
    startServer();
}

module.exports = app;