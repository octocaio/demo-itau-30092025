const express = require('express');
const ContaController = require('../controllers/ContaController');
const { logSanitizedBody, performanceLogger } = require('../middleware/requestLogger');

const router = express.Router();

/**
 * @route   POST /api/contas
 * @desc    Criar nova conta
 * @access  Public
 */
router.post('/', 
    logSanitizedBody,
    performanceLogger('criar_conta'),
    ContaController.criarConta
);

/**
 * @route   GET /api/contas
 * @desc    Listar todas as contas
 * @access  Public
 */
router.get('/', 
    performanceLogger('listar_contas'),
    ContaController.listarContas
);

/**
 * @route   GET /api/contas/numero/:numero
 * @desc    Buscar conta por número
 * @access  Public
 */
router.get('/numero/:numero', 
    performanceLogger('buscar_conta'),
    ContaController.buscarConta
);

/**
 * @route   GET /api/contas/saldo/:numero
 * @desc    Consultar saldo da conta
 * @access  Public
 */
router.get('/saldo/:numero', 
    performanceLogger('consultar_saldo'),
    ContaController.consultarSaldo
);

/**
 * @route   GET /api/contas/cliente/:cpf
 * @desc    Listar contas de um cliente
 * @access  Public
 */
router.get('/cliente/:cpf', 
    performanceLogger('listar_contas_cliente'),
    ContaController.listarContasCliente
);

/**
 * @route   PUT /api/contas/:numero/saldo
 * @desc    Atualizar saldo da conta (uso administrativo)
 * @access  Public
 */
router.put('/:numero/saldo', 
    logSanitizedBody,
    performanceLogger('atualizar_saldo'),
    ContaController.atualizarSaldo
);

/**
 * @route   DELETE /api/contas/:numero
 * @desc    Desativar conta
 * @access  Public
 */
router.delete('/:numero', 
    performanceLogger('desativar_conta'),
    ContaController.desativarConta
);

module.exports = router;