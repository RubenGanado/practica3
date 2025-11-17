import { Router } from 'express';
import { getDb } from '../mongo';
import dotenv from 'dotenv';
import { Products } from '../types';
import { verifyToken, AuthRequest } from '../middleware/verifyToken';

dotenv.config();
const router = Router();

router.get("/products", async (req, res) => {
    try {
        const db = getDb();
        const productsCollection = db.collection<Products>("products");

        const products = await productsCollection.find().toArray();
        res.json(products);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

router.post('/products', verifyToken, async (req: AuthRequest, res) => { 
    try {
        const db = getDb();   // ✔️ AQUÍ SÍ
        const productsCollection = db.collection<Products>("products");
        const { name, description, price, stock } = req.body;

        if (!name || typeof price !== 'number' || price <= 0 || typeof stock !== 'number' || stock < 0) {
            return res.status(400).json({ message: "Campos inválidos" });
        }
        await productsCollection.insertOne({
            name,
            description: description || '',
            price,
            stock,  
            createdAt: new Date()
        });
        res.status(201).json({ message: 'Producto creado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

export default router;
