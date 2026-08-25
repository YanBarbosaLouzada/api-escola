# 📘 AULA 1 DE 3 — Rotas com Express

**Duração:** 1h30 (90 min)
**Tema:** o que é uma rota e como criar uma API
**Aula independente:** o projeto é criado do zero aqui.

---

## ✅ Antes de começar

O aluno precisa ter:

- Node.js instalado (`node -v` no terminal)
- VS Code aberto
- Um cliente HTTP para testar POST, PUT e DELETE. Escolha **um**:
  - **Insomnia** (programa separado, muito usado no mercado)
  - **Postman** (programa separado, o mais famoso)
  - **Thunder Client** (extensão do VS Code, não precisa abrir outro app)

Conhecimento anterior útil: a aula de servidor com `http`, `fs` e `path`.
Mas **não é obrigatório** — vamos criar tudo de novo.

---

## 🎯 Objetivos desta aula

1. Entender o que é **rota** e **verbo HTTP**
2. Subir um servidor com **Express**
3. Ler dados de `params`, `query` e `body`
4. Responder com **JSON** e **status code** certo
5. Construir um **CRUD** completo

---

## ⏱️ Cronograma (90 min)

| Bloco | Tempo | Assunto |
|---|---|---|
| 1 | 15 min | O problema: servidor sem rotas |
| 2 | 15 min | Criando o projeto com Express |
| 3 | 25 min | Verbos, params, query e body |
| 4 | 25 min | CRUD completo na memória |
| 5 | 10 min | Testes no Thunder Client |
| 6 | 10 min | Exercício e fechamento |

---

# 🧱 BLOCO 1 — O problema (15 min)

Um servidor Node **sem** Express, com várias páginas, fica assim:

```js
// exemplo-ruim.js
import http from 'http';

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ mensagem: 'Início' }));
  }
  else if (req.url === '/alunos' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ nome: 'Ana' }]));
  }
  else if (req.url === '/alunos' && req.method === 'POST') {
    // aqui ainda faltaria juntar os pedaços do body na mão 😵
  }
  else {
    res.writeHead(404);
    res.end('Não encontrado');
  }
});

server.listen(3000);
```

### ⚠️ Problemas

- Cresce demais
- Difícil de ler
- Difícil de achar erro
- Muito código repetido

---

## 💡 Conceito-chave: o que é uma ROTA?

> **Rota = Método HTTP + Caminho**

| Método | Caminho | Significa |
|---|---|---|
| GET | `/alunos` | Quero **ver** a lista |
| GET | `/alunos/1` | Quero **ver** o aluno 1 |
| POST | `/alunos` | Quero **criar** um aluno |
| PUT | `/alunos/1` | Quero **atualizar** o aluno 1 |
| DELETE | `/alunos/1` | Quero **apagar** o aluno 1 |

### 📌 Apontamento

O caminho `/alunos` aparece 3 vezes na tabela.
**O que muda é o método.** Esse combinado se chama **REST**.

---

# 📦 BLOCO 2 — Criando o projeto (15 min)

```bash
mkdir api-escola
cd api-escola
npm init -y
npm install express
npm install -D nodemon
```

### `package.json`

```json
{
  "name": "api-escola",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### ⚠️ Não esqueça

`"type": "module"` → é o que libera `import` / `export`.
Sem ele, o Node só aceita `require`.

### Primeiro servidor

```js
// server.js
import express from 'express';

const app = express();
const PORT = 3000;

// libera a leitura de JSON no corpo da requisição
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: '🚀 API da escola no ar!' });
});

