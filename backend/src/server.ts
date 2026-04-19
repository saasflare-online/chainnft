import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import { startIndexer } from './services/indexer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = 'mongodb+srv://greyparadox:parth1241@payslip.5du9xig.mongodb.net/?appName=payslip';

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      startIndexer();
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
