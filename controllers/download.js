const { getOrSetCache } = require("../utils/redisCache")
const File = require('../models/File') 
const bcrypt = require('bcrypt')

const handleDownload = async (req, res) => {
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

module.exports = {handleDownload}