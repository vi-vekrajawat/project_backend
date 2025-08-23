import mongoose from "mongoose"
const batchSchema = new mongoose.Schema({
    batchName: {
        type: String,
        required: true
    },
    launchDate: {
        type: Date,
        required: true,
    },
    expireDate: {
        type: Date,
        required: true
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

