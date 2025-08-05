import express from "express"
import { submitAssignment,getAll,getSubmittedAssignmentIds,submissionId } from "../controller/submissionController.js"
import multer from "multer"
const submissionRouter = express.Router()

const taskFile = multer({dest:"assignment/files"})

submissionRouter.post('/', taskFile.single("fileName"),submitAssignment)
submissionRouter.get('/',getAll)
submissionRouter.get("/submitted/:studentId", getSubmittedAssignmentIds);
submissionRouter.get("/submission/:userId",submissionId)


export default submissionRouter