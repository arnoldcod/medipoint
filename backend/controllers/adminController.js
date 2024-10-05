import validator from 'validator'
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import jwt from 'jsonwebtoken'

//api for adding doctor
const addDoctor = async (req, res) => {
    
    try {

        const {name, email, password, speciality, degree, experience, about, fees, address} = req.body;
        const imageFile = req.file

        //check for all data to add to Doctor
        if (!name ||!email ||!password ||!speciality ||!degree ||!experience ||!about ||!fees ||!address) {
            return res.json({ success: false, message:"Misiing Details"});
        }

        //check for email validation
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please enter a valid email' });
        }

        //check for password length
        if (password.length < 8) {
            return res.json({success: false, message: 'Password must be at least 8 characters long' });
        }

        //hashing doctor password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //uploading doctor image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: 'image'})
        const imageURL = imageUpload.secure_url

        //creating new doctor object
        const doctorData = {
            name,
            email,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            image: imageURL,
            address: JSON.parse(address), 
            available: true,
            slots_booked: {},
            date: Date.now()
        }
        //creating new doctor document
        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()  //saving doctor to database

        res.status(200).json({ success: true, message: 'Doctor added successfully' });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
        
    }
}

//API For admin Login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for all data to login admin
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            
            const token = jwt.sign(email+password, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: 'Incorrect Email or Password' });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export { addDoctor, loginAdmin }