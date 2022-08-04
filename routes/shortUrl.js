const express = require('express')
const router = express.Router()

const {handleShortUrlGenerator , handleShortUrlResponse} = require('../controllers/shortUrl')

router.post('/' , handleShortUrlGenerator)

router.get('/:shorturl' , handleShortUrlResponse)

module.exports = router