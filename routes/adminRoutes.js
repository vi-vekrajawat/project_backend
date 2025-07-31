import express from "express";
import { insertStudent,uploadStudents ,userLogin,deleteByID,uploadProfile, getAll} from "../controller/userController.js";
// import { uploadProfile } from "../controller/userController.js";
import multer from "multer";
const upload = multer({dest:'uploads/profile'})
const adminRouter = express.Router()

adminRouter.post('/insert-single',insertStudent)
adminRouter.post("/insert-students", upload.single("excelFile"), uploadStudents);
adminRouter.get('/',getAll)
adminRouter.post("/login",userLogin)
adminRouter.delete('/delete/:id',deleteByID)
adminRouter.patch('/profile/:id',upload.single("profile"),uploadProfile)


export default adminRouter