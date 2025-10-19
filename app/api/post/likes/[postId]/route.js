import { NextResponse } from "next/server";
import { handleLike } from "@/app/lib/redis/redis";
import { auth } from "@/app/auth";
// POST: Toggle like and update count
export async function POST(_, { params }) {
  try {
    const { postId } = await params;
    
    // Validate postId
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Optional: Check authentication at route level for earlier failure
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Handle the like/unlike operation
    const response = await handleLike(postId);

    if (response.success) {
      // Return comprehensive response with new state
      return NextResponse.json(
        { 
          success: true,
          likes: response.likes,
          userLiked: response.userLiked, // Include the new like state
          postId,
          message: response.userLiked ? "Post liked" : "Post unliked"
        },
        { status: 200 }
      );
    } else {
      // Handle specific error cases
      if (response.error === "Unauthorized action") {
        return NextResponse.json(
          { error: response.error },
          { status: 401 }
        );
      }
      
      throw new Error(response.error || "Failed to update like");
    }
  } catch (err) {
    console.error("Error in POST /api/posts/[postId]/like:", err);
    
    // Differentiate between different error types
    if (err.message === "Unauthorized action") {
      return NextResponse.json(
        { error: "Please login to like posts" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to process like action",
        details: process.env.NODE_ENV === "development" ? err.message : undefined
      },
      { status: 500 }
    );
  }
}

// Optional: Add rate limiting middleware
export async function POST_WITH_RATE_LIMIT(_, { params }) {
  try {
    const { postId } = await params;
    
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Simple rate limiting check (you might want to use a proper rate limiter)
    const userId = session.user.id;
    const rateLimitKey = `ratelimit:like:${userId}`;
    
    // Check rate limit (example: max 10 likes per minute)
    const redisClient = await connectRedis();
    const currentCount = await redisClient.incr(rateLimitKey);
    
    if (currentCount === 1) {
      // First action, set expiry
      await redisClient.expire(rateLimitKey, 60); // 60 seconds
    }
    
    if (currentCount > 10) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    // Handle the like operation
    const response = await handleLike(postId);

    if (response.success) {
      return NextResponse.json(
        { 
          success: true,
          likes: response.likes,
          userLiked: response.userLiked,
          postId
        },
        { status: 200 }
      );
    } else {
      throw new Error(response.error || "Failed to update like");
    }
  } catch (err) {
    console.error("Error in POST /api/posts/[postId]/like:", err);
    
    return NextResponse.json(
      { 
        error: "Failed to process like action",
        details: process.env.NODE_ENV === "development" ? err.message : undefined
      },
      { status: 500 }
    );
  }
}

// Optional: Add optimistic response with validation
export async function POST_WITH_VALIDATION(_, { params }) {
  try {
    const { postId } = await params;
    
    // Validate postId format (assuming MongoDB ObjectId)
    if (!postId || !/^[0-9a-fA-F]{24}$/.test(postId)) {
      return NextResponse.json(
        { error: "Invalid post ID format" },
        { status: 400 }
      );
    }

    // You might want to check if the post actually exists
    // const postExists = await checkPostExists(postId);
    // if (!postExists) {
    //   return NextResponse.json(
    //     { error: "Post not found" },
    //     { status: 404 }
    //   );
    // }

    const response = await handleLike(postId);

    if (response.success) {
      const res = NextResponse.json(
        { 
          success: true,
          likes: response.likes,
          userLiked: response.userLiked,
          postId,
          timestamp: Date.now()
        },
        { status: 200 }
      );

      // Add headers for real-time feel
      res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.headers.set('X-Response-Time', Date.now().toString());
      
      return res;
    } else {
      throw new Error(response.error || "Failed to update like");
    }
  } catch (err) {
    console.error("Error in POST /api/posts/[postId]/like:", err);
    
    const errorResponse = NextResponse.json(
      { 
        error: "Failed to process like action",
        details: process.env.NODE_ENV === "development" ? err.message : undefined,
        timestamp: Date.now()
      },
      { status: 500 }
    );
    
    errorResponse.headers.set('Cache-Control', 'no-store');
    
    return errorResponse;
  }
}