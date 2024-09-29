import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';


//app config
const app = express();
const port = process.env.PORT || 5000;

//db connection
connectDB();

// middlewares
app.use(express.json());
app.use(cors());

//api endpoints
app.get('/', (req, res)=> {
    res.send('API is running...');
})


app.listen(port, ()=> console.log('server listening on port', port));