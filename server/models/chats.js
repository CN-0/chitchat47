const mongoose = require("mongoose");

const chatsSchema = new mongoose.Schema({
    messages:[{
        type:mongoose.SchemaTypes.ObjectId,
        required:true,
        ref:'Message'
    }],
    partcipients:[],
    sockets:[]
},{
    timestamps:true
})

const Chats = mongoose.model('Chats',chatsSchema)

module.exports = Chats