import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import adminRouter from "./routes/adminRoutes.js";
import batchRouter from "./routes/batchRoutes.js";
import teacherRoute from "./routes/teacherroutes.js";
import submissionRouter from "./routes/submissionRoutes.js";
import noticeRouter from "./routes/NoticeRoute.js";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads/profile", express.static("uploads/profile"));
app.use("/assignment/files", express.static("assignment/files"));

app.use("/batch", batchRouter);
app.use("/admin", adminRouter);
app.use("/teacher", teacherRoute);
app.use("/student", submissionRouter);
app.use("/notice", noticeRouter);

app.use(express.static(path.join(__dirname, "client/build")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// Database + Server
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    app.listen(3000, () => {
      console.log("Server Started on port 3000");
    });
  })
  .catch((err) => {
    console.log(" DB Connection Error:", err);
  });
