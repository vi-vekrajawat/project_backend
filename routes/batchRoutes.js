import express from "express"
import { createBatch ,allBatches } from "../controller/batchController.js"
const batchRouter = express.Router()

batchRouter.post("/create-batch",createBatch)
batchRouter.get('/',allBatches)
export default batchRouter