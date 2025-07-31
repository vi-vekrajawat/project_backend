import { response } from "express";
import Submission from "../models/SubmissionModel.js";
export const submitAssignment = async(request,response)=>{
    try{

        const tasksubmissions = await Submission.create(request.body)
        response.status(200).json({message:"Submissions Successfully",tasksubmissions})
    }
    catch(err){
        console.log(err)
    }
}

export const getAll = async(request,response)=>{
    try{
        const allass = await Submission.find()
        return response.json({message:"All Asignments",allass})
    }
    catch(err){
        console.log(err)
    }
}