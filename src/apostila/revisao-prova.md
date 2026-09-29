# 📝 REVISÃO PARA A PROVA — Aulas 1 a 4

**Conteúdo:** Rotas com Express · Router e Controllers · Middlewares, Erros e Services · MongoDB
**Como usar:** leia o resumo de cada aula, decore as tabelas marcadas com 🧠 e faça os exercícios do final **sem olhar o gabarito**.

---

## 🗺️ Mapa geral (a história das 4 aulas)

```
Aula 1 → tudo no server.js, dados num array
Aula 2 → separa em routes / controllers / models
Aula 3 → middlewares (log, validação, 404, erro) + service + async/await
Aula 4 → troca o array pelo MongoDB (Mongoose) — dados não somem mais
```

O caminho completo de uma requisição no projeto final:

```
Cliente → server.js → logger → express.json → router → validarAluno → controller → Model (Mongo) → res
                                                                          ↓ erro
                                                                   next(erro) → errorHandler
```

---

# 📘 AULA 1 — Rotas com Express

## Conceitos principais

- **Rota = Método HTTP + Caminho** (ex.: `GET /alunos`)
- **REST**: o caminho é o mesmo (`/alunos`), o que muda é o **método**
- **CRUD**: Create, Read, Update, Delete
- **Express** usa o módulo `http` por dentro — só deixa o código curto

## 🧠 Verbos HTTP

| Método | Caminho | Ação | Status de sucesso |
|---|---|---|---|
| GET | `/alunos` | listar | 200 |
| GET | `/alunos/:id` | buscar um | 200 |
| POST | `/alunos` | criar | **201** |
| PUT | `/alunos/:id` | atualizar | 200 |
| DELETE | `/alunos/:id` | apagar | **204** |

## 🧠 Os 3 lugares de onde vêm os dados

| Onde | Exemplo | Serve para |
|---|---|---|
| `req.params` | `/alunos/7` | apontar **um** item |
| `req.query` | `/alunos?turma=A` | **filtrar** a lista |
| `req.body` | não aparece na URL | **enviar dados** novos (POST/PUT) |

## 🧠 Status codes

| Código | Nome | Quando |
|---|---|---|
| 200 | OK | deu certo |
| 201 | Created | criou |
| 204 | No Content | apagou, sem corpo |
| 400 | Bad Request | dado errado do cliente |
| 401 | Unauthorized | falta credencial (Aula 3) |
| 404 | Not Found | não achou |
| 500 | Server Error | erro do servidor |

> **4xx** = culpa de quem pediu · **5xx** = culpa do servidor

## ⚠️ Pegadinhas da Aula 1

1. `"type": "module"` no `package.json` → libera `import`/`export`. Sem ele, só `require`.
2. `req.body` veio `undefined`? Faltou `app.use(express.json())`.
3. `req.params.id` é sempre **texto** → use `Number(req.params.id)` (no array).
4. **`return` antes do `res`** no `if` de erro. Sem ele: `Cannot set headers after they are sent` (tentou responder duas vezes).
5. `a ?? b` → usa `a`; se `a` for `null`/`undefined`, usa `b`. Usado no PUT: `aluno.nome = req.body.nome ?? aluno.nome`.
6. `express.static('public')` serve arquivos estáticos.
7. `npm install -D nodemon` → dependência de desenvolvimento; `npm run dev` reinicia sozinho.

---

# 📗 AULA 2 — Router e Controllers

## Conceitos principais

| Restaurante | Código | Responsabilidade |
|---|---|---|
| Porta / recepção | `server.js` | liga tudo |
| Garçom | **Router** | decide **QUEM** atende |
| Cozinheiro | **Controller** | decide **O QUE** fazer |
| Estoque | **Model** | guarda os dados |

- **Princípio da Responsabilidade Única**: *"um arquivo, um motivo para mudar"*
- Essa organização se chama **MVC** (Model – View – Controller)
- **Refatorar** = reorganizar o código sem mudar o que ele faz
- **Acoplamento** = tudo depende de tudo (ruim)

## Código-chave

```js
// routes/alunos.routes.js
import { Router } from 'express';
import { listarAlunos, buscarAluno } from '../controllers/alunos.controller.js';

const router = Router();
router.get('/',    listarAlunos);
router.get('/:id', buscarAluno);
export default router;

// server.js
app.use('/alunos', alunosRoutes);
```

