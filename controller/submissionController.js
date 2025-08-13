import { request, response } from "express";
import Submission from "../models/SubmissionModel.js";
import User from "../models/User.js";

export const submissionId = async (request, response) => {
  try {
    const id = request.params.userId;
    console.log(id);
    const submissions = await Submission.find({ userId: id });
    const submissionCount = await Submission.countDocuments({ userId: id });

    response.json({
      message: "Submitted Assignments",
      submissionCount
    });

  } catch (err) {
    console.error(err);
    response.status(500).json({ message: "Server error" });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { userId, assignmentId, description, feedback, status, batchId } = req.body;
    console.log(assignmentId)
    console.log(userId)

    const alreadySubmitted = await Submission.findOne({ userId, assignmentId })
    if (alreadySubmitted) {
      console.log("submitted")
      return res.status(400).json({ message: "Already submitted this assignment." });
    }

    const newSubmission = await Submission.create({
      userId,
      assignmentId,
      batchId,
      description,
      feedback,
      status,
      fileName: req.file?.filename
    });

    return res.status(200).json({ message: "Submission Successful", newSubmission });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getAll = async (request, response) => {
  try {
    const allass = await Submission.find().populate("assignmentId").populate("batchId").populate("userId");
    return response.json({ message: "All Asignments", allass })
  }
  catch (err) {
    console.log(err)
  }
}

export const getSubmittedAssignmentIds = async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log(studentId)
    const submissions = await Submission.find({ userId: studentId }).populate("assignmentId");
    console.log(submissions)

    // const submittedAssignmentIds = submissions.map(sub => sub.assignmentId.toString());
    // console.log(submittedAssignmentIds)
    res.json({ submissions });
  } catch (err) {
    console.error("Error fetching submitted assignment IDs:", err);
    res.status(500).json({ message: "Server error while fetching submitted assignments." });
  }
};

