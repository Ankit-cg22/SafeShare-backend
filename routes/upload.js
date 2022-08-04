const express = require('express')

const router = express.Router()
const {handleUploads} = require('../controllers/uploads')

const multer = require('multer')
const upload = multer({dest : "uploads"})

router.post('/' , upload.single("file") , handleUploads);

module.exports = router