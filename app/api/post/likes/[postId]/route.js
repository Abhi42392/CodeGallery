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

