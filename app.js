const express = require('express')
require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const File  = require('./models/File')
const ShortURL = require('./models/shortURL')
const multer = require('multer')
const cors = require('cors');
const shortid = require('shortid')

const app = express()
app.use(express.urlencoded({extended : true}))    
const upload = multer({dest : "uploads"})
mongoose.connect(process.env.DATABASE_URL)
app.use(cors());
app.use(express.json())

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
        const file = await File.findById(req.params.id)
        console.log(req.body.password)
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
    
        file.downloadCount++;
        await file.save()
        // const data = {passwordNeeded : file.password!=null , path:file.path , originalName : file.originalName}
        
        // res.json({path : file.path , originalName:  file.originalName})
        res.download(file.path , file.originalName)
    
}

app.get('/file/:id' , async (req,res) => {
    const file = await File.findById(req.params.id)
   
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
    const urldata = await ShortURL.findOne({ short : shorturl })

    if(urldata == null)
    {
        return res.status(404).send("url does not exist !")
    }

    urldata.clicks++;
    urldata.save()

    res.redirect(urldata.full)
})


app.listen(process.env.PORT , () => console.log("Server is up ..."))