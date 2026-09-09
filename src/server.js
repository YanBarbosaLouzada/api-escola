// server.js
import express from 'express';
import alunosRoutes from './routes/alunos.routes.js';
import { logger } from './middleware/logger.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = 3000;


app.use(logger);
app.use(express.json());
app.use(express.static('public'));

//rotas

app.use('/alunos', alunosRoutes);


// middleware de tratamento de erros
app.use(notFound);
app.use(errorHandler);




app.listen(PORT, () => {
  console.log(`Servidor em http://localhost:${PORT}`);
})