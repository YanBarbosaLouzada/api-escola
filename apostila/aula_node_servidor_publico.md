# Apostila de Aula: Criando um Servidor HTTP com Node.js, Pasta Public, ES Modules e Nodemon

**Duração:** 1h30min (90 minutos)  
**Nível:** Iniciante / Intermediário  
**Pré-requisitos:** Conhecimentos básicos de HTML, CSS e JavaScript.

---

## 📋 Cronograma da Aula (90 min)

| Bloco | Tempo | Conteúdo Principal |
| :--- | :--- | :--- |
| **01** | 10 min | Introdução ao Node.js, HTTP e Sistema de Módulos (`Import` e `Export`) |
| **02** | 15 min | Configuração do Projeto, `npm init` e Instalação do `Nodemon` |
| **03** | 15 min | Estrutura da Pasta `public` (HTML, CSS e JS do Cliente) |
| **04** | 35 min | Construção e Explicação Detalhada do Servidor (`server.js`) |
| **05** | 10 min | Execução com Nodemon e Inspeção de Rede no Navegador |
| **06** | 05 min | Exercício Prático e Próximos Passos (Visão do Mercado de Trabalho) |

---

## 🟢 Bloco 1: Conceitos e Sistema de Módulos (10 min)

### 1.1 O que é o Node.js e a Pasta `public`?
* **Node.js:** É um ambiente de execução JavaScript no lado do servidor (*backend*). Ele permite ler e escrever arquivos no sistema operacional, responder requisições de rede e interagir com bancos de dados.
* **Pasta `public`:** Diretório destinado a guardar arquivos **estáticos** (HTML, CSS, JS client-side, imagens). Qualquer arquivo colocado nessa pasta pode ser solicitado e baixado diretamente pelo navegador do cliente.

---

### 1.2 Entendendo `Import` e `Export` no Node.js
No Node.js, existem dois sistemas para organizar e dividir o código em múltiplos arquivos (módulos):

#### A) CommonJS (Sistema Padrão Histórico do Node.js)
Utiliza as funções `require()` para importar e `module.exports` para exportar.

**Exemplo de Exportação (`helpers.js`):**
```javascript
// helpers.js - Exportando com CommonJS
function formatarMoeda(valor) {
  return `R$ ${valor.toFixed(2)}`;
}

function somar(a, b) {
  return a + b;
}

module.exports = {
  formatarMoeda,
  somar
};
```

**Exemplo de Importação (`app.js`):**
```javascript
// app.js - Importando com CommonJS
const { formatarMoeda, somar } = require('./helpers');

console.log(somar(10, 20)); // 30
console.log(formatarMoeda(50)); // R$ 50.00
```

---

#### B) ES Modules / ESM (Padrão Moderno do JavaScript)
Utiliza as instruções `import` e `export`. É o padrão nativo dos navegadores modernos e o padrão utilizado em projetos modernos de Frontend (React, Vue) e Backend.

Para habilitar o ES Modules no Node.js, precisamos adicionar a propriedade `"type": "module"` no arquivo `package.json`.

**Exemplo de Exportação (`mime.js`):**
```javascript
// mime.js - Exportando funções e constantes com ES Modules

// Exportação Nomeada
export const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json'
};

// Exportação Nomeada de Função
export function obterTipoMime(extensao) {
  return MIME_TYPES[extensao] || 'application/octet-stream';
}
```

**Exemplo de Importação (`server.js`):**
```javascript
// server.js - Importando módulos com ES Modules
import { MIME_TYPES, obterTipoMime } from './mime.js';

console.log(obterTipoMime('.css')); // text/css
```

---

## 🛠️ Bloco 2: Configuração do Projeto e Nodemon (15 min)

### 2.1 Criando a Estrutura do Projeto
Abra o seu terminal e execute os comandos:

```bash
# 1. Criar a pasta do projeto
mkdir servidor-node-nodemon

# 2. Entrar na pasta do projeto
cd servidor-node-nodemon

# 3. Inicializar o arquivo package.json
npm init -y
```

---

### 2.2 O que é e por que usar o `Nodemon`?
Por padrão, quando executamos `node server.js`, o Node.js lê o código e o carrega na memória. Se você alterar qualquer linha de código no seu arquivo, precisará parar o servidor manualmente no terminal (`Ctrl + C`) e executá-lo novamente.

O **Nodemon** é uma ferramenta de desenvolvimento que monitora os arquivos da sua aplicação. Sempre que um arquivo é salvo (`Ctrl + S`), o Nodemon **reinicia o servidor automaticamente**.

