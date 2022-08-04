const Redis = require("redis");

const redisClient = Redis.createClient({
    host: process.env.REDIS_HOSTNAME,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
})
redisClient.on('connect' , () => console.log("connected to redis !"))
redisClient.on('error' , (err) => console.log(err))
const DEFAULT_EXPIRY = 3600;

function getOrSetCache(key , cb){
    
    return new Promise((resolve , reject) => {
        redisClient.get(key , async (error,data) => {
            if(error) return reject(error)
            
            if(data != null)
            {
                return resolve(JSON.parse(data));
            }

            const newData = await cb()
            redisClient.setex(key , DEFAULT_EXPIRY , JSON.stringify(newData))
            resolve(newData)
        })
    })
}

module.exports = {getOrSetCache}