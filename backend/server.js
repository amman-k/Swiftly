import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import connectDB from './config/db.js';
import configurePassport from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import listRoutes from './routes/listRoutes.js';
import cardRoutes from './routes/cardRoutes.js';

dotenv.config();

connectDB();

configurePassport();


const app = express();
const PORT = process.env.PORT || 5001;


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());


if (!process.env.SESSION_SECRET) {
    console.error("FATAL ERROR: SESSION_SECRET is not defined in the .env file.");
    process.exit(1);
}
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions' 
    }),
    cookie: {
      secure: 'auto',
      httpOnly: true,
      sameSite: 'lax', 
      maxAge: 1000 * 60 * 60 * 24 
    }
  })
);


app.use(passport.initialize());
app.use(passport.session());


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`A user connected with socket id: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`User with socket id ${socket.id} disconnected.`);
    });
});

app.use('/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards',cardRoutes);

app.get('/', (req, res) => {
    res.send('Swiftly API is running...');
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
