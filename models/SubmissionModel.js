import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    assignmentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Assignment",
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    fileName:{
        type:String
    },
    description:{
        type:String

    },
    feedback:{
        type:String
    },
    status:{
        type:String,
        required:true
    }
})

const Submission = mongoose.model("Submission",submissionSchema)
export default Submission