## ⚠️ Pegadinhas da Aula 2

1. **O caminho SOMA**: `app.use('/alunos', r)` + `router.get('/:id')` = `GET /alunos/:id`.
   `router.get('/alunos')` dentro do router vira **`/alunos/alunos`** ❌
2. **Extensão `.js` obrigatória** no import (por causa do ESM): `'./routes/alunos.routes.js'`
3. **Passe a função SEM parênteses**: `router.get('/', listarAlunos)` ✅ — `listarAlunos()` ❌ executa na hora.
   Analogia: `listarAlunos` é o controle remoto; `listarAlunos()` é apertar o botão.
4. `setAlunos(novaLista)` existe porque **não dá para reatribuir** uma variável importada — só o arquivo dono pode.

---

# 📕 AULA 3 — Middlewares, Erros e Services

## O que é middleware

> Função que roda **entre** a requisição e a resposta. Assinatura: `(req, res, next)`

Analogia do **aeroporto**: cada posto (check-in, raio-X...) deixa passar (`next()`) ou barra (`res.status(...)`).

### 🧠 Regra de ouro
> Ou chama `next()`, ou responde com `res`. **Nunca os dois. Nunca nenhum.**
> Esqueceu o `next()` → a requisição **trava** (fica carregando para sempre).

### 🧠 `next()` x `next(erro)`

| Chamada | Vai para |
|---|---|
| `next()` | o **próximo** middleware |
| `next(erro)` | pula tudo e vai direto para o **errorHandler** |

## Onde aplicar um middleware

```js
app.use(logger);                          // em TODAS as rotas
app.use('/alunos', logger, alunosRoutes); // só em /alunos
router.post('/', validarAluno, criarAluno); // só em UMA rota
```

`express.json()` e `express.static()` **também são middlewares** (nativos).

## Middleware de erro

```js
export function errorHandler(erro, req, res, next) {   // 4 parâmetros!
  res.status(erro.status || 500).json({ erro: erro.message });
}
```

> O Express reconhece o middleware de erro **pela quantidade de parâmetros (4)**.
> Com 3 parâmetros, vira middleware normal e não funciona.

Disparando um erro no controller:

```js
const erro = new Error('Aluno não encontrado');
erro.status = 404;
return next(erro);
```

## 🧠 Ordem no `server.js` (decore!)

```
1. Middlewares globais (logger, express.json, static)
2. Rotas
3. notFound (404)
4. errorHandler (SEMPRE por último)
```

- `express.json()` depois das rotas → `req.body` = `undefined`
- `notFound` no começo → **nada** funciona

## Service

> **Controller** cuida do HTTP (`req`, `res`, status) · **Service** cuida da regra de negócio

- Service já é `async` mesmo com array → quando trocar por banco, o controller não muda.
- **Pipeline** = esteira de middlewares: `req → logger → express.json → validarAluno → criarAluno → res`
- Função `async` **precisa** de `try/catch` com `next(erro)` no `catch` — senão o Express não captura o erro.

## Desafio bônus (pode cair!)
Middleware `autenticar` que confere o header `x-api-key === 'escola123'`; se não bater → **401**.

```js
export function autenticar(req, res, next) {
  if (req.headers['x-api-key'] !== 'escola123') {
    return res.status(401).json({ erro: 'Não autorizado' });
  }
  next();
}
// router.delete('/:id', autenticar, deletarAluno);
```

---

# 🍃 AULA 4 — MongoDB com Mongoose

## Por que banco de dados?
O array vive na **memória RAM** → reiniciou o servidor, **sumiu tudo**.
Analogia: array = **quadro branco**; banco = **caderno**.

## 🧠 Vocabulário

| Mongo | SQL / Excel | Nosso código |
|---|---|---|
| **Database** | planilha inteira | o projeto |
| **Collection** | tabela / aba | o array `alunos` |
| **Document** | linha | um objeto `{ nome: 'Ana' }` |
| **Field** | coluna | a propriedade `nome` |

