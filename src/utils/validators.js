const Joi = require('joi');
const { validarCPF } = require('./cpfValidator');

// Validador customizado para CPF
const cpfValidator = (value, helpers) => {
    if (!validarCPF(value)) {
        return helpers.error('any.invalid');
    }
    return value;
};

// Schema de validação para cliente
const clienteSchema = Joi.object({
    nome: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.base': 'Nome deve ser um texto',
            'string.empty': 'Nome é obrigatório',
            'string.min': 'Nome deve ter pelo menos 2 caracteres',
            'string.max': 'Nome não pode ter mais de 100 caracteres',
            'any.required': 'Nome é obrigatório'
        }),
    
    cpf: Joi.string()
        .required()
        .custom(cpfValidator, 'validação de CPF')
        .messages({
            'string.base': 'CPF deve ser um texto',
            'string.empty': 'CPF é obrigatório',
            'any.invalid': 'CPF inválido',
            'any.required': 'CPF é obrigatório'
        }),
    
    data_nascimento: Joi.date()
        .iso()
        .max('now')
        .required()
        .messages({
            'date.base': 'Data de nascimento deve ser uma data válida',
            'date.format': 'Data de nascimento deve estar no formato YYYY-MM-DD',
            'date.max': 'Data de nascimento não pode ser futura',
            'any.required': 'Data de nascimento é obrigatória'
        }),
    
    email: Joi.string()
        .email()
        .optional()
        .messages({
            'string.email': 'Email deve ter um formato válido'
        }),
    
    telefone: Joi.string()
        .pattern(/^(\+55)?(\d{2})(\d{4,5})(\d{4})$/)
        .optional()
        .messages({
            'string.pattern.base': 'Telefone deve ter formato válido (ex: 11999999999)'
        }),
    
    endereco: Joi.string()
        .max(200)
        .optional()
        .messages({
            'string.max': 'Endereço não pode ter mais de 200 caracteres'
        }),
    
    cep: Joi.string()
        .pattern(/^(\d{5})-?(\d{3})$/)
        .optional()
        .messages({
            'string.pattern.base': 'CEP deve estar no formato 12345-678'
        }),
    
    cidade: Joi.string()
        .max(50)
        .optional()
        .messages({
            'string.max': 'Cidade não pode ter mais de 50 caracteres'
        }),
    
    estado: Joi.string()
        .length(2)
        .uppercase()
        .optional()
        .messages({
            'string.length': 'Estado deve ter 2 caracteres (ex: SP)',
            'string.uppercase': 'Estado deve estar em maiúsculas'
        })
});

// Schema de validação para conta
const contaSchema = Joi.object({
    cpf_cliente: Joi.string()
        .required()
        .custom(cpfValidator, 'validação de CPF')
        .messages({
            'string.base': 'CPF do cliente deve ser um texto',
            'string.empty': 'CPF do cliente é obrigatório',
            'any.invalid': 'CPF do cliente inválido',
            'any.required': 'CPF do cliente é obrigatório'
        }),
    
    tipo_conta: Joi.string()
        .valid('corrente', 'poupanca')
        .required()
        .messages({
            'string.base': 'Tipo de conta deve ser um texto',
            'any.only': 'Tipo de conta deve ser "corrente" ou "poupanca"',
            'any.required': 'Tipo de conta é obrigatório'
        }),
    
    saldo_inicial: Joi.number()
        .min(0)
        .precision(2)
        .default(0.00)
        .messages({
            'number.base': 'Saldo inicial deve ser um número',
            'number.min': 'Saldo inicial não pode ser negativo',
            'number.precision': 'Saldo inicial deve ter no máximo 2 casas decimais'
        }),
    
    limite_diario: Joi.number()
        .min(0)
        .precision(2)
        .default(5000.00)
        .messages({
            'number.base': 'Limite diário deve ser um número',
            'number.min': 'Limite diário não pode ser negativo',
            'number.precision': 'Limite diário deve ter no máximo 2 casas decimais'
        }),
    
    agencia: Joi.string()
        .pattern(/^\d{4}$/)
        .default('0001')
        .messages({
            'string.pattern.base': 'Agência deve ter 4 dígitos'
        })
});

// Schema para parâmetros de busca por CPF
const cpfParamSchema = Joi.object({
    cpf: Joi.string()
        .required()
        .custom(cpfValidator, 'validação de CPF')
        .messages({
            'string.base': 'CPF deve ser um texto',
            'string.empty': 'CPF é obrigatório',
            'any.invalid': 'CPF inválido',
            'any.required': 'CPF é obrigatório'
        })
});

// Schema para parâmetros de busca por número da conta
const numeroContaParamSchema = Joi.object({
    numero: Joi.string()
        .pattern(/^\d{6}$/)
        .required()
        .messages({
            'string.base': 'Número da conta deve ser um texto',
            'string.pattern.base': 'Número da conta deve ter 6 dígitos',
            'any.required': 'Número da conta é obrigatório'
        })
});

module.exports = {
    clienteSchema,
    contaSchema,
    cpfParamSchema,
    numeroContaParamSchema
};