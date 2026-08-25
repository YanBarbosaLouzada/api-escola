// controllers/alunos.controllers.js
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