- **MongoDB**: banco **NoSQL orientado a documentos** (guarda objetos tipo JSON)
- **Atlas**: MongoDB na nuvem (plano **M0** grátis)
- **Mongoose**: biblioteca que conversa com o Mongo e dá **Schema** (regras) + **Model** (métodos `find`, `create`...)
- **`_id`**: **ObjectId** de **24 caracteres**, gerado sozinho → acabou o `id: length + 1` e o `Number(req.params.id)`

## `.env` e segurança

```bash
# .env  (na raiz, sem aspas, sem espaço no =)
MONGO_URI=mongodb+srv://usuario:senha@cluster.../escola?retryWrites=true&w=majority
PORT=3000
```

- `.env` **nunca** vai pro GitHub → coloque no `.gitignore`
- `.env.example` (sem valores secretos) **vai** para o Git, como modelo
- `import 'dotenv/config'` é **a primeira linha** do `server.js`; senão `process.env.MONGO_URI` = `undefined`
- Nome do banco vai **antes do `?`** na string (`/escola?`). Esqueceu → salva no banco `test`
- `await conectarBanco()` **antes** do `app.listen`; se falhar → `process.exit(1)`

### Erros de conexão

| Mensagem | Causa |
|---|---|
| `bad auth : authentication failed` | usuário/senha errados |
| `Could not connect to any servers` | IP bloqueado (Network Access) |
| `uri parameter ... must be of type string` | `.env` não foi lido |
| `querySrv ENOTFOUND` | string copiada errada |

## Schema e Model

```js
const alunoSchema = new mongoose.Schema({
  nome:  { type: String, required: [true, 'msg'], trim: true, minlength: 3 },
  idade: { type: Number, required: true, min: 0, max: 120 },
  turma: { type: String, uppercase: true, default: 'A' },
}, { timestamps: true });

export const Aluno = mongoose.model('Aluno', alunoSchema); // collection "alunos"
```

| Opção | Faz |
|---|---|
| `required` | não salva sem o campo |
| `trim` | tira espaços das pontas |
| `uppercase` | salva em maiúsculo |
| `default` | valor quando não vem nada |
| `min`/`max`, `minlength` | limites |
| `timestamps: true` | cria `createdAt` e `updatedAt` |

> `mongoose.model('Aluno')` → collection **`alunos`** (minúsculo + plural automático).
> Middleware `validarAluno` + Schema = **cinto e airbag** (os dois se completam).

## 🧠 Array → Mongoose

| Antes (array) | Agora (Mongoose) |
|---|---|
| `alunos` | `await Aluno.find()` |
| `alunos.filter(a => a.nome === nome)` | `await Aluno.find({ nome })` |
| `alunos.find(a => a.id === id)` | `await Aluno.findById(id)` |
| `alunos.push(novo)` | `await Aluno.create(novo)` |
| editar na mão | `await Aluno.findByIdAndUpdate(id, dados, { new: true, runValidators: true })` |
| `alunos.filter(a => a.id !== id)` | `await Aluno.findByIdAndDelete(id)` |

- **`new: true`** → devolve o documento **depois** da alteração (sem isso vem o antigo)
- **`runValidators: true`** → aplica as regras do Schema também no update
- `.sort({ nome: 1 })` → ordena por nome crescente
- Toda função do Mongoose devolve **Promise** → `async` + `await` + `try/catch` + `next(erro)`
- As **rotas não mudaram nada** — prêmio por ter separado as camadas

## 🧠 Erros do banco no errorHandler

| Erro | Causa | Status |
|---|---|---|
| `CastError` | id fora do formato ObjectId (ex.: `/alunos/123`) | **400** |
| `ValidationError` | Schema recusou (mensagens em `erro.errors`) | **400** |
| id válido mas não existe | `findById` retornou `null` | **404** |
| duplicado (`unique`) | `erro.code === 11000` | **409** (bônus) |
| banco fora do ar | — | **500** |

```js
if (erro.name === 'CastError') return res.status(400).json({ error: 'ID inválido.' });
if (erro.name === 'ValidationError') {
  const mensagens = Object.values(erro.errors).map((e) => e.message);
  return res.status(400).json({ error: mensagens });
}
```

---

# ✍️ EXERCÍCIOS DE FIXAÇÃO

## Parte A — Múltipla escolha

**1.** Qual requisição é a mais adequada para **filtrar** alunos da turma B?
a) `GET /alunos/B` b) `GET /alunos?turma=B` c) `POST /alunos` com body `{turma:'B'}` d) `PUT /alunos/B`

