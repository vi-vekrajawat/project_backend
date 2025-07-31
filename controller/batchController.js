import { request, response } from "express";
import Batch from '../models/BatchModel.js'
import User from "../models/User.js";
export const createBatch = async(request,response)=>{
    try{
        const newBatch = await Batch.create(request.body)
        response.json({message:"Batch Created",newBatch})

    }
    catch(err){
        console.log("Internal server error")
        console.log(err)
    }

}

export const allBatches = async(request,response)=>{
    try{
        const getAll = await Batch.find().populate('students').populate('teachers')
        response.json({message:"all batches are",getAll})
    }
    catch(err){
        console.log(err)
    }
}
