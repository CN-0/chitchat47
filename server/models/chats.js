const mongoose = require("mongoose");

const chatsSchema = new mongoose.Schema({
    messages:[{
        type:mongoose.SchemaTypes.ObjectId,
        required:true,
        ref:'Message'
    }],
    partcipients:[]
},{
    timestamps:true
})

const Chats = mongoose.model('Chats',chatsSchema)

module.exports = Chats