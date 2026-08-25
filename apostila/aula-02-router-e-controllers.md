# 📗 AULA 2 DE 3 — Router e Controllers

**Duração:** 1h30 (90 min)
**Tema:** separar o código em camadas
**Aula independente:** o código inicial está no Bloco 1, pronto para copiar.

---

## ✅ Antes de começar

O aluno precisa saber:

- Criar rota com `app.get()` / `app.post()`
- Usar `req.params`, `req.query` e `req.body`
- O que é status code (200, 201, 400, 404)

Se faltou na aula passada, **sem problema**: o ponto de partida está pronto abaixo.

---

## 🎯 Objetivos desta aula

1. Entender **por que** separar o código em pastas
2. Usar o `express.Router()`
3. Criar **Controllers**
4. Ligar rota → controller
5. Montar a estrutura de pastas usada no mercado

---

## ⏱️ Cronograma (90 min)

| Bloco | Tempo | Assunto |
|---|---|---|
| 1 | 10 min | Ponto de partida (código inicial) |
| 2 | 15 min | Separação de responsabilidades |
| 3 | 20 min | `express.Router()` |
| 4 | 30 min | Controllers |
| 5 | 10 min | Estrutura final + mercado |
| 6 | 5 min  | Exercício |

---

# 🧱 BLOCO 1 — Ponto de partida (10 min)

Todo mundo precisa estar com **este** projeto rodando.

```bash
mkdir api-escola
cd api-escola
npm init -y
npm install express
npm install -D nodemon
```

`package.json`:

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

`server.js` (ponto de partida — tudo misturado de propósito):

```js
// server.js
import express from 'express';

const app = express();
app.use(express.json());

let alunos = [
  { id: 1, nome: 'Ana',   idade: 12 },
  { id: 2, nome: 'Bruno', idade: 13 },
];

app.get('/alunos', (req, res) => {
  res.json(alunos);
});

app.get('/alunos/:id', (req, res) => {
  const id = Number(req.params.id);
  const aluno = alunos.find((a) => a.id === id);
  if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado' });
  res.json(aluno);
});

app.post('/alunos', (req, res) => {
  const { nome, idade } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });
  const novo = { id: alunos.length + 1, nome, idade };
  alunos.push(novo);
  res.status(201).json(novo);
});

app.listen(3000, () => console.log('🚀 http://localhost:3000'));
```

```bash
npm run dev
```

### 📌 Apontamento — o problema desta aula

Olhem **uma** rota de perto:

```js
app.get('/alunos/:id', (req, res) => {
  const id = Number(req.params.id);              // trata a requisição
  const aluno = alunos.find(a => a.id === id);   // mexe nos dados
  if (!aluno) return res.status(404)...          // trata o erro
  res.json(aluno);                               // monta a resposta
});
```

**4 responsabilidades diferentes** em 4 linhas.

**Pergunta pra turma:**
Se der erro na listagem, em qual arquivo você procura?
E se o arquivo tiver 800 linhas?

---

# 🍽️ BLOCO 2 — Separação de responsabilidades (15 min)

## A analogia do restaurante

| Restaurante | Nosso código |
|---|---|
| 🚪 Porta / recepção | `server.js` |
| 🧑‍🍳 Garçom (anota e leva pra cozinha certa) | **Router** |
| 👨‍🍳 Cozinheiro (prepara o prato) | **Controller** |
| 📦 Estoque / geladeira | **Model** |

O garçom **não cozinha**.
O cozinheiro **não atende mesa**.

Cada um faz **uma coisa só** — e faz bem.

## 💡 Conceito-chave

> **Router** = decide **QUEM** vai atender
> **Controller** = decide **O QUE** fazer

## 📌 Apontamento

Isso tem nome no mercado: **Princípio da Responsabilidade Única**
(*Single Responsibility Principle*).

Frase para colar na parede:

> **Um arquivo, um motivo para mudar.**

## 🎲 Dinâmica rápida (3 min)

Peça para a turma classificar cada frase em **Router** ou **Controller**:

| Frase | Resposta |
|---|---|
| "Quem chegou em `GET /alunos/5`?" | Router |
| "Procurar o aluno 5 na lista" | Controller |
| "Se não achou, responder 404" | Controller |
| "`/cursos` vai para o arquivo de cursos" | Router |

---

# 🚦 BLOCO 3 — `express.Router()` (20 min)

