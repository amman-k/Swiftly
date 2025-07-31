import mongoose from "mongoose";

const cardSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,'Title is required'],
        trim:true,
    },
    description:{
        type:String,
        trim:true,
        default:'',
    },
    list:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'List',
        required:true,
    },
    // More features will be implemented later, such as:
  // members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // labels: [String],
  // dueDate: Date,
},{
    timestamps:true,
});

const Card=mongoose.model('Card',cardSchema);

export default Card;