const express = require('express');
const ClienteController = require('../controllers/ClienteController');
const { logSanitizedBody, performanceLogger } = require('../middleware/requestLogger');

const router = express.Router();

/**
 * @route   POST /api/clientes
 * @desc    Cadastrar novo cliente
 * @access  Public
 */
router.post('/', 
    logSanitizedBody,
    performanceLogger('criar_cliente'),
    ClienteController.criarCliente
);

/**
 * @route   GET /api/clientes
 * @desc    Listar todos os clientes
 * @access  Public
 */
router.get('/', 
    performanceLogger('listar_clientes'),
    ClienteController.listarClientes
);

/**
 * @route   GET /api/clientes/:cpf
 * @desc    Buscar cliente por CPF
 * @access  Public
 */
router.get('/:cpf', 
    performanceLogger('buscar_cliente'),
    ClienteController.buscarCliente
);

/**
 * @route   PUT /api/clientes/:cpf
 * @desc    Atualizar dados do cliente
 * @access  Public
 */
router.put('/:cpf', 
    logSanitizedBody,
    performanceLogger('atualizar_cliente'),
    ClienteController.atualizarCliente
);

/**
 * @route   DELETE /api/clientes/:cpf
 * @desc    Desativar cliente
 * @access  Public
 */
router.delete('/:cpf', 
    performanceLogger('desativar_cliente'),
    ClienteController.desativarCliente
);

module.exports = router;