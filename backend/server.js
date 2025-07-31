import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import {Server} from 'socket.io';
import connectDB from './config/db';

dotenv.config();

connectDB();

const app=express();
const PORT=process.env.PORT || 5000;

app.use(cors({
    origin:'http://localhost:5173',
    credentials:true,
}));

const server = http.createServer(app);
const io=new Server(server,{
     cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    }
});

io.on('connection',(socket)=>{
    console.log(`A user connected with socket id: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`User with socket id ${socket.id} disconnected.`);
    });
});

app.get('/',(req,res)=>{
    res.send("Api is running Successfully");
});

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})