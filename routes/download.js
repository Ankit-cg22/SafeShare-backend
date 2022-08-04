const express = require('express')

const router = express.Router()

const {handleDownload} = require('../controllers/download')

router.get('/:id' , handleDownload)

router.post('/:id' ,handleDownload)

module.exports = router