app.listen(PORT, () => {
  console.log(`Servidor em http://localhost:${PORT}`);
});
```

```bash
npm run dev
```

### 📌 Apontamento — o que o Express economiza

| Sem Express | Com Express |
|---|---|
| `res.writeHead(200, {...})` + `res.end(JSON.stringify(x))` | `res.json(x)` |
| `fs.readFile` na mão | `express.static('public')` |
| `if (req.url === '/x')` | `app.get('/x', ...)` |

O Express **não é mágica**: ele usa o mesmo `http` por dentro.
Só deixa o código curto.

### Servindo arquivos estáticos (opcional)

```js
app.use(express.static('public'));
```

Uma linha faz o que antes eram 30.

---

# 🔧 BLOCO 3 — Verbos, params, query e body (25 min)

## 3.1 Os 4 verbos

```js
app.get('/alunos', (req, res) => {
  res.json({ acao: 'listar' });
});

app.post('/alunos', (req, res) => {
  res.status(201).json({ acao: 'criar' });
});

app.put('/alunos/:id', (req, res) => {
  res.json({ acao: 'atualizar' });
});

app.delete('/alunos/:id', (req, res) => {
  res.status(204).end();
});
```

## 3.2 `req.params` — apontar UM item

```js
// URL chamada: /alunos/7
app.get('/alunos/:id', (req, res) => {
  const { id } = req.params;
  console.log(id); // "7"
  res.json({ id });
});
```

### ⚠️ Cuidado clássico

`req.params.id` vem sempre como **texto**, nunca número.

```js
const id = Number(req.params.id); // converta antes de comparar
```

## 3.3 `req.query` — filtrar

Vem depois do `?` na URL.

```js
// URL chamada: /alunos?turma=A&idade=12
app.get('/alunos', (req, res) => {
  const { turma, idade } = req.query;
  res.json({ turma, idade });
});
```

## 3.4 `req.body` — enviar dados

```js
app.post('/alunos', (req, res) => {
  const { nome, idade } = req.body;
  res.status(201).json({ nome, idade });
});
```

### ⚠️ Erro mais comum da turma

`req.body` veio `undefined`? Faltou:

```js
app.use(express.json());
```

## 📌 Resumo dos 3 lugares

| Onde | Exemplo de URL | Serve para |
|---|---|---|
| `req.params` | `/alunos/7` | Apontar **um** item |
| `req.query` | `/alunos?turma=A` | Filtrar a lista |
| `req.body` | (não aparece na URL) | Enviar dados novos |

## 3.5 Status codes

| Código | Nome | Quando usar |
|---|---|---|
| 200 | OK | Deu certo |
| 201 | Created | Criou algo novo |
| 204 | No Content | Apagou, sem resposta |
| 400 | Bad Request | Dado errado do cliente |
| 404 | Not Found | Não achei |
| 500 | Server Error | O erro foi **nosso** |

### 📌 Regra fácil de decorar

- **4xx** → culpa de quem pediu
- **5xx** → culpa do servidor

---

# 🧪 BLOCO 4 — CRUD completo (25 min)

Ainda **sem banco de dados**. Vamos usar um array na memória.

```js
// server.js — versão final da Aula 1
import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// nosso "banco de dados" temporário
let alunos = [
  { id: 1, nome: 'Ana',   idade: 12, turma: 'A' },
  { id: 2, nome: 'Bruno', idade: 13, turma: 'B' },
];

// LISTAR  →  GET /alunos
app.get('/alunos', (req, res) => {
  const { turma } = req.query;

  if (turma) {
    return res.json(alunos.filter((a) => a.turma === turma));
  }

  res.json(alunos);
});

// BUSCAR UM  →  GET /alunos/1
app.get('/alunos/:id', (req, res) => {
  const id = Number(req.params.id);
  const aluno = alunos.find((a) => a.id === id);

  if (!aluno) {
    return res.status(404).json({ erro: 'Aluno não encontrado' });
  }

  res.json(aluno);
});

// CRIAR  →  POST /alunos
app.post('/alunos', (req, res) => {
  const { nome, idade, turma } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'O campo nome é obrigatório' });
  }

  const novoAluno = { id: alunos.length + 1, nome, idade, turma };

  alunos.push(novoAluno);
  res.status(201).json(novoAluno);
});

