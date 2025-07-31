import User from "../models/User.js"
import multer from "multer";
import bcrypt from "bcryptjs"
import xlsx from "xlsx"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import Batch from "../models/BatchModel.js"
import { response } from "express";
dotenv.config()

export const uploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an Excel file." });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const students = xlsx.utils.sheet_to_json(worksheet);

    const seenEmails = new Set(); // To track duplicate emails in Excel
    const results = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      const name = student.name?.trim();
      const email = student.email?.toLowerCase().trim();
      const role = student.role?.trim().toLowerCase() || "student";
      const batchId = student.batch?.trim();

      if (!name || !email) {
        console.log(`Skipping row ${i + 1}: Missing name or email`);
        continue;
      }

      if (seenEmails.has(email)) {
        console.log(`Duplicate email in Excel: ${email}`);
        continue;
      }
      seenEmails.add(email);

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log(`User already exists in DB: ${email}`);
        continue;
      }

      const newPassword = genratePassword();
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const newUser = await User.create({
        name,
        email,
        role,
        password: hashedPassword,
        batch: batchId,
        isApproved: true // Set to true or false based on your workflow
      });

      await sendPasswordEmail(email, name, newPassword);

      if (batchId && (role === "student" || role === "teacher")) {
        const updateField = role === "student" ? { students: newUser._id } : { teachers: newUser._id };

        await Batch.findOneAndUpdate(
          { _id: batchId },
          { $push: updateField },
          { new: true, upsert: true }
        );
      }

      results.push({
        name,
        email,
        password: newPassword,
      });

      console.log(`✅ Created user: ${email}`);
    }

    res.status(200).json({
      message: `Successfully created ${results.length} user(s).`,
      students: results,
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      message: "Something went wrong during student upload.",
      error: error.message,
    });
  }
};

// export const uploadStudents = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.json({ message: "Please upload Excel file" });
//         }

//         const workbook = xlsx.readFile(req.file.path);
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const students = xlsx.utils.sheet_to_json(worksheet);

//         console.log("Found students:", students.length);

//         const results = [];

//         for (let i = 0; i < students.length; i++) {
//             const student = students[i];

//             const name = student.name;
//             const email = student.email;
//             const role = student.role || "student";
//             const batchName = student.batch;

//             if (!name || !email) {
//                 console.log(`Skipping row ${i + 1}: Missing name or email`);
//                 continue;
//             }

//             const existingUser = await User.findOne({ email });
//             if (existingUser) {
//                 console.log(`User ${email} already exists`);
//                 continue;
//             }

//             const newPassword = genratePassword();
//             const hashedPassword = await bcrypt.hash(newPassword, 10);

//             const newUser = await User.create({
//                 name,
//                 email,
//                 role,
//                 password: hashedPassword,
//                 batch: batchName
//             });

//             await sendPasswordEmail(email, name, newPassword);

//             if (batchName && (role === "student" || role === "teacher")) {
//                 if (role === "student") {
//                     await Batch.findOneAndUpdate(
//                         // { batchName: batchName }, // Query - batch find karo
//                         { _id: batchName },
//                         { $push: { students: newUser._id } }, // Update - student add karo
//                         { new: true, upsert: true } // Options
//                     );
//                 } else if (role === "teacher") {
//                     await Batch.findOneAndUpdate(
//                         // { batchName: batchName }, // Query - batch find karo
//                         { _id: batchName },
//                         { $push: { teachers: newUser._id } }, // Update - teacher add karo
//                         { new: true, upsert: true } // Options
//                     );
//                 }
//             }

//             results.push({
//                 name,
//                 email,
//                 password: newPassword,
//             });

//             console.log(`Created user: ${email}`);
//         }

//         res.json({
//             message: `Successfully created ${results.length} students`,
//             students: results,
//         });

//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({
//             message: "Something went wrong",
//             error: error.message,
//         });
//     }
// };
// export const uploadStudents = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.json({ message: "Please upload Excel file" });
//         }

//         const workbook = xlsx.readFile(req.file.path);
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const students = xlsx.utils.sheet_to_json(worksheet);

//         console.log("Found students:", students.length);

//         const results = [];

//         for (let i = 0; i < students.length; i++) {
//             const student = students[i];

