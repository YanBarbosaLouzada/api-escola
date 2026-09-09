export function notFound(req, res, next) {
  const erro = new Error('Rota não encontrada');
  erro.status = 404;
  next(erro);
}