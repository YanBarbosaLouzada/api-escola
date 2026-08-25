# 📕 AULA 3 DE 3 — Middlewares, Erros e Services

**Duração:** 1h30 (90 min)
**Tema:** deixar a API profissional
**Aula independente:** o código inicial está no Bloco 1, pronto para copiar.

---

## ✅ Antes de começar

O aluno precisa saber:

- Criar rota com `express.Router()`
- Separar controller do arquivo de rotas
- Usar `req.body` e status code

Se faltou na aula passada, **sem problema**: o ponto de partida está pronto abaixo.

---

## 🎯 Objetivos desta aula

1. Entender o que é **middleware** e o que faz o `next()`
2. Criar middleware de **log** e de **validação**
3. Tratar **404** e **erro 500** em um lugar só
4. Separar a camada de **Service**
5. Usar `async / await` com `try / catch`

---

## ⏱️ Cronograma (90 min)

| Bloco | Tempo | Assunto |
|---|---|---|
| 1 | 10 min | Ponto de partida (código inicial) |
| 2 | 20 min | O que é middleware |
| 3 | 15 min | Middleware de validação |
| 4 | 20 min | 404 e tratamento de erros |
| 5 | 20 min | Camada de Service + async |
| 6 | 5 min  | Projeto final |

---

# 🧱 BLOCO 1 — Ponto de partida (10 min)

Estrutura que todo mundo precisa ter:

```
api-escola/
├── controllers/alunos.controller.js
├── models/alunos.model.js
├── routes/alunos.routes.js
├── package.json
└── server.js
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

```js
// controllers/alunos.controller.js
import { alunos } from '../models/alunos.model.js';

export function listarAlunos(req, res) {
  res.json(alunos);
}

export function buscarAluno(req, res) {
  const id = Number(req.params.id);
  const aluno = alunos.find((a) => a.id === id);
  if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado' });
  res.json(aluno);
}

export function criarAluno(req, res) {
  const { nome, idade } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });
  const novo = { id: alunos.length + 1, nome, idade };
  alunos.push(novo);
  res.status(201).json(novo);
}
```

```js
// routes/alunos.routes.js
import { Router } from 'express';
import { listarAlunos, buscarAluno, criarAluno } from '../controllers/alunos.controller.js';

const router = Router();
router.get('/', listarAlunos);
router.get('/:id', buscarAluno);
router.post('/', criarAluno);

export default router;
```

```js
// server.js
import express from 'express';
import alunosRoutes from './routes/alunos.routes.js';

const app = express();
app.use(express.json());
app.use('/alunos', alunosRoutes);

app.listen(3000, () => console.log('🚀 http://localhost:3000'));
```

### 📌 Pergunta que abre a aula

Onde eu coloco um código que precisa rodar em **TODAS** as rotas?

No controller? Teria que repetir em cada função.
No router? Teria que repetir em cada arquivo.

Precisamos de um lugar novo. 👇

---

# 🚏 BLOCO 2 — O que é um Middleware (20 min)

## A analogia do aeroporto

Para chegar no avião você passa por vários postos:

1. Check-in
2. Raio-X
3. Passaporte
4. Portão

Cada posto pode:

- ✅ **deixar passar** para o próximo → `next()`
- ❌ **barrar** você ali mesmo → `res.status(...)`

**Middleware é isso:** um posto no meio do caminho.

## 💡 Conceito-chave

> Middleware é uma função que roda **entre** a requisição e a resposta.

```js
function meuMiddleware(req, res, next) {
  // faz alguma coisa
  next(); // libera para o próximo
}
```

## ⚠️ A regra de ouro

> Ou você chama `next()`, ou você responde com `res`.
> **Nunca os dois. Nunca nenhum.**

Esqueceu o `next()`? A requisição **trava** e o navegador fica carregando para sempre.

## 2.1 Primeiro middleware: o Logger

```bash
mkdir middlewares
```

```js
// middlewares/logger.js
export function logger(req, res, next) {
  const hora = new Date().toLocaleTimeString('pt-BR');
  console.log(`[${hora}] ${req.method} ${req.url}`);
  next(); // MUITO importante
}
```

```js
// server.js
import { logger } from './middlewares/logger.js';

app.use(logger); // roda em TODAS as rotas
```

Teste: acesse qualquer rota e veja o terminal.

## ⚠️ Apontamento: a ORDEM importa muito

O Express lê **de cima para baixo**.

```js
app.use(logger);              // 1º roda
app.use(express.json());      // 2º roda
app.use('/alunos', rotas);    // 3º roda
```

Se `express.json()` vier **depois** das rotas, o `req.body` vem `undefined`.

## 2.2 Middleware não precisa ser global

```js
// em todas as rotas
app.use(logger);

