# 📗 AULA 4 — Conectando tudo no MongoDB

**Duração:** 1h30 (90 min)
**Tema:** sair do array na memória e usar um banco de dados de verdade
**Aula independente:** o código inicial está no Bloco 1, pronto para copiar.

---

## ✅ Antes de começar

O aluno precisa saber:

- Criar rota com `express.Router()`
- Separar controller do arquivo de rotas
- O que é middleware e o que faz o `next()`

Se faltou na aula passada, **sem problema**: o ponto de partida está pronto abaixo.

Você também vai precisar de:

- Node.js instalado (teste com `node -v`)
- Uma conta gratuita no **MongoDB Atlas** (https://www.mongodb.com/atlas) — é grátis e não pede cartão
- Insomnia, Postman ou Thunder Client para testar as rotas

---

## 😱 O problema que vamos resolver hoje

Hoje a nossa API guarda os alunos assim:

```js
export let alunos = [
  { id: 1, nome: 'Ana', idade: 12, turma: 'A' },
];
```

Faça este teste agora:

1. Cadastre 3 alunos com `POST /alunos`
2. Pare o servidor (`Ctrl + C`)
3. Suba de novo (`npm run dev`)
4. Faça `GET /alunos`

**Sumiu tudo.** Voltaram só a Ana e o Bruno.

Isso acontece porque o array vive na **memória RAM** do processo do Node.
Quando o processo morre, a memória é limpa.

> 💡 **Analogia:** o array é um quadro branco. O banco de dados é um caderno.
> Acabou a aula? O quadro é apagado. O caderno continua na mochila.

**Hoje a gente troca o quadro branco pelo caderno.**

---

## 🎯 Objetivos desta aula

1. Entender o que é **MongoDB** e o que é uma **collection**
2. Criar um banco grátis no **MongoDB Atlas**
3. Guardar segredos no arquivo **`.env`**
4. Conectar o Express no Mongo usando o **Mongoose**
5. Trocar o array por um **Schema / Model**
6. Reescrever o CRUD todo com **`async / await`**
7. Tratar os erros novos do banco (`CastError` e `ValidationError`)

---

## ⏱️ Cronograma (90 min)

| Bloco | Tempo | Assunto |
|---|---|---|
| 1 | 10 min | Ponto de partida (código inicial) |
| 2 | 10 min | O que é MongoDB (teoria rápida) |
| 3 | 15 min | Criar o banco no Atlas e pegar a string |
| 4 | 10 min | `.env`, `.gitignore` e conexão |
| 5 | 10 min | Schema e Model com Mongoose |
| 6 | 25 min | Reescrever o CRUD com async/await |
| 7 | 10 min | Erros do banco no errorHandler |

---

# 🧱 BLOCO 1 — Ponto de partida (10 min)

Estrutura que todo mundo precisa ter antes de começar:

```
api-escola/
├── src/
│   ├── controllers/alunos.controllers.js
│   ├── middleware/errorHandler.js
│   ├── middleware/logger.js
│   ├── middleware/notFound.js
│   ├── middleware/validarAluno.js
│   ├── models/alunos.model.js
│   ├── routes/alunos.routes.js
│   └── server.js
└── package.json
```

```js
// src/models/alunos.model.js
export let alunos = [
  { id: 1, nome: 'Ana',   idade: 12, turma: 'A' },
  { id: 2, nome: 'Bruno', idade: 13, turma: 'B' },
];

export function setAlunos(novaLista) {
  alunos = novaLista;
}
```

```js
// src/routes/alunos.routes.js
import { Router } from 'express';
import {
  listarAlunos, buscarAluno, criarAluno, atualizarAluno, deletarAluno,
} from '../controllers/alunos.controllers.js';
import { validarAluno } from '../middleware/validarAluno.js';

const router = Router();

router.get('/',       listarAlunos);
router.get('/:id',    buscarAluno);
router.post('/',      validarAluno, criarAluno);
router.put('/:id',    validarAluno, atualizarAluno);
router.delete('/:id', deletarAluno);

export default router;
```

```js
// src/server.js
import express from 'express';
import alunosRoutes from './routes/alunos.routes.js';
import { logger } from './middleware/logger.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = 3000;

app.use(logger);
app.use(express.json());

app.use('/alunos', alunosRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor em http://localhost:${PORT}`);
});
```

▶️ Rode `npm run dev` e confirme que `GET /alunos` responde.
Só siga para o Bloco 2 quando a turma inteira estiver com isso funcionando.

---

# 🍃 BLOCO 2 — O que é MongoDB (10 min)

**MongoDB** é um banco de dados **NoSQL orientado a documentos**.

Tradução para humanos: ele guarda **objetos JSON**, quase iguais aos que a
gente já escreve em JavaScript.

### O vocabulário novo

| No Mongo | No Excel / SQL | No nosso código |
|---|---|---|
| **Database** | A planilha inteira | O projeto todo |
| **Collection** | Uma aba / tabela | O array `alunos` |
| **Document** | Uma linha | Um objeto `{ nome: 'Ana' }` |
| **Field** | Uma coluna | Uma propriedade `nome` |

Um documento de aluno dentro do Mongo é assim:

```json
{
  "_id": "65f0c1a2b3c4d5e6f7a8b9c0",
  "nome": "Ana",
  "idade": 12,
  "turma": "A"
}
```

### 👀 Repare no `_id`

O Mongo **cria o id sozinho**. Não é `1`, `2`, `3` — é um **ObjectId**:
uma string de 24 caracteres, única no mundo.

Isso muda 3 coisas no nosso código, e vale anotar no caderno:

1. Some o `id: alunos.length + 1`
2. `Number(req.params.id)` **acaba** — o id agora é texto
3. O campo chama `_id`, com underline na frente

### E o Mongoose, o que é?

**Mongoose** é a biblioteca que conversa com o Mongo pelo Node.
Ele dá duas coisas que o driver puro não dá:

- **Schema**: o contrato do que um aluno pode ter (validação automática)
- **Model**: um objeto com os métodos prontos — `find()`, `create()`, `findById()`...

> 💡 **Analogia:** o MongoDB é o armário de pastas.
> O Mongoose é o estagiário organizado que guarda e busca a pasta pra você —
> e reclama se você tentar guardar um aluno sem nome.

---

# ☁️ BLOCO 3 — Criando o banco no Atlas (15 min)

**Atlas** é o MongoDB rodando na nuvem, de graça. Não precisa instalar nada.

### Passo 1 — Criar o cluster

1. Acesse **https://www.mongodb.com/atlas** e crie a conta
2. Clique em **Build a Database**
3. Escolha o plano **M0 (Free)**
4. Escolha a região mais perto de você (ex.: São Paulo)
5. Dê um nome ao cluster (ex.: `cluster-escola`) → **Create**

☕ O cluster leva 1 a 3 minutos para ficar pronto.

### Passo 2 — Criar o usuário do banco

Menu lateral → **Database Access** → **Add New Database User**:

- **Username:** `admin_escola`
- **Password:** clique em **Autogenerate** e **copie a senha agora**
- **Role:** `Read and write to any database`

> ⚠️ Se a senha vier com `@`, `#`, `/` ou `:`, gere outra.
> Esses caracteres quebram a string de conexão.