**2.** Um `DELETE` bem-sucedido deve responder com:
a) 200 com o aluno b) 201 c) 204 sem corpo d) 404

**3.** O `req.body` está chegando `undefined`. A causa mais provável é:
a) faltou `express.static` b) faltou `app.use(express.json())` c) o id é texto d) faltou `next()`

**4.** Com `app.use('/cursos', cursosRoutes)` e `router.get('/:id', ...)`, a rota final é:
a) `GET /:id` b) `GET /cursos/cursos/:id` c) `GET /cursos/:id` d) `GET /cursos`

**5.** Qual linha está **errada**?
a) `router.get('/', listarAlunos)` b) `router.get('/', listarAlunos())` c) `router.post('/', validarAluno, criarAluno)` d) `app.use(logger)`

**6.** Como o Express sabe que uma função é o middleware de erro?
a) pelo nome `errorHandler` b) por estar no final c) por ter 4 parâmetros d) por usar `res.status(500)`

**7.** O que acontece com `next(erro)`?
a) vai para o próximo middleware normal b) vai direto para o errorHandler c) derruba o servidor d) responde 404

**8.** Na Aula 4, `GET /alunos/123` gera qual erro e qual status?
a) `ValidationError` / 400 b) `CastError` / 400 c) `CastError` / 404 d) nenhum / 404

**9.** Por que `{ new: true }` no `findByIdAndUpdate`?
a) cria o documento se não existir b) roda o Schema c) devolve a versão atualizada d) gera novo `_id`

**10.** Qual arquivo **não** deve ir para o GitHub?
a) `.env.example` b) `.gitignore` c) `.env` d) `package.json`

**11.** `mongoose.model('Professor', schema)` cria a collection:
a) `Professor` b) `professor` c) `professores` / `professors` (plural minúsculo) d) `schema`

**12.** No MongoDB, uma **collection** equivale a:
a) uma linha b) uma coluna c) uma tabela d) o banco inteiro

## Parte B — Verdadeiro ou Falso

13. ( ) Em um middleware, pode-se chamar `next()` e também `res.json()`.
14. ( ) O `notFound` deve ser registrado antes das rotas.
15. ( ) O `import 'dotenv/config'` precisa vir antes de qualquer código que leia `process.env`.
16. ( ) Com o Schema do Mongoose, o middleware `validarAluno` fica proibido.
17. ( ) `req.params.id` chega como número.
18. ( ) O Service cuida da regra de negócio; o Controller cuida de `req`/`res`/status.
19. ( ) Sem `runValidators: true`, um PUT com `idade: -5` pode ser aceito.
20. ( ) Esquecer o `return` antes de `res.status(404).json(...)` pode causar `Cannot set headers after they are sent`.

## Parte C — Encontre o erro

**21.**
```js
app.use('/alunos', alunosRoutes);
app.use(express.json());
```

**22.**
```js
export function logger(req, res) {
  console.log(req.method, req.url);
}
```

**23.**
```js
// routes/alunos.routes.js  (plugado com app.use('/alunos', router))
router.get('/alunos/:id', buscarAluno);
```

**24.**
```js
export async function criarAluno(req, res, next) {
  const novo = await Aluno.create(req.body);
  res.json(novo);
}
```

**25.**
```js
app.use(errorHandler);
app.use('/alunos', alunosRoutes);
app.use(notFound);
```

## Parte D — Dissertativas curtas

26. Explique a diferença entre `req.params`, `req.query` e `req.body` com um exemplo de cada.
27. Explique Router x Controller usando a analogia do restaurante.
28. O que é middleware? Use a analogia do aeroporto.
29. Por que o controller virou `async` na Aula 4? Qual o padrão de 3 passos?
30. Por que os dados sumiam na Aula 1–3 e por que não somem mais na Aula 4?

## Parte E — Código

31. Escreva o middleware `validarCurso` que responde 400 se `nome` não vier ou se `cargaHoraria` não for número maior que zero.
32. Escreva o Schema/Model `Curso` com `nome` (String, obrigatório, trim) e `cargaHoraria` (Number, obrigatório, mínimo 1), com timestamps.
33. Escreva o controller `buscarCurso` com Mongoose, tratando 404.

