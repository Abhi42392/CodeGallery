import { createClient } from "redis";

let redisClient;

if(!global.redisClient){
    redisClient=createClient()
    redisClient.on('error',(err)=>{console.log("Redis connection failed",err)})
    await redisClient.connect().then(()=>{console.log("Redis connected successfully")})
    global.redisClient=redisClient;
}else{
    redisClient=global.redisClient
}

export default redisClient