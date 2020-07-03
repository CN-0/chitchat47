const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const Chats = require('../models/chats')
const Message = require('../models/message')
const mongoose = require('mongoose')

const router  =new express.Router()

router.get('/friends',auth,async (req,res)=>{
    res.status(201).send(req.user.friends)
})

router.post('/register',async (req,res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        const token =await  user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).json({msg:e.message})
    }
    
})

router.post('/login',async (req,res)=>{
    try{ 
        const user = await User.findUser(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({user,token})
    }catch(e){
        res.status(409).json({msg:e.message})
    }
    
})

router.post('/logout',auth, async (req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.status(200).json({msg:"you are successfully logged-out"})
    } catch (e) {
        res.status(500).json({msg:e.message})
    }
})

router.get('/friends',auth,async(req,res)=>{
    try{
    res.status(200).send(req.user.friends)
    }catch(e){
        res.status(500).json({msg:e.message})
    }
})

router.post('/friends',auth, async (req,res)=>{
    let id = new mongoose.Types.ObjectId()
    
    try {
        if(req.body.friend===req.user.email){
            throw new Error("you cant add yourself")
        }
        let friendsArray = []
        req.user.friends.forEach(friend=>{
            friendsArray.push(friend.friend)
        })
        if(friendsArray.includes(req.body.friend)){
            throw new Error("user already exists!")
        }
        const friend  = await User.findFriend(req.body.friend)
        await Chats.find({partcipients:[req.user.email,friend]}, async (err, chat) => {
            if(err){
                throw new Error("an Error occured while adding friends")
            }
            if(chat.length>0){
                id = chat[0]._id
            }else{
                const chats = new Chats({
                    _id:id,
                    partcipients:[friend,req.user.email]
                })
                try{
                    await chats.save()
                }catch(e){
                    throw new Error("an Error occured while saving friends")
                }}
        })        
                req.user.friends = await req.user.friends.concat({
                    friend:friend,
                    chat:id
                })
                await req.user.save()
        res.status(200).send(req.user.friends)
    } catch (e) {
        res.status(500).json({msg:e.message})
    }
})
router.get('/chat/:id',auth, async(req,res)=>{
    try {
        chatID = req.params.id
        let messages = await Message.find({chat:chatID})
        res.status(200).send({
            chat:chatID,
            messages:messages
        })
    } catch (e) {
        res.status(500).json({msg:e.message})
    }
})

router.post('/chat',auth, async(req,res)=>{
    try {
        const idd = new mongoose.Types.ObjectId()
        const message = new Message({
            _id:idd,
            content:req.body.content,
            chat:req.body.chat,
            sender:req.body.sender,
            recipient:req.body.recipient
        })
        try{
            await message.save()
            let messages = await Message.find({chat:req.body.chat})
            res.status(201).send({
                chat:req.body.chat,
                messages:messages
            })
        }catch(e){
            throw new Error("an Error occured while creating message")
        }  
    } catch (e) {
        res.status(500).json({msg:e.message})
    }
})

router.patch('/update',auth, async (req,res)=>{
    try {
        req.user["password"] = req.body["password"]
        await req.user.save()
        res.status(200).send("password changed successfully!")
    } catch (e) {
        res.status(400).json({msg:e.message})
    }
})

router.delete('/delete',auth, async(req,res)=>{
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router

