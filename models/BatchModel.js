import mongoose from "mongoose"
const batchSchema = new mongoose.Schema({
    batchName: {
        type: String,
        required: true,
        trim:true
    },
    launchDate: {
        type: Date,
        required: true,
        trim:true
    },
    expireDate: {
        type: Date,
        required: true,
        trim:true
    },
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    teachers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    assignments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignment",
        },
    ],
})

export default mongoose.model("Batch", batchSchema)