// ATUALIZAR  →  PUT /alunos/1
app.put('/alunos/:id', (req, res) => {
  const id = Number(req.params.id);
  const aluno = alunos.find((a) => a.id === id);

  if (!aluno) {
    return res.status(404).json({ erro: 'Aluno não encontrado' });
  }

  aluno.nome  = req.body.nome  ?? aluno.nome;
  aluno.idade = req.body.idade ?? aluno.idade;
  aluno.turma = req.body.turma ?? aluno.turma;

  res.json(aluno);
});

// APAGAR  →  DELETE /alunos/1
app.delete('/alunos/:id', (req, res) => {
  const id = Number(req.params.id);
  const existe = alunos.some((a) => a.id === id);

  if (!existe) {
    return res.status(404).json({ erro: 'Aluno não encontrado' });
  }

  alunos = alunos.filter((a) => a.id !== id);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
});
```

### ⚠️ Apontamento: o `return` é obrigatório

```js
if (!aluno) {
  return res.status(404).json({ erro: '...' }); // <- sem o return dá erro
}
res.json(aluno);
```

Sem o `return`, o código continua e tenta responder **duas vezes**.
O Node reclama: `Cannot set headers after they are sent`.

### 📌 Apontamento: `??` (nullish coalescing)

```js
aluno.nome = req.body.nome ?? aluno.nome;
```

Lê-se: "usa o que veio no body; se não veio nada, mantém o que já tinha".

---

# 🔍 BLOCO 5 — Testes (10 min)

### 📌 Apontamento

Todos esses programas fazem a **mesma coisa**: montam uma requisição HTTP.
Muda só a tela. Use o que a turma achar mais fácil.

| Verbo | Como testar |
|---|---|
| GET | direto no navegador |
| POST / PUT / DELETE | Insomnia, Postman ou Thunder Client |

### Roteiro de teste em sala

1. `GET http://localhost:3000/alunos` → deve trazer 2 alunos
2. `GET http://localhost:3000/alunos/1` → deve trazer a Ana
3. `GET http://localhost:3000/alunos/99` → deve dar **404**
4. `POST http://localhost:3000/alunos` com o body abaixo → deve dar **201**

```json
{
  "nome": "Carlos",
  "idade": 11,
  "turma": "A"
}
```

5. `POST` sem o campo `nome` → deve dar **400**
6. `GET /alunos?turma=A` → deve filtrar
7. `DELETE /alunos/2` → deve dar **204**

---

# 🏋️ BLOCO 6 — Exercício e fechamento (10 min)

## Exercício

1. Crie as rotas de **cursos** dentro do mesmo `server.js`:
   - `GET /cursos`
   - `GET /cursos/:id`
   - `POST /cursos`
   - `DELETE /cursos/:id`
2. Cada curso tem: `id`, `nome`, `cargaHoraria`
3. No POST, valide que `cargaHoraria` é um número maior que zero

## ✅ Checklist da Aula 1

- [ ] Sei explicar o que é uma rota
- [ ] Sei a diferença entre GET, POST, PUT e DELETE
- [ ] Sei usar `params`, `query` e `body`
- [ ] Sei quando usar 200, 201, 400 e 404
- [ ] Fiz o CRUD de alunos funcionar

## 🔮 Gancho para a Aula 2

Olhem o `server.js` agora: rota + validação + regra + dados, **tudo junto**.

Se adicionarmos cursos, professores e turmas, esse arquivo passa de 500 linhas.

👉 Na próxima aula vamos separar tudo em **Router** e **Controller**.

---

## 📖 Glossário da Aula 1

| Palavra | Significado simples |
|---|---|
| **API** | Servidor que devolve dados, não páginas |
| **Rota** | Método + caminho (`GET /alunos`) |
| **Endpoint** | Cada rota disponível na API |
| **REST** | Combinado de mercado de como nomear rotas |
| **CRUD** | Create, Read, Update, Delete |
| **JSON** | Formato de texto para trocar dados |
| **Status code** | Número que diz se deu certo ou errado |