O `Router` é um **mini-app do Express**.
Ele guarda um grupo de rotas e depois é "plugado" no app principal.

## Passo 1 — criar a pasta

```bash
mkdir routes
```

## Passo 2 — criar o arquivo de rotas

```js
// routes/alunos.routes.js
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ acao: 'listar alunos' });
});

router.get('/:id', (req, res) => {
  res.json({ acao: 'buscar aluno', id: req.params.id });
});

router.post('/', (req, res) => {
  res.status(201).json({ acao: 'criar aluno' });
});

export default router;
```

## Passo 3 — plugar no `server.js`

```js
// server.js
import express from 'express';
import alunosRoutes from './routes/alunos.routes.js';

const app = express();

app.use(express.json());

// tudo que começar com /alunos vai para alunosRoutes
app.use('/alunos', alunosRoutes);

app.listen(3000, () => console.log('🚀 http://localhost:3000'));
```

## ⚠️ O detalhe que confunde TODO MUNDO

O caminho é **somado**:

```
app.use('/alunos', alunosRoutes)   →  prefixo:  /alunos
router.get('/')                    →  vira:     GET /alunos
router.get('/:id')                 →  vira:     GET /alunos/:id
```

Dentro do arquivo de rotas você **não repete** a palavra `alunos`.

❌ Errado:
```js
router.get('/alunos', ...) // vira /alunos/alunos
```

✅ Certo:
```js
router.get('/', ...)
```

## ⚠️ Apontamento: a extensão `.js` é obrigatória

```js
import alunosRoutes from './routes/alunos.routes.js'; // ✅
import alunosRoutes from './routes/alunos.routes';    // ❌ quebra no ESM
```

Isso só acontece porque usamos `"type": "module"`.

---

# 👨‍🍳 BLOCO 4 — Controllers (30 min)

O arquivo de rotas ainda tem lógica dentro. Vamos tirar.

## O que é um Controller?

Um arquivo com as **funções** que respondem às rotas.

- Recebe `req`
- Executa a lógica
- Devolve `res`

## Passo 1 — os dados em um arquivo separado

```bash
mkdir models
```

```js
// models/alunos.model.js
export let alunos = [
  { id: 1, nome: 'Ana',   idade: 12, turma: 'A' },
  { id: 2, nome: 'Bruno', idade: 13, turma: 'B' },
];

export function setAlunos(novaLista) {
  alunos = novaLista;
}
```

### 📌 Apontamento

Por que a função `setAlunos`?
Porque não dá para reatribuir (`alunos = ...`) uma variável importada de fora.
Quem troca a lista precisa ser o próprio arquivo dono dela.

## Passo 2 — o controller

```bash
mkdir controllers
```

```js
// controllers/alunos.controller.js
import { alunos, setAlunos } from '../models/alunos.model.js';

// GET /alunos
export function listarAlunos(req, res) {
  const { turma } = req.query;

  if (turma) {
    return res.json(alunos.filter((a) => a.turma === turma));
  }

  res.json(alunos);
}

// GET /alunos/:id
export function buscarAluno(req, res) {
  const id = Number(req.params.id);
  const aluno = alunos.find((a) => a.id === id);

  if (!aluno) {
    return res.status(404).json({ erro: 'Aluno não encontrado' });
  }

  res.json(aluno);
}

// POST /alunos
export function criarAluno(req, res) {
  const { nome, idade, turma } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'O campo nome é obrigatório' });
  }

  const novoAluno = { id: alunos.length + 1, nome, idade, turma };

  alunos.push(novoAluno);
  res.status(201).json(novoAluno);
}

// PUT /alunos/:id
export function atualizarAluno(req, res) {
  const id = Number(req.params.id);
  const aluno = alunos.find((a) => a.id === id);

  if (!aluno) {
    return res.status(404).json({ erro: 'Aluno não encontrado' });
  }

  aluno.nome  = req.body.nome  ?? aluno.nome;
  aluno.idade = req.body.idade ?? aluno.idade;
  aluno.turma = req.body.turma ?? aluno.turma;

  res.json(aluno);
}

// DELETE /alunos/:id
export function deletarAluno(req, res) {
  const id = Number(req.params.id);
  const existe = alunos.some((a) => a.id === id);

  if (!existe) {
    return res.status(404).json({ erro: 'Aluno não encontrado' });
  }

  setAlunos(alunos.filter((a) => a.id !== id));
  res.status(204).end();
}
```

