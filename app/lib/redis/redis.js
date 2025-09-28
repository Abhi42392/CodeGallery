import connectRedis from "@/app/config/redis";
import { auth } from "../../auth";

export const handleLike = async (postId) => {
  try {
    const session = await auth();
    if (!session || !session.user) {
      throw new Error("Unauthorized action");
    }
    const redisClient=await connectRedis();
    const key = `post:${postId}`;
    const likesField = "likes";
    const userLikeKey = `liked:${postId}:${session.user.id}`;

    // 🔒 Ensure the 'likes' field is a number
    const existingLikes = await redisClient.hGet(key, likesField);
    if (!existingLikes || isNaN(parseInt(existingLikes))) {
      await redisClient.hSet(key, likesField, "0");
    }

    const userHasLiked = await isUserLiked(postId);

    const delta = userHasLiked ? -1 : 1;
    const userLiked = userHasLiked ? "0" : "1";


    const updatedLikes = await redisClient.hIncrBy(key, likesField, delta);

    await redisClient.hSet(userLikeKey, "liked", userLiked);

    return { success: true, likes: updatedLikes };
  } catch (err) {
    console.log(err);
    return { success: false, error: err.message };
  }
};

export const getLikes = async (postId) => {
  try {
    const redisClient=await connectRedis();
    const likes = await redisClient.hGet(`post:${postId}`, "likes");
    return likes ? parseInt(likes) : 0;
  } catch (err) {
    console.log(err);
    return 0;
  }
};

export const isUserLiked = async (postId) => {
  try {
    const redisClient=await connectRedis();
    const session = await auth();
    if (!session || !session.user?.id) {
      return false;
    }

    const isLiked = await redisClient.hGet(
      `liked:${postId}:${session.user.id}`,
      "liked"
    );

    return isLiked === "1";
  } catch (err) {
    console.log("Error in isUserLiked:", err);
    return false;
  }
};

export const addView=async(postId)=>{
  try{
    const redisClient=await connectRedis();
    const key=`view:${postId}`
    const session = await auth();
    if (!session || !session.user?.id) {
      return false;
    }
    await redisClient.sAdd("view-keys",key)
    const userId=session.user.id;
    await redisClient.sAdd(key,userId)
    return true;
  }catch(err){
    console.log(err)
    return false
  }
}

export const getViewCount=async(postId)=>{
  try{
    const redisClient=await connectRedis();
    const key=`view:${postId}`
    const views=await redisClient.sCard(key)
    console.log()
    return views;
  }catch(err){
    console.log(err)
    return 0;
  }
}

