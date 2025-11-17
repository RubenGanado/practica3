import express from 'express';
import authRoutes from './routes/auth';
import productsRoutes from './routes/products';
import cartsRoutes from './routes/carts';
import { connectMongoDB } from "./mongo";

import dotenv from "dotenv";

dotenv.config();
connectMongoDB();

const app = express();
app.use(express.json());

// Montar rutas
app.use('/api', authRoutes);
app.use('/api', productsRoutes);
app.use('/api', cartsRoutes);

app.listen(3000, () => console.log("El API ha comenzado: "));

