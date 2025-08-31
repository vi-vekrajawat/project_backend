
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

// DELETE /assignments/:id
export const deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Assignment find karo
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // 2. Batch se remove karo
    await Batch.findByIdAndUpdate(assignment.batchId, {
      $pull: { assignments: assignment._id }
    });

    // 3. Assignment collection se delete karo
    await Assignment.findByIdAndDelete(id);

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting assignment", error: err.message });
  }
};
