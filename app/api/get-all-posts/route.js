"use server";
import ProjectModel from "../../models/ProjectModel"
import userModel from "../../models/userModel";
import  connectDB from "../../config/mongodb"
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const posts = await ProjectModel.find({}).populate('user');
    return NextResponse.json({ success: true, data: posts });
  } catch (err) {
    console.error("Error fetching posts:", err.message);
    return NextResponse.json({ success: false, message: "Failed to fetch posts" }, { status: 500 });
  }
}
