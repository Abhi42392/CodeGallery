import { NextResponse } from "next/server";
import connectRedis from "@/app/config/redis";
import ProjectModel from "@/app/models/ProjectModel";
import connectDB from "@/app/config/mongodb";


export async function GET() {
  // Prevent concurrent sync

  try {
      updateLikes(),
      updateViews()
    
    return NextResponse.json({
      message: "✅ Data successfully synced from Redis to MongoDB",
    }, { status: 200 });
  } catch (err) {
    console.error("❌ Sync error:", err);
    return NextResponse.json({ 
      error: "Sync failed",
      details: err.message 
    }, { status: 500 });
  }
}

const updateLikes = async () => {
   try {
    await connectDB();

    const redisClient=await connectRedis();
    const keys = await redisClient.keys("post:*");
    for (const key of keys) {
      const postId = key.split(":")[1];
      const likes = await redisClient.hGet(key, "likes");
      const likesCount = parseInt(likes || "0");
      // ✅ Sync both like and unlike counts
      if (likesCount !== 0) {
        await ProjectModel.findByIdAndUpdate(postId, {
          $inc: { likes: likesCount },
        });
      }
       // ✅ Reset Redis value
      await redisClient.hSet(key, "likes", 0);
      console.log(`✅ Synced ${postId} with likes: ${likesCount}`);
    }
     return true
  }catch(err){
    console.log(err)
    throw err;
  }
}

const updateViews=async()=>{
  try{
    await connectDB()
    const redisClient=await connectRedis();
    const posts=await redisClient.sMembers("view-keys")
    for(let post of posts){
      const views=await redisClient.sCard(post);
      const postId=post.split(":")[1]
      if(views>0){
        await ProjectModel.findByIdAndUpdate(postId,{
          views:views
        })
      }
      console.log(`Synced ${postId} with views ${views}`);
      await redisClient.sRem('view-keys',post)
    }
    return true;
  }catch(err){
    console.log(err)
    throw err
  }
}