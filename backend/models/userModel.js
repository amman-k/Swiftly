import mongoose from "mongoose";

/**
 * Mongoose schema for the User collection.
 * This schema is designed for users authenticating via OAuth (e.g., Google).
 * It stores the provider-specific ID instead of a local password.
 */

const userSchema=new mongoose.Schema({
    googleId:{
        type:String,
        required:true,
        unique:true,
    },

    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    avatar: {
    type: String,
  },
    boards:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Board',
    }]
},{
    timestamps:true,
});

const User=mongoose.model('User',userSchema);

export default User;