import express from "express"
import { createBatch ,allBatches,deleteBatch } from "../controller/batchController.js"
const batchRouter = express.Router()

batchRouter.post("/create-batch",createBatch)
batchRouter.get('/',allBatches)
batchRouter.delete('/:id',deleteBatch)
export default batchRouter