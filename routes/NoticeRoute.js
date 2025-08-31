import express from "express";
import { newNotice, noticeCreated, noticeDeleted } from "../controller/NoticeController.js";

const noticeRouter = express.Router()

noticeRouter.post('/new-notice',noticeCreated)
noticeRouter.get('/get-notice',newNotice)
noticeRouter.delete('/:id',noticeDeleted)

export default noticeRouter