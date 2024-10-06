import express from 'express';

import upload from '../middlewares/multer.js'
import { addDoctor, getAllDoctors, loginAdmin } from '../controllers/adminController.js';
import authAdmin from '../middlewares/authAdmin.js';


const adminRouter = express.Router();

adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor)
adminRouter.post('/login', loginAdmin)
adminRouter.post('/all-doctors', authAdmin ,getAllDoctors)

export default adminRouter;