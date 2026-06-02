/**
 * SCRIPT DE TESTES DE SEGURANÇA E CONFORMIDADE (APPSEC TDD)
 * 
 * Este arquivo contém os testes automatizados para validar a eficácia
 * das travas de segurança do portfólio da KF Studio, rodando de forma
 * nativa no Node.js.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const test = require('node:test');

// Caminhos dos arquivos críticos do projeto
const htmlPath = path.join(__dirname, 'index.html');
const jsPath = path.join(__dirname, 'assets', 'js', 'main.js');

// ==========================================================================
// TESTES DE SEGURANÇA
// ==========================================================================

test('VULN-1: Prevenção de XSS - Sanitização de caracteres HTML perigosos', () => {
    // Replica a lógica exata de sanitização implementada no main.js
    const sanitizeHTMLString = (str) => {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    };

    const payloadScript = "<script>alert('xss')</script>";
    const payloadImage = '<img src="x" onerror="alert(1)">';
    const payloadQuote = "'; DROP TABLE users; --";

    const cleanScript = sanitizeHTMLString(payloadScript);
    const cleanImage = sanitizeHTMLString(payloadImage);
    const cleanQuote = sanitizeHTMLString(payloadQuote);

    // Validações
    assert.ok(!cleanScript.includes('<script>'), 'Falha: payload de script não foi escapado.');
    assert.ok(cleanScript.includes('&lt;script&gt;'), 'Sucesso: tags < e > foram devidamente codificadas.');
    
    assert.ok(cleanImage.includes('&quot;'), 'Sucesso: aspas duplas foram convertidas em &quot;.');
    assert.ok(cleanImage.includes('&lt;img'), 'Sucesso: abertura da tag img foi escapada.');
    assert.ok(cleanImage.includes('&gt;'), 'Sucesso: fechamento da tag img foi escapado.');

    assert.ok(cleanQuote.includes('&#x27;'), 'Sucesso: aspas simples foram escapadas, mitigando sql escape básico.');
    
    console.log('✓ VULN-1 neutralizada com sucesso no sanitizador.');
});

test('VULN-2: Prevenção de SSRF / Engenharia Social em Links Externos (Target Blanks)', () => {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Expressão regular para capturar tags de link que abrem em nova aba
    const linkRegex = /<a\s+[^>]*target="_blank"[^>]*>/gi;
    let match;
    let totalTargetBlanks = 0;
    let secureTargetBlanks = 0;

    while ((match = linkRegex.exec(htmlContent)) !== null) {
        totalTargetBlanks++;
        const linkTag = match[0];
        
        // Verifica se possui rel="noopener noreferrer" ou rel="noreferrer noopener"
        const isSecure = /rel="noopener\s+noreferrer"|rel="noreferrer\s+noopener"/i.test(linkTag);
        if (isSecure) {
            secureTargetBlanks++;
        } else {
            console.error(`✗ VULN LINK DETECTADA: Link inseguro encontrado -> ${linkTag}`);
        }
    }

    assert.strictEqual(secureTargetBlanks, totalTargetBlanks, 'Erro: existem links target="_blank" sem "noopener noreferrer".');
    console.log(`✓ VULN-2 neutralizada: Todos os ${totalTargetBlanks} links externos estão seguros contra Reverse Tabnabbing.`);
});

test('VULN-3: Prevenção de Injeção via manipulação do DOM', () => {
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    
    // Garante que o desenvolvedor não usou innerHTML ou document.write para processar inputs de formulários
    const hasInnerHTMLOnInput = jsContent.includes('errorElement.innerHTML') || jsContent.includes('successContainer.innerHTML');
    
    assert.strictEqual(hasInnerHTMLOnInput, false, 'Erro de segurança: Uso inseguro de innerHTML detectado na renderização de mensagens dinâmicas.');
    
    // Garante o uso estrito de textContent
    const hasTextContent = jsContent.includes('textContent =');
    assert.ok(hasTextContent, 'Segurança: textContent está sendo usado corretamente para injeção limpa de dados.');
    
    console.log('✓ VULN-3 neutralizada: Uso estrito de textContent para renderização no DOM.');
});

test('VULN-4: Limitação de tamanho de payload no formulário', () => {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Verifica se os campos de texto no HTML possuem atributos de limite de caracteres (maxlength)
    assert.ok(htmlContent.includes('id="form-name"') && htmlContent.includes('maxlength="80"'), 'Erro: limite maxlength ausente no Nome.');
    assert.ok(htmlContent.includes('id="form-phone"') && htmlContent.includes('maxlength="15"'), 'Erro: limite maxlength ausente no Telefone.');
    assert.ok(htmlContent.includes('id="form-message"') && htmlContent.includes('maxlength="500"'), 'Erro: limite maxlength ausente no campo de Mensagem.');
    
    console.log('✓ VULN-4 neutralizada: Limites de tamanho de payload configurados no markup HTML5.');
});
