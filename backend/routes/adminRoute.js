import express from 'express';

import upload from '../middlewares/multer.js'
import { addDoctor, loginAdmin } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.post('/add-doctor', upload.single('image'), addDoctor)
adminRouter.post('/login', loginAdmin)

export default adminRouter;