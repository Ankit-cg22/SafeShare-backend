const ShortURL = require('../models/shortURL')
const shortid = require('shortid')
const {getOrSetCache} = require('../utils/redisCache')

const handleShortUrlGenerator = async (req, res)=>{
    // console.log(req.body.fullURL)
    new_shortid = shortid.generate()
    const newURL = await ShortURL.create({full : req.body.fullURL , short : new_shortid})
    // console.log(newURL)
    res.json({shortUrl : newURL.short })
}

const handleShortUrlResponse = async (req,res)=>{

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

    res.redirect(urldata.full)
}

module.exports = {handleShortUrlGenerator , handleShortUrlResponse}