// só em /alunos
app.use('/alunos', logger, alunosRoutes);

// só em UMA rota
router.post('/', validarAluno, criarAluno);
```

## 📌 Apontamento

Você já usava middleware sem saber:

```js
app.use(express.json());            // middleware nativo
app.use(express.static('public'));  // middleware nativo
```

---

# ✅ BLOCO 3 — Middleware de validação (15 min)

A validação estava repetida dentro dos controllers. Vamos tirar de lá.

```js
// middlewares/validarAluno.js
export function validarAluno(req, res, next) {
  const { nome, idade } = req.body;

  if (!nome || nome.trim() === '') {
    return res.status(400).json({ erro: 'O campo nome é obrigatório' });
  }

  if (nome.length < 3) {
    return res.status(400).json({ erro: 'O nome precisa ter ao menos 3 letras' });
  }

  if (idade !== undefined && (isNaN(idade) || idade < 0)) {
    return res.status(400).json({ erro: 'Idade inválida' });
  }

  next(); // passou, pode seguir
}
```

Usando na rota:

```js
// routes/alunos.routes.js
import { Router } from 'express';
import { validarAluno } from '../middlewares/validarAluno.js';
import {
  listarAlunos, buscarAluno, criarAluno, atualizarAluno, deletarAluno,
} from '../controllers/alunos.controller.js';

const router = Router();

router.get('/',       listarAlunos);
router.get('/:id',    buscarAluno);
router.post('/',      validarAluno, criarAluno);      // 👈 valida antes
router.put('/:id',    validarAluno, atualizarAluno);  // 👈 valida antes
router.delete('/:id', deletarAluno);

export default router;
```

### 📌 Apontamento

Agora o controller **confia** que o dado chegou certo.
Ele só cuida da regra de negócio.

Isso se chama **pipeline** — uma esteira de etapas:

```
req → logger → express.json → validarAluno → criarAluno → res
```

---

# 💥 BLOCO 4 — 404 e tratamento de erros (20 min)

## 4.1 Middleware de 404

```js
// middlewares/notFound.js
export function notFound(req, res) {
  res.status(404).json({
    erro: 'Rota não encontrada',
    caminho: req.url,
  });
}
```

### ⚠️ Por que ele vai no FINAL?

O Express testa as rotas em ordem.
Se chegou até aqui, é porque **nenhuma rota bateu**.

Se colocar no começo, **nada** funciona.

## 4.2 Middleware de erro (o especial)

Este tem **4 parâmetros**. O primeiro é o erro.

```js
// middlewares/errorHandler.js
export function errorHandler(erro, req, res, next) {
  console.error('❌ ERRO:', erro.message);

  res.status(erro.status || 500).json({
    erro: erro.message || 'Erro interno do servidor',
  });
}
```

### ⚠️ Detalhe que quase ninguém decora

O Express identifica o middleware de erro **pela quantidade de parâmetros**:

```js
(req, res, next)        → middleware normal
(erro, req, res, next)  → middleware de ERRO
```

Esqueceu o 4º parâmetro? Ele vira um middleware normal e **não funciona**.

## 4.3 Como disparar um erro

```js
export function buscarAluno(req, res, next) {
  const id = Number(req.params.id);
  const aluno = alunos.find((a) => a.id === id);

  if (!aluno) {
    const erro = new Error('Aluno não encontrado');
    erro.status = 404;
    return next(erro); // 👈 next COM argumento vai direto pro errorHandler
  }

  res.json(aluno);
}
```

### 📌 A regra do `next`

| Chamada | O que faz |
|---|---|
| `next()` | Vai para o **próximo middleware** |
| `next(erro)` | Pula tudo e vai para o **errorHandler** |

## 4.4 `server.js` completo

```js
// server.js
import express from 'express';

import { logger }       from './middlewares/logger.js';
import { notFound }     from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

import alunosRoutes from './routes/alunos.routes.js';
import cursosRoutes from './routes/cursos.routes.js';

const app = express();
const PORT = 3000;

// 1. middlewares globais
app.use(logger);
app.use(express.json());
app.use(express.static('public'));

// 2. rotas
app.use('/alunos', alunosRoutes);
app.use('/cursos', cursosRoutes);

// 3. rota não encontrada
app.use(notFound);

// 4. tratamento de erro (SEMPRE por último)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
});
```

### 📌 Decore esta ordem

```
1. Middlewares globais
2. Rotas
3. 404
4. Error handler
```

---

# 🧠 BLOCO 5 — Camada de Service + async (20 min)

## O problema

O controller ainda sabe **onde** os dados estão (o array).
Se amanhã virar banco de dados, teremos que reescrever todos os controllers.

## A solução: Service

> **Controller** cuida do HTTP (req / res / status)
> **Service** cuida da regra de negócio

```bash
mkdir services
```

```js
// services/alunos.service.js
import { alunos, setAlunos } from '../models/alunos.model.js';

