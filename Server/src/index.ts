import express from "express";
import cors from 'cors'
import routes from './routes/routes'
import path from "path";
import dotenv from 'dotenv'
import morgan from 'morgan'
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });


const app = express()
app.use(express.json())

app.use(cors({
    origin: process.env.FRONTEND || '*',
    methods:['GET','POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true 
})) 
app.use(morgan("dev"));
app.use('/uploads', express.static(path.join(__dirname, '..','uploads')));

app.use('/',routes)

app.listen(3000,()=>{
    console.log('Server is running');
}) 