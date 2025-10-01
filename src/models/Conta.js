const database = require('../config/database');
const logger = require('../config/logger');
const Cliente = require('./Cliente');
const { limparCPF } = require('../utils/cpfValidator');
const ModelWrapper = require('../utils/modelWrapper');

class Conta {
    /**
     * Gerar número único de conta
     * @returns {Promise<string>} Número da conta gerado
     */
    static async gerarNumeroConta() {
        let numero;
        let existe = true;
        
        // Gerar números até encontrar um que não existe
        while (existe) {
            numero = Math.floor(100000 + Math.random() * 900000).toString();
            const conta = await this.buscarPorNumero(numero);
            existe = !!conta;
        }
        
        return numero;
    }
    
    /**
     * Criar nova conta
     * @param {Object} dadosConta - Dados da conta
     * @returns {Promise<Object>} Conta criada
     */
    static async criar(dadosConta) {
        try {
            // Limpar CPF do cliente
            const cpfClienteLimpo = limparCPF(dadosConta.cpf_cliente);
            
            // Verificar se cliente existe
            const clienteExiste = await Cliente.existe(cpfClienteLimpo);
            if (!clienteExiste) {
                throw new Error('Cliente não encontrado. Cadastre o cliente antes de criar a conta.');
            }
            
            // Gerar número único da conta
            const numeroConta = await this.gerarNumeroConta();
            
            const query = `
                INSERT INTO contas (
                    numero_conta, cpf_cliente, tipo_conta, saldo,
                    limite_diario, agencia
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            const valores = [
                numeroConta,
                cpfClienteLimpo,
                dadosConta.tipo_conta,
                dadosConta.saldo_inicial || 0.00,
                dadosConta.limite_diario || 5000.00,
                dadosConta.agencia || '0001'
            ];
            
            await database.run(query, valores);
            
            logger.info('Conta criada com sucesso', { 
                numero_conta: numeroConta, 
                cpf_cliente: cpfClienteLimpo, 
                tipo_conta: dadosConta.tipo_conta 
            });
            
            // Retornar a conta criada
            return await this.buscarPorNumero(numeroConta);
            
        } catch (error) {
            logger.error('Erro ao criar conta:', error);
            throw error;
        }
    }
    
    /**
     * Buscar conta por número
     * @param {string} numeroConta - Número da conta
     * @returns {Promise<Object|null>} Conta encontrada ou null
     */
    static async buscarPorNumero(numeroConta) {
        return ModelWrapper.execute(
            async () => {
                const query = 'SELECT * FROM contas WHERE numero_conta = ? AND ativa = 1';
                const conta = await database.get(query, [numeroConta]);
                
                if (conta) {
                    // Converter valores numéricos
                    conta.saldo = parseFloat(conta.saldo);
                    conta.limite_diario = parseFloat(conta.limite_diario);
                    conta.ativa = !!conta.ativa;
                }
                
                return conta;
            },
            'buscar conta por número'
        );
    }
    
    /**
     * Listar contas por cliente
     * @param {string} cpfCliente - CPF do cliente
     * @returns {Promise<Array>} Lista de contas do cliente
     */
    static async listarPorCliente(cpfCliente) {
        return ModelWrapper.execute(
            async () => {
                const cpfLimpo = limparCPF(cpfCliente);
                
                const query = `
                    SELECT c.*, cl.nome as nome_cliente
                    FROM contas c
                    JOIN clientes cl ON c.cpf_cliente = cl.cpf
                    WHERE c.cpf_cliente = ? AND c.ativa = 1
                    ORDER BY c.created_at DESC
                `;
                
                const contas = await database.all(query, [cpfLimpo]);
                
                // Formatar valores numéricos
                return contas.map(conta => ({
                    ...conta,
                    saldo: parseFloat(conta.saldo),
                    limite_diario: parseFloat(conta.limite_diario),
                    ativa: !!conta.ativa
                }));
            },
            'listar contas por cliente'
        );
    }
    
    /**
     * Consultar saldo da conta
     * @param {string} numeroConta - Número da conta
     * @returns {Promise<Object>} Informações de saldo
     */
    static async consultarSaldo(numeroConta) {
        try {
            const query = `
                SELECT 
                    c.numero_conta,
                    c.saldo,
                    c.tipo_conta,
                    c.agencia,
                    cl.nome as nome_cliente,
                    c.updated_at as ultima_atualizacao
                FROM contas c
                JOIN clientes cl ON c.cpf_cliente = cl.cpf
                WHERE c.numero_conta = ? AND c.ativa = 1
            `;
            
            const resultado = await database.get(query, [numeroConta]);
            
            if (!resultado) {
                throw new Error('Conta não encontrada ou inativa');
            }
            
            return {
                numero_conta: resultado.numero_conta,
                saldo: parseFloat(resultado.saldo),
                tipo_conta: resultado.tipo_conta,
                agencia: resultado.agencia,
                nome_cliente: resultado.nome_cliente,
                ultima_atualizacao: resultado.ultima_atualizacao
            };
            
        } catch (error) {
            logger.error('Erro ao consultar saldo:', error);
            throw error;
        }
    }
    
    /**
     * Atualizar saldo da conta
     * @param {string} numeroConta - Número da conta
     * @param {number} novoSaldo - Novo saldo
     * @returns {Promise<Object>} Conta atualizada
     */
    static async atualizarSaldo(numeroConta, novoSaldo) {
        try {
            // Verificar se conta existe
            const contaExiste = await this.buscarPorNumero(numeroConta);
            if (!contaExiste) {
                throw new Error('Conta não encontrada');
            }
            
            // Verificar se saldo não fica negativo
            if (novoSaldo < 0) {
                throw new Error('Saldo não pode ser negativo');
            }
            
            const query = `
                UPDATE contas 
                SET saldo = ?, updated_at = CURRENT_TIMESTAMP
                WHERE numero_conta = ?
            `;
            
            await database.run(query, [novoSaldo, numeroConta]);
            
            logger.info('Saldo atualizado com sucesso', { numero_conta: numeroConta, novo_saldo: novoSaldo });
            
            // Retornar conta atualizada
            return await this.buscarPorNumero(numeroConta);
            
        } catch (error) {
            logger.error('Erro ao atualizar saldo:', error);
            throw error;
        }
    }
    
    /**
     * Desativar conta (soft delete)
     * @param {string} numeroConta - Número da conta
     * @returns {Promise<boolean>} Sucesso da operação
     */
    static async desativar(numeroConta) {
        try {
            const query = `
                UPDATE contas 
                SET ativa = 0, updated_at = CURRENT_TIMESTAMP
                WHERE numero_conta = ?
            `;
            
            const resultado = await database.run(query, [numeroConta]);
            
            if (resultado.changes === 0) {
                throw new Error('Conta não encontrada');
            }
            
            logger.info('Conta desativada com sucesso', { numero_conta: numeroConta });
            return true;
            
        } catch (error) {
            logger.error('Erro ao desativar conta:', error);
            throw error;
        }
    }
    
    /**
     * Listar todas as contas ativas
     * @returns {Promise<Array>} Lista de todas as contas
     */
    static async listar() {
        return ModelWrapper.execute(
            async () => {
                const query = `
                    SELECT 
                        c.*,
                        cl.nome as nome_cliente
                    FROM contas c
                    JOIN clientes cl ON c.cpf_cliente = cl.cpf
                    WHERE c.ativa = 1
                    ORDER BY c.created_at DESC
                `;
                
                const contas = await database.all(query);
                
                // Formatar valores numéricos
                return contas.map(conta => ({
                    ...conta,
                    saldo: parseFloat(conta.saldo),
                    limite_diario: parseFloat(conta.limite_diario),
                    ativa: !!conta.ativa
                }));
            },
            'listar todas as contas'
        );
    }
}

module.exports = Conta;