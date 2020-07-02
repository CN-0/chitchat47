const express = require('express');
const cors = require('cors');
const socketIO = require('socket.io');
const mongoose = require('mongoose')
const Message = require('./models/message')
const Chats = require('./models/chats')
const app = express();
const path = require('path');
const socketioJwt   = require('socketio-jwt')
require('./db/mongoose');
const userRouter = require('./routers/user');

const PORT = process.env.PORT || 5000

const server = express()
  .use(app)
  .listen(PORT, () => console.log(`Listening Socket on ${ PORT }`));

const io = socketIO(server)
io.use(socketioJwt.authorize({
  secret: process.env.JWT_SECRET,
  handshake: true
}));

app.use(express.json())
app.use(cors())
app.use('/users',userRouter)

io.on("connection", socket => {
  socket.on("addSocket",async (chats)=>{
      for (let chat  of chats) {
        let cha = await Chats.findOne({_id:chat})
        let sockets = cha.sockets
        let chaty = await Chats.findOneAndUpdate({_id:chat},{sockets:[...sockets,socket.id]},{new:true})
      }
  })

  socket.on("inputChatMessage", async(data) => {
    const idd = new mongoose.Types.ObjectId()
    const message = new Message({
        _id:idd,
        content:data.content,
        chat:data.chat,
        sender:data.sender,
        recipient:data.recipient
    })
    try{
        await message.save()
        let messages = await Message.find({chat:data.chat})
        let chat = await Chats.findOne({_id:data.chat})
        chat.sockets.forEach(socket => {
          io.to(socket).emit('messagePosted', {
            chat:data.chat,
            messages:messages
          });
        });
    }catch(e){
        console.log(e)
    } 
  })
  socket.on('disconnect',async () => {
    Chats.find({sockets:socket.id}, async (err, memes) => {
      console.log(err)
      for(let meme of memes){
        meme.sockets = await meme.sockets.filter(id=>id !== socket.id)
        await meme.save()
      }
    });
})
})

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))

    app.get('*', (req,res)=>{
        res.sendFile(path.join(__dirname, '../client', 'build', 'index.html'))
    })
}
