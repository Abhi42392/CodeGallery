import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    default: "",
  },
  liveSiteUrl: {
    type: String,
    required: true,
    trim: true,
  },
  githubUrl: {
    type: String,
    default: "",
    trim: true,
  },
  poster: {
    type: String, 
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
   user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes:{type:Number,default:0},
  views:{type:Number,default:0}
});


const ProjectModel =
  mongoose.models.Project || mongoose.model("Project", projectSchema);

export default ProjectModel;