### Passo 3 — Liberar o seu IP

Menu lateral → **Network Access** → **Add IP Address**:

- Em sala de aula, com Wi-Fi que muda: **Allow Access from Anywhere** (`0.0.0.0/0`)

> ⚠️ `0.0.0.0/0` é ótimo para **estudar**.
> Em projeto de verdade, libere só o IP do seu servidor.

### Passo 4 — Pegar a string de conexão

**Database** → botão **Connect** → **Drivers** → copie a string:

```
mongodb+srv://admin_escola:<password>@cluster-escola.abc123.mongodb.net/?retryWrites=true&w=majority
```

Agora faça **duas edições nela**:

1. Troque `<password>` pela senha real (apague também os sinais `<` e `>`)
2. Escreva o nome do banco **antes da `?`**

Resultado final:

```
mongodb+srv://admin_escola:SenhaAqui123@cluster-escola.abc123.mongodb.net/escola?retryWrites=true&w=majority
```

> 🧠 Se você esquecer o `/escola`, o Mongoose salva tudo num banco chamado `test`.
> Funciona, mas some da sua vista. Não esqueça.

---

# 🔐 BLOCO 4 — `.env` e a conexão (10 min)

### Por que `.env`?

A string de conexão tem **usuário e senha**. Se ela for parar no GitHub,
qualquer pessoa entra no seu banco. Por isso ela **nunca** fica no código.

### Passo 1 — Instalar as dependências

```bash
npm install mongoose dotenv
```

### Passo 2 — Criar o `.env`

Na **raiz do projeto** (do lado do `package.json`):

