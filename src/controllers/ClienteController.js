const Cliente = require('../models/Cliente');
const logger = require('../config/logger');
const { clienteSchema, cpfParamSchema } = require('../utils/validators');
const { asyncHandler } = require('../middleware/errorHandler');
const ResponseFormatter = require('../utils/responseFormatter');

class ClienteController {
    /**
     * Criar novo cliente
     * POST /api/clientes
     */
    static criarCliente = asyncHandler(async (req, res) => {
        // Validar dados de entrada
        const { error, value } = clienteSchema.validate(req.body);
        if (error) {
            return ResponseFormatter.validationError(res, error);
        }

        // Criar cliente
        const cliente = await Cliente.criar(value);

        logger.info('Cliente criado via API:', { cpf: cliente.cpf, nome: cliente.nome });

        return ResponseFormatter.created(res, cliente, 'Cliente criado com sucesso');
    });

    /**
     * Buscar cliente por CPF
     * GET /api/clientes/:cpf
     */
    static buscarCliente = asyncHandler(async (req, res) => {
        // Validar parâmetro CPF
        const { error, value } = cpfParamSchema.validate(req.params);
        if (error) {
            return ResponseFormatter.validationError(res, error, 'CPF inválido');
        }

        // Buscar cliente
        const cliente = await Cliente.buscarPorCpf(value.cpf);

        if (!cliente) {
            return ResponseFormatter.notFound(res, 'Cliente');
        }

        return ResponseFormatter.success(res, cliente);
    });

    /**
     * Listar todos os clientes
     * GET /api/clientes
     */
    static listarClientes = asyncHandler(async (req, res) => {
        const clientes = await Cliente.listar();

        return ResponseFormatter.success(res, clientes);
    });

    /**
     * Atualizar cliente
     * PUT /api/clientes/:cpf
     */
    static atualizarCliente = asyncHandler(async (req, res) => {
        // Validar parâmetro CPF
        const { error: paramError, value: paramValue } = cpfParamSchema.validate(req.params);
        if (paramError) {
            return ResponseFormatter.validationError(res, paramError, 'CPF inválido');
        }

        // Validar dados de entrada (parcial)
        const { error: bodyError, value: bodyValue } = clienteSchema.validate(req.body, { 
            allowUnknown: false,
            stripUnknown: true,
            presence: 'optional' // Permitir campos opcionais para atualização
        });
        
        if (bodyError) {
            return ResponseFormatter.validationError(res, bodyError);
        }

        // Atualizar cliente
        const cliente = await Cliente.atualizar(paramValue.cpf, bodyValue);

        logger.info('Cliente atualizado via API:', { cpf: cliente.cpf });

        return ResponseFormatter.success(res, cliente, 'Cliente atualizado com sucesso');
    });

    /**
     * Desativar cliente
     * DELETE /api/clientes/:cpf
     */
    static desativarCliente = asyncHandler(async (req, res) => {
        // Validar parâmetro CPF
        const { error, value } = cpfParamSchema.validate(req.params);
        if (error) {
            return ResponseFormatter.validationError(res, error, 'CPF inválido');
        }

        // Desativar cliente
        await Cliente.desativar(value.cpf);

        logger.info('Cliente desativado via API:', { cpf: value.cpf });

        return ResponseFormatter.noContent(res, 'Cliente desativado com sucesso');
    });
}

module.exports = ClienteController;