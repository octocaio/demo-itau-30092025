const logger = require('../config/logger');

/**
 * Classe utilitária para padronização de respostas HTTP da API
 * 
 * Centraliza a formatação de respostas para eliminar duplicação de código
 * e garantir consistência em todas as rotas da API.
 */
class ResponseFormatter {
    /**
     * Formatar resposta de sucesso
     * @param {Object} res - Objeto de resposta do Express
     * @param {*} data - Dados a serem retornados
     * @param {string} message - Mensagem de sucesso
     * @param {number} statusCode - Código HTTP de status (padrão: 200)
     * @returns {Object} Resposta JSON formatada
     */
    static success(res, data, message = 'Operação realizada com sucesso', statusCode = 200) {
        const response = {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        };

        // Adicionar contagem se data for um array
        if (Array.isArray(data)) {
            response.count = data.length;
        }

        return res.status(statusCode).json(response);
    }

    /**
     * Formatar resposta de erro genérico
     * @param {Object} res - Objeto de resposta do Express
     * @param {string} message - Mensagem de erro
     * @param {*} details - Detalhes adicionais do erro (opcional)
     * @param {number} statusCode - Código HTTP de status (padrão: 400)
     * @returns {Object} Resposta JSON formatada
     */
    static error(res, message, details = null, statusCode = 400) {
        const response = {
            success: false,
            error: {
                message,
                code: statusCode
            },
            timestamp: new Date().toISOString()
        };

        if (details) {
            response.error.details = details;
        }

        return res.status(statusCode).json(response);
    }

    /**
     * Formatar resposta de erro de validação (Joi)
     * @param {Object} res - Objeto de resposta do Express
     * @param {Object} joiError - Objeto de erro do Joi
     * @param {string} message - Mensagem customizada (opcional)
     * @returns {Object} Resposta JSON formatada
     */
    static validationError(res, joiError, message = 'Dados inválidos') {
        const details = joiError.details.map(detail => detail.message);
        
        logger.warn('Erro de validação:', { message, details });
        
        return this.error(res, message, details, 400);
    }

    /**
     * Formatar resposta de recurso não encontrado (404)
     * @param {Object} res - Objeto de resposta do Express
     * @param {string} entity - Nome da entidade não encontrada
     * @returns {Object} Resposta JSON formatada
     */
    static notFound(res, entity = 'Recurso') {
        return this.error(res, `${entity} não encontrado`, null, 404);
    }

    /**
     * Formatar resposta de sucesso sem conteúdo
     * @param {Object} res - Objeto de resposta do Express
     * @param {string} message - Mensagem de sucesso
     * @returns {Object} Resposta JSON formatada
     */
    static noContent(res, message = 'Operação realizada com sucesso') {
        return res.status(200).json({
            success: true,
            message,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Formatar resposta de criação de recurso (201)
     * @param {Object} res - Objeto de resposta do Express
     * @param {*} data - Dados do recurso criado
     * @param {string} message - Mensagem de sucesso
     * @returns {Object} Resposta JSON formatada
     */
    static created(res, data, message = 'Recurso criado com sucesso') {
        return this.success(res, data, message, 201);
    }
}

module.exports = ResponseFormatter;
