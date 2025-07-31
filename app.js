import express, { urlencoded } from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import adminRouter from "./routes/adminRoutes.js";
import batchRouter from "./routes/batchRoutes.js";
import teacherRoute from "./routes/teacherroutes.js";
import submissionRouter from "./routes/submissionRoutes.js";
dotenv.config();

const app = express()


mongoose.connect(process.env.DB_URL).then((result) => {
    // app.use(express.static("public"));
    app.use("/uploads/profile", express.static("uploads/profile"));
    app.use("/assignment/files", express.static("assignment/files"));
    app.use(express.json())
    app.use(cors())
    app.use(express.urlencoded({ extended: true }))
    app.use('/admin', adminRouter)
    app.use('/batch', batchRouter)
    app.use('/teacher', teacherRoute)
    app.use('/student', submissionRouter)
    app.listen(3000, () => {
        console.log("Server  Started")
    })
}).catch((err) => {
    console.log("Server is not connected something is error", err)
})
