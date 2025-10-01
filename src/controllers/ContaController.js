const Conta = require('../models/Conta');
const logger = require('../config/logger');
const { contaSchema, cpfParamSchema, numeroContaParamSchema } = require('../utils/validators');
const { asyncHandler } = require('../middleware/errorHandler');

class ContaController {
    /**
     * Criar nova conta
     * POST /api/contas
     */
    static criarConta = asyncHandler(async (req, res) => {
        // Validar dados de entrada
        const { error, value } = contaSchema.validate(req.body);
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

        // Criar conta
        const conta = await Conta.criar(value);

        logger.info('Conta criada via API:', { 
            numero_conta: conta.numero_conta, 
            cpf_cliente: conta.cpf_cliente,
            tipo_conta: conta.tipo_conta 
        });

        res.status(201).json({
            success: true,
            message: 'Conta criada com sucesso',
            data: conta,
            timestamp: new Date().toISOString()
        });
    });

    /**
     * Buscar conta por número
     * GET /api/contas/numero/:numero
     */
    static buscarConta = asyncHandler(async (req, res) => {
        // Validar parâmetro número da conta
        const { error, value } = numeroContaParamSchema.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Número da conta inválido',
                    details: error.details.map(detail => detail.message)
                },
                timestamp: new Date().toISOString()
            });
        }

        // Buscar conta
        const conta = await Conta.buscarPorNumero(value.numero);

        if (!conta) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Conta não encontrada',
                    code: 404
                },
                timestamp: new Date().toISOString()
            });
        }

        res.json({
            success: true,
            data: conta,
            timestamp: new Date().toISOString()
        });
    });

    /**
     * Consultar saldo da conta
     * GET /api/contas/saldo/:numero
     */
    static consultarSaldo = asyncHandler(async (req, res) => {
        // Validar parâmetro número da conta
        const { error, value } = numeroContaParamSchema.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Número da conta inválido',
                    details: error.details.map(detail => detail.message)
                },
                timestamp: new Date().toISOString()
            });
        }

        // Consultar saldo
        const saldoInfo = await Conta.consultarSaldo(value.numero);

        logger.info('Saldo consultado via API:', { numero_conta: value.numero });

        res.json({
            success: true,
            data: saldoInfo,
            timestamp: new Date().toISOString()
        });
    });

    /**
     * Listar contas de um cliente
     * GET /api/contas/cliente/:cpf
     */
    static listarContasCliente = asyncHandler(async (req, res) => {
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

        // Listar contas do cliente
        const contas = await Conta.listarPorCliente(value.cpf);

        res.json({
            success: true,
            data: contas,
            count: contas.length,
            timestamp: new Date().toISOString()
        });
    });

    /**
     * Listar todas as contas
     * GET /api/contas
     */
    static listarContas = asyncHandler(async (req, res) => {
        const contas = await Conta.listar();

        res.json({
            success: true,
            data: contas,
            count: contas.length,
            timestamp: new Date().toISOString()
        });
    });

    /**
     * Atualizar saldo da conta (para uso interno/administrativo)
     * PUT /api/contas/:numero/saldo
     */
    static atualizarSaldo = asyncHandler(async (req, res) => {
        // Validar parâmetro número da conta
        const { error: paramError, value: paramValue } = numeroContaParamSchema.validate(req.params);
        if (paramError) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Número da conta inválido',
                    details: paramError.details.map(detail => detail.message)
                },
                timestamp: new Date().toISOString()
            });
        }

        // Validar novo saldo
        const { novo_saldo } = req.body;
        if (typeof novo_saldo !== 'number' || novo_saldo < 0) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Novo saldo deve ser um número maior ou igual a zero'
                },
                timestamp: new Date().toISOString()
            });
        }

        // Atualizar saldo
        const conta = await Conta.atualizarSaldo(paramValue.numero, novo_saldo);

        logger.info('Saldo atualizado via API:', { 
            numero_conta: paramValue.numero, 
            novo_saldo: novo_saldo 
        });

        res.json({
            success: true,
            message: 'Saldo atualizado com sucesso',
            data: conta,
            timestamp: new Date().toISOString()
        });
    });

    /**
     * Desativar conta
     * DELETE /api/contas/:numero
     */
    static desativarConta = asyncHandler(async (req, res) => {
        // Validar parâmetro número da conta
        const { error, value } = numeroContaParamSchema.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Número da conta inválido',
                    details: error.details.map(detail => detail.message)
                },
                timestamp: new Date().toISOString()
            });
        }

        // Desativar conta
        await Conta.desativar(value.numero);

        logger.info('Conta desativada via API:', { numero_conta: value.numero });

        res.json({
            success: true,
            message: 'Conta desativada com sucesso',
            timestamp: new Date().toISOString()
        });
    });
}

module.exports = ContaController;