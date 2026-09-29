// // models/alunos.model.js
// export let alunos = [
//   { id: 1, nome: 'Ana', idade: 12, turma: 'A', },
//   { id: 2, nome: 'Bruno', idade: 13, turma: 'B', },
// ];

// export function setAlunos(novaLista) {
//   alunos = novaLista;
// }

import mongoose from "mongoose";

const alunoSchema = new mongoose.Schema({

  nome: {
    type: String,
    required: [true, "O nome do aluno é obrigatório"],
    trim: true,
    minlength: [3, "O nome do aluno deve ter no mínimo 3 caracteres"],
    maxlength: [50, "O nome do aluno deve ter no máximo 50 caracteres"]
  },

  idade: {
    type: Number,
    required: [true, "A idade do aluno é obrigatória"],
    min: [6, "A idade do aluno deve ser no mínimo 6 anos"],
    max: [18, "A idade do aluno deve ser no máximo 18 anos"]
  },

  turma: {
    type: String,
    trim: true,
    uppercase: true,
    default: "A",
  }

}, {
  versionKey: false,
  timestamps: true
});

export const  Aluno = mongoose.model("Aluno",alunoSchema);