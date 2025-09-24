import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  avatarUrl: { type: String, default: "" },
  providerAccountId: { type: String, required: true },
  about:{type:String,default:""},
  resume: {
    type: {
      url: { type: String, required: true },
      fileName: { type: String, required: true }
    },
    default: null,
    _id:false
  },

  headline: { type: String, default: "" },

  portfolio: {
    type: [{
      site: { type: String, default: "" },
      url: { type: String, default: "" },
      _id:false
    }],
    default: [] 
  },

  skills: {
    type: [String],
    default: [] 
  },
  phone:{type:String,default:""},
  organizations: {
    type: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
          maxLength: 100
        },
        jobTitle: {
          type: String,
          required: true,
          trim: true,
          maxLength: 100
        },
        startDate: {
          type: Date,
          required: false
        },
        endDate: {
          type: Date,
          required: false
        },
        isCurrent:{
          type:Boolean,
          default:false
        }
      }
    ],
    default: []
  }
});


const userModel=mongoose.models.user||mongoose.model('user',userSchema);

export default userModel