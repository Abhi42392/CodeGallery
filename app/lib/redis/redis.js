import connectRedis from "@/app/config/redis";
import { auth } from "../../auth";

/**
 * Handle like/unlike operations with atomic Redis operations
 * Uses separate key for like counts to match sync mechanism
 */
export const handleLike = async (postId) => {
  try {
    const session = await auth();
    if (!session || !session.user) {
      throw new Error("Unauthorized action");
    }

    const redisClient = await connectRedis();
    
    // Updated key structure to match sync mechanism
    const likesKey = `post:${postId}:likes`;  // Separate key for likes count
    const userLikeKey = `user:${session.user.id}:liked:${postId}`;  // Better namespacing
    
    // Check if user has already liked using atomic operation
    const userHasLiked = await redisClient.get(userLikeKey) === "1";
    
    // Use Redis transaction for atomic operations
    const multi = redisClient.multi();
    
    if (userHasLiked) {
      // Unlike: decrement and remove user flag
      multi.decr(likesKey);
      multi.del(userLikeKey);
    } else {
      // Like: increment and set user flag
      multi.incr(likesKey);
      multi.set(userLikeKey, "1");
      // Optional: Set TTL on user like to auto-cleanup old data
      multi.expire(userLikeKey, 2592000); // 30 days
    }
    
    // Execute transaction atomically
    const results = await multi.exec();
    
    // Get the updated likes count (first operation result)
    const updatedLikes = results[0];
    
    // Ensure the key exists with proper initialization if needed
    if (updatedLikes === null || updatedLikes < 0) {
      await redisClient.set(likesKey, "0");
      return { success: true, likes: 0, userLiked: false };
    }

    return { 
      success: true, 
      likes: updatedLikes,
      userLiked: !userHasLiked  // New state after toggle
    };
    
  } catch (err) {
    console.error("Error in handleLike:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Get likes count for a post
 * Fetches from the dedicated likes key
 */
export const getLikes = async (postId) => {
  try {
    const redisClient = await connectRedis();
    const likesKey = `post:${postId}:likes`;
    
    const likes = await redisClient.get(likesKey);
    return likes ? parseInt(likes) : 0;
    
  } catch (err) {
    console.error("Error in getLikes:", err);
    return 0;
  }
};

/**
 * Check if current user has liked a post
 * Uses improved key structure for better organization
 */
export const isUserLiked = async (postId) => {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return false;
    }

    const redisClient = await connectRedis();
    const userLikeKey = `user:${session.user.id}:liked:${postId}`;
    
    const isLiked = await redisClient.get(userLikeKey);
    return isLiked === "1";
    
  } catch (err) {
    console.error("Error in isUserLiked:", err);
    return false;
  }
};

/**
 * Add a view for a post from current user
 * Uses Set to ensure unique views per user
 */
export const addView = async (postId) => {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return false;
    }

    const redisClient = await connectRedis();
    const viewKey = `view:${postId}`;
    const userId = session.user.id;
    
    // Use transaction for atomic operations
    const multi = redisClient.multi();
    
    // Add to tracking set for sync process
    multi.sAdd("view-keys", viewKey);
    
    // Add user to post's view set (automatically handles uniqueness)
    multi.sAdd(viewKey, userId);
    
    // Optional: Set TTL on view key to auto-cleanup old data
    multi.expire(viewKey, 604800); // 7 days
    
    const results = await multi.exec();
    
    // Check if this was a new view (sAdd returns 1 if new, 0 if existed)
    const isNewView = results[1] === 1;
    
    return { success: true, isNewView };
    
  } catch (err) {
    console.error("Error in addView:", err);
    return { success: false };
  }
};

/**
 * Get total unique view count for a post
 */
export const getViewCount = async (postId) => {
  try {
    const redisClient = await connectRedis();
    const viewKey = `view:${postId}`;
    
    const views = await redisClient.sCard(viewKey);
    return views || 0;
    
  } catch (err) {
    console.error("Error in getViewCount:", err);
    return 0;
  }
};

/**
 * Batch get likes for multiple posts (performance optimization)
 */
export const getBatchLikes = async (postIds) => {
  try {
    if (!postIds || postIds.length === 0) {
      return {};
    }

    const redisClient = await connectRedis();
    const multi = redisClient.multi();
    
    // Queue all get operations
    postIds.forEach(postId => {
      multi.get(`post:${postId}:likes`);
    });
    
    const results = await multi.exec();
    
    // Map results to post IDs
    const likesMap = {};
    postIds.forEach((postId, index) => {
      likesMap[postId] = parseInt(results[index] || "0");
    });
    
    return likesMap;
    
  } catch (err) {
    console.error("Error in getBatchLikes:", err);
    return {};
  }
};

/**
 * Batch check if current user has liked multiple posts
 */
export const getBatchUserLikes = async (postIds) => {
  try {
    const session = await auth();
    if (!session || !session.user?.id || !postIds || postIds.length === 0) {
      return {};
    }

    const redisClient = await connectRedis();
    const multi = redisClient.multi();
    const userId = session.user.id;
    
    // Queue all get operations
    postIds.forEach(postId => {
      multi.get(`user:${userId}:liked:${postId}`);
    });
    
    const results = await multi.exec();
    
    // Map results to post IDs
    const likesMap = {};
    postIds.forEach((postId, index) => {
      likesMap[postId] = results[index] === "1";
    });
    
    return likesMap;
    
  } catch (err) {
    console.error("Error in getBatchUserLikes:", err);
    return {};
  }
};

/**
 * Get statistics for a post (likes and views combined)
 */
export const getPostStats = async (postId) => {
  try {
    const redisClient = await connectRedis();
    const multi = redisClient.multi();
    
    // Get both likes and views in one go
    multi.get(`post:${postId}:likes`);
    multi.sCard(`view:${postId}`);
    
    const [likes, views] = await multi.exec();
    
    return {
      likes: parseInt(likes || "0"),
      views: views || 0
    };
    
  } catch (err) {
    console.error("Error in getPostStats:", err);
    return { likes: 0, views: 0 };
  }
};

/**
 * Initialize likes for a new post (optional)
 */
export const initializePost = async (postId) => {
  try {
    const redisClient = await connectRedis();
    const likesKey = `post:${postId}:likes`;
    
    // Set initial value only if it doesn't exist
    const result = await redisClient.set(likesKey, "0", { NX: true });
    
    return { success: true, initialized: result === "OK" };
    
  } catch (err) {
    console.error("Error in initializePost:", err);
    return { success: false };
  }
};