```bash
# .env
MONGO_URI=mongodb+srv://admin_escola:SenhaAqui123@cluster-escola.abc123.mongodb.net/escola?retryWrites=true&w=majority
PORT=3000
```

> ⚠️ Sem aspas e sem espaço antes ou depois do `=`. É `CHAVE=valor`, e ponto.

### Passo 3 — Proteger com `.gitignore`

```bash
# .gitignore
node_modules
.env
```

E crie um **`.env.example`**. Esse **vai** para o Git e serve de modelo
para quem clonar o projeto:

```bash
# .env.example
MONGO_URI=
PORT=3000
```

### Passo 4 — O arquivo de conexão

Crie a pasta `src/config/`:

```js
// src/config/database.js
import mongoose from 'mongoose';

export async function conectarBanco() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🍃 MongoDB conectado!');
  } catch (erro) {
    console.error('❌ Erro ao conectar no MongoDB:', erro.message);
    process.exit(1); // sem banco, a API não serve pra nada
  }
}
```

### Passo 5 — Ligar no `server.js`

```js
// src/server.js
import 'dotenv/config';            // <-- SEMPRE a primeira linha
import express from 'express';
import { conectarBanco } from './config/database.js';
import alunosRoutes from './routes/alunos.routes.js';
import { logger } from './middleware/logger.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

await conectarBanco();             // conecta ANTES de subir o servidor

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger);
app.use(express.json());

app.use('/alunos', alunosRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor em http://localhost:${PORT}`);
});
```

> 🧠 O `import 'dotenv/config'` precisa vir **antes** de qualquer arquivo que
> leia `process.env`. Se vier depois, `process.env.MONGO_URI` chega `undefined`.

▶️ Rode `npm run dev`. Tem que aparecer:

```
🍃 MongoDB conectado!
Servidor em http://localhost:3000
```

### 🔧 Deu erro? Procure na tabela

| Mensagem no terminal | O que é | Como resolver |
|---|---|---|
| `bad auth : authentication failed` | Usuário ou senha errados | Recrie o usuário em Database Access |
| `Could not connect to any servers` | Seu IP está bloqueado | Libere em Network Access |
| `The uri parameter ... must be of type string` | O `.env` não foi lido | `import 'dotenv/config'` na 1ª linha e `.env` na raiz |
| `querySrv ENOTFOUND` | String copiada errada | Copie de novo do Atlas |

---

# 📐 BLOCO 5 — Schema e Model (10 min)

Agora o `alunos.model.js` **deixa de ser um array** e vira um Model.
Apague o conteúdo antigo e escreva:

```js
// src/models/alunos.model.js
import mongoose from 'mongoose';

const alunoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome do aluno é obrigatório.'],
      trim: true,
      minlength: [3, 'O nome deve ter pelo menos 3 caracteres.'],
    },
    idade: {
      type: Number,
      required: [true, 'A idade do aluno é obrigatória.'],
      min: [0, 'A idade não pode ser negativa.'],
      max: [120, 'Idade inválida.'],
    },
    turma: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'A',
    },
  },
  {
    timestamps: true, // cria createdAt e updatedAt sozinho
  }
);

export const Aluno = mongoose.model('Aluno', alunoSchema);
```

### Lendo o Schema em português

| Opção | O que faz |
|---|---|
| `type` | O tipo do campo (`String`, `Number`, `Boolean`, `Date`) |
| `required` | Não salva sem esse campo |
| `minlength` / `min` | Tamanho ou valor mínimo |
| `trim` | Tira os espaços das pontas |
| `uppercase` | Salva em maiúsculo (`b` vira `B`) |
| `default` | Valor usado quando não vem nada |
| `timestamps` | Adiciona `createdAt` e `updatedAt` automaticamente |

> 🧠 `mongoose.model('Aluno', ...)` cria a collection **`alunos`**:
> o Mongoose deixa minúsculo e coloca no plural sozinho.

### E o `validarAluno.js`, morreu?

**Não.** Os dois se completam:

- O **middleware** barra a besteira **antes** de ir no banco — é mais rápido e a mensagem é nossa
- O **Schema** é a última linha de defesa — vale até se alguém escrever no banco por fora da API

Pode manter os dois. É cinto **e** airbag.

---

# ⚡ BLOCO 6 — O CRUD com async/await (25 min)

### Por que agora precisa de `async`?

Buscar no array é **instantâneo** (está na RAM, ali do lado).
Buscar no Atlas é uma **viagem pela internet** — demora milissegundos.

Toda função do Mongoose devolve uma **Promise**. Então o combinado é:

1. `async` na frente da função
2. `await` na frente da chamada do banco
3. `try / catch` em volta, com `next(erro)` dentro do catch

Esse trio se repete nas 5 funções. Decore o padrão:

```js
export async function algumaCoisa(req, res, next) {
  try {
    const resultado = await Aluno.algumMetodo();
    res.json(resultado);
  } catch (erro) {
    next(erro);           // manda pro errorHandler
  }
}
```

### O controller completo

```js
// src/controllers/alunos.controllers.js
import { Aluno } from '../models/alunos.model.js';

