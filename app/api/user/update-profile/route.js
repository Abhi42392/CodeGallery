// app/api/user/update-profile/route.js
import { NextResponse } from "next/server";
import connectDB from "@/app/config/mongodb";
import { auth } from "@/app/auth";
import {uploadImage } from "../../../lib/cloudinary/actions";
import userModel from "@/app/models/userModel";

export async function POST(req) {
  try {
    await connectDB();
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const fd = await req.formData();
    console.log("Processing profile update...");

    // Extract form data
    const name = fd.get("name");
    const about = fd.get("about");
    const portfolio = fd.get("portfolio");
    const headline = fd.get("headline");
    const avatarUrl = fd.get("avatarUrl");
    const email = fd.get("email");
    const skills = fd.get("skills");
    const phone = fd.get("phone");
    const organizations = fd.get("organizations");
    

    // Parse JSON fields with proper error handling
    let parsedPortfolio = [];
    try {
      parsedPortfolio = portfolio ? JSON.parse(portfolio) : [];
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Invalid portfolio data format" },
        { status: 400 }
      );
    }

    let parsedSkills = [];
    try {
      parsedSkills = skills ? JSON.parse(skills) : [];
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Invalid skills data format" },
        { status: 400 }
      );
    }

    let parsedOrganizations = [];
    try {
      if (organizations) {
        parsedOrganizations = JSON.parse(organizations);
        
        // Validate and format organization dates
        parsedOrganizations = parsedOrganizations.map(org => ({
          name: org.name || "",
          jobTitle: org.jobTitle || "",
          startDate: org.startDate ? new Date(org.startDate) : null,
          endDate: org.endDate && !org.isCurrent ? new Date(org.endDate) : null,
          isCurrent: org.isCurrent || false
        }));
        
        // Filter out empty organizations
        parsedOrganizations = parsedOrganizations.filter(
          org => org.name && org.jobTitle && org.startDate
        );
      }
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Invalid organizations data format" },
        { status: 400 }
      );
    }

    

    // Handle avatar image upload
    let finalImageUrl = avatarUrl;
    if (avatarUrl instanceof File) {
      try {
        const imageResponse = await uploadImage(avatarUrl);
        if (!imageResponse?.url) {
          throw new Error("No URL returned from image upload");
        }
        finalImageUrl = imageResponse.url;
      } catch (imageError) {
        console.error("Avatar upload failed:", imageError);
        return NextResponse.json(
          { success: false, error: "Failed to upload profile image" },
          { status: 500 }
        );
      }
    } else if (typeof avatarUrl === 'string') {
      finalImageUrl = avatarUrl;
    }

    // Prepare update data
    const updatedData = {
      name: name || "",
      about: about || "",
      headline: headline || "",
      portfolio: parsedPortfolio,
      avatarUrl: finalImageUrl,
      email: email || "",
      skills: parsedSkills,
      phone: phone || "",
      organizations: parsedOrganizations,
    };

    // Remove null/undefined fields
    Object.keys(updatedData).forEach(key => {
      if (updatedData[key] === null || updatedData[key] === undefined) {
        delete updatedData[key];
      }
    });

    
    const updatedUser = await userModel.findByIdAndUpdate(
      session.user.id,
      updatedData,
      { 
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    console.log("Profile updated successfully");
    
    return NextResponse.json({ 
      success: true, 
      message: "Profile updated successfully",
      data: updatedUser 
    });
    
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    return NextResponse.json(
      { 
        success: false, 
        error: err.message || "An unexpected error occurred" 
      },
      { status: 500 }
    );
  }
}