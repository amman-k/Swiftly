import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import {Server} from 'socket.io';
import connectDB from './config/db';
import session from 'express-session';
import passport  from 'passport';
import configurePassport from './config/passport';
import authRoutes from './routes/authRoutes';
import boardRoutes from './routes/boardRoutes';

dotenv.config();

connectDB();

configurePassport();

const app=express();
const PORT=process.env.PORT || 5000;

app.use(cors({
    origin:'http://localhost:5173',
    credentials:true,
}));
app.use(express.json());

if(!process.env.SESSION_TICKET){
    console.error("FATAL ERROR: SESSION_SECRET is not defined in the .env file.");
    process.exit(1);
}

app.use(
    session({
        secret:process.env.SESSION_TICKET,
        resave:false,
        saveUninitialized:false,
    })
)

app.use(passport.initialize());
app.use(passport.session());


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

app.use('/auth',authRoutes);
app.use('/api/boards',boardRoutes);

app.get('/',(req,res)=>{
    res.send("Api is running Successfully");
});

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})