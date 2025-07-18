import mongoose from "mongoose";
import { Schema } from "mongoose";


const userSchema=new Schema({
    firstName:{
        type:String,
        required:true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        immutable:true
    },
    age:{
        type:Number,
        min:10,
        max:80
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:"problem"
        }],
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    likedProblems:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:"problem",
            unique:true
        }],
    },

    followers:{
       type:[{
            type:Schema.Types.ObjectId,
            ref:"user",
            unique:true
        }],
    },
    following:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:"user",
            unique:true
        }],
    },
    streak:{
        lastActive:{
            type:Date,
        },
        current:{
            type:Number,
            default:0
        },
        max:{
            type:Number,
            default:0
        }
    },
    codingScore:{
        type:Number,
        default:0
    },
    battlesPlayed: { 
        type: Number, 
        default: 0 
    },
    battlesWon: { 
        type: Number, 
        default: 0 
    },
    coins: { 
        type: Number, 
        default: 500 
    },
    profilePic:{
        
            secureURL: {
                type: String,
                default:null
            },
            cloudinaryPublicId: {
                type: String,
                unique: true
            }
        
    }

},{
    timestamps:true
})

const User=mongoose.model("user",userSchema)

export default User;