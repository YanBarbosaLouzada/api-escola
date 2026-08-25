// models/alunos.model.js
export let alunos = [
  { id: 1, nome: 'Ana',   idade: 12, turma: 'A' },
  { id: 2, nome: 'Bruno', idade: 13, turma: 'B' },
];

export function setAlunos(novaLista) {
  alunos = novaLista;
}