//             const name = student.name;
//             const email = student.email;
//             const role = student.role || "student";
//             const batchName = student.batch;

//             if (!name || !email) {
//                 console.log(`Skipping row ${i + 1}: Missing name or email`);
//                 continue;
//             }

//             const existingUser = await User.findOne({ email });
//             if (existingUser) {
//                 console.log(`User ${email} already exists`);
//                 continue;
//             }

//             const newPassword = genratePassword();
//             const hashedPassword = await bcrypt.hash(newPassword, 10);

//             const newUser = await User.create({
//                 name,
//                 email,
//                 role,
//                 password: hashedPassword,
//             });

//             await sendPasswordEmail(email, name, newPassword);

//             if (batchName && (role === "student" || role === "teacher")) {
//                 await Batch.findOneAndUpdate(
//                     { $push: { students: newUser._id } }, // if teachers in different field, adjust here
//                     { new: true, upsert: true }
//                 );
//             }

//             results.push({
//                 name,
//                 email,
//                 password: newPassword,
//             });

//             console.log(`Created user: ${email}`);
//         }

//         res.json({
//             message: `Successfully created ${results.length} students`,
//             students: results,
//         });

//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({
//             message: "Something went wrong",
//             error: error.message,
//         });
//     }
// };


export const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const fileName = Date.now() + "-" + file.originalname;
        cb(null, fileName);
    }
});

export const checkFileType = (req, file, cb) => {
    if (file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
        cb(null, true);
    } else {
        cb(new Error("Please upload Excel file only"), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: checkFileType
});


// export const insertStudent = async (request, response) => {
//     try {
//         const { name, email, role, batch } = request.body
//         const existingUSer = await User.findOne({ email })
//         if (existingUSer) {
//             response.json({ message: "User already exist" })
//         }

//         const findBatach = await Batch.findOne({batchName:batch})
//         if(!findBatach)
//             return response.status(400).json({message:"batch not found"})
//         const genpass = genratePassword()
//         const hashPass = await bcrypt.hash(genpass, 12)

//         await sendPasswordEmail(email, name, genpass);
//         const userCreate = await User.create({
//             name, email, password: hashPass, role, batch:batch._id
//         })
//         if (userCreate.role === "student") {

//             // Batch.students.push(userCreate._id)
//             // Batch.save()
//             await Batch.findByIdAndUpdate(
//                 batch,
//                 { $push: { students: userCreate._id } },
//                 { new: true }
//             );
//         } else if (userCreate.role === "teacher") {
//             // await Batch.teachers.push(userCreate._id)
//             // Batch.save()
//             await Batch.findByIdAndUpdate(
//                 batch,
//                 { $push: { teachers: userCreate._id } },
//                 { new: true }
//             );
//         }


//         response.json({ message: "User Created", userCreate })

//     }
//     catch(err) {
//         console.log(err)
//         console.log("Internal server Error")
//         // response.json({message});
//     }
// }


export const insertStudent = async (request, response) => {
    try {
        const { name, email, role, batch } = request.body
        if (!name || name.trim() === "") {
            return response.status(400).json({ message: "Name is required" });
        }
        if (!email || email.trim() === "") {
            return response.status(400).json({ message: "Email is required" });
        }
        if (!batch || batch.trim() === "") {
            return response.status(400).json({ message: "Please select a batch" });
        }
        const userRole = (role && role.trim() !== "" && role !== "undefined")
            ? role.trim()
            : "student";
        const existingUser = await User.findOne({ email: email.trim() })
        if (existingUser) {
            return response.status(400).json({ message: "User already exists" })
        }
        const batchName = batch.trim();
        const findBatch = await Batch.findOne({ batchName: batchName })

        if (!findBatch) {
            return response.status(400).json({message:"Batch not Found" })
        }
        const genpass = genratePassword()
        const hashPass = await bcrypt.hash(genpass, 12)
        await sendPasswordEmail(email.trim(), name.trim(), genpass);
        const userCreate = await User.create({
            name: name.trim(),
            email: email.trim(),
            password: hashPass,
            role: userRole,
            batch: findBatch._id
        })
        response.json({message:"User Created created"})
        if (userRole === "student") {
            console.log("11. Adding student to batch...");
            const updateResult = await Batch.findByIdAndUpdate(
                findBatch._id,  
                { $push: { students: userCreate._id } },
                { new: true }
            );
        } else if (userRole === "teacher") {
            console.log("11. Adding teacher to batch...");
            const updateResult = await Batch.findByIdAndUpdate(
                findBatch._id,  
                { $push: { teachers: userCreate._id } },
                { new: true }
            );
        }
    }
    catch (err) {
        console.error("Full error:", err);

        return response.status(500).json({
            message: "Internal server error"
        })
    }
}

export const genratePassword = () => {
    const char = "abcde12234FGHI#$%$%^%^&"
    let password = ""
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * char.length)
        const randomChar = char[randomIndex]

        password = password + randomChar

    }
    console.log(password)
    return password
}


