import express from "express"
import { assignmentCreate ,allAssignment} from "../controller/AssignmentController.js"
const teacherRoute = express.Router()
import multer from "multer"
    const assignment = multer({dest:'assignment/files'})
teacherRoute.post("/create", assignment.single('assignFileName') ,assignmentCreate)
teacherRoute.get('/',allAssignment)
// router.post('/assignment/create', assignmentCreate);
// router.get('/assignments/:batchId', allAssignment);  
// router.put('/assignment/:assignmentId', updateAssignment);
// router.get('/batches', getAllBatches); // Debug ke liye
export default teacherRoute