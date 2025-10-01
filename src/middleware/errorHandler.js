const logger = require('../config/logger');

/**
 * Middleware para tratamento centralizado de erros
 */
const errorHandler = (err, req, res, next) => {
    // Log do erro completo
    logger.error('Erro na aplicação:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Determinar código de status HTTP
    let statusCode = 500;
    let message = 'Erro interno do servidor';

    // Errors específicos da aplicação
    if (err.message.includes('não encontrado')) {
        statusCode = 404;
        message = err.message;
    } else if (err.message.includes('já existe') || 
               err.message.includes('inválido') ||
               err.message.includes('obrigatório') ||
               err.message.includes('Nenhum dado')) {
        statusCode = 400;
        message = err.message;
    } else if (err.message.includes('não autorizado')) {
        statusCode = 401;
        message = err.message;
    } else if (err.message.includes('acesso negado')) {
        statusCode = 403;
        message = err.message;
    }

    // Em desenvolvimento, incluir stack trace
    const response = {
        success: false,
        error: {
            message: message,
            code: statusCode
        },
        timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === 'development') {
        response.error.stack = err.stack;
        response.error.details = err.message;
    }

    res.status(statusCode).json(response);
};

/**
 * Middleware para capturar rotas não encontradas (404)
 */
const notFoundHandler = (req, res) => {
    logger.warn('Rota não encontrada:', {
        url: req.url,
        method: req.method,
        ip: req.ip
    });

    res.status(404).json({
        success: false,
        error: {
            message: 'Rota não encontrada',
            code: 404
        },
        timestamp: new Date().toISOString()
    });
};

/**
 * Middleware para capturar erros async/await
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};