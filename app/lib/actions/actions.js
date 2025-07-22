"use server";
import ProjectModel from "@/app/models/ProjectModel";
import { auth } from "@/app/auth";
import connectDB from "@/app/config/mongodb";
import mongoose from "mongoose";
import userModel from "@/app/models/userModel";
import { uploadImage,extractPublicId,deleteImageFromCloudinary, uploadPDF } from "../cloudinary/actions";



// Server action to create a new project
export const createNewProject = async (formData) => {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user) throw new Error("Unauthorized");

    // Extract fields from FormData
    const title = formData.get("title");
    const description = formData.get("description");
    const liveSiteUrl = formData.get("liveSiteUrl");
    const githubUrl = formData.get("githubUrl");
    const category = formData.get("category");
    const file = formData.get("poster");

    // Validate required fields
    if (!title || !description || !file) {
      throw new Error("Missing required fields or invalid file");
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadImage(file);

    // Create new project in DB
    await ProjectModel.create({
      title,
      description,
      liveSiteUrl,
      githubUrl,
      category,
      poster: imageUrl,
      user: new mongoose.Types.ObjectId(session.user.id),
    });

    return { success: true};
  } catch (err) {
    console.error("❌ Error creating project:", err);
    return { success: false, message: err.message };
  }
};


export const getProjectDetails = async (id) => {
  try {
    connectDB()
    const project = await ProjectModel.findById(id).populate('user').lean();

    if (!project) {
      throw new Error('Project not found');
    }

    return { project };
  } catch (err) {
    console.error('Error in getProjectDetails:', err.message);
    return { project: null, error: err.message };
  }
};


export const deleteProject=async(id)=>{
  try{
     await connectDB();
    const session = await auth();

    if (!session?.user) throw new Error("Unauthorized");
    await ProjectModel.findByIdAndDelete(id);
    return {success:true}
  }catch(err){
    console.log(err.message)
    return {success:false}
  }
}


export const updateProject = async (form, projectId,isNewImage) => {
  try {
    await connectDB();

    const session = await auth();
    if (!session || !session.user) throw new Error("Unauthorized");

    const project = await ProjectModel.findById(projectId);
    if (!project) throw new Error("Project not found");

    const posterFile = form.get("poster");
    let imageUrl = project.poster; // fallback to existing

    // Only if new image is selected
    if (isNewImage) {
      // 1. Delete old image from Cloudinary
      const publicId = extractPublicId(project.poster);
      if (publicId) {
        await deleteImageFromCloudinary(publicId);
      }

      // 2. Upload new image
      imageUrl = await uploadImage(posterFile);
    }

    // Update fields
    const updateData = {
      title: form.get("title"),
      description: form.get("description"),
      liveSiteUrl: form.get("liveSiteUrl"),
      githubUrl: form.get("githubUrl"),
      category: form.get("category"),
      poster: imageUrl,
    };

    await ProjectModel.findByIdAndUpdate(
      projectId,
      updateData,
      { new: true }
    );

    return { success: true };

  } catch (err) {
    console.error("❌ Error updating project:", err);
    return { success: false, error: err.message };
  }
};

export const getUserProjects=async(userId)=>{
  try{
    await connectDB();
    const session = await auth();
    if (!session || !session.user) throw new Error("Unauthorized");

    const response=await ProjectModel.find({user:userId}).lean()
    return {success:true,projects:response}
  }catch(err){
    return {success:false,error:err.message}
  }
}

export const getUserDetails=async(userId)=>{
  try{
    await connectDB();
    const session = await auth();
    if (!session || !session.user) throw new Error("Unauthorized");
    const response=await userModel.findById(userId,'-password').lean()
    const plainResponse={
      ...response,
      _id:response._id.toString()
    }
    return {success:true,user:plainResponse}
  }catch(err){
    return {success:false,error:err.message}
  }
}

