const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    chat:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'Chats'
    }
    ,content:{
        type:String,
        required:true,
        trim:false
    },
    sender:{
        type:String
    },
    recipient:{
        type:String
    }
},{
    timestamps:true
})

const Message = mongoose.model('Message',messageSchema)

module.exports = Message
