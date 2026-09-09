// routes/alunos.routes.js
import { Router } from 'express';
import {
  listarAlunos,
  buscarAluno,
  criarAluno,
  atualizarAluno,
  deletarAluno,
} from '../controllers/alunos.controllers.js';
import { validarAluno } from '../middleware/validarAluno.js';

const router = Router();

router.get('/',       listarAlunos);
router.get('/:id',    buscarAluno);
router.post('/',      validarAluno, criarAluno);
router.put('/:id',    validarAluno, atualizarAluno);
router.delete('/:id', deletarAluno);

export default router;
