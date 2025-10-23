// /app/api/login/route.js
import { NextResponse } from "next/server";
import connectDB from "../../../config/mongodb";      // or "@/config/mongodb"
import userModel from "../../../models/userModel";     // or "@/models/userModel"
import { signIn } from "../../../auth";                     // from your NextAuth config

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Use NextAuth to verify credentials and set session cookie
    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // (Optional) Return safe user info for the client
    await connectDB();
    const user = await userModel
      .findOne({ email }, { password: 0 }) // exclude password
      .lean();

    return NextResponse.json(
      { success: true, message: "Login successful", user },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
