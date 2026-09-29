// controllers/alunos.controllers.js
import { Aluno } from "../models/alunos.model.js";

// GET /alunos
export async function listarAlunos(req, res, next) {
  try {
    const { nome} = req.query;

    const filtro = {};
    if (nome)  filtro.nome  = nome;
   

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
      const erro = new Error("Aluno não encontrado");
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
    const { nome, idade, turma } = req.body

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
      const erro = new Error('Aluno não encontrado')
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
      const erro = new Error("Aluno não encontrado");
      erro.status = 404;
      return next(erro);
    }
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
}
