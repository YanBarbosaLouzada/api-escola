import mongoose from "mongoose";

export async function conectarBanco(){
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB conectado");
    } catch (error) {
        console.log("Erro ao conectar com o MongoDB: ", error);
        process.exit(1);
    }
}