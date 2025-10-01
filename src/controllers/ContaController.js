const Conta = require('../models/Conta');
const logger = require('../config/logger');
const { contaSchema, cpfParamSchema, numeroContaParamSchema } = require('../utils/validators');
const { asyncHandler } = require('../middleware/errorHandler');
const ResponseFormatter = require('../utils/responseFormatter');

class ContaController {
    /**
     * Criar nova conta
     * POST /api/contas
     */
    static criarConta = asyncHandler(async (req, res) => {
        // Validar dados de entrada
        const { error, value } = contaSchema.validate(req.body);
        if (error) {
            return ResponseFormatter.validationError(res, error);
        }

        // Criar conta
        const conta = await Conta.criar(value);

        logger.info('Conta criada via API:', { 
            numero_conta: conta.numero_conta, 
            cpf_cliente: conta.cpf_cliente,
            tipo_conta: conta.tipo_conta 
        });

        return ResponseFormatter.created(res, conta, 'Conta criada com sucesso');
    });

    /**
     * Buscar conta por número
     * GET /api/contas/numero/:numero
     */
    static buscarConta = asyncHandler(async (req, res) => {
        // Validar parâmetro número da conta
        const { error, value } = numeroContaParamSchema.validate(req.params);
        if (error) {
            return ResponseFormatter.validationError(res, error, 'Número da conta inválido');
        }

        // Buscar conta
        const conta = await Conta.buscarPorNumero(value.numero);

        if (!conta) {
            return ResponseFormatter.notFound(res, 'Conta');
        }

        return ResponseFormatter.success(res, conta);
    });

    /**
     * Consultar saldo da conta
     * GET /api/contas/saldo/:numero
     */
    static consultarSaldo = asyncHandler(async (req, res) => {
        // Validar parâmetro número da conta
        const { error, value } = numeroContaParamSchema.validate(req.params);
        if (error) {
            return ResponseFormatter.validationError(res, error, 'Número da conta inválido');
        }

        // Consultar saldo
        const saldoInfo = await Conta.consultarSaldo(value.numero);

        logger.info('Saldo consultado via API:', { numero_conta: value.numero });

        return ResponseFormatter.success(res, saldoInfo);
    });

    /**
     * Listar contas de um cliente
     * GET /api/contas/cliente/:cpf
     */
    static listarContasCliente = asyncHandler(async (req, res) => {
        // Validar parâmetro CPF
        const { error, value } = cpfParamSchema.validate(req.params);
        if (error) {
            return ResponseFormatter.validationError(res, error, 'CPF inválido');
        }

        // Listar contas do cliente
        const contas = await Conta.listarPorCliente(value.cpf);

        return ResponseFormatter.success(res, contas);
    });

    /**
     * Listar todas as contas
     * GET /api/contas
     */
    static listarContas = asyncHandler(async (req, res) => {
        const contas = await Conta.listar();

        return ResponseFormatter.success(res, contas);
    });

    /**
     * Atualizar saldo da conta (para uso interno/administrativo)
     * PUT /api/contas/:numero/saldo
     */
    static atualizarSaldo = asyncHandler(async (req, res) => {
        // Validar parâmetro número da conta
        const { error: paramError, value: paramValue } = numeroContaParamSchema.validate(req.params);
        if (paramError) {
            return ResponseFormatter.validationError(res, paramError, 'Número da conta inválido');
        }

        // Validar novo saldo
        const { novo_saldo } = req.body;
        if (typeof novo_saldo !== 'number' || novo_saldo < 0) {
            return ResponseFormatter.error(res, 'Novo saldo deve ser um número maior ou igual a zero');
        }

        // Atualizar saldo
        const conta = await Conta.atualizarSaldo(paramValue.numero, novo_saldo);

        logger.info('Saldo atualizado via API:', { 
            numero_conta: paramValue.numero, 
            novo_saldo: novo_saldo 
        });

        return ResponseFormatter.success(res, conta, 'Saldo atualizado com sucesso');
    });

    /**
     * Desativar conta
     * DELETE /api/contas/:numero
     */
    static desativarConta = asyncHandler(async (req, res) => {
        // Validar parâmetro número da conta
        const { error, value } = numeroContaParamSchema.validate(req.params);
        if (error) {
            return ResponseFormatter.validationError(res, error, 'Número da conta inválido');
        }

        // Desativar conta
        await Conta.desativar(value.numero);

        logger.info('Conta desativada via API:', { numero_conta: value.numero });

        return ResponseFormatter.noContent(res, 'Conta desativada com sucesso');
    });
}

module.exports = ContaController;