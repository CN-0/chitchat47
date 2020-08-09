const express = require('express');
const path = require('path');
const cors = require('cors');
const socketIO = require('socket.io');
const mongoose = require('mongoose')
const socketioJwt   = require('socketio-jwt')
require('./db/mongoose');
const userRouter = require('./routers/user');
const chatRouter=  require('./routers/chat')
const Message = require('./models/message')
const User = require('./models/user')
const app = express();

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
app.use('/chat',chatRouter)



io.on("connection", socket => {
  socket.on("addSocket",async (email) => {
      await User.findOneAndUpdate({email:email},{socket:socket.id},{new:true})
  })

  socket.on("inputChatMessage", async(data) => {
    const idd = new mongoose.Types.ObjectId()
    const sender = data.sender
    let friendSocket 
    const message = new Message({
        _id:idd,
        content:data.content,
        chat:data.chat,
        sender:data.sender,
        recipient:data.recipient
    })
    try{
        await message.save()
        let friend = await User.findOne({email:data.recipient})
        friendSocket = friend.socket
         if(friend.newMessages){
            if(friend.newMessages[sender]){
              friend.newMessages[sender] = friend.newMessages[sender] + 1
              friend.markModified('newMessages')
            friend.save()
            }else{
              friend.newMessages[sender] = 1
              friend.markModified('newMessages')
              friend.save()
            }
         }else{
           friend.newMessages = {}
           friend.newMessages[sender] = 1
           friend.markModified('newMessages')
           friend.save()
         }
         if(friendSocket){
          io.to(friendSocket).emit('messagePosted',data)
        }
    }catch(e){
        
    } 
  })
  socket.on('disconnect',async () => {
    await User.findOneAndUpdate({socket:socket.id},{socket:null})
})
})


if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))

    app.get('*', (req,res)=>{
        res.sendFile(path.join(__dirname, '../client', 'build', 'index.html'))
    })
}
