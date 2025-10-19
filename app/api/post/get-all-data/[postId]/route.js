import { 
  isUserLiked, 
  getLikes,
  getViewCount
} from "@/app/lib/redis/redis";
import { NextResponse } from "next/server";

// Alternative implementation if you prefer individual calls
export async function GET(_, { params }) {
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
