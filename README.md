# 🎓 API Escola

API REST didática de cadastro de alunos, feita com **Node.js + Express 5** e **ES Modules**.
O projeto é o código-base de um curso de **3 aulas** sobre construção de APIs, com a apostila
completa incluída na pasta [`apostila/`](apostila/).

O foco é ensinar, na prática, a evolução de um servidor simples até uma API organizada em
camadas (**routes → controllers → models**), no mesmo formato usado no mercado.

---

## 📚 Conteúdo do curso

| Aula | Arquivo | Tema |
| :--- | :--- | :--- |
| Extra | [aula_node_servidor_publico.md](apostila/aula_node_servidor_publico.md) | Servidor HTTP puro, pasta `public`, ES Modules e Nodemon |
| 01 | [aula-01-rotas-e-express.md](apostila/aula-01-rotas-e-express.md) | Rotas, verbos HTTP, `params` / `query` / `body`, status codes |
| 02 | [aula-02-router-e-controllers.md](apostila/aula-02-router-e-controllers.md) | `express.Router()`, controllers e separação em camadas |
| 03 | [aula-03-middlewares-e-erros.md](apostila/aula-03-middlewares-e-erros.md) | Middlewares, `next()`, tratamento de erros, services e `async/await` |

Cada aula tem duração de 1h30 e é **independente**: o ponto de partida do código vem pronto no
início do material, então dá para entrar em qualquer aula sem ter feito a anterior.

---

## 🚀 Como rodar

Pré-requisitos: **Node.js 18+** instalado.

```bash
# 1. Clone o repositório
git clone https://github.com/<seu-usuario>/api-escola.git
cd api-escola

# 2. Instale as dependências
npm install

# 3. Rode em modo desenvolvimento (reinicia sozinho ao salvar)
npm run dev

# ou em modo normal
npm start
```

O servidor sobe em **http://localhost:3000**.

---

## 🛣️ Rotas disponíveis

Base: `/alunos`

| Método | Rota | Descrição | Respostas |
| :--- | :--- | :--- | :--- |
| `GET` | `/alunos` | Lista todos os alunos | `200` |
| `GET` | `/alunos?turma=A` | Filtra alunos por turma | `200` |
| `GET` | `/alunos/:id` | Busca um aluno pelo id | `200`, `404` |
| `POST` | `/alunos` | Cria um aluno (`nome` obrigatório) | `201`, `400` |
| `PUT` | `/alunos/:id` | Atualiza um aluno | `200`, `404` |
| `DELETE` | `/alunos/:id` | Remove um aluno | `204`, `404` |

### Exemplos

```bash
# Listar todos
curl http://localhost:3000/alunos

# Filtrar por turma
curl "http://localhost:3000/alunos?turma=A"

# Buscar por id
curl http://localhost:3000/alunos/1

# Criar
curl -X POST http://localhost:3000/alunos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Carla","idade":12,"turma":"A"}'

# Atualizar
curl -X PUT http://localhost:3000/alunos/1 \
  -H "Content-Type: application/json" \
  -d '{"turma":"B"}'

# Deletar
curl -X DELETE http://localhost:3000/alunos/1
```

Para testar `POST`, `PUT` e `DELETE` também dá para usar **Insomnia**, **Postman** ou a extensão
**Thunder Client** do VS Code.

---

## 🗂️ Estrutura do projeto

```
api-escola/
├── apostila/                      # Material didático das aulas (Markdown)
├── controllers/
│   └── alunos.controllers.js      # Regra de cada rota (o que responder)
├── models/
│   └── alunos.model.js            # Dados dos alunos (em memória)
├── routes/
│   └── alunos.routes.js           # Mapa de rotas → controllers
├── server.js                      # Ponto de entrada da aplicação
└── package.json
```

**Como a requisição caminha:**

```
Cliente → server.js → routes/ → controllers/ → models/ → resposta JSON
```

---

## 💾 Sobre os dados

Os alunos ficam guardados **em memória** (um array em `models/alunos.model.js`), sem banco de
dados. Isso é proposital: mantém o foco nas rotas e nas camadas do Express. Ao reiniciar o
servidor, a lista volta ao estado inicial (Ana e Bruno).

---

## 🧰 Tecnologias

- [Node.js](https://nodejs.org/) com ES Modules (`"type": "module"`)
- [Express 5](https://expressjs.com/)
- [Nodemon](https://nodemon.io/) (desenvolvimento)

---

## 📄 Licença

ISC
