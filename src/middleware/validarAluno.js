export function validarAluno(req, res, next){
    const {nome, idade} = req.body;

    if(!nome || nome.trim() === ''){
        return res.status(400).json({error: 'O nome do aluno é obrigatório.'});
    }
    if(nome.length < 3){
        return res.status(400).json({error: 'O nome do aluno deve ter pelo menos 3 caracteres.'});
    }
    if(!idade || isNaN(idade) || idade < 0 || idade > 120){
        return res.status(400).json({error: 'A idade do aluno é obrigatória e deve ser um número.'});
    }

    next();
}