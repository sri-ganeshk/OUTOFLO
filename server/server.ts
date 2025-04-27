import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import campaignRoutes from './campaigns';
import messageRoutes from './message';
import authRoutes from './auth';
import bodyParser from 'body-parser';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || '';
// Middleware
app.use(bodyParser.json());
app.use(cors())

// Routes
app.use('/auth', authRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/personalized-message', messageRoutes);

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('MongoDB URI:', MONGODB_URI);
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

export default app;