## Passo 3 — a rota fica LIMPA

```js
// routes/alunos.routes.js
import { Router } from 'express';
import {
  listarAlunos,
  buscarAluno,
  criarAluno,
  atualizarAluno,
  deletarAluno,
} from '../controllers/alunos.controller.js';

const router = Router();

router.get('/',       listarAlunos);
router.get('/:id',    buscarAluno);
router.post('/',      criarAluno);
router.put('/:id',    atualizarAluno);
router.delete('/:id', deletarAluno);

export default router;
```

### 📌 Apontamento grande

O arquivo de rotas virou um **índice**, um sumário.
Dá para bater o olho e entender a API inteira em 5 segundos.

**Esse é o objetivo.**

## ⚠️ Erro clássico: chamar a função com `()`

❌ Errado:
```js
router.get('/', listarAlunos()); // executa AGORA e passa o resultado
```

✅ Certo:
```js
router.get('/', listarAlunos);   // entrega a função pro Express chamar depois
```

### 📌 Analogia para explicar

- `listarAlunos` → é **o controle remoto**
- `listarAlunos()` → é **apertar o botão**

Você entrega o controle remoto pro Express. Quem aperta é ele, quando alguém acessa a rota.

## 🔄 O caminho completo da requisição

```
Navegador
   ↓  GET /alunos/2
server.js
   ↓  app.use('/alunos', alunosRoutes)
routes/alunos.routes.js
   ↓  router.get('/:id', buscarAluno)
controllers/alunos.controller.js
   ↓  procura no array
models/alunos.model.js
   ↓  devolve o aluno
res.json(aluno)  →  volta pro navegador
```

Vale desenhar isso no quadro.

---

# 📁 BLOCO 5 — Estrutura final e mercado (10 min)

```
api-escola/
├── controllers/
│   ├── alunos.controller.js
│   └── cursos.controller.js
├── models/
│   ├── alunos.model.js
│   └── cursos.model.js
├── routes/
│   ├── alunos.routes.js
│   └── cursos.routes.js
├── public/
├── package.json
└── server.js
```

`server.js` final:

```js
// server.js
import express from 'express';
import alunosRoutes from './routes/alunos.routes.js';
import cursosRoutes from './routes/cursos.routes.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

app.use('/alunos', alunosRoutes);
app.use('/cursos', cursosRoutes);

app.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
});
```

### 📌 Apontamento

O `server.js` voltou a ter **15 linhas**.
E vai continuar pequeno mesmo com 50 rotas.

## 💼 No mercado de trabalho

- Essa organização se chama **MVC** (Model – View – Controller)
- O **NestJS** já força essa separação por padrão
- Em API a "View" quase não existe — quem mostra a tela é o React
- Praticamente toda vaga de Node espera que você saiba isso

---

# 🏋️ BLOCO 6 — Exercício (5 min)

1. Crie a estrutura completa de **cursos**:
   - `models/cursos.model.js`
   - `controllers/cursos.controller.js`
   - `routes/cursos.routes.js`
2. Campos: `id`, `nome`, `cargaHoraria`
3. Faça as 5 rotas (listar, buscar, criar, atualizar, deletar)
4. Plugue com `app.use('/cursos', cursosRoutes)`

## ✅ Checklist da Aula 2

- [ ] Sei explicar a diferença entre Router e Controller
- [ ] Sei criar um `express.Router()` e plugar com `app.use()`
- [ ] Sei que o caminho do `app.use` **soma** com o do `router`
- [ ] Sei que passo a função **sem** os parênteses
- [ ] Meu `server.js` está pequeno

## 🔮 Gancho para a Aula 3

Repare: a validação `if (!nome)` está repetida em vários controllers.

E se eu quiser:
- registrar no console **toda** requisição que chega?
- bloquear quem não tem senha?
- tratar erro em **um lugar só**?

👉 Na próxima aula: **Middlewares**.

---

## 📖 Glossário da Aula 2

| Palavra | Significado simples |
|---|---|
| **Router** | Mini-app do Express com um grupo de rotas |
| **Controller** | Função que responde a uma rota |
| **Model** | Onde ficam os dados |
| **MVC** | Padrão de organização em camadas |
| **Acoplamento** | Quando tudo depende de tudo (ruim) |
| **Refatorar** | Reorganizar o código sem mudar o que ele faz |
