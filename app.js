const express = require('express')
const app = express()

require('dotenv').config()
const cors = require('cors');

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)

app.use(express.urlencoded({extended : true}))    
app.use(cors());
app.use(express.json())

const uploadRoutes = require('./routes/upload')
const downloadRoutes = require('./routes/download')
const fileRoutes = require('./routes/file')
const shortUrlRoutes = require('./routes/shortUrl')

app.use('/upload' , uploadRoutes);
app.use('/download', downloadRoutes);
app.use('/file' , fileRoutes)
app.use('/su' , shortUrlRoutes)


app.listen(process.env.PORT , () => console.log("Server is up ..."))