import express from "express"
import { submitAssignment,getAll } from "../controller/submissionController.js"
import multer from "multer"
const submissionRouter = express.Router()

const taskFile = multer({dest:"assignment/files"})

submissionRouter.post('/', taskFile.single("fileName"),submitAssignment)
submissionRouter.get('/',getAll)

export default submissionRouter