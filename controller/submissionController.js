import { response } from "express";
import Submission from "../models/SubmissionModel.js";
// export const submitAssignment = async(request,response)=>{
//     try{

//         const tasksubmissions = await Submission.create(request.body)
//         response.status(200).json({message:"Submissions Successfully",tasksubmissions})
//     }
//     catch(err){
//         console.log(err)
//     }
// }
export const submitAssignment = async (req, res) => {
  try {
    const { userId, assignmentId, description, feedback, status } = req.body;

    // Prevent duplicate
    const alreadySubmitted = await Submission.findOne({ userId, assignmentId });
    if (alreadySubmitted) {
      console.log("submitted")
      return res.status(400).json({ message: "Already submitted this assignment." });
    }

    const newSubmission = await Submission.create({
      userId,
      assignmentId,
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

export const getAll = async(request,response)=>{
    try{
        const allass = await Submission.find()
        return response.json({message:"All Asignments",allass})
    }
    catch(err){
        console.log(err)
    }
}

// Get all submitted assignment IDs for a student
export const getSubmittedAssignmentIds = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const submissions = await Submission.find({ student: studentId }).select("assignment");

    const submittedAssignmentIds = submissions.map(sub => sub.assignment.toString());

    res.json({ submittedAssignmentIds });
  } catch (err) {
    console.error("Error fetching submitted assignment IDs:", err);
    res.status(500).json({ message: "Server error while fetching submitted assignments." });
  }
};
