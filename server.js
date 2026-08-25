// server.js
import express from 'express';
import alunosRoutes from './routes/alunos.routes.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// tudo que começar com /alunos vai para alunosRoutes
app.use('/alunos', alunosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor em http://localhost:${PORT}`);
});