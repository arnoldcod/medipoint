import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from "../models/doctorModel.js";

//API to register user

const registerUser = async (req, res)=> {
   try {
      const { name, email , password }  = req.body;

      if ( !name || !password || !email) {
        return res.json({success:false, message:' Missing details'})
      }
      
      //validate email format
      if (!validator.isEmail(email)) {
        return res.json({success:false, message:'enter a valid email'})
      }
      

      //validate a strong password
      if (password.length < 8) {
        return res.json({success:false, message:'enter a strong password'})
      }

      // hashing user's password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      const userData = {
        name,
        email,
        password: hashedPassword
      }

      const newUser = new userModel(userData)
      const user = await newUser.save()
      
      const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)

      res.json({success:true, token})
      

   } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
   }
}

// API to login user

const loginUser = async (req, res) => {
   try {
      const { email, password } = req.body;
      const user = await userModel.findOne({ email });

      if (!user) {
        return res.json({ success: false, message: 'Incorrect Email' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ success: true, token });
      } else {
        return res.json({ success: false, message: 'Incorrect password' });
      }
      
      
   } catch (error) {
      console.error(error);
      res.json({ success: false, message: error.message });
   }
  }

  //API to get user profile data
  const getProfile = async (req, res)=> {

     try {
       const { userId } = req.body
       const userData = await userModel.findById(userId).select('-password')

       res.json({ success: true, userData })

     } catch (error) {
      console.error(error);
      res.json({ success: false, message: error.message });
     }
  }

  //API to update user profile
  const updateProfile = async (req, res)=> {

     try {
       const { userId, name, phone, address,  dob, gender } = req.body
       const imageFile = req.file

       if (!name || !phone || !dob || !gender) {
         return res.json({ success: false, message: 'Missing details' });
       }

       await userModel.findByIdAndUpdate(userId,{name, phone, address: JSON.parse(address), dob, gender })

       if (imageFile) {
        //upload image to cloudinary
         const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: 'image'} )
         const imageURL = imageUpload.secure_url

         await userModel.findByIdAndUpdate(userId, {image: imageURL})
       }

       res.json({ success: true, message: 'Profile updated' })

     } catch (error) {
      console.error(error);
      res.json({ success: false, message: error.message });
     }
  }


  //API to book appointment
  const bookAppointment = async (req, res)=> {

     try {
       const { userId, docId, slotDate, slotTime } = req.body

       const docData = await doctorModel.findById(docId).select('-password')

       if (!docData.available) {
         return res.json({ success: false, message: 'Doctor is not available' });
       }


       let slots_booked = docData.slots_booked
       //checking for slots available
       if(slots_booked[slotDate]) {
         if(slots_booked[slotDate].includes(slotTime)) {
           return res.json({ success: false, message: 'Slot is already booked' });
         } else {
           slots_booked[slotDate].push(slotTime)  
         }
       } else {
         slots_booked[slotDate] = []
         slots_booked[slotDate].push(slotTime)
       }

       const userData = await userModel.findById(userId).select('-password')

       delete docData.slots_booked

       const appointmentData = { 
         userId,
         docId,
         userData,
         docData,
         amount: docData.fees,
         slotDate,
         slotTime,
         date: Date.now(),
       }

       const newAppointment = new appointmentModel(appointmentData)
       await newAppointment.save()

       //save new slots data in docData
       await doctorModel.findByIdAndUpdate(docId, {slots_booked})

       res.json({ success: true, message: 'Appointment booked successfully' })


     } catch (error) {
      console.error(error);
      res.json({ success: false, message: error.message });
     }
  }


  export { registerUser, loginUser, getProfile, updateProfile, bookAppointment }


