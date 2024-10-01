import mongoose from 'mongoose';

const connectDB = async () => {
    // Event listener for a successful connection
    mongoose.connection.on('connected', () => {
        console.log('Database connected');
    });

    // Event listener for a connection error
    mongoose.connection.on('error', (err) => {
        console.error(`Database connection error: ${err}`);
    });

    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/medipoint`, {
            
        });
    } catch (err) {
        console.error('Failed to connect to the database:', err);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;
