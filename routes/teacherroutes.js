import express from "express"
import { assignmentCreate ,allAssignment} from "../controller/AssignmentController.js"
const teacherRoute = express.Router()
import multer from "multer"
    const assignment = multer({dest:'assignment/files'})
teacherRoute.post("/create", assignment.single('assignFileName') ,assignmentCreate)
teacherRoute.get('/',allAssignment)

export default teacherRoute