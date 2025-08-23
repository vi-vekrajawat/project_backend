import { request, response } from "express";
import Batch from '../models/BatchModel.js'
import User from "../models/User.js";
import AssignmentModel from "../models/AssignmentModel.js";

export const deleteBatch = async (request, response) => {
    try {
        const id = request.params.id
        console.log(id)
        const findBatch = await Batch.findById(id)
        const alldelete = await User.deleteMany({ _id: { $in: [...findBatch.students, ...findBatch.teachers] } })
        const assignmentdelte = await AssignmentModel.deleteMany({ _id: { $in: [...findBatch.assignments] } })
        const deleteBatch = await Batch.findByIdAndDelete(id)

    }
    catch (err) {
        console.log(err)
    }
}
export const createBatch = async (request, response) => {
    try {
        const newBatch = await Batch.create(request.body)
        response.json({ message: "Batch Created", newBatch })

    }
    catch (err) {
        console.log("Internal server error")
        console.log(err)
    }

}

export const allBatches = async (request, response) => {
    try {
        const getAll = await Batch.find().populate('students').populate('teachers').populate("assignments")
        response.json({ message: "all batches are", getAll })
    }
    catch (err) {
        console.log(err)
    }
}