export const sendPasswordEmail = async (toEmail, name, password) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Infobeans CSR" <${process.env.EMAIL}>`,
            to: toEmail,
            subject: "Your Account Credentials",
            html: `
        <h3>Hello ${name},</h3>
        <p>You have been successfully registered.</p>
        <p><b>Email:</b> ${toEmail}</p>
        <p><b>Password:</b> ${password}</p>
        <br />
        <p>Regards,<br/>CSR Assignment System</p>
      `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Password sent to ${toEmail}`);
    } catch (error) {
        console.error(`❌ Failed to send email to ${toEmail}`, error);
    }
};

export const userLogin = async (request, response) => {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({ success: false, message: "Missing fields" });
        }

        const search = await User.findOne({ email });

        if (!search) {
            console.log("Email not found");
            return response.status(401).json({ success: false, message: "Email not found" });
        }

        const isMatch = await bcrypt.compare(password, search.password);
        if (!isMatch) {
            console.log("Password mismatch");
            return response.status(401).json({ success: false, message: "Password is wrong" });
        }

        const findUser = await User.findOne({email})
        console.log(findUser)

        let userRole = "student"
        if (search.role === "teacher"){
            userRole = "teacher" ,
            console.log(userRole)
        return response.status(200).json({message: "Login successfully",userRole,findUser});
        }
        else if(search.role === "admin"){
             userRole = "admin" ,
            console.log(userRole)
        return response.status(200).json({message: "Login successfully",userRole,findUser});
        }
           else if(search.role === "student"){
             userRole = "student" ,
            console.log(userRole)
        return response.status(200).json({message: "Login successfully",userRole,findUser});
        }

    } catch (err) {
        console.error("Login error:", err);
        return response.status(500).json({ success: false, message: "Internal server error" });
    }
};



export const deleteByID = async (request, response) => {
    try {
        const { id } = request.params
        const { batch } = request.body
        const deleteUser = await User.findByIdAndDelete(id)
        if (!deleteUser) {
            response.json({ message: "User Not Found" })
        }

        const findBatch = await Batch.findById(batch)
        if (findBatch) {
            const index = findBatch.students.indexOf(id)
            if (index !== -1) {
                findBatch.students.splice(index, 1)
                await findBatch.save()
            }
        }
        return response.json({ message: "Deleted Successfully" })
    }
    catch (err) {
        console.log(err)
        return response.json({ message: "Internal server error" })
    }
}
export const uploadProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const profileFile = req.file;

    if (!profileFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profile: profileFile.filename },  // ✅ only filename (string)
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Profile uploaded successfully", user: updatedUser });
  } catch (error) {
    console.error("Upload Profile Error:", error);
    res.status(500).json({ error: "Something went wrong while uploading profile." });
  }
};

// export const uploadProfile = async (request, response) => {
//     try {
//         const { id } = request.params;
//         let user = await User.findById(id)
//         if (!user) {
//             return response.status(404).json({ message: "User not found" });
//         }
//         user.profile = {
//             file: request.file.file
//         }
//         await user.save()
//         response.json({ message: "Profile updated" })
//     }
//     catch (err) {
//         console.log(err)
//     }
// }

export const getAll = async (request, response) => {
    try {
        const allStudents = await User.find().populate('batch')
        response.json({ message: "Students List", allStudents })
    }
    catch (err) {
        console.log(err)
        response.json({ message: "Internal Server Error" })
    }
}

