export function logger(req, res, next) {
    const hora = new Date().toLocaleTimeString();
    console.log(`[${hora}] - ${req.method} ${req.url}`);
    next();
}

// middleware

// E como um aeroporto 
// 1 - Check-in 
// 2 - Raio-X
// 3 - Passaporte
// 4 - Portão de embarque

// next()   Deixa você ir para a proxima etapa
// res.status() barra voce de ir para a proxima etapa e explica o que aconteceu
