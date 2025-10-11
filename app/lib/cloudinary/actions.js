import cloudinary from "@/app/config/cloudinary";
import streamifier from "streamifier";
export const uploadImage = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "project-posters" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url); // return the uploaded image URL
      }
    );
    uploadStream.end(buffer);
  });
};

export const extractPublicId=async(url)=>{
    try{
        const path=url.split('/');
        const file=path[path.length-1];
        const publicId=file.split('.')[0]
        return publicId
    }catch(err){
        console.log(err.message);
        throw err
    }
}

export const deleteImageFromCloudinary=async(publicId)=>{
    try{
        const result=await cloudinary.uploader.destroy(publicId)
        return result
    }catch(err){
        console.log(err.message);
        throw err
    }
}