#### Instalando como Dependência de Desenvolvimento:
```bash
npm install -D nodemon
```
*A flag `-D` (ou `--save-dev`) sinaliza que o pacote só será utilizado durante a etapa de desenvolvimento.*

---

### 2.3 Configurando o `package.json`
Abra o `package.json` no seu editor e adicione `"type": "module"` para utilizar `import`/`export`, além de configurar os scripts de execução:

```json
{
  "name": "servidor-node-nodemon",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

* **`npm run dev`**: Inicia o servidor através do Nodemon (com recarregamento automático).
* **`npm start`**: Executa o servidor no modo produção padrão do Node.js.

---

## 📂 Bloco 3: Criando os Arquivos Estáticos (`public/`) (15 min)

Crie a pasta `public` no seu projeto:

```bash
mkdir public
```

### Arquivo 1: `public/index.html`
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Servidor Node.js Estático</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="card">
    <h1>🚀 Servidor Node.js em Execução!</h1>
    <p>Esta página foi servida a partir da pasta <strong>public</strong>.</p>
    <button id="btn-mensagem">Clique Aqui</button>
    <p id="resposta"></p>
  </main>

  <script src="app.js"></script>
</body>
</html>
```

### Arquivo 2: `public/style.css`
```css
body {
  font-family: Arial, sans-serif;
  background-color: #f0f2f5;
  color: #1c1e21;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.card {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
}

h1 {
  color: #0d6efd;
}

button {
  background-color: #0d6efd;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 15px;
}

button:hover {
  background-color: #0b5ed7;
}

#resposta {
  margin-top: 15px;
  font-weight: bold;
  color: #198754;
}
```

### Arquivo 3: `public/app.js`
```javascript
// Código JavaScript executado no navegador (Client-side)
document.getElementById('btn-mensagem').addEventListener('click', () => {
  const resposta = document.getElementById('resposta');
  resposta.textContent = '✅ Script do cliente executado com sucesso!';
});
```

---

## 🧠 Bloco 4: Construção e Explicação Detalhada do Servidor (35 min)

Para praticar a modularização com `export` e `import`, vamos separar a lógica dos tipos MIME em um arquivo próprio e depois construir o `server.js`.

### Arquivo 4: `mime.js` (Módulo Exportado)
Crie o arquivo `mime.js` na raiz do projeto:

```javascript
// mime.js - Módulo para identificar Tipos MIME

// Tabela com as extensões de arquivo e seus respectivos Content-Types HTTP
export const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.ico': 'image/x-icon'
};

// Função exportada para obter o tipo MIME
export function obterTipoMime(extensao) {
  return MIME_TYPES[extensao] || 'application/octet-stream';
}
```

---

### Arquivo 5: `server.js` (Servidor Completo)

Crie o arquivo `server.js` na raiz do projeto:

```javascript
// 1. IMPORTAÇÕES DE MÓDULOS
// Módulos nativos do Node.js
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Importação do nosso próprio módulo (observar o caminho relativo com './' e extensão '.js')
import { obterTipoMime } from './mime.js';

// 2. CONFIGURAÇÃO DE CAMINHOS NO ES MODULES
// No ES Modules, a variável __dirname não existe por padrão. Precisamos recriá-la:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definição da porta da aplicação
const PORT = 3000;

// 3. CRIAÇÃO DO SERVIDOR HTTP
const server = http.createServer((req, res) => {
  console.log(`[REQUISIÇÃO] Método: ${req.method} | URL: ${req.url}`);

  // Se a URL for a raiz '/', direciona para 'index.html'
  let arquivoSolicitado = req.url === '/' ? 'index.html' : req.url;

  // Monta o caminho físico completo no sistema operacional dentro da pasta 'public'
  const caminhoAbsoluto = path.join(__dirname, 'public', arquivoSolicitado);

  // Extrai a extensão do arquivo (ex: '.html', '.css', '.js')
  const extensao = path.extname(caminhoAbsoluto);

  // Obtém o cabeçalho Content-Type correto através da nossa função importada
  const contentType = obterTipoMime(extensao);

  // LER O ARQUIVO NO DISCO (Leitura Assíncrona)
  fs.readFile(caminhoAbsoluto, (erro, conteudo) => {
    if (erro) {
      // Trata erro de arquivo não encontrado (ENOENT = Error NO ENTtity)
      if (erro.code === 'ENOENT') {
        console.error(`[ERRO 404] Arquivo não encontrado: ${caminhoAbsoluto}`);
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>Erro 404 - Página ou Arquivo Não Encontrado</h1>');
      } else {
        // Trata outros erros do servidor (ex: falta de permissão de leitura)
        console.error(`[ERRO 500] Erro interno: ${erro.message}`);
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>Erro 500 - Erro Interno do Servidor</h1>');
      }
    } else {
      // Sucesso: Envia o código de status HTTP 200 (OK) e o conteúdo do arquivo
      res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
      res.end(conteudo);
    }
  });
});

// 4. INICIALIZAÇÃO DO SERVIDOR
server.listen(PORT, () => {
  console.log(`
