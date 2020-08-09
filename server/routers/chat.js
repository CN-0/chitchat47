const express = require('express')
const mongoose = require('mongoose')
const User = require('../models/user')
const auth = require('../middleware/auth')
const Chats = require('../models/chats')
const Message = require('../models/message')

const router  =new express.Router()

router.post('/friends',auth, async (req,res)=>{
    let id = new mongoose.Types.ObjectId()
    try {
        if(req.body.friend===req.user.email){
            throw new Error("you cant add yourself")
        }
        const friendsData = await req.user.populate('friends','email').execPopulate();
        let friendsArray = []
        friendsData.friends.forEach(friend=>{
            friendsArray.push(friend.email)
        })
        if(friendsArray.includes(req.body.friend)){
            throw new Error("user already exists!")
        }
        const friend  = await User.findFriend(req.body.friend)
        await Chats.find({partcipients:[req.user.email,friend.email]}, async (err, chat) => {
            if(err){
                throw new Error("an Error occured while adding friends")
            }
            if(chat.length>0){
                id = chat[0]._id
            }else{
                const chats = new Chats({
                    _id:id,
                    partcipients:[friend.email,req.user.email]
                })
                try{
                    await chats.save()
                }catch(e){
                    throw new Error("an Error occured while saving friends")
                }}
        })   
        req.user.friends = await req.user.friends.concat(friend._id)
        let image
        if(friend.avatar.image){
            const buffer = Buffer.from(friend.avatar.image);
            image = buffer.toString('base64')
        }else{
            image = null
        }
        try {
            await req.user.save()
            const returnData = {email:friend.email,username:friend.username,avatar:{...friend.avatar,image:image}}
            res.status(200).send(returnData)
        } catch (error) {
            throw new Error("an Error occured while saving friends")
        }
    } catch (e) {
        res.status(500).json({msg:e.message})
    }
})
router.get('/chat/:id',auth, async(req,res)=>{
    const friend = req.params.id
    let chatID
    if(req.user.newMessages){
        if(req.user.newMessages[friend]){
            req.user.newMessages[friend] = 0
            req.user.markModified('newMessages')
            req.user.save()
        }
    }
    try {
        await Chats.find({partcipients:[req.user.email,friend]}, async (err, chat) => {
            if(chat.length>0){
               chatID = await chat[0]._id
            }else{
                await Chats.find({partcipients:[friend,req.user.email]}, async (err, secChat) => {
                    if(secChat.length>0){
                       chatID = await secChat[0]._id
                    }else{
                        throw new Error("the requested friend id isn't available!")
                    }
                })
            }
        })
        Message.find({} , function (err, docs) {
            let messages = docs.filter(message=> message.chat == chatID)
            res.status(200).send({
                chat:chatID,
                messages:messages
            })
        })
    } catch (e) {
        res.status(500).json({msg:e.message})
    }
})


module.exports = router