const logger = require('../config/logger');

/**
 * Utilitário para tratamento padronizado de erros em models
 * 
 * Centraliza o padrão try/catch usado repetidamente nos models,
 * reduzindo duplicação de código e garantindo log consistente.
 */
class ModelWrapper {
    /**
     * Executa uma operação de banco de dados com tratamento de erros padronizado
     * @param {Function} operation - Função assíncrona que executa a operação
     * @param {string} operationName - Nome descritivo da operação (para logs)
     * @param {string} errorMessage - Mensagem de erro customizada (opcional)
     * @returns {Promise<*>} Resultado da operação
     */
    static async execute(operation, operationName, errorMessage = null) {
        try {
            return await operation();
        } catch (error) {
            logger.error(`Erro ao ${operationName}:`, error);
            
            // Usar mensagem de erro customizada ou padrão
            const message = errorMessage || `Erro interno do servidor ao ${operationName}`;
            
            // Re-lançar o erro original se já for um Error com mensagem customizada
            // (ex: "Cliente não encontrado", "Email já está em uso")
            if (error.message && !error.message.includes('SQLITE') && !error.code) {
                throw error;
            }
            
            // Para erros do SQLite, lançar erro genérico
            throw new Error(message);
        }
    }

    /**
     * Executa operação com tratamento de erros de constraint do SQLite
     * @param {Function} operation - Função assíncrona que executa a operação
     * @param {string} operationName - Nome descritivo da operação
     * @param {Object} constraintMessages - Mapeamento de códigos de erro para mensagens
     * @returns {Promise<*>} Resultado da operação
     */
    static async executeWithConstraints(operation, operationName, constraintMessages = {}) {
        try {
            return await operation();
        } catch (error) {
            logger.error(`Erro ao ${operationName}:`, error);
            
            // Tratar erros específicos de constraint
            if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' && constraintMessages.primaryKey) {
                throw new Error(constraintMessages.primaryKey);
            }
            
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' && constraintMessages.unique) {
                throw new Error(constraintMessages.unique);
            }
            
            if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' && constraintMessages.foreignKey) {
                throw new Error(constraintMessages.foreignKey);
            }
            
            // Para outros erros, usar mensagem padrão
            throw new Error(`Erro interno do servidor ao ${operationName}`);
        }
    }
}

module.exports = ModelWrapper;
