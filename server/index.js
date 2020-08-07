const express = require('express');
var fs = require('fs');
const cors = require('cors');
const socketIO = require('socket.io');
const mongoose = require('mongoose')
const Message = require('./models/message')
const auth = require('./middleware/auth')
const Chats = require('./models/chats')
const User = require('./models/user')
var multer = require('multer');
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

var storage = multer.diskStorage({ 
  destination: (req, file, cb) => { 
      cb(null, './server/uploads') 
  }, 
  filename: (req, file, cb) => { 
      cb(null, file.originalname) 
  } 
}); 

var upload = multer({ storage: storage }).single("file");

app.post('/avatar',auth,upload,async (req, res) => {
  var newImg = fs.readFileSync(req.file.path);
  var encImg = newImg.toString('base64');
  var newItem = {
      name: req.file.filename,
      img:{
        data: Buffer.from(encImg, 'base64'),
        contentType: req.file.mimetype
      }
  };
  req.user["avatar"] = newItem
  await req.user.save()
  fs.unlink(req.file.path, (err) => {
    if (err) throw err;
  });
  const buffer = Buffer.from(req.user.avatar.img.data);
  const base64String = buffer.toString('base64')
  return res.send({name:req.user.avatar.name,img:{data:base64String,contentType:req.user.avatar.img.contentType}});
});

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
        console.log('inputmsg', e)
    } 
  })
  socket.on('disconnect',async () => {
    Chats.find({sockets:socket.id}, async (err, memes) => {
      console.log('disconnect',err)
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
