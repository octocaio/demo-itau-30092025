/**
 * Validador de CPF brasileiro
 * Implementa o algoritmo oficial de validação de CPF
 */

/**
 * Remove caracteres não numéricos do CPF
 * @param {string} cpf - CPF com ou sem formatação
 * @returns {string} CPF apenas com números
 */
const limparCPF = (cpf) => {
    return cpf.replace(/[^\d]/g, '');
};

/**
 * Formatar CPF no padrão XXX.XXX.XXX-XX
 * @param {string} cpf - CPF apenas com números
 * @returns {string} CPF formatado
 */
const formatarCPF = (cpf) => {
    const cpfLimpo = limparCPF(cpf);
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Validar CPF usando algoritmo brasileiro
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} true se CPF for válido
 */
const validarCPF = (cpf) => {
    if (!cpf) return false;

    const cpfLimpo = limparCPF(cpf);
    
    // Verificar se tem 11 dígitos
    if (cpfLimpo.length !== 11) return false;
    
    // Verificar se não são todos os dígitos iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let primeiroDigito = 11 - (soma % 11);
    if (primeiroDigito >= 10) primeiroDigito = 0;
    
    if (parseInt(cpfLimpo.charAt(9)) !== primeiroDigito) {
        return false;
    }
    
    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    let segundoDigito = 11 - (soma % 11);
    if (segundoDigito >= 10) segundoDigito = 0;
    
    return parseInt(cpfLimpo.charAt(10)) === segundoDigito;
};

/**
 * Gerar CPF válido aleatório (para testes)
 * @returns {string} CPF válido formatado
 */
const gerarCPF = () => {
    // Gerar os 9 primeiros dígitos aleatoriamente
    const digitos = [];
    for (let i = 0; i < 9; i++) {
        digitos.push(Math.floor(Math.random() * 10));
    }
    
    // Calcular primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += digitos[i] * (10 - i);
    }
    let primeiroDigito = 11 - (soma % 11);
    if (primeiroDigito >= 10) primeiroDigito = 0;
    digitos.push(primeiroDigito);
    
    // Calcular segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += digitos[i] * (11 - i);
    }
    let segundoDigito = 11 - (soma % 11);
    if (segundoDigito >= 10) segundoDigito = 0;
    digitos.push(segundoDigito);
    
    const cpf = digitos.join('');
    return formatarCPF(cpf);
};

module.exports = {
    validarCPF,
    formatarCPF,
    limparCPF,
    gerarCPF
};