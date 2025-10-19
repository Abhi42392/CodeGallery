import { 
  getLikes, 
  isUserLiked, 
  getViewCount,
  getPostStats 
} from "@/app/lib/redis/redis";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  try {
    const { postId } = await params;
    
    // Validate postId
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Option 1: Use the combined stats function for better performance
    // This reduces Redis calls from 3 to 2 (or even 1 if you don't need user-specific data)
    const [stats, isLiked] = await Promise.all([
      getPostStats(postId),
      isUserLiked(postId)
    ]);

    return NextResponse.json(
      { 
        likes: stats.likes,
        views: stats.views,
        isLiked,
        postId // Include postId for client-side reference
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching post stats:", error);
    
    // Return safe defaults on error
    return NextResponse.json(
      { 
        likes: 0,
        views: 0,
        isLiked: false,
        error: "Failed to fetch post statistics"
      },
      { status: 500 }
    );
  }
}

// Alternative implementation if you prefer individual calls
export async function GET_INDIVIDUAL(_, { params }) {
  try {
    const { postId } = await params;
    
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Parallel execution for better performance
    const [likes, isLiked, views] = await Promise.all([
      getLikes(postId),
      isUserLiked(postId),
      getViewCount(postId)
    ]);

    return NextResponse.json(
      { 
        likes: likes, // getLikes already returns a number
        isLiked: isLiked,
        views: views,
        postId
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching post stats:", error);
    
    return NextResponse.json(
      { 
        likes: 0,
        views: 0,
        isLiked: false,
        error: "Failed to fetch post statistics"
      },
      { status: 500 }
    );
  }
}

// Optional: Add caching headers for better performance
export async function GET_WITH_CACHE(_, { params }) {
  try {
    const { postId } = await params;
    
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const [stats, isLiked] = await Promise.all([
      getPostStats(postId),
      isUserLiked(postId)
    ]);

    // Create response with caching headers
    const response = NextResponse.json(
      { 
        likes: stats.likes,
        views: stats.views,
        isLiked,
        postId,
        timestamp: Date.now() // Optional: include timestamp for debugging
      },
      { status: 200 }
    );

    // Add cache control headers
    // Cache for 5 seconds to reduce server load while keeping data fresh
    response.headers.set('Cache-Control', 'public, s-maxage=5, stale-while-revalidate');
    
    return response;

  } catch (error) {
    console.error("Error fetching post stats:", error);
    
    const errorResponse = NextResponse.json(
      { 
        likes: 0,
        views: 0,
        isLiked: false,
        error: "Failed to fetch post statistics"
      },
      { status: 500 }
    );
    
    // Don't cache errors
    errorResponse.headers.set('Cache-Control', 'no-store');
    
    return errorResponse;
  }
}