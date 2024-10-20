import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import * as paypal from '@paypal/checkout-server-sdk';

// Constants
const SALT_ROUNDS = 10;
const PASSWORD_MIN_LENGTH = 8;

// Helper functions
const generateToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET);

const handleError = (res, error) => {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
};

// Middleware for validation
const validateUserInput = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !password || !email) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
        return res.status(400).json({
            success: false,
            message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
        });
    }

    next();
};

// Controllers
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = await userModel.create({ name, email, password: hashedPassword });
        const token = generateToken(newUser._id);
        res.status(201).json({ success: true, token });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }
        handleError(res, error);
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email }).select("+password");

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(user._id);
        res.json({ success: true, token });
    } catch (error) {
        handleError(res, error);
    }
};

const getProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const userData = await userModel.findById(userId).select("-password");

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, userData });
    } catch (error) {
        handleError(res, error);
    }
};

const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body;
        const imageFile = req.file;

        if (!name || !phone || !dob || !gender) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const updateData = { name, phone, address: JSON.parse(address), dob, gender };

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            updateData.image = imageUpload.secure_url;
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        handleError(res, error);
    }
};

const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body;

        const docData = await doctorModel.findById(docId).select("-password");

        if (!docData.available) {
            return res.status(400).json({ success: false, message: "Doctor is not available" });
        }

        let slots_booked = docData.slots_booked;

        if (slots_booked[slotDate]?.includes(slotTime)) {
            return res.status(400).json({ success: false, message: "Slot is already booked" });
        }

        slots_booked[slotDate] = [...(slots_booked[slotDate] || []), slotTime];

        const userData = await userModel.findById(userId).select("-password");

        const appointmentData = {
            userId,
            docId,
            userData,
            docData: { ...docData.toObject(), slots_booked: undefined },
            amount: docData.fees,
            slotDate,
            slotTime,
            date: Date.now(),
        };

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        return res.json({ success: true, message: "Appointment booked successfully" });
    } catch (error) {
        return handleError(res, error);
    }
};

const listAppointment = async (req, res) => {
    try {
        const { userId } = req.body;
        const appointments = await appointmentModel.find({ userId });
        res.json({ success: true, appointments });
    } catch (error) {
        return handleError(res, error);
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);

        if (appointmentData.userId !== userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        const { docId, slotDate, slotTime } = appointmentData;
        const docData = await doctorModel.findById(docId);
        let slots_booked = docData.slots_booked;

        slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime);

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        res.json({ success: true, message: "Appointment cancelled" });
    } catch (error) {
        return handleError(res, error);
    }
};

// PayPal integration

// PayPal configuration
const environment = process.env.NODE_ENV === 'production'
    ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

const paymentPaypal = async (req, res) => {
  try {
      const { appointmentId } = req.body;
      const appointmentData = await appointmentModel.findById(appointmentId);

      if (!appointmentData || appointmentData.cancelled) {
          return res.status(400).json({
              success: false,
              message: "Appointment not found or has been cancelled",
          });
      }

      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
          intent: 'CAPTURE',
          purchase_units: [{
              amount: {
                  currency_code: process.env.CURRENCY || 'USD',
                  value: appointmentData.amount.toString()
              },
              reference_id: appointmentId
          }]
      });

      const order = await paypalClient.execute(request);

      if (order.statusCode !== 201) {
          throw new Error('Failed to create PayPal order');
      }

      res.json({ success: true, orderId: order.result.id });
  } catch (error) {
      return handleError(res, error);
  }
};

const capturePaypalPayment = async (req, res) => {
  try {
      const { orderId } = req.body;
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});

      const capture = await paypalClient.execute(request);

      if (capture.statusCode !== 201) {
          throw new Error('Failed to capture PayPal payment');
      }

      // Update appointment status or perform any other necessary actions
      // You might want to update the appointment status to 'paid' here

      res.json({ success: true, message: "Payment captured successfully" });
  } catch (error) {
      return handleError(res, error);
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentPaypal,
  capturePaypalPayment,
};