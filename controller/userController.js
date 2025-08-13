import User from "../models/User.js"
import multer from "multer";
import bcrypt from "bcryptjs"
import xlsx from "xlsx"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import Batch from "../models/BatchModel.js"
import { response } from "express";
dotenv.config()

export const googleLogin = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email)
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        let findUser = await User.findOne({ email });
        return res.status(200).json({
            message: "Login successful",
            findUser: findUser,
            userRole: findUser.userRole,
            findUser
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

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
            const batchName = student.batch?.trim(); // batch name from Excel

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

            // Find batch by name
            let batch = null;
            if (batchName) {
                batch = await Batch.findOne({ batchName });
                if (!batch) {
                    console.log(`Batch not found: ${batchName}`);
                    continue; // or create new batch if you want
                }
            }

            const newPassword = genratePassword();
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const newUser = await User.create({
                name,
                email,
                role,
                password: hashedPassword,
                batch: batch ? batch._id : null, // assign batch ID
                isApproved: true
            });

            await sendPasswordEmail(email, name, newPassword);

            if (batch && (role === "student" || role === "teacher")) {
                const updateField = role === "student" ? { students: newUser._id } : { teachers: newUser._id };

                await Batch.findOneAndUpdate(
                    { _id: batch._id },
                    { $push: updateField },
                    { new: true }
                );
            }

            results.push({
                name,
                email,
                password: newPassword,
                batch: batchName
            });

            console.log("Created User", email);
        }

        res.status(200).json({
            message: "Successfully created",
            students: results,
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            message: "Something went wrong during student upload.",
        });
    }
};



export const insertStudent = async (req, res) => {
    try {
        const { name, email, role, batch } = req.body;

        // Check basic required fields
        if (!name || name.trim() === "") {
            return res.status(400).json({ message: "Name is required" });
        }
        if (!email || email.trim() === "") {
            return res.status(400).json({ message: "Email is required" });
        }

        const userRole = role?.trim() || "student";
        const trimmedEmail = email.trim();
        const trimmedName = name.trim();

        // If user already exists
        const userExists = await User.findOne({ email: trimmedEmail });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        let batchDoc = null;

        // Only check batch if user is not admin
        if (userRole !== "admin") {
            if (!batch || batch.trim() === "") {
                return res.status(400).json({ message: "Please select a batch" });
            }

            batchDoc = await Batch.findOne({ batchName: batch.trim() });
            if (!batchDoc) {
                return res.status(400).json({ message: "Batch not found" });
            }
        }

        // Generate and hash password
        const plainPassword = genratePassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 12);

        // Send password to user's email
        await sendPasswordEmail(trimmedEmail, trimmedName, plainPassword);

        // Create user
        const newUser = await User.create({
            name: trimmedName,
            email: trimmedEmail,
            password: hashedPassword,
            role: userRole,
            batch: batchDoc?._id || null
        });

        // Link student or teacher to batch
        if (userRole === "student") {
            await Batch.findByIdAndUpdate(batchDoc._id, { $push: { students: newUser._id } });
        } else if (userRole === "teacher") {
            await Batch.findByIdAndUpdate(batchDoc._id, { $push: { teachers: newUser._id } });
        }

        return res.status(200).json({ message: "User created successfully." });

    } catch (err) {
        console.error("Insert student error:", err);
        return res.status(500).json({ message: "Something went wrong on the server." });
    }
};


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
        console.error(`Failed to send email to ${toEmail}`, error);
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

        const findUser = await User.findOne({ email })
        // console.log(findUser)
        console.log(findUser.batch)

        let userRole = "student"
        if (search.role === "teacher") {
            userRole = "teacher",
                console.log(findUser)
            return response.status(200).json({ message: "Login successfully", userRole, findUser });
        }
        else if (search.role === "admin") {
            userRole = "admin",
                console.log(findUser)
            return response.status(200).json({ message: "Login successfully", userRole, findUser });
        }
        else if (search.role === "student") {
            userRole = "student",
                console.log(findUser)
            return response.status(200).json({ message: "Login successfully", userRole, findUser });
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
            { profile: profileFile.filename },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: "Profile uploaded successfully", user: updatedUser });
    } catch (error) {
        console.error("Upload Profile Error:", error);
        res.status(500).json({ error: "Something went wrong while uploading profile." });
    }
};

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

export const profileDataUpdate = async (request, response) => {
  try {
    const id = request.params.id;
    const { name, email, bio } = request.body;

    const existUser = await User.findById(id);
    if (!existUser) return response.status(404).json({ message: "User not found" });

    const userProfile = await User.findByIdAndUpdate(
      id,
      {
        name: name ?? existUser.name,
        email: email ?? existUser.email,
        bio: bio ?? existUser.bio,
      },
      { new: true }
    );

    response.json({ message: "Profile updated", userProfile });
  } catch (err) {
    console.error("Profile update error:", err);
    response.status(500).json({ message: "Server error", error: err.message });
  }
};
