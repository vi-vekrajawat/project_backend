import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notice = mongoose.model("Notice", noticeSchema);
export default Notice;
