
import Assignment from '../models/AssignmentModel.js';
import Batch from '../models/BatchModel.js';
import User from '../models/User.js';
export const assignmentCreate = async (req, res) => {
    try {
        const { title, batchId, description, instructions, subject, deadline, teacherId } = req.body;
        if (!batchId) {
            return res.status(400).json({ message: "Batch not found" });
        }

        if (!batchId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Batch ID ka format galat hai" });
        }

        const batch = await Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ message: "Batch does not exist" });
        }

        if (deadline && new Date(deadline) < new Date()) {
            return res.status(400).json({ message: "Deadline past me nahi ho sakti" });
        }

        const fileName = req.file?.filename || null;

        const newAssignment = new Assignment({
            title,
            batchId,
            description,
            instructions,
            teacherId,
            subject,
            deadline,
            file: fileName
        });

        const savedAssignment = await newAssignment.save();

        await Batch.findByIdAndUpdate(
            batchId,
            { $push: { assignments: savedAssignment._id } },
            { new: true }
        );

        res.status(201).json({
            message: "Assignment successfully created",
            assignment: savedAssignment
        });

    } catch (error) {
        console.error("Assignment create error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

export const allAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.find().populate("teacherId");
        return res.json({ message: "all assignment", assignment });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error fetching assignments" });
    }
};
export const getByTeacherId = async (req, res) => {
    try {
        const tId = req.params.id
        const findAssignment = await Assignment.find({ teacherId: tId })
        return res.json({ message: "all assignment", findAssignment });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error fetching assignments" });
    }
};