---

# ✅ GABARITO

**Parte A:** 1-b · 2-c · 3-b · 4-c · 5-b · 6-c · 7-b · 8-b · 9-c · 10-c · 11-c · 12-c

**Parte B:**
13 **F** (nunca os dois) · 14 **F** (vai no final, antes só do errorHandler) · 15 **V** · 16 **F** (os dois se completam — cinto e airbag) · 17 **F** (é texto) · 18 **V** · 19 **V** · 20 **V**

**Parte C:**
- **21.** `express.json()` precisa vir **antes** das rotas, senão `req.body` = `undefined`.
- **22.** Faltou o parâmetro `next` e a chamada `next()` → a requisição trava.
- **23.** Caminho duplicado: vira `/alunos/alunos/:id`. O certo é `router.get('/:id', ...)`.
- **24.** Faltou `try/catch` com `next(erro)`, e criar deve responder **201** (`res.status(201).json(novo)`).
- **25.** Ordem errada. Certo: rotas → `notFound` → `errorHandler` (por último).

**Parte D (pontos-chave):**
- **26.** params = identifica um item (`/alunos/7`); query = filtro após `?` (`/alunos?turma=A`); body = dados enviados no corpo (POST/PUT), exige `express.json()`.
- **27.** Router é o garçom (decide **quem** atende / encaminha); Controller é o cozinheiro (decide **o que** fazer / executa a lógica).
- **28.** Função `(req, res, next)` que roda entre a requisição e a resposta; como postos do aeroporto, pode deixar passar (`next()`) ou barrar (responder com `res`).
- **29.** Porque o banco é uma viagem pela internet e o Mongoose devolve **Promise**. Padrão: `async` na função, `await` na chamada, `try/catch` com `next(erro)`.
- **30.** O array vivia na memória RAM do processo — morreu o processo, limpou. O MongoDB grava em disco (na nuvem, Atlas), então persiste.

**Parte E:**

```js
// 31
export function validarCurso(req, res, next) {
  const { nome, cargaHoraria } = req.body;
  if (!nome || nome.trim() === '') {
    return res.status(400).json({ erro: 'O campo nome é obrigatório' });
  }
  if (typeof cargaHoraria !== 'number' || cargaHoraria <= 0) {
    return res.status(400).json({ erro: 'cargaHoraria deve ser um número maior que zero' });
  }
  next();
}
```

```js
// 32
import mongoose from 'mongoose';

const cursoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: [true, 'O nome é obrigatório.'], trim: true },
    cargaHoraria: { type: Number, required: true, min: [1, 'Mínimo de 1 hora.'] },
  },
  { timestamps: true }
);

export const Curso = mongoose.model('Curso', cursoSchema);
```

```js
// 33
export async function buscarCurso(req, res, next) {
  try {
    const curso = await Curso.findById(req.params.id);
    if (!curso) {
      const erro = new Error('Curso não encontrado');
      erro.status = 404;
      return next(erro);
    }
    res.json(curso);
  } catch (erro) {
    next(erro); // CastError vira 400 no errorHandler
  }
}
```

---

## 🏁 Checklist final antes da prova

- [ ] Sei os 5 verbos do CRUD e o status de cada um
- [ ] Sei diferenciar `params`, `query` e `body`
- [ ] Sei por que usar `return` antes de responder erro
- [ ] Sei que o caminho do `app.use` **soma** com o do `router`
- [ ] Sei passar a função **sem** `()`
- [ ] Sei a regra de ouro do middleware e a diferença `next()` × `next(erro)`
- [ ] Sei que o errorHandler tem **4 parâmetros** e vai por último
- [ ] Sei a ordem: globais → rotas → 404 → erro
- [ ] Sei a diferença Controller × Service
- [ ] Sei Database / Collection / Document / Field
- [ ] Sei para que servem `.env`, `.gitignore` e `.env.example`
- [ ] Sei ler um Schema (`required`, `trim`, `default`, `timestamps`...)
- [ ] Sei traduzir array → Mongoose (`find`, `findById`, `create`, `findByIdAndUpdate`, `findByIdAndDelete`)
- [ ] Sei `new: true` e `runValidators: true`
- [ ] Sei `CastError` (400) × não encontrado (404) × `ValidationError` (400)

Boa prova! 🍀
