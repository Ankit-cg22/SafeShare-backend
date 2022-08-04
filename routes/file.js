const express = require('express')
const router = express.Router()
const {handleFileRequest} = require('../controllers/file')

router.get('/:id' , handleFileRequest) 

module.exports = router 