#!/usr/bin/env node
/**
 * Script: generate-modules-doc.js
 *
 * Descrição:
 *  1) Percorre a pasta "src/modules" e identifica cada subpasta (cada "módulo").
 *  2) Para cada subpasta, faz uma busca recursiva de arquivos .ts.
 *  3) Gera um arquivo de saída separado, por exemplo: "arquivos-NOMEDAMODULO.txt".
 */

const fs = require('fs');
const path = require('path');

const baseModulesDir = path.join(__dirname, 'src');

/**
 * Retorna lista de subpastas dentro de baseModulesDir.
 */
function getSubdirectories(dir) {
    return fs
        .readdirSync(dir)
        .filter((item) => {
            const itemPath = path.join(dir, item);
            return fs.statSync(itemPath).isDirectory();
        });
}

/**
 * Lê recursivamente os arquivos .ts em "dir"
 * e retorna o conteúdo formatado.
 */
function readDirectoryRecursive(dir, outputArray) {
    const items = fs.readdirSync(dir);
    items.forEach((item) => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
            // recursivo
            readDirectoryRecursive(itemPath, outputArray);
        } else {
            if (itemPath.endsWith('.ts')) {
                // lê conteúdo
                const fileContent = fs.readFileSync(itemPath, 'utf8');
                const relativePath = path.relative(process.cwd(), itemPath);
                const docText = `
-------------------------------------------------------------------
- Arquivo: ${relativePath}
-------------------------------------------------------------------
${fileContent}

`;
                outputArray.push(docText);
            }
        }
    });
}

/**
 * Função principal:
 * - Pega subpastas de src/modules
 * - Para cada subpasta, gera 1 arquivo .txt
 */
function generateDocsByModule() {
    const subdirs = getSubdirectories(baseModulesDir);

    subdirs.forEach((subdir) => {
        const moduleDir = path.join(baseModulesDir, subdir);
        const outputFile = path.join(__dirname, `arquivos-${subdir}.txt`);

        console.log(`\n[PROCESSANDO] Módulo: ${subdir}`);
        let outputBuffer = [];

        // Lê recursivamente todos .ts
        readDirectoryRecursive(moduleDir, outputBuffer);

        // Concatena tudo
        const finalText = outputBuffer.join('');

        // Escreve no arquivo de saída
        try {
            fs.writeFileSync(outputFile, finalText, 'utf8');
            console.log(`[OK] Arquivo gerado: ${outputFile}`);
        } catch (err) {
            console.error(`[ERRO] Ao escrever ${outputFile}:`, err);
        }
    });
}

// Executa
generateDocsByModule();
