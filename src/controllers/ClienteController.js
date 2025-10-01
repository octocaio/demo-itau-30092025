const Cliente = require('../models/Cliente');
const logger = require('../config/logger');
const { clienteSchema, cpfParamSchema } = require('../utils/validators');
const { asyncHandler } = require('../middleware/errorHandler');

class ClienteController {
    /**
     * Criar novo cliente
     * POST /api/clientes
     */
    static criarCliente = asyncHandler(async (req, res) => {
        // Validar dados de entrada
        const { error, value } = clienteSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Dados inválidos',
                    details: error.details.map(detail => detail.message)
                },
                timestamp: new Date().toISOString()
            });
        }

        // Criar cliente
        const cliente = await Cliente.criar(value);

        logger.info('Cliente criado via API:', { cpf: cliente.cpf, nome: cliente.nome });

        res.status(201).json({
            success: true,
            message: 'Cliente criado com sucesso',
            data: cliente,
            timestamp: new Date().toISOString()
        });
    });

    /**
     * Buscar cliente por CPF
     * GET /api/clientes/:cpf
     */
    static buscarCliente = asyncHandler(async (req, res) => {
        // Validar parâmetro CPF
        const { error, value } = cpfParamSchema.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'CPF inválido',
                    details: error.details.map(detail => detail.message)
                },
                timestamp: new Date().toISOString()
            });
        }

        // Buscar cliente
        const cliente = await Cliente.buscarPorCpf(value.cpf);

        if (!cliente) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Cliente não encontrado',
                    code: 404
                },
                timestamp: new Date().toISOString()
            });
        }

        res.json({
            success: true,
            data: cliente,
            timestamp: new Date().toISOString()
        });
    });

    /**
     * Listar todos os clientes
     * GET /api/clientes
     */
    static listarClientes = asyncHandler(async (req, res) => {
        const clientes = await Cliente.listar();

        res.json({
            success: true,
            data: clientes,
            count: clientes.length,
            timestamp: new Date().toISOString()
        });
    });

    /**
     * Atualizar cliente
     * PUT /api/clientes/:cpf
     */
    static atualizarCliente = asyncHandler(async (req, res) => {
        // Validar parâmetro CPF
        const { error: paramError, value: paramValue } = cpfParamSchema.validate(req.params);
        if (paramError) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'CPF inválido',
                    details: paramError.details.map(detail => detail.message)
                },
                timestamp: new Date().toISOString()
            });
        }

        // Validar dados de entrada (parcial)
        const { error: bodyError, value: bodyValue } = clienteSchema.validate(req.body, { 
            allowUnknown: false,
            stripUnknown: true,
            presence: 'optional' // Permitir campos opcionais para atualização
        });
        
        if (bodyError) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Dados inválidos',
                    details: bodyError.details.map(detail => detail.message)
                },
                timestamp: new Date().toISOString()
            });
        }

        // Atualizar cliente
        const cliente = await Cliente.atualizar(paramValue.cpf, bodyValue);

        logger.info('Cliente atualizado via API:', { cpf: cliente.cpf });

        res.json({
            success: true,
            message: 'Cliente atualizado com sucesso',
            data: cliente,
            timestamp: new Date().toISOString()
        });
    });

    /**
     * Desativar cliente
     * DELETE /api/clientes/:cpf
     */
    static desativarCliente = asyncHandler(async (req, res) => {
        // Validar parâmetro CPF
        const { error, value } = cpfParamSchema.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'CPF inválido',
                    details: error.details.map(detail => detail.message)
                },
                timestamp: new Date().toISOString()
            });
        }

        // Desativar cliente
        await Cliente.desativar(value.cpf);

        logger.info('Cliente desativado via API:', { cpf: value.cpf });

        res.json({
            success: true,
            message: 'Cliente desativado com sucesso',
            timestamp: new Date().toISOString()
        });
    });
}

module.exports = ClienteController;