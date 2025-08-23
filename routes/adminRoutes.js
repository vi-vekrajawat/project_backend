import express from "express";
import { insertStudent,uploadStudents ,userLogin,deleteByID,uploadProfile, getAll,googleLogin,profileDataUpdate,assignBatch,removeTeacherFromBatch} from "../controller/userController.js";
import multer from "multer";
const upload = multer({dest:'uploads/profile'})
const adminRouter = express.Router()

adminRouter.post('/insert-single',insertStudent)
adminRouter.post("/insert-students", upload.single("excelFile"), uploadStudents);
adminRouter.get('/',getAll)
adminRouter.post("/login",userLogin)
adminRouter.delete('/delete/:id',deleteByID)
adminRouter.patch('/profile/:id',upload.single("profile"),uploadProfile)
adminRouter.patch('/profile-data/:id',profileDataUpdate)
adminRouter.post('/google-login', googleLogin);
adminRouter.put("/assign-batch/:teacherId", assignBatch);


adminRouter.delete("teacher/:teacherId", removeTeacherFromBatch);


export default adminRouter