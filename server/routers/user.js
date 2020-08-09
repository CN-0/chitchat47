const express = require('express')
const fs =require('fs')
var multer = require('multer');
const User = require('../models/user')
const auth = require('../middleware/auth')

const router  = new express.Router()

let storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, './server/uploads') 
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.originalname) 
    } 
}); 
  
let upload = multer({ storage: storage }).single("file");

router.post('/register',async (req,res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        const token =await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).json({msg:e.message})
    }
    
})

router.post('/login',async (req,res)=>{
    try{
        const user = await User.findUser(req.body.email,req.body.password)
        const userData = await user.populate('friends','avatar email username').execPopulate()
        const token = await user.generateAuthToken()
        res.status(200).send({userData,token})
    }catch(e){
        res.status(409).json({msg:e.message})
    }
    
})

router.post('/logout',auth, async (req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        req.user.newMessages = req.body.newMessages
        await req.user.save()
        res.status(200).json({msg:"you are successfully logged-out"})
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
  
router.put('/avatar',auth,upload,async (req, res) => {
    try {
        var newImg = fs.readFileSync(req.file.path);
        var encImg = newImg.toString('base64');
        var newItem = {
            name: req.file.filename,
            image: Buffer.from(encImg, 'base64'),
            contentType: req.file.mimetype
        };
        req.user["avatar"] = newItem
        await req.user.save()
        fs.unlink(req.file.path, (err) => {
            if (err) throw err;
        });
        const buffer = Buffer.from(req.user.avatar.image);
        const base64StringImage = buffer.toString('base64')
        return res.send({...req.user.avatar,image:base64StringImage});
    } catch (error) {
        res.status(400).json({msg:"an error occured while adding image!"})
    }
});

module.exports = router

