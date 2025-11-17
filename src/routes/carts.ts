import { Router } from 'express';
import { getDb } from '../mongo';
import { ObjectId } from 'mongodb';
import { verifyToken, AuthRequest } from '../middleware/verifyToken';
import { Carts } from '../types';

const router = Router();
router.use(verifyToken);

router.put('/cart/add', async (req: AuthRequest, res) => {
    try {
        const db = getDb();
        const cartsCollection = db.collection<Carts>("carts");
        const productsCollection = db.collection("products");

        const { productId, quantity } = req.body;

        if (!productId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: "Campos inválidos" });
        }

        const userId = (req.user as { userId: string }).userId;

        const product = await productsCollection.findOne({ _id: new ObjectId((String(productId))) });
        if (!product) return res.status(404).json({ message: "Product not found" });
        if (product.stock < quantity) return res.status(400).json({ message: "Insufficient stock" });

        let cart = await cartsCollection.findOne({ userId: new ObjectId((String(userId))) });
        /*if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }
        */
        if (!cart) {
            // Crear carrito nuevo si no existe
            const newCart = {
                userId: new ObjectId(userId),
                items: []
            };
            const result = await cartsCollection.insertOne(newCart);
            cart = { ...newCart, _id: result.insertedId };
        }


        const existingItem = cart.items.find(
            i => i.productId.toString() === productId
        );


        if (existingItem) {
            await cartsCollection.updateOne(
                { userId: new ObjectId(userId), "items.productId": new ObjectId((String(productId)))},
                { $inc: { "items.$.quantity": quantity } }
            );
        } else {
            await cartsCollection.updateOne(
                { userId: new ObjectId(userId) },
                { $push: { items: { productId: new ObjectId((String(productId))), quantity } } }
            );
        }

        return res.status(200).json({ message: "Carrito actualizado" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});

router.get('/cart', async (req: AuthRequest, res) => {
    try {
        const db = getDb();
        const cartsCollection = db.collection<Carts>("carts");

        const userId = (req.user as { userId: string }).userId;

        const cart = await cartsCollection.findOne({ userId: new ObjectId(userId) });
        return res.status(200).json(cart || { items: [] });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});

export default router;
