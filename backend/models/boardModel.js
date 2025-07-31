import mongoose from "mongoose";

const boardSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,'Board name is required'],
        trim:true,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    lists:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Lists',
    }],
},{
    timestamps:true,
});

const Board=mongoose.model('Board',boardSchema);

export default Board;