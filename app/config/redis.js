// lib/redis.js
import { createClient } from 'redis';

let client;

export async function connectRedis() {
    if(client&&client.isOpen){
        return client;
    }
    client = createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: 'redis-10589.c62.us-east-1-4.ec2.redns.redis-cloud.com',
            port: 10589
        }
    });

    client.on('error', (err) => console.error('Redis Client Error', err));
    try{
        await client.connect();
        console.log('✅ Redis Connected Successfully');
    }catch(err){
        console.log('Redis Connection Failed',err);
    }
    return client;
}

export default connectRedis;