export async function listarTodos(turma) {
  if (turma) {
    return alunos.filter((a) => a.turma === turma);
  }
  return alunos;
}

export async function buscarPorId(id) {
  return alunos.find((a) => a.id === id);
}

export async function criar(dados) {
  const novoAluno = {
    id: alunos.length + 1,
    nome: dados.nome,
    idade: dados.idade,
    turma: dados.turma,
  };

  alunos.push(novoAluno);
  return novoAluno;
}

export async function remover(id) {
  const existe = alunos.some((a) => a.id === id);
  if (!existe) return false;

  setAlunos(alunos.filter((a) => a.id !== id));
  return true;
}
```

## Controller usando o service

```js
// controllers/alunos.controller.js
import * as alunosService from '../services/alunos.service.js';

export async function listarAlunos(req, res, next) {
  try {
    const lista = await alunosService.listarTodos(req.query.turma);
    res.json(lista);
  } catch (erro) {
    next(erro);
  }
}

export async function buscarAluno(req, res, next) {
  try {
    const id = Number(req.params.id);
    const aluno = await alunosService.buscarPorId(id);

    if (!aluno) {
      const erro = new Error('Aluno não encontrado');
      erro.status = 404;
      return next(erro);
    }

    res.json(aluno);
  } catch (erro) {
    next(erro);
  }
}

export async function criarAluno(req, res, next) {
  try {
    const novoAluno = await alunosService.criar(req.body);
    res.status(201).json(novoAluno);
  } catch (erro) {
    next(erro);
  }
}

export async function deletarAluno(req, res, next) {
  try {
    const id = Number(req.params.id);
    const removido = await alunosService.remover(id);

    if (!removido) {
      const erro = new Error('Aluno não encontrado');
      erro.status = 404;
      return next(erro);
    }

    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
}
```

### ⚠️ Por que `async` se ainda é só um array?

Porque amanhã vai ser banco de dados — e banco **é assíncrono**.
Escrevendo `async` desde já, quando trocar o service por Prisma ou MongoDB,
**o controller não muda nenhuma linha**.

### ⚠️ O `try / catch` é obrigatório em função `async`

Se estourar um erro dentro de um `async` sem `try/catch`,
o Express **não captura sozinho** e o servidor pode travar.

## 📌 Estrutura final do projeto

```
api-escola/
├── controllers/     # fala HTTP (req, res)
├── services/        # regra de negócio
├── models/          # os dados
├── routes/          # o índice das rotas
├── middlewares/     # o que roda no meio do caminho
├── public/          # arquivos estáticos
├── package.json
└── server.js        # só liga tudo
```

## 💼 No mercado de trabalho

- Essa é praticamente a estrutura de um projeto **NestJS**
- "O que é middleware?" é pergunta **muito** comum em entrevista
- O `errorHandler` central evita repetir tratamento de erro em toda rota

---

# 🏋️ BLOCO 6 — Projeto final (5 min)

Monte a API completa da escola:

1. **3 recursos**: `/alunos`, `/cursos`, `/professores`
2. Cada um com **routes + controller + service + model**
3. Middlewares obrigatórios:
   - `logger` (global)
   - `validar` (em cada POST e PUT)
   - `notFound`
   - `errorHandler`
4. Todos os controllers com `async / await` + `try / catch`
5. Uma rota com filtro: `GET /alunos?turma=A`

## ⭐ Desafio bônus

Crie o middleware `autenticar.js` que verifica o header
`x-api-key` com o valor `escola123`.
Se não vier, responda `401 Não autorizado`.

Use ele **só** nas rotas de DELETE.

## ✅ Checklist da Aula 3

- [ ] Sei explicar o que é middleware usando a analogia do aeroporto
- [ ] Sei a diferença entre `next()` e `next(erro)`
- [ ] Sei por que a ordem dos `app.use()` importa
- [ ] Sei que o errorHandler tem 4 parâmetros
- [ ] Sei a diferença entre Controller e Service

---

## 📖 Glossário da Aula 3

| Palavra | Significado simples |
|---|---|
| **Middleware** | Função que roda no meio do caminho |
| **`next()`** | Libera para a próxima etapa |
| **`next(erro)`** | Pula direto para o tratador de erro |
| **Pipeline** | A esteira de middlewares |
| **Service** | Camada com a regra de negócio |
| **Header** | Informação extra enviada junto da requisição |
| **401** | Não autorizado (falta credencial) |