==================================================
🚀 SERVIDOR RODANDO COM NODEMON!
📍 Acesse no navegador: http://localhost:${PORT}
==================================================
  `);
});
```

---

### 🔍 Explicação Detalhada do Código do Servidor

1. **`http.createServer((req, res) => { ... })`**:
   * Cria a instância do servidor HTTP.
   * Recebe uma função de *callback* que é disparada **a cada requisição** feita pelo cliente.
   * **`req` (Request):** Objeto com dados da requisição (`req.url`, `req.method`, cabeçalhos do cliente).
   * **`res` (Response):** Objeto com métodos para enviar a resposta ao cliente (`res.writeHead()`, `res.end()`).

2. **`fileURLToPath(import.meta.url)` e `path.dirname()`**:
   * Quando utilizamos ES Modules (`"type": "module"`), o Node.js não disponibiliza a variável global `__dirname`.
   * `import.meta.url` obtém o endereço URL do arquivo atual (ex: `file:///C:/projeto/server.js`).
   * `fileURLToPath()` converte esse URL para um caminho de arquivo padrão do sistema operacional.
   * `path.dirname()` extrai o diretório em que o arquivo está contido.

3. **`path.join(__dirname, 'public', arquivoSolicitado)`**:
   * Une os segmentos de caminho de forma compatível com qualquer sistema operacional (trata `/` no Linux/Mac e `\` no Windows automaticamente).

4. **`res.writeHead(status, headers)`**:
   * Envia os cabeçalhos da resposta HTTP.
   * O status **`200`** indica sucesso.
   * O status **`404`** indica que o recurso não foi encontrado.
   * O cabeçalho **`Content-Type`** diz ao navegador como ele deve interpretar os dados (ex: renderizar como página web `text/html`, aplicar estilização `text/css` ou executar como código `text/javascript`).

5. **`fs.readFile(caminho, callback)`**:
   * Método do módulo nativo `fs` (File System) que lê o conteúdo de um arquivo do disco de forma não-bloqueante (assíncrona).

---

## ⚡ Bloco 5: Execução e Testes no Navegador (10 min)

### Passo 1: Iniciar o Servidor
No terminal, execute o script do Nodemon:

```bash
npm run dev
```

---

### Passo 2: Testar o Recarregamento Automático
1. Acesse `http://localhost:3000` no seu navegador.
2. Abra o arquivo `public/index.html` no VS Code.
3. Altere o texto da tag `<h1>` para "🚀 Meu Servidor Atualizado!".
4. Salve o arquivo (`Ctrl + S`).
5. Note no terminal que o Nodemon reinicia automaticamente o servidor. Recarregue a página no navegador para ver o resultado.

---

### Passo 3: Inspeção de Rede no DevTools
1. Abra a ferramenta do desenvolvedor no navegador (`F12`).
2. Clique na aba **Network (Rede)**.
3. Atualize a página (`F5`).
4. Observe que o navegador fez 3 requisições automáticas:
   * `localhost` (`index.html`) -> Status `200` (Type: `document`)
   * `style.css` -> Status `200` (Type: `stylesheet`)
   * `app.js` -> Status `200` (Type: `script`)

---

## 🏋️ Bloco 6: Exercício Prático e Mercado de Trabalho (5 min)

### Exercício Prático para os Alunos
1. Crie um arquivo `public/404.html` com uma mensagem amigável e estilizada.
2. Modifique a condicional de erro `erro.code === 'ENOENT'` dentro do `server.js` para ler e exibir o arquivo `public/404.html` em vez de responder com texto simples.

---

### 💼 Como é feito no Mercado de Trabalho (Express.js)
No mercado de trabalho, para criar servidores de arquivos estáticos ou APIs, utiliza-se o framework **Express.js**, que simplifica a criação desse servidor para poucas linhas:

```javascript
import express from 'express';
const app = express();

// Serve todos os arquivos estáticos da pasta 'public' automaticamente
app.use(express.static('public'));

app.listen(3000, () => {
  console.log('Servidor Express rodando na porta 3000');
});
```
*Compreender o código nativo com `http` e `fs` é fundamental para entender o funcionamento interno de frameworks como Express, Fastify e NestJS.*
