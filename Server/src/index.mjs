import express from 'express'
import authRouter from './routes/auth.route.mjs'
import dotenv from 'dotenv'
import { connectDB } from './lib/db.mjs'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import messageRouter from './routes/message.route.mjs'
dotenv.config()
const app = express()
const PORT = process.env.PORT
app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_KEY,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use('/auth', authRouter);
app.use('/message', messageRouter);

app.listen(PORT, () => {
    console.log('Server is running on port: ' + PORT);
    connectDB();
})