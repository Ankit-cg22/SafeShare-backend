const express = require('express')
require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const File  = require('./models/File')
const ShortURL = require('./models/shortURL')
const multer = require('multer')
const cors = require('cors');
const shortid = require('shortid')
const Redis = require("redis");

const app = express()
app.use(express.urlencoded({extended : true}))    
const upload = multer({dest : "uploads"})
mongoose.connect(process.env.DATABASE_URL)
app.use(cors());
app.use(express.json())

const redisClient = Redis.createClient({
    host: process.env.REDIS_HOSTNAME,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
})
redisClient.on('connect' , () => console.log("connected to redis !"))
redisClient.on('error' , (err) => console.log(err))
const DEFAULT_EXPIRY = 3600;

app.post('/upload' ,  upload.single("file") ,async (req, res) => {
    
    const fileData = {
        path  : req.file.path ,
        originalName: req.file.originalname
    }

    if(req.body.password != null && req.body.password !== "")
    {
        fileData.password = await bcrypt.hash(req.body.password , 10)
    }

    const file = await File.create(fileData)
   
    res.json({fileId : file.id})
})

app.route('/download/:id').get(handleDownload).post(handleDownload)

async function handleDownload(req, res){

        const file = await getOrSetCache(`file?id=${req.params.id}` , async()=>{
            const data =  await File.findById(req.params.id)
            return data
        })

        
        if(file.password != null)
        {
            if(req.body.password == null || req.body.password == "")
            {
                res.json({"message" : "Enter Password"})
                return;
            }
        
            if( !( await bcrypt.compare(req.body.password , file.password )) )
            {
                
                res.json({"message" : "Wrong Password"})
                return ;
            }
        }
    
    
        // res.json({path : file.path , originalName:  file.originalName})
        res.download(file.path , file.originalName)
    
}

app.get('/file/:id' , async (req,res) => {
    // const file = await File.findById(req.params.id)
    const file = await getOrSetCache(`file?id=${req.params.id}` , async()=>{
        const data =  await File.findById(req.params.id)
        return data
    })
   
    const data = {passwordNeeded : file.password!=null , originalName : file.originalName}
    
    res.status(200).json(data)
})


app.post('/short-url' , async (req, res)=>{
    console.log(req.body.fullURL)
    new_shortid = shortid.generate()
    const newURL = await ShortURL.create({full : req.body.fullURL , short : new_shortid})
    console.log(newURL)
    res.json({shortUrl : newURL.short })
})

app.get('/su/:shorturl' , async (req,res)=>{
    const shorturl = req.params.shorturl
    // const urldata = await ShortURL.findOne({ short : shorturl })
    const urldata = await getOrSetCache(`urldata?id=${req.params.shorturl}` , async()=>{
        const data =  await ShortURL.findOne({ short : shorturl })
        return data
    })

    if(urldata == null)
    {
        return res.status(404).send("url does not exist !")
    }

    // urldata.clicks++;
    // urldata.save()

    res.redirect(urldata.full)
})

function getOrSetCache(key , cb){
    return new Promise((resolve , reject) => {
        redisClient.get(key , async (error,data) => {
            if(error) return reject(error)
            if(data != null)
            {
                resolve(JSON.parse(data));
            }

            const newData = await cb()
            redisClient.setex(key , DEFAULT_EXPIRY , JSON.stringify(newData))
            resolve(newData)
        })
    })
}

app.listen(process.env.PORT , () => console.log("Server is up ..."))