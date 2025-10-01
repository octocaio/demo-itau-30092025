const database = require('../config/database');
const logger = require('../config/logger');
const { limparCPF, formatarCPF } = require('../utils/cpfValidator');

class Cliente {
    /**
     * Criar novo cliente
     * @param {Object} dadosCliente - Dados do cliente
     * @returns {Promise<Object>} Cliente criado
     */
    static async criar(dadosCliente) {
        try {
            // Limpar CPF antes de salvar (remover formatação)
            const cpfLimpo = limparCPF(dadosCliente.cpf);
            
            const query = `
                INSERT INTO clientes (
                    cpf, nome, email, telefone, data_nascimento, 
                    endereco, cep, cidade, estado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const valores = [
                cpfLimpo,
                dadosCliente.nome,
                dadosCliente.email || null,
                dadosCliente.telefone || null,
                dadosCliente.data_nascimento,
                dadosCliente.endereco || null,
                dadosCliente.cep || null,
                dadosCliente.cidade || null,
                dadosCliente.estado || null
            ];
            
            await database.run(query, valores);
            
            logger.info('Cliente criado com sucesso', { cpf: cpfLimpo, nome: dadosCliente.nome });
            
            // Retornar o cliente criado
            return await this.buscarPorCpf(cpfLimpo);
            
        } catch (error) {
            logger.error('Erro ao criar cliente:', error);
            
            // Verificar se é erro de CPF duplicado
            if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                throw new Error('Cliente com este CPF já existe');
            }
            
            // Verificar se é erro de email duplicado
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                throw new Error('Email já está em uso por outro cliente');
            }
            
            throw new Error('Erro interno do servidor ao criar cliente');
        }
    }
    
    /**
     * Buscar cliente por CPF
     * @param {string} cpf - CPF do cliente
     * @returns {Promise<Object|null>} Cliente encontrado ou null
     */
    static async buscarPorCpf(cpf) {
        try {
            const cpfLimpo = limparCPF(cpf);
            const query = 'SELECT * FROM clientes WHERE cpf = ? AND status = "ATIVO"';
            
            const cliente = await database.get(query, [cpfLimpo]);
            
            if (cliente) {
                // Formatar CPF para exibição
                cliente.cpf = formatarCPF(cliente.cpf);
                // Converter data para formato brasileiro se necessário
                if (cliente.data_nascimento) {
                    cliente.data_nascimento = new Date(cliente.data_nascimento).toISOString().split('T')[0];
                }
            }
            
            return cliente;
            
        } catch (error) {
            logger.error('Erro ao buscar cliente por CPF:', error);
            throw new Error('Erro interno do servidor ao buscar cliente');
        }
    }
    
    /**
     * Listar todos os clientes ativos
     * @returns {Promise<Array>} Lista de clientes
     */
    static async listar() {
        try {
            const query = 'SELECT * FROM clientes WHERE status = "ATIVO" ORDER BY nome';
            const clientes = await database.all(query);
            
            // Formatar CPFs para exibição
            return clientes.map(cliente => ({
                ...cliente,
                cpf: formatarCPF(cliente.cpf),
                data_nascimento: new Date(cliente.data_nascimento).toISOString().split('T')[0]
            }));
            
        } catch (error) {
            logger.error('Erro ao listar clientes:', error);
            throw new Error('Erro interno do servidor ao listar clientes');
        }
    }
    
    /**
     * Atualizar dados do cliente
     * @param {string} cpf - CPF do cliente
     * @param {Object} dados - Novos dados do cliente
     * @returns {Promise<Object>} Cliente atualizado
     */
    static async atualizar(cpf, dados) {
        try {
            const cpfLimpo = limparCPF(cpf);
            
            // Verificar se cliente existe
            const clienteExiste = await this.buscarPorCpf(cpfLimpo);
            if (!clienteExiste) {
                throw new Error('Cliente não encontrado');
            }
            
            // Remover campos que não devem ser atualizados
            const { cpf, created_at, updated_at, ...dadosAtualizacao } = dados;
            
            if (Object.keys(dadosAtualizacao).length === 0) {
                throw new Error('Nenhum dado para atualizar');
            }
            
            // Construir query dinâmica
            const campos = Object.keys(dadosAtualizacao);
            const valores = Object.values(dadosAtualizacao);
            const placeholders = campos.map(campo => `${campo} = ?`).join(', ');
            
            const query = `
                UPDATE clientes 
                SET ${placeholders}, updated_at = CURRENT_TIMESTAMP
                WHERE cpf = ?
            `;
            
            await database.run(query, [...valores, cpfLimpo]);
            
            logger.info('Cliente atualizado com sucesso', { cpf: cpfLimpo });
            
            // Retornar cliente atualizado
            return await this.buscarPorCpf(cpfLimpo);
            
        } catch (error) {
            logger.error('Erro ao atualizar cliente:', error);
            throw error;
        }
    }
    
    /**
     * Desativar cliente (soft delete)
     * @param {string} cpf - CPF do cliente
     * @returns {Promise<boolean>} Sucesso da operação
     */
    static async desativar(cpf) {
        try {
            const cpfLimpo = limparCPF(cpf);
            
            const query = `
                UPDATE clientes 
                SET status = 'INATIVO', updated_at = CURRENT_TIMESTAMP
                WHERE cpf = ?
            `;
            
            const resultado = await database.run(query, [cpfLimpo]);
            
            if (resultado.changes === 0) {
                throw new Error('Cliente não encontrado');
            }
            
            logger.info('Cliente desativado com sucesso', { cpf: cpfLimpo });
            return true;
            
        } catch (error) {
            logger.error('Erro ao desativar cliente:', error);
            throw error;
        }
    }
    
    /**
     * Verificar se cliente existe (usado por outras classes)
     * @param {string} cpf - CPF do cliente
     * @returns {Promise<boolean>} True se cliente existe
     */
    static async existe(cpf) {
        try {
            const cliente = await this.buscarPorCpf(cpf);
            return !!cliente;
            
        } catch (error) {
            logger.error('Erro ao verificar se cliente existe:', error);
            return false;
        }
    }
}

module.exports = Cliente;