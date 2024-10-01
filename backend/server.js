import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';


//app config
const app = express();
const port = process.env.PORT || 5000;

//db connection
connectDB();
connectCloudinary();

// middlewares
app.use(express.json());
app.use(cors());


// routes 
app.use('/api/admin', adminRouter) //localhost:5000/api/admin/add-doctor



//api endpoints
app.get('/', (req, res)=> {
    res.send('API is running...');
})


app.listen(port, ()=> console.log('server listening on port', port));