// GET /alunos  e  GET /alunos?nome=Ana&turma=A
export async function listarAlunos(req, res, next) {
  try {
    const { nome, turma } = req.query;

    const filtro = {};
    if (nome)  filtro.nome  = nome;
    if (turma) filtro.turma = turma.toUpperCase();

    const alunos = await Aluno.find(filtro).sort({ nome: 1 });
    res.json(alunos);
  } catch (erro) {
    next(erro);
  }
}

// GET /alunos/:id
export async function buscarAluno(req, res, next) {
  try {
    const aluno = await Aluno.findById(req.params.id);

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

// POST /alunos
export async function criarAluno(req, res, next) {
  try {
    const { nome, idade, turma } = req.body;

    const novoAluno = await Aluno.create({ nome, idade, turma });

    res.status(201).json(novoAluno);
  } catch (erro) {
    next(erro);
  }
}

// PUT /alunos/:id
export async function atualizarAluno(req, res, next) {
  try {
    const aluno = await Aluno.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

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

// DELETE /alunos/:id
export async function deletarAluno(req, res, next) {
  try {
    const aluno = await Aluno.findByIdAndDelete(req.params.id);

    if (!aluno) {
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

> 👀 As rotas em `alunos.routes.js` **não mudam nada**.
> Esse é o prêmio por ter separado as camadas na Aula 2.

### ⚠️ As duas opções mais importantes do dia

```js
{ new: true, runValidators: true }
```

- **`new: true`** → devolve o documento **depois** da mudança.
  Sem isso, o Mongoose devolve a versão **antiga** e o aluno jura que o PUT não funcionou.
- **`runValidators: true`** → roda as regras do Schema também no update.
  Sem isso, dá para mandar `idade: -5` num PUT e o banco aceita numa boa.

### 🔁 Tabela de tradução: array → Mongoose

| Antes (array) | Agora (Mongoose) |
|---|---|
| `alunos` | `await Aluno.find()` |
| `alunos.filter(a => a.nome === nome)` | `await Aluno.find({ nome })` |
| `alunos.find(a => a.id === id)` | `await Aluno.findById(id)` |
| `alunos.push(novo)` | `await Aluno.create(novo)` |
| editar o objeto na mão | `await Aluno.findByIdAndUpdate(id, dados, { new: true })` |
| `alunos.filter(a => a.id !== id)` | `await Aluno.findByIdAndDelete(id)` |
| `id: alunos.length + 1` | o Mongo gera o `_id` sozinho |

### 🧪 Testando (Insomnia / Postman / Thunder Client)

```http
POST http://localhost:3000/alunos
Content-Type: application/json

{ "nome": "Carla", "idade": 14, "turma": "b" }
```

Resposta:

```json
{
  "nome": "Carla",
  "idade": 14,
  "turma": "B",
  "_id": "65f0c1a2b3c4d5e6f7a8b9c0",
  "createdAt": "2026-09-15T13:02:11.482Z",
  "updatedAt": "2026-09-15T13:02:11.482Z",
  "__v": 0
}
```

Repare: o `turma` foi salvo como `"B"` maiúsculo (foi o `uppercase: true`),
e vieram de brinde o `_id`, o `createdAt` e o `updatedAt`.

**Agora o teste que importa:**

1. `Ctrl + C` no servidor
2. `npm run dev` de novo
3. `GET /alunos`

**A Carla continua lá.** 🎉 É exatamente isso que um banco de dados faz.

---

# 🚑 BLOCO 7 — Os erros novos do banco (10 min)

Com o Mongo aparecem dois erros que a gente nunca tinha visto.

### 1. `CastError` — id com formato inválido

```http
GET /alunos/123
```

`123` não tem cara de ObjectId. O `findById` **estoura**, cai no `catch`
e, sem tratamento, vira um **500** — quando na verdade a culpa é de quem
mandou a requisição (**400**).

### 2. `ValidationError` — o Schema recusou

```http
POST /alunos
{ "nome": "Jo", "idade": 200 }
```

O Schema barra e devolve um erro com **todas** as mensagens dentro
de `erro.errors`.

### O errorHandler atualizado

```js
// src/middleware/errorHandler.js
export function errorHandler(erro, req, res, next) {
  console.error('❌ ERRO:', erro.message);

  // id fora do formato de ObjectId
  if (erro.name === 'CastError') {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  // o Schema do Mongoose recusou os dados
  if (erro.name === 'ValidationError') {
    const mensagens = Object.values(erro.errors).map((e) => e.message);
    return res.status(400).json({ error: mensagens });
  }

  res.status(erro.status || 500).json({
    error: erro.message || 'Erro interno do servidor.',
  });
}
```

### Tabela de status code da aula

| Situação | Status | Resposta |
|---|---|---|
| Listou tudo | 200 | array de alunos |
| Criou | 201 | o aluno criado |
| Deletou | 204 | corpo vazio |
| ID mal formado | 400 | `ID inválido.` |
| Schema recusou os dados | 400 | lista de mensagens |
| ID válido, mas aluno não existe | 404 | `Aluno não encontrado` |
| Banco fora do ar | 500 | `Erro interno do servidor.` |

> 🧠 **400 vs 404:** `/alunos/123` é **400** (o id nem tem formato de id).
> `/alunos/65f0c1a2b3c4d5e6f7a8b9ff` é **404** (o id é válido, o aluno é que não existe).

---

# 🏁 Projeto final da aula

1. Cluster no Atlas com o banco chamado **`escola`**
2. CRUD completo de `/alunos` gravando no Mongo
3. `.env` no `.gitignore` e `.env.example` versionado
4. Filtros funcionando: `GET /alunos?turma=A` e `GET /alunos?nome=Ana`
5. `errorHandler` tratando `CastError` e `ValidationError`
6. Teste de fogo: derrube o servidor, suba de novo — os dados continuam lá

## ⭐ Desafios bônus

1. **Novo recurso:** crie `Curso` (`nome`, `cargaHoraria`) com CRUD completo
2. **Paginação:** `GET /alunos?pagina=2&limite=10` usando `.skip()` e `.limit()`
3. **Busca parcial:** `GET /alunos?nome=an` achar "Ana" e "Daniel"
   → dica: `{ nome: { $regex: nome, $options: 'i' } }`
4. **Campo único:** adicione `matricula` com `unique: true` e trate o erro de
   duplicado (`erro.code === 11000`) devolvendo **409**
5. **Soft delete:** em vez de apagar, marque `ativo: false`

## ✅ Checklist da Aula 4

- [ ] Sei explicar por que o array perdia os dados ao reiniciar
- [ ] Sei a diferença entre database, collection e document
- [ ] Criei o cluster no Atlas e liberei meu IP
- [ ] Sei por que a string de conexão fica no `.env`
- [ ] Sei que o `.env` nunca vai para o GitHub
- [ ] Sei o que é um Schema e para que serve o `required`
- [ ] Sei por que todo controller virou `async`
- [ ] Sei por que `findByIdAndUpdate` precisa de `{ new: true }`
- [ ] Sei a diferença entre `CastError` (400) e não encontrado (404)

---

## 📖 Glossário da Aula 4

| Palavra | Significado simples |
|---|---|
| **MongoDB** | Banco de dados que guarda objetos JSON |
| **Atlas** | O MongoDB rodando na nuvem, com plano grátis |
| **Mongoose** | Biblioteca do Node para conversar com o Mongo |
| **Collection** | O "array" que mora dentro do banco (ex.: `alunos`) |
| **Document** | Um item da collection (um aluno) |
| **Schema** | O contrato: quais campos existem e quais são as regras |
| **Model** | O objeto com os métodos prontos (`find`, `create`...) |
| **ObjectId** | O id de 24 caracteres que o Mongo gera sozinho |
| **`.env`** | Arquivo de segredos, que fica fora do Git |
| **Promise** | Promessa de um valor que chega depois |
| **`await`** | "Espere terminar antes de seguir" |
| **`CastError`** | Erro de id/tipo fora do formato esperado |
| **`ValidationError`** | Erro de regra do Schema |
| **`timestamps`** | `createdAt` e `updatedAt` automáticos |
