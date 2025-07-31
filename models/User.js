import mongoose from "mongoose";
import Batch from "../models/BatchModel.js"
const ueserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', "student", 'teacher'],
        required: true
    },
    isApproved: {
        type: String,
        default: true
    },
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
    },
    accessibleBatches: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
        },
    ],
    profile:{
     
            type:String,
            default:""
     
    }
})

export default mongoose.model("User", ueserSchema)