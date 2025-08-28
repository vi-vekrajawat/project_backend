import mongoose from "mongoose";
const AssignmentSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    batchId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Batch"
    },
    teacherId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    description:{
        type:String,
    },
    instructions:{
        type:String
    },
    subject: {
        type: String,
        enum: ['softskill', "technical", 'aptitude'],
        required: true
    },
    deadline:{
        type:Date
    },
    file:{
        type:String
    }
})

export default mongoose.model("Assignment",AssignmentSchema)