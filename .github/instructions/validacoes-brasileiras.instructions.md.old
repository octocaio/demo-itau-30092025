applyTo:
  - src/utils/validation.js
  - src/middleware/validation.js
  - frontend/js/validation.js
  - **/*cpf*
  - **/*telefone*
  - **/*brasil*
---
# Validações Brasileiras - Instruções Específicas
Orientações para implementação de validações específicas do contexto bancário brasileiro.

## Validações Obrigatórias

### CPF (Cadastro de Pessoa Física)
- Implementar algoritmo completo de validação de CPF brasileiro
- Rejeitar CPFs com todos os dígitos iguais (111.111.111-11, etc.)
- Calcular e validar dígitos verificadores
- Aplicar máscara visual: 000.000.000-00
- Permitir entrada com e sem formatação

### Telefone Brasileiro
- Validar DDD brasileiro (código de área)
- Suportar celular (9 dígitos) e fixo (8 dígitos)
- Aplicar máscara: (00) 90000-0000 ou (00) 0000-0000
- Validar DDDs válidos conforme ANATEL

### Dados Bancários
- Número de conta: exatamente 6 dígitos
- Agência: 4 dígitos com dígito verificador opcional
- Valores monetários: formato brasileiro (R$ 1.234,56)
- Tipos de conta: corrente, poupança

## Formatação e Máscaras
- Use formatação visual sem impactar dados armazenados
- Máscaras devem ser aplicadas durante digitação
- Remova formatação antes de enviar para API
- Mantenha consistência entre frontend e backend

## Mensagens de Erro
- Use português brasileiro claro e direto
- Seja específico sobre o erro (ex: "CPF inválido" não "Erro de validação")
- Forneça orientação quando possível

## Exemplo de Implementação
```javascript
// CPF Validation
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    // Algoritmo de validação dos dígitos verificadores
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    // ... resto da implementação
}
```

## Estilo de Feedback
"Validação de CPF não implementada corretamente. Use algoritmo brasileiro completo com cálculo de dígitos verificadores."

"Máscara de telefone deve suportar DDD brasileiro. Implemente validação de DDDs válidos conforme ANATEL."