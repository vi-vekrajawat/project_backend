import express from "express"
import { assignmentCreate ,allAssignment,getByTeacherId} from "../controller/AssignmentController.js"
import multer from "multer"

const teacherRoute = express.Router()

const assignment = multer({dest:'assignment/files'})
teacherRoute.post("/create", assignment.single('assignFileName') ,assignmentCreate)
teacherRoute.get('/',allAssignment)
teacherRoute.get('/teacherId/:id',getByTeacherId)


export default teacherRoute