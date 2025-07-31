import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB= async ()=>{
    try{
        const MONGO_URI=process.env.MONGO_URI;
        if(!MONGO_URI){
            console.error("No MONGO DB connection string found");
            process.exit(1);
        }
        await mongoose.connect(MONGO_URI);
        console.log("Successfully connected to MongoDB");

    }catch(err){
        console.error("Database connection error",err);
        process.exit(1);
    }
}

export default connectDB;