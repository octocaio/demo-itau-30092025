const logger = require('../config/logger');

/**
 * Middleware para log de requisições HTTP
 */
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    
    // Capturar informações da requisição
    const requestInfo = {
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    };

    // Log da requisição recebida
    logger.info('Requisição recebida:', requestInfo);

    // Interceptar o final da resposta para log
    const originalEnd = res.end;
    
    res.end = function(chunk, encoding) {
        // Calcular tempo de resposta
        const responseTime = Date.now() - startTime;
        
        // Informações da resposta
        const responseInfo = {
            ...requestInfo,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            contentLength: res.get('content-length') || 0
        };

        // Log baseado no status code
        if (res.statusCode >= 500) {
            logger.error('Erro interno do servidor:', responseInfo);
        } else if (res.statusCode >= 400) {
            logger.warn('Erro de cliente:', responseInfo);
        } else {
            logger.info('Resposta enviada:', responseInfo);
        }

        // Chamar o método original
        originalEnd.call(this, chunk, encoding);
    };

    next();
};

/**
 * Middleware para log de dados sensíveis (sanitizado)
 */
const logSanitizedBody = (req, res, next) => {
    if (req.body && Object.keys(req.body).length > 0) {
        // Sanitizar dados sensíveis antes do log
        const sanitizedBody = { ...req.body };
        
        // Lista de campos sensíveis que não devem aparecer nos logs
        const sensitiveFields = ['password', 'senha', 'token', 'authorization'];
        
        sensitiveFields.forEach(field => {
            if (sanitizedBody[field]) {
                sanitizedBody[field] = '[REDACTED]';
            }
        });

        // Mascarar CPF parcialmente nos logs
        if (sanitizedBody.cpf) {
            const cpf = sanitizedBody.cpf.replace(/[^\d]/g, '');
            sanitizedBody.cpf = cpf.replace(/(\d{3})\d{5}(\d{2})/, '$1.***.***-$2');
        }
        
        if (sanitizedBody.cpf_cliente) {
            const cpf = sanitizedBody.cpf_cliente.replace(/[^\d]/g, '');
            sanitizedBody.cpf_cliente = cpf.replace(/(\d{3})\d{5}(\d{2})/, '$1.***.***-$2');
        }

        logger.info('Body da requisição (sanitizado):', {
            url: req.url,
            method: req.method,
            body: sanitizedBody
        });
    }

    next();
};

/**
 * Middleware para log de performance de operações críticas
 */
const performanceLogger = (operacao) => {
    return (req, res, next) => {
        const startTime = process.hrtime.bigint();
        
        // Interceptar o final da resposta
        const originalEnd = res.end;
        
        res.end = function(chunk, encoding) {
            const endTime = process.hrtime.bigint();
            const duration = Number(endTime - startTime) / 1000000; // Converter para ms
            
            // Log de performance se operação demorou mais de 1 segundo
            if (duration > 1000) {
                logger.warn('Operação lenta detectada:', {
                    operacao: operacao,
                    duracao: `${duration.toFixed(2)}ms`,
                    url: req.url,
                    method: req.method
                });
            } else {
                logger.info('Performance da operação:', {
                    operacao: operacao,
                    duracao: `${duration.toFixed(2)}ms`,
                    url: req.url,
                    method: req.method
                });
            }
            
            originalEnd.call(this, chunk, encoding);
        };
        
        next();
    };
};

module.exports = {
    requestLogger,
    logSanitizedBody,
    performanceLogger
};