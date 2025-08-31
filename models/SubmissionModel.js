import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        required: true
    },
    fileName: {
        type: String
    },
    description: {    //Optional
        type: String,
        trim:true

    },
    feedback: {        //Optional
        type: String,
        trim:true
    },
    status: {          
        type: String,
        required: true,
        trim:true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
})

const Submission = mongoose.model("Submission", submissionSchema)
export default Submission