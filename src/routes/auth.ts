import { Router } from 'express';
import { getDb } from '../mongo';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../types';

dotenv.config();
const router = Router();
const SECRET = process.env.SECRET as string;
const usersCollection = () => getDb().collection<User>('users');

router.post('/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body as { username: string; email: string; password: string; };

        const users = usersCollection();

        const existsEmail = await users.findOne({ email });
        if (existsEmail) return res.status(409).json({ message: 'El email ya existe' });

        const existsUsername = await users.findOne({ username });
        if (existsUsername) return res.status(409).json({ message: 'El username ya existe' });

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) return res.status(400).json({ message: 'El email no tiene un formato válido' });

        const passwordHash = await bcrypt.hash(password, 10);
        const result = await users.insertOne({
            username,
            email,
            passwordHash,
            createdAt: new Date()
        });

        res.status(201).json({ message: "User created" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body as { email: string; password: string; };
        const users = usersCollection();

        const user = await users.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
        const validPass = await bcrypt.compare(password, user.passwordHash);
        if (!validPass) return res.status(401).json({ message: 'Credenciales inválidas' });
        const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: '1h' });
        return res.status(200).json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

export default router;
