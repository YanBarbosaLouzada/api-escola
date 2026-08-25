// routes/alunos.routes.js
import { Router } from 'express';
import {
  listarAlunos,
  buscarAluno,
  criarAluno,
  atualizarAluno,
  deletarAluno,
} from '../controllers/alunos.controllers.js';

const router = Router();

router.get('/',       listarAlunos);
router.get('/:id',    buscarAluno);
router.post('/',      criarAluno);
router.put('/:id',    atualizarAluno);
router.delete('/:id', deletarAluno);

export default router;
