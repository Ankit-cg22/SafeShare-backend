const {getOrSetCache} = require('../utils/redisCache')
const File = require('../models/File')

const handleFileRequest = async (req,res) => {

    const file = await getOrSetCache(`file?id=${req.params.id}` , async()=>{

        const data =  await File.findById(req.params.id)
        return data
    })
   
    const data = {passwordNeeded : file.password!=null , originalName : file.originalName}
    
    res.status(200).json(data)
}

module.exports = {handleFileRequest}