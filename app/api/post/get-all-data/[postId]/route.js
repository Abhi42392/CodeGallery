import { getLikes,isUserLiked,getViewCount } from "@/app/lib/redis/redis";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  const { postId } = await params;
  const likes = await getLikes(postId);
  const isLiked = await isUserLiked(postId);
  const views=await getViewCount(postId)
  return NextResponse.json(
    { likes: parseInt(likes || 0), isLiked,views },
    { status: 200 }
  );
}