import mongoose from "mongoose";
const AssignmentSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    batchId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Batch",
    },
    teacherId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    description:{
        type:String,
        trim:true
    },
    instructions:{
        type:String,
        trim:true
    },
    subject: {
        type: String,
        enum: ['softskill', "technical", 'aptitude'],
        required: true,
        trim:true
    },
    deadline:{
        type:Date,
        required:true
    },
    file:{
        type:String
    }
})

export default mongoose.model("Assignment",AssignmentSchema)