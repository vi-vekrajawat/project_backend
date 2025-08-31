import Notice from "../models/NoticeBoard.js";
import User from "../models/User.js";

export const noticeCreated = async (req, res) => {
    try {
      
        const { title, description ,createdBy} = req.body;

        const notice = await Notice.create({
            title,
            description,
            createdBy
        });
        res.status(201).json({ success: true, notice });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};




export const newNotice = async (req, res) => {
    try {

        const notices = await Notice.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true,notices });

    }
    catch (err) {
        console.log(err)
    }
}


export const noticeDeleted =async(req,res)=>{
    try{
        const {id} = req.params
        const deleteNotice = await Notice.findByIdAndDelete(id)
        res.json({message:"Notice Deleted",deleteNotice})

    }
    catch(err){
        console.log(err)
    }
}

