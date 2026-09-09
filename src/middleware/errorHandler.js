export function errorHandler(erro, req, res, next) {
    console.error('X ERRO:', erro.message, erro.stack);
    res.status(erro.status || 500).json({ error: erro.message || 'Erro interno do servidor.' });
}