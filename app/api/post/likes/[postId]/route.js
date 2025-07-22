import { NextResponse } from "next/server";
import {  handleLike} from "@/app/lib/redis/redis";


// POST: Toggle like and update count
export async function POST(_, { params }) {
  try {
    const { postId } = await params;
    const response = await handleLike(postId);

    if (response.success) {
      return NextResponse.json({ likes: response.likes }, { status: 200 });
    } else {
      throw new Error(response.error);
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
