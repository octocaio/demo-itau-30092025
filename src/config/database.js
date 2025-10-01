const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('./logger');

class Database {
    constructor() {
        this.db = null;
        this.dbPath = path.join(__dirname, '../../data/banking_demo.db');
    }

    // Inicializar conexão com o banco
    init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    logger.error('Erro ao conectar com o banco de dados:', err);
                    reject(err);
                } else {
                    logger.info('Conectado ao banco SQLite com sucesso');
                    // Habilitar foreign keys
                    this.db.run('PRAGMA foreign_keys = ON');
                    resolve();
                }
            });
        });
    }

    // Executar query que retorna uma linha
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    logger.error('Erro na query GET:', { sql, params, error: err.message });
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Executar query que retorna múltiplas linhas
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    logger.error('Erro na query ALL:', { sql, params, error: err.message });
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Executar query de modificação (INSERT, UPDATE, DELETE)
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    logger.error('Erro na query RUN:', { sql, params, error: err.message });
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        changes: this.changes
                    });
                }
            });
        });
    }

    // Fechar conexão
    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        logger.error('Erro ao fechar conexão com banco:', err);
                        reject(err);
                    } else {
                        logger.info('Conexão com banco fechada');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
}

// Criar instância única do banco (Singleton)
const database = new Database();

module.exports = database;