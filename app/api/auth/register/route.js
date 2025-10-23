import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "../../../config/mongodb";
import userModel from "../../../models/userModel";
import { signIn } from "../../../auth"; // if no '@' alias, import from your relative path to auth.js

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, username } = body;

    if (!email || !password || !username) {
      return NextResponse.json(
        { success: false, message: "email, password, and username are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await userModel.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await userModel.create({
      name: username,
      email,
      password: hashed,
      // don't store provider name in password; just mark this account as credentials-based
      providerAccountId: "credentials",
    });

    const { password: _pw, ...safeUser } = user.toObject();

    // 👇 Immediately create a NextAuth session (sets cookies)
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // keep this endpoint returning JSON
    });

    if (res?.error) {
      // Registered but auto-login failed (rare). Let the client know to log in manually.
      return NextResponse.json(
        { success: true, user: safeUser, note: "Registered, but auto-login failed. Please log in." },
        { status: 201 }
      );
    }

    return NextResponse.json({ success: true, user: safeUser }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
