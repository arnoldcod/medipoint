import mongoose from 'mongoose';

const connectDB= async () => {
    mongoose.connection.on('connnected', ()=> console.log('Database connected') )

    await mongoose.connect(`${process.env.MONGODB_URI}/medipoint`)
}

export default connectDB;