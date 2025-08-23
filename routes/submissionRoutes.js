import express from "express"
import { submitAssignment,getAll,getSubmittedAssignmentIds,submissionId } from "../controller/submissionController.js"
import multer from "multer"
const taskFile = multer({dest:"assignment/files"})

const submissionRouter = express.Router()

submissionRouter.post('/', taskFile.single("fileName"),submitAssignment)
submissionRouter.get('/',getAll)
submissionRouter.get("/submitted-assignments/:studentId", getSubmittedAssignmentIds);
submissionRouter.get("/submission/:userId",submissionId)


export default submissionRouter