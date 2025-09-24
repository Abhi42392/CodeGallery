import { NextResponse } from "next/server";
import connectDB from "@/app/config/mongodb";
import { auth } from "@/app/auth";
import { uploadPDF } from "../../../lib/cloudinary/actions";
import { uploadImage } from "../../../lib/cloudinary/actions";
import userModel from "@/app/models/userModel";

export async function POST(req) {
  try {
    await connectDB();
    const session = await auth();
    if (!session || !session.user) throw new Error("Unauthorized");

    const fd = await req.formData();
    console.log("Processing profile update...");

    // Extract fields
    const name = fd.get("name");
    const about = fd.get("about");
    const portfolio = fd.get("portfolio");
    const headline = fd.get("headline");
    const avatarUrl = fd.get("avatarUrl");
    const email = fd.get("email");
    const skills = fd.get("skills");
    const resume = fd.get("resume");
    const phone = fd.get("phone");
    const organizations = fd.get("organizations"); // New field

    // Parse portfolio
    let parsedPortfolio = [];
    try {
      parsedPortfolio = JSON.parse(portfolio);
    } catch {
      throw new Error("Portfolio must be a valid JSON array");
    }

    // Parse skills
    let parsedSkills = [];
    try {
      parsedSkills = JSON.parse(skills);
    } catch {
      throw new Error("Skills must be a valid JSON array");
    }

    // Parse organizations - new parsing logic
    let parsedOrganizations = [];
    try {
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
      
    } catch {
      throw new Error("Organizations must be a valid JSON array");
    }

    // Upload resume
    let finalResume = resume;
    if (resume instanceof File) {
      const response = await uploadPDF(resume);
      if (!response.success) {
        throw new Error("Failed to upload resume PDF");
      }
      finalResume = {
        fileName: resume.name,
        url: response.url,
      };
    }

    // Upload avatar image
    let finalImageUrl = avatarUrl;
    if (avatarUrl instanceof File) {
      const imageResponse = await uploadImage(avatarUrl);
      if (!imageResponse?.url) throw new Error("Failed to upload profile image");
      finalImageUrl = imageResponse.url;
    }

    const updatedData = {
      name,
      about,
      headline,
      portfolio: parsedPortfolio,
      avatarUrl: finalImageUrl,
      resume: finalResume,
      email,
      skills: parsedSkills,
      phone,
      organizations: parsedOrganizations, 
    };

    console.log("Updating user data:", updatedData);
    
    const updatedUser = await userModel.findByIdAndUpdate(
      session.user.id,
      updatedData,
      { 
        new: true, 
        runValidators: true,
      }
    );

    console.log("Profile updated successfully");
    
    return NextResponse.json({ 
      success: true, 
      data: updatedUser 
    });
    
  } catch (err) {
    console.error("❌ Error updating profile:", err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { 
      status: 400 
    });
  }
}