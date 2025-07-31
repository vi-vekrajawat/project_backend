import Assignment from '../models/AssignmentModel.js';
import Batch from '../models/BatchModel.js';
import User from '../models/User.js';

export const assignmentCreate = async (req, res) => {
    try {
        const { title, batchId, description, instructions, subject, deadline, file } = req.body;

        // Debug: batchId check karte hai
        console.log("Received batchId:", batchId, "Type:", typeof batchId);
        
        // batchId validation
        if (!batchId) {
            return res.status(400).json({ 
                message: "Batch ID bhejni zaroori hai" 
            });
        }

        // MongoDB ObjectId validation
        if(!batchId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                message: "Batch ID ka format galat hai" 
            });
        }

        // Batch exist karta hai ya nahi check karte hai
        const batch = await Batch.findById(batchId);
        console.log("Found batch:", batch ? "Yes" : "No");
        console.log("Batch details:", batch ? batch.batchName : "Not found");
        
        if (!batch) {
            return res.status(404).json({ 
                message: "Batch does not exist" 
            });
        }

        // Deadline validation
        if (deadline && new Date(deadline) < new Date()) {
            return res.status(400).json({ 
                message: "Deadline past me nahi ho sakti"
            });
        }
        const fileName = req.file?.filename || null;

        // Assignment create karte hai
        const newAssignment = new Assignment({
            title,
            batchId,
            description,
            instructions,
            subject,
            deadline,
            file:fileName
        });

        // Assignment save karte hai
        const savedAssignment = await newAssignment.save();
        console.log("Assignment saved:", savedAssignment._id);

        // Batch me assignment ki ID add karte hai
        const updatedBatch = await Batch.findByIdAndUpdate(
            batchId,
            { $push: { assignments: savedAssignment._id } },
            { new: true }
        );
        console.log("Batch updated with assignment ID");

        // Response bhejte hai
        res.status(201).json({
            message: "Assignment successfully create", 
            assignment: savedAssignment
        });

    } catch (error) {
        console.error("Assignment create karte waqt error:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// Batch ke saare assignments get karne ka function
export const allAssignment = async(request,response)=>{
    try{
        const assignment = await Assignment.find()
        return response.json({message:"all assignment",assignment})
    }
    catch(err){
        console.log(err)
    }
}
// export const allAssignment = async (req, res) => {
//     try {
//         const { batchId } = req.params;

//         // Simple version - bina user check ke
//         if (!batchId) {
//             return res.status(400).json({ 
//                 message: "Batch ID required hai" 
//             });
//         }

//         // Batch exist karta hai ya nahi
//         const batch = await Batch.findById(batchId);
//         if (!batch) {
//             return res.status(404).json({ 
//                 message: "Batch nahi mila" 
//             });
//         }

//         // Assignments fetch karte hai
//         const assignments = await Assignment.find({ batchId })
//             .sort({ deadline: 1 }) // Deadline ke according sort karte hai
//             .populate('batchId', 'batchName');

//         res.status(200).json({
//             message: "Assignments mil gaye",
//             assignments,
//             totalAssignments: assignments.length
//         });

//     } catch (error) {
//         console.error("Assignments fetch karte waqt error:", error);
//         res.status(500).json({
//             message: "Kuch gadbad hai server me",
//             error: error.message
//         });
//     }
// };

// Assignment update karne ka function  
export const updateAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const updateData = req.body;

        // Assignment exist karta hai ya nahi
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ 
                message: "Assignment nahi mila" 
            });
        }

        // Update karte hai
        const updatedAssignment = await Assignment.findByIdAndUpdate(
            assignmentId,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Assignment update ho gaya",
            assignment: updatedAssignment
        });

    } catch (error) {
        console.error("Assignment update error:", error);
        res.status(500).json({
            message: "Update nahi ho paya",
            error: error.message
        });
    }
};

// Debug function - Saare batches dekhne ke liye
export const getAllBatches = async (req, res) => {
    try {
        const batches = await Batch.find({}).select('_id batchName launchDate');
        
        console.log("All batches in database:");
        batches.forEach(batch => {
            console.log(`ID: ${batch._id}, Name: ${batch.batchName}`);
        });

        res.status(200).json({
            message: "Saare batches mil gaye",
            batches,
            totalBatches: batches.length
        });

    } catch (error) {
        console.error("Batches fetch error:", error);
        res.status(500).json({
            message: "Batches nahi mil paye",
            error: error.message
